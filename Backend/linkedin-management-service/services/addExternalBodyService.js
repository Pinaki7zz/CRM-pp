const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.validateIdentityProvider = async (identityProviderName) => {
  const identityProvider = await prisma.addIdentityProvider.findFirst({
    where: { identityProviderName }
  });
  return !!identityProvider;
};

exports.createAddExternalBody = async (data) => {
  // Check if external credential name already exists
  const existing = await prisma.addExternalBody.findFirst({
    where: { externalCredentialName: data.externalCredentialName }
  });

  if (existing) {
    throw new Error(`External Credential "${data.externalCredentialName}" already exists`);
  }

  return await prisma.addExternalBody.create({
    data
  });
};

exports.getAddExternalBodies = async () => {
  return await prisma.addExternalBody.findMany({
    orderBy: { createdAt: 'desc' }
  });
};

exports.getAddExternalBody = async (id) => {
  return await prisma.addExternalBody.findUnique({
    where: { id }
  });
};

exports.updateAddExternalBody = async (id, data) => {
  // Check if name changed and already exists
  if (data.externalCredentialName) {
    const existing = await prisma.addExternalBody.findFirst({
      where: { 
        externalCredentialName: data.externalCredentialName,
        NOT: { id }
      }
    });

    if (existing) {
      throw new Error(`External Credential "${data.externalCredentialName}" already exists`);
    }
  }

  return await prisma.addExternalBody.update({
    where: { id },
    data
  });
};

exports.deleteAddExternalBody = async (id) => {
  // Check if referenced by AddPrincipal
  const referencing = await prisma.addPrincipal.count({
    where: { externalBodyId: id }
  });

  if (referencing > 0) {
    throw new Error(`Cannot delete External Body referenced by ${referencing} Principal(s)`);
  }

  await prisma.addExternalBody.delete({
    where: { id }
  });
};