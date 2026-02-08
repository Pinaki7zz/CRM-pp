const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createAddPrincipal = async (data) => {
  // Check if principal with same name already exists
  const existing = await prisma.addPrincipal.findUnique({
    where: { principalName: data.principalName }
  });

  if (existing) {
    throw new Error(`Principal "${data.principalName}" already exists`);
  }

  // Set default status
  data.status = 'NOT_CONFIGURED';

  return await prisma.addPrincipal.create({
    data
  });
};

exports.getAddPrincipals = async () => {
  return await prisma.addPrincipal.findMany({
    orderBy: { createdAt: 'desc' }
  });
};

exports.getAddPrincipal = async (id) => {
  return await prisma.addPrincipal.findUnique({
    where: { id }
  });
};

exports.updateAddPrincipal = async (id, data) => {
  return await prisma.addPrincipal.update({
    where: { id },
    data
  });
};

exports.deleteAddPrincipal = async (id) => {
  await prisma.addPrincipal.delete({
    where: { id }
  });
};

// Called by LinkedIn login to update status (find by principalName)
exports.updatePrincipalStatus = async (principalName) => {
  const updated = await prisma.addPrincipal.updateMany({
    where: {
      principalName,
      status: 'NOT_CONFIGURED'
    },
    data: { 
      status: 'CONFIGURED',
      updatedAt: new Date()
    }
  });

  console.log(`✅ Updated ${updated.count} principal(s) to CONFIGURED status for ${principalName}`);
  return updated.count;
};