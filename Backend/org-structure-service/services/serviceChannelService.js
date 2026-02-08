const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const {
	validateServiceChannel,
	validateServiceChannelUpdate,
} = require("../validations/serviceChannelValidation");

class ServiceChannelService {
	static async createServiceChannel(data) {
		const { error } = validateServiceChannel(data);
		if (error) {
			throw new Error(error.details.map((detail) => detail.message).join(", "));
		}

		const existingChannel = await prisma.serviceChannel.findUnique({
			where: { serviceChannelCode: data.serviceChannelCode },
		});

		if (existingChannel) {
			throw new Error("Service Channel ID already exists");
		}

		return prisma.serviceChannel.create({
			data,
		});
	}

	static async getAllServiceChannels() {
		return prisma.serviceChannel.findMany();
	}

	static async getServiceChannelById(serviceChannelCode) {
		return prisma.serviceChannel.findUnique({
			where: { serviceChannelCode },
		});
	}

	static async updateServiceChannelById(serviceChannelCode, data) {
		const existingChannel = await prisma.serviceChannel.findUnique({
			where: { serviceChannelCode },
		});

		if (!existingChannel) {
			throw new Error("Service Channel not found");
		}

		const { error } = validateServiceChannelUpdate(data);
		if (error) {
			throw new Error(error.details.map((detail) => detail.message).join(", "));
		}

		// Prevent changing the serviceChannelCode
		if (data.serviceChannelCode && data.serviceChannelCode !== serviceChannelCode) {
			throw new Error("Cannot change serviceChannelCode through this endpoint");
		}

		return prisma.serviceChannel.update({
			where: { serviceChannelCode },
			data,
		});
	}

	static async deleteServiceChannelById(serviceChannelCode) {
		const existingChannel = await prisma.serviceChannel.findUnique({
			where: { serviceChannelCode },
		});

		if (!existingChannel) {
			throw new Error("Service Channel not found");
		}

		return prisma.serviceChannel.delete({
			where: { serviceChannelCode },
		});
	}
}

module.exports = ServiceChannelService;
