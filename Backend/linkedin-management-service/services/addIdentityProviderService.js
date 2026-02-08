const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createAddIdentityProvider = async (data) => {
  // Check if identity provider with same name already exists
  const existing = await prisma.addIdentityProvider.findFirst({
    where: { identityProviderName: data.identityProviderName }
  });

  if (existing) {
    throw new Error(`Identity Provider "${data.identityProviderName}" already exists`);
  }

  return await prisma.addIdentityProvider.create({
    data
  });
};

exports.getAddIdentityProviders = async () => {
  return await prisma.addIdentityProvider.findMany({
    orderBy: { createdAt: 'desc' }
  });
};

exports.getAddIdentityProvider = async (id) => {
  return await prisma.addIdentityProvider.findUnique({
    where: { id }
  });
};

exports.updateAddIdentityProvider = async (id, data) => {
  // Check if name changed and already exists
  if (data.identityProviderName) {
    const existing = await prisma.addIdentityProvider.findFirst({
      where: { 
        identityProviderName: data.identityProviderName,
        NOT: { id }
      }
    });

    if (existing) {
      throw new Error(`Identity Provider "${data.identityProviderName}" already exists`);
    }
  }

  return await prisma.addIdentityProvider.update({
    where: { id },
    data
  });
};

exports.deleteAddIdentityProvider = async (id) => {
  // Check if referenced by AddExternalBody
  const identityProvider = await prisma.addIdentityProvider.findUnique({ where: { id } });
  const referencing = await prisma.addExternalBody.count({
    where: { identityProvider: identityProvider.identityProviderName }
  });

  if (referencing > 0) {
    throw new Error(`Cannot delete Identity Provider referenced by ${referencing} External Body(ies)`);
  }

  await prisma.addIdentityProvider.delete({
    where: { id }
  });
};