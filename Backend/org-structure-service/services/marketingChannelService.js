const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const {
	validateMarketingChannel,
	validateMarketingChannelUpdate,
} = require("../validations/marketingChannelValidation");

class MarketingChannelService {
	static async createMarketingChannel(data) {
		console.log(data)
		const { error } = validateMarketingChannel(data);
		if (error) {
			throw new Error(error.details.map((detail) => detail.message).join(", "));
		}

		const existingChannel = await prisma.marketingChannel.findUnique({
			where: { marketingChannelCode: data.marketingChannelCode },
		});

		if (existingChannel) {
			throw new Error("Marketing Channel ID already exists");
		}

		return prisma.marketingChannel.create({
			data,
		});
	}

	static async getAllMarketingChannels() {
		return prisma.marketingChannel.findMany();
	}

	static async getMarketingChannelById(marketingChannelCode) {
		return prisma.marketingChannel.findUnique({
			where: { marketingChannelCode },
		});
	}

	static async updateMarketingChannelById(marketingChannelCode, data) {
		const existingChannel = await prisma.marketingChannel.findUnique({
			where: { marketingChannelCode },
		});

		if (!existingChannel) {
			throw new Error("Marketing Channel not found");
		}

		const { error } = validateMarketingChannelUpdate(data);
		if (error) {
			throw new Error(error.details.map((detail) => detail.message).join(", "));
		}

		// Prevent changing the marketingChannelCode
		if (data.marketingChannelCode && data.marketingChannelCode !== marketingChannelCode) {
			throw new Error("Cannot change marketingChannelCode through this endpoint");
		}

		return prisma.marketingChannel.update({
			where: { marketingChannelCode },
			data,
		});
	}

	static async deleteMarketingChannelById(marketingChannelCode) {
		const existingChannel = await prisma.marketingChannel.findUnique({
			where: { marketingChannelCode },
		});

		if (!existingChannel) {
			throw new Error("Marketing Channel not found");
		}

		return prisma.marketingChannel.delete({
			where: { marketingChannelCode },
		});
	}
}

module.exports = MarketingChannelService;
