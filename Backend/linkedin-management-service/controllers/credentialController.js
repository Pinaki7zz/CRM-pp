const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper to get model based on type
const getModel = (type) => {
  switch (type) {
    case 'identity-provider': return prisma.addIdentityProvider;
    case 'external-body': return prisma.addExternalBody;
    case 'principal': return prisma.addPrincipal;
    case 'named-credential': return prisma.addNamedCredential;
    default: throw new Error('Invalid type');
  }
};

exports.createCredential = async (req, res) => {
  try {
    const { type } = req.params;
    const userId = req.user.id;
    const model = getModel(type);
    const data = { ...req.body, userId };

    // Specific data handling
    if (type === 'principal') {
      data.status = data.status || 'NOT_CONFIGURED';
    }

    const credential = await model.create({ data });
    res.status(201).json({ message: `${type} created`, credential });
  } catch (error) {
    console.error(`Create ${type} error:`, error);
    res.status(500).json({ error: `Failed to create ${type}` });
  }
};

exports.getCredentials = async (req, res) => {
  try {
    const { type } = req.params;
    const userId = req.user.id;
    const model = getModel(type);
    const credentials = await model.findMany({ where: { userId } });
    res.json({ credentials });
  } catch (error) {
    console.error(`Get ${type} error:`, error);
    res.status(500).json({ error: `Failed to fetch ${type}s` });
  }
};

exports.getCredential = async (req, res) => {
  try {
    const { type, id } = req.params;
    const userId = req.user.id;
    const model = getModel(type);
    const credential = await model.findFirst({ where: { id: parseInt(id), userId } });
    if (!credential) return res.status(404).json({ error: `${type} not found` });
    res.json({ credential });
  } catch (error) {
    console.error(`Get ${type} error:`, error);
    res.status(500).json({ error: `Failed to fetch ${type}` });
  }
};

exports.updateCredential = async (req, res) => {
  try {
    const { type, id } = req.params;
    const userId = req.user.id;
    const model = getModel(type);
    const data = req.body;

    // For principal, allow status patch only
    if (type === 'principal' && data.status) {
      data.status = data.status;
    }

    const credential = await model.update({
      where: { id: parseInt(id), userId },
      data,
    });
    res.json({ message: `${type} updated`, credential });
  } catch (error) {
    console.error(`Update ${type} error:`, error);
    res.status(500).json({ error: `Failed to update ${type}` });
  }
};

exports.deleteCredential = async (req, res) => {
  try {
    const { type, id } = req.params;
    const userId = req.user.id;
    const model = getModel(type);
    await model.delete({ where: { id: parseInt(id), userId } });
    res.json({ message: `${type} deleted` });
  } catch (error) {
    console.error(`Delete ${type} error:`, error);
    res.status(500).json({ error: `Failed to delete ${type}` });
  }
};