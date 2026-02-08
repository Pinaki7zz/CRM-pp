const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.validateExternalCredential = async (externalCredentialName) => {
  const externalBody = await prisma.addExternalBody.findFirst({
    where: { externalCredentialName }
  });
  return !!externalBody;
};

// exports.createAddNamedCredential = async (data) => {
//   // Check if credential name already exists
//   const existing = await prisma.addNamedCredential.findFirst({
//     where: { credentialName: data.credentialName }
//   });

//   if (existing) {
//     throw new Error(`Named Credential "${data.credentialName}" already exists`);
//   }

//   return await prisma.addNamedCredential.create({
//     data
//   });
// };

exports.createAddNamedCredential = async (data) => {
  // Check if credential name already exists
  const existing = await prisma.addNamedCredential.findUnique({
    where: { credentialName: data.credentialName }
  });

  if (existing) {
    throw new Error(`Named Credential "${data.credentialName}" already exists`);
  }

  // ✅ REMOVED: No longer validate externalCredential
  return await prisma.addNamedCredential.create({
    data
  });
};

exports.getAddNamedCredentials = async () => {
  return await prisma.addNamedCredential.findMany({
    orderBy: { createdAt: 'desc' }
  });
};

exports.getAddNamedCredential = async (id) => {
  return await prisma.addNamedCredential.findUnique({
    where: { id }
  });
};

exports.updateAddNamedCredential = async (id, data) => {
  // Check if name changed and already exists
  if (data.credentialName) {
    const existing = await prisma.addNamedCredential.findFirst({
      where: { 
        credentialName: data.credentialName,
        NOT: { id }
      }
    });

    if (existing) {
      throw new Error(`Named Credential "${data.credentialName}" already exists`);
    }
  }

  return await prisma.addNamedCredential.update({
    where: { id },
    data
  });
};

exports.deleteAddNamedCredential = async (id) => {
  await prisma.addNamedCredential.delete({
    where: { id }
  });
};