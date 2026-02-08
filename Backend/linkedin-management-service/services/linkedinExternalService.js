const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const addPrincipalService = require('./addPrincipalService');
const prisma = new PrismaClient();

exports.validateIntegration = async (integrationId) => {
  const integration = await prisma.integration.findUnique({
    where: { id: integrationId }
  });
  return !!integration;
};

exports.createLinkedinExternal = async (data) => {
  // Check if external credential name already exists
  const existing = await prisma.linkedinExternalCredentialName.findUnique({
    where: { externalCredentialName: data.externalCredentialName }
  });

  if (existing) {
    throw new Error(`LinkedIn External Credential "${data.externalCredentialName}" already exists`);
  }

  return await prisma.linkedinExternalCredentialName.create({
    data,
    include: {
      integration: true
    }
  });
};

// ✅ NEW: Create with auto-assigned integrationId
exports.createLinkedinExternalWithAutoIntegration = async (data) => {
  // Get latest LinkedIn integration automatically
  const integration = await require('./integrationService').getLatestLinkedInIntegration();
  
  const dataWithIntegration = {
    ...data,
    integrationId: integration.id  // ✅ Auto-assigned
  };

  console.log(`🔗 Auto-assigned Integration ID ${integration.id} to LinkedIn External Credential "${data.externalCredentialName}"`);

  return await this.createLinkedinExternal(dataWithIntegration);
};

// Rest of methods unchanged...
exports.getLinkedinExternals = async () => {
  return await prisma.linkedinExternalCredentialName.findMany({
    include: {
      integration: true
    },
    orderBy: { createdAt: 'desc' }
  });
};

exports.getLinkedinExternal = async (id) => {
  return await prisma.linkedinExternalCredentialName.findUnique({
    where: { id },
    include: {
      integration: true
    }
  });
};

exports.getIntegration = async (integrationId) => {
  return await prisma.integration.findUnique({
    where: { id: integrationId }
  });
};

exports.updateLinkedinExternal = async (id, data) => {
  if (data.externalCredentialName) {
    const existing = await prisma.linkedinExternalCredentialName.findFirst({
      where: { 
        externalCredentialName: data.externalCredentialName,
        NOT: { id }
      }
    });

    if (existing) {
      throw new Error(`LinkedIn External Credential "${data.externalCredentialName}" already exists`);
    }
  }

  return await prisma.linkedinExternalCredentialName.update({
    where: { id },
    data,
    include: {
      integration: true
    }
  });
};

exports.deleteLinkedinExternal = async (id) => {
  await prisma.linkedinExternalCredentialName.delete({
    where: { id }
  });
};

exports.exchangeLinkedInCode = async (code, integration) => {
  try {
    const response = await axios.post(integration.tokenEndpointURL, 
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: integration.callBackURL,
        client_id: integration.clientId,
        client_secret: integration.clientSecretKey,
      }), {
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    console.log('✅ LinkedIn token exchange successful');
    return response.data;
  } catch (error) {
    console.error('LinkedIn token exchange failed:', error.response?.data || error.message);
    throw new Error(`Token exchange failed: ${error.response?.data?.error_description || error.message}`);
  }
};

exports.updatePrincipalStatusAfterLogin = async (principalName, integrationId) => {
  const updatedCount = await addPrincipalService.updatePrincipalStatus(principalName);
  return updatedCount;
};