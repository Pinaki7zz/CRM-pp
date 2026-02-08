const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const isEqual = (a, b) => {
	if (typeof a !== typeof b) return false;
	if (typeof a === "object" && a !== null && b !== null) {
		const keysA = Object.keys(a);
		const keysB = Object.keys(b);
		if (keysA.length !== keysB.length) return false;
		return keysA.every((key) => isEqual(a[key], b[key]));
	}
	return a === b;
};

exports.createProductCategoryWithSubs = async (parentData, subCategories) => {
	return await prisma.$transaction(async (tx) => {
		// 1️⃣ Create MAIN category
		const parent = await tx.productCategory.create({
			data: parentData,
		});

		// 2️⃣ Create all SUB categories
		for (const sub of subCategories) {
			await tx.productCategory.create({
				data: {
					...sub,
					parentCategory: {
						connect: { categoryId: parent.categoryId },
					},
				},
			});
		}

		return parent;
	});
};

exports.getAllProductCategories = async () => {
	return await prisma.productCategory.findMany({
		where: { type: "MAIN" },
		include: {
			subcategories: true,
		},
	});
};

exports.getAllProductCategoriesPaginated = async ({
	page = 1,
	limit = 10,
	search = "",
	status = "",
	createdAt = "",
	viewType = "",
}) => {
	const skip = (page - 1) * limit;

	// ========== STEP 1: Find matching SUB category IDs ==========
	let matchedSubIds = [];

	if (search.trim()) {
		const subMatches = await prisma.productCategory.findMany({
			where: {
				type: "SUB",
				OR: [
					{ name: { contains: search, mode: "insensitive" } },
					{ categoryId: { contains: search, mode: "insensitive" } }
				]
			},
			select: { id: true }
		});

		matchedSubIds = subMatches.map(s => s.id);
	}

	// ========== STEP 2: Build WHERE for MAIN categories ==========
	const whereMain = {
		AND: [
			viewType === "MAIN" ? { type: "MAIN" } : {},
			viewType === "SUB" ? { type: "SUB" } : {},
			viewType === "ACTIVE" ? { status: "ACTIVE" } : {},
			viewType === "INACTIVE" ? { status: "INACTIVE" } : {},
			viewType === "CLOSED" ? { status: "CLOSED" } : {},
			createdAt
				? {
					createdAt: {
						gte: new Date(createdAt + "T00:00:00.000Z"),
						lte: new Date(createdAt + "T23:59:59.999Z"),
					},
				}
				: {},
			search
				? {
					OR: [
						{ name: { contains: search, mode: "insensitive" } },
						{ categoryId: { contains: search, mode: "insensitive" } },
						{
							subcategories: {
								some: { id: { in: matchedSubIds } },
							},
						},
					],
				}
				: {},
		],
	};

	const [items, total] = await Promise.all([
		prisma.productCategory.findMany({
			where: whereMain,
			skip,
			take: Number(limit),
			orderBy: { createdAt: "desc" },
			include: {
				subcategories: true,
			},
		}),
		prisma.productCategory.count({ where: whereMain }),
	]);

	return {
		items,
		total,
		page: Number(page),
		limit: Number(limit),
		totalPages: Math.ceil(total / limit),
	};
};

exports.getProductCategoryById = async (id) => {
	return await prisma.productCategory.findUnique({
		where: { id },
		include: {
			subcategories: true,
			parentCategory: {
				include: { subcategories: true }
			}
		}
	});
};

exports.updateProductCategoryWithSubs = async (parentId, parentData, subCategories) => {
	return await prisma.$transaction(async (tx) => {
		// 1️⃣ Check if parent exists
		const existingParent = await tx.productCategory.findUnique({
			where: { id: parentId },
			include: { subcategories: true },
		});

		if (!existingParent) {
			throw new Error("Product category not found");
		}

		// 2️⃣ Update PARENT category
		const updatedParent = await tx.productCategory.update({
			where: { id: parentId },
			data: parentData,
		});

		// Prepare maps
		const existingSubsMap = new Map(existingParent.subcategories.map((s) => [s.id, s]));

		// 3️⃣ Process incoming SUB categories
		for (const sub of subCategories) {
			// Extract ID so it's not passed in 'data'
			const { id: subId, ...subData } = sub;

			if (subId) {
				// 👉 Case A: Update existing sub-category
				await tx.productCategory.update({
					where: { id: subId },
					data: {
						...subData,
						// Use UUID connection
						parentCategory: {
							connect: { id: parentId }
						}
					},
				});

				// Mark this sub as processed
				existingSubsMap.delete(subId);
			} else {
				// 👉 Case B: Create new sub-category
				await tx.productCategory.create({
					data: {
						...subData,
						parentCategory: {
							connect: { id: parentId },
						},
					},
				});
			}
		}

		// 4️⃣ Delete removed sub-categories
		for (const [subId] of existingSubsMap) {
			await tx.productCategory.delete({
				where: { id: subId },
			});
		}

		// 5️⃣ Return updated parent
		return updatedParent;
	});
};

exports.deleteProductCategory = async (id) => {
	const productExists = await prisma.product.findFirst({
		where: { productCategoryId: id },
		select: { id: true },
	});

	if (productExists) {
		throw new Error("Cannot delete category: linked products exist.");
	}

	return await prisma.productCategory.delete({
		where: { id },
	});
}