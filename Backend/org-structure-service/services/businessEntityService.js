const prisma = require("@prisma/client");

class BusinessEntityService {
  static async createBusinessEntity(data) {
    const { error } =
      require("../validations/businessEntityValidation").validateBusinessEntityCreate(
        data
      );
    if (error)
      throw new Error(error.details.map((detail) => detail.message).join(", "));

    // Find the highest valid businessEntityCode
    // const existingEntities = await prisma.businessEntity.findMany({
    //   select: { businessEntityCode: true },
    //   where: { businessEntityCode: { startsWith: 'BE' } },
    //   orderBy: { businessEntityCode: 'desc' },
    //   take: 1
    // });

    // let nextCode = 'BE01';
    // if (existingEntities.length > 0) {
    //   const lastCode = existingEntities[0].businessEntityCode;
    //   if (!lastCode.match(/^BE[0-9]{2}$/)) {
    //     throw new Error(`Invalid existing businessEntityCode format: ${lastCode}`);
    //   }
    //   const lastNumber = parseInt(lastCode.replace('BE', ''), 10);
    //   if (isNaN(lastNumber)) {
    //     throw new Error(`Invalid number in businessEntityCode: ${lastCode}`);
    //   }
    //   if (lastNumber >= 99) throw new Error('Maximum number of business entities (BE99) reached');
    //   nextCode = `BE${String(lastNumber + 1).padStart(2, '0')}`;
    // }

    // Log the data to be inserted
    const insertData = {
      businessEntityCode: data.businessEntityCode,
      businessEntityName: data.businessEntityName,
      street1: data.street1,
      street2: data.street2,
      city: data.city,
      state: data.state,
      region: data.region,
      country: data.country,
      pinCode: data.pinCode,
    };
    console.log("Data to be inserted:", insertData);
    console.log("Field lengths:", {
      businessEntityCode: insertData.businessEntityCode?.length,
      businessEntityName: insertData.businessEntityName?.length,
      street1: insertData.street1?.length,
      street2: insertData.street2?.length,
      city: insertData.city?.length,
      state: insertData.state?.length,
      region: insertData.region?.length,
      country: insertData.country?.length,
      pinCode: insertData.pinCode?.length,
    });

    try {
      return await prisma.businessEntity.create({
        data: insertData,
      });
    } catch (err) {
      console.error("Prisma error:", err.message);
      throw new Error("Business Entity Code already exists");
    }
  }

  static async updateBusinessEntityByCode(code, data) {
    const existingEntity = await prisma.businessEntity.findUnique({
      where: { businessEntityCode: code },
    });
    if (!existingEntity) throw new Error("Business Entity not found");

    const { error } =
      require("../validations/businessEntityValidation").validateBusinessEntityUpdate(
        data
      );
    if (error)
      throw new Error(error.details.map((detail) => detail.message).join(", "));

    return prisma.businessEntity.update({
      where: { businessEntityCode: code },
      data: {
        businessEntityName: data.businessEntityName,
        street1: data.street1,
        street2: data.street2,
        city: data.city,
        state: data.state,
        region: data.region,
        country: data.country,
        pinCode: data.pinCode,
      },
    });
  }

  static async getBusinessEntityByCode(code) {
    const businessEntity = await prisma.businessEntity.findUnique({
      where: { businessEntityCode: code },
    });
    if (!businessEntity) throw new Error("Business Entity not found");
    return businessEntity;
  }

  static async getAllBusinessEntities() {
    return prisma.businessEntity.findMany();
  }

  static async deleteBusinessEntityByCode(code) {
    const existingEntity = await prisma.businessEntity.findUnique({
      where: { businessEntityCode: code },
    });
    if (!existingEntity) throw new Error("Business Entity not found");
    return prisma.businessEntity.delete({
      where: { businessEntityCode: code },
    });
  }

  static async assignUnits(
    businessEntityCode,
    businessUnitCode,
    factoryUnitCode
  ) {
    const businessEntity = await prisma.businessEntity.findUnique({
      where: { businessEntityCode },
    });
    if (!businessEntity) throw new Error("Business Entity not found");

    const businessUnit = await prisma.businessUnit.findUnique({
      where: { businessUnitCode },
    });
    if (!businessUnit) throw new Error("Business Unit not found");

    const factoryUnit = await prisma.factoryUnit.findUnique({
      where: { factoryUnitCode },
    });
    if (!factoryUnit) throw new Error("Factory Unit not found");

    const existingPair = await prisma.businessEntityUnitPair.findUnique({
      where: {
        businessEntityCode_businessUnitCode_factoryUnitCode: {
          businessEntityCode,
          businessUnitCode,
          factoryUnitCode,
        },
      },
    });

    if (!existingPair) {
      return prisma.businessEntityUnitPair.create({
        data: { businessEntityCode, businessUnitCode, factoryUnitCode },
      });
    }
    return existingPair;
  }

  static async updateUnits(
    businessEntityCode,
    businessUnitCode,
    factoryUnitCode
  ) {
    const businessEntity = await prisma.businessEntity.findUnique({
      where: { businessEntityCode },
    });
    if (!businessEntity) throw new Error("Business Entity not found");

    const businessUnit = await prisma.businessUnit.findUnique({
      where: { businessUnitCode },
    });
    if (!businessUnit) throw new Error("Business Unit not found");

    const factoryUnit = await prisma.factoryUnit.findUnique({
      where: { factoryUnitCode },
    });
    if (!factoryUnit) throw new Error("Factory Unit not found");

    // Find the first existing pair for this businessEntityCode to update
    const existingPair = await prisma.businessEntityUnitPair.findFirst({
      where: { businessEntityCode },
    });
    if (!existingPair) throw new Error("No unit pair found to update");

    return prisma.businessEntityUnitPair.update({
      where: { id: existingPair.id },
      data: { businessUnitCode, factoryUnitCode, updatedAt: new Date() },
    });
  }

  static async getUnitsByEntityCode(businessEntityCode) {
    const businessEntity = await prisma.businessEntity.findUnique({
      where: { businessEntityCode },
      include: {
        unitPairs: { include: { businessUnit: true, factoryUnit: true } },
      },
    });
    if (!businessEntity) throw new Error("Business Entity not found");
    return businessEntity.unitPairs.map((pair) => ({
      businessUnitCode: pair.businessUnit.businessUnitCode,
      businessUnitDesc: pair.businessUnit.businessUnitDesc,
      factoryUnitCode: pair.factoryUnit.factoryUnitCode,
      factoryUnitName: pair.factoryUnit.factoryUnitName,
    }));
  }

  static async deleteUnitPair(
    businessEntityCode,
    businessUnitCode,
    factoryUnitCode
  ) {
    const existingPair = await prisma.businessEntityUnitPair.findUnique({
      where: {
        businessEntityCode_businessUnitCode_factoryUnitCode: {
          businessEntityCode,
          businessUnitCode,
          factoryUnitCode,
        },
      },
    });
    if (!existingPair) throw new Error("Unit pair not found");
    return prisma.businessEntityUnitPair.delete({
      where: { id: existingPair.id },
    });
  }
}

module.exports = BusinessEntityService;
