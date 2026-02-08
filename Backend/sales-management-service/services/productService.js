// services/productService.js
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

const normalizeEmptyStrings = (data) => {
    Object.keys(data).forEach((key) => {
        if (data[key] === "") data[key] = null;
    });
    return data;
};

const createProduct = async (data) => {
    // 1. Sanitize Numeric Fields to prevent NaN
    // Define fields that must be Floats
    const floatFields = ['unitPrice', 'commissionRate', 'tax'];
    floatFields.forEach(field => {
        const val = parseFloat(data[field]);
        data[field] = isNaN(val) ? 0.0 : val;
    });

    // Define fields that must be Integers
    const intFields = ['quantityOrdered', 'quantityInStock', 'reorderLevel', 'quantityInDemand'];
    intFields.forEach(field => {
        const val = parseInt(data[field], 10);
        data[field] = isNaN(val) ? 0 : val;
    });

    // 2. Normalize strings (empty "" -> null)
    const normalized = normalizeEmptyStrings(data);

    // 3. Handle Relations explicitly
    if (normalized.productCategoryId) {
        normalized.productCategory = {
            connect: {
                categoryId: normalized.productCategoryId
            }
        };
        // Remove the scalar ID to avoid conflicts
        delete normalized.productCategoryId;
    }

    return await prisma.product.create({ data: normalized });
};

const getAllProducts = async () => {
    return await prisma.product.findMany({
        include: {
            productCategory: {
                select: {
                    name: true,
                }
            }
        }
    });
};

const getAllProductsPaginated = async ({
    page = 1,
    limit = 10,
    search = "",
    status = "",
    productCategoryId = "",
    createdAt = "",
    viewType = "",
    productOwnerId = ""
}) => {
    const skip = (page - 1) * limit;

    const where = {
        AND: [
            // 🔍 Global search
            search
                ? {
                    OR: [
                        { name: { contains: search, mode: "insensitive" } },
                        { productId: { contains: search, mode: "insensitive" } }
                    ],
                }
                : {},

            // 🟢 Status filter
            status ? { status } : {},

            // 🟢 Category filter
            productCategoryId ? { productCategoryId } : {},

            // 🟢 Owner filter
            productOwnerId ? { productOwnerId } : {},

            // 📅 Created date filter
            createdAt
                ? {
                    createdAt: {
                        gte: new Date(`${createdAt}T00:00:00.000Z`),
                        lte: new Date(`${createdAt}T23:59:59.999Z`)
                    }
                }
                : {},

            // 👁️ View type logic
            viewType === "ACTIVE" ? { isActiveStock: true } : {},
            viewType === "INACTIVE" ? { isActiveStock: false } : {}
        ]
    };

    const [items, total] = await Promise.all([
        prisma.product.findMany({
            where,
            skip,
            take: Number(limit),
            orderBy: { createdAt: "desc" },
            include: {
                productCategory: {
                    select: { name: true }
                }
            }
        }),
        prisma.product.count({ where })
    ]);

    return {
        items,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit)
    };
};

const getProductById = async (id) => {
    return await prisma.product.findUnique({
        where: { id },
        include: {
            productCategory: {
                select: {
                    categoryId: true,
                    name: true,
                }
            },
            // Assuming the schema has relations defined, typically attachments are fetched separately or included
            // attachments: true 
        }
    });
};

const updateProduct = async (id, data) => {
    // 1️⃣ Normalize incoming empty strings
    const normalizedData = normalizeEmptyStrings({ ...data });

    // 2️⃣ Get existing record
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
        throw new Error("Product not found");
    }

    // 3️⃣ Only compare fields you care about
    const fieldsToCompare = [
        "name",
        "status",
        "unitOfMeasurement",
        "vendorName",
        "productCategoryId",
        "productOwnerId",
        "manufacturer",
        "salesStartDate",
        "salesEndDate",
        "supportStartDate",
        "supportEndDate",
        "unitPrice",
        "commissionRate",
        "tax",
        "taxable",
        "usageUnit",
        "quantityOrdered",
        "quantityInStock",
        "reorderLevel",
        "handler",
        "quantityInDemand",
        "isActiveStock",
        "description",
    ];

    // 4️⃣ Compare existing DB values vs normalized new values
    const hasChanges = fieldsToCompare.some(
        (field) => !isEqual(existing[field], normalizedData[field])
    );

    if (!hasChanges) {
        console.log("⏩ No changes detected. Skipping DB update.");
        return existing;
    }

    // 5️⃣ If changed → update with normalized data
    return await prisma.product.update({
        where: { id },
        data: normalizedData
    });
};

const deleteProduct = async (id) => {
    return await prisma.product.delete({ where: { id } });
};

/**
 * Add an attachment record to the database
 */
const addAttachment = async (productId, fileData) => {
    return await prisma.productAttachment.create({
        data: {
            fileName: fileData.originalname,
            fileUrl: fileData.path, // Mapping path to fileUrl
            mimeType: fileData.mimetype,
            fileSize: fileData.size,
            product: { connect: { id: productId } },
        },
    });
};

const getAttachments = async (productId) => {
    return await prisma.productAttachment.findMany({
        where: { productId: productId },
        orderBy: { uploadedAt: 'desc' } // Note: schema uses uploadedAt, not createdAt
    });
};

module.exports = {
    createProduct,
    getAllProducts,
    getAllProductsPaginated,
    getProductById,
    updateProduct,
    deleteProduct,
    addAttachment,
    getAttachments
};