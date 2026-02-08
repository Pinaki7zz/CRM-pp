// const { PrismaClient } = require('@prisma/client');
// const prisma = new PrismaClient();

// // Default LinkedIn configuration
// const LINKEDIN_DEFAULTS = {
//   authorizedEndpointURL: 'https://www.linkedin.com/oauth/v2/authorization',
//   tokenEndpointURL: 'https://www.linkedin.com/oauth/v2/accessToken',
//   userInfoEndpointURL: 'https://api.linkedin.com/v2/me',
//   defaultScopes: 'profile email w_member_social r_liteprofile r_emailaddress'
// };

// exports.createIntegration = async (data) => {
//   // Ensure providerType is linkedin for LinkedIn integration
//   if (data.providerType !== 'linkedin') {
//     throw new Error('Only LinkedIn integration is supported');
//   }

//   // Apply LinkedIn defaults
//   const integrationData = {
//     ...data,
//     ...LINKEDIN_DEFAULTS,
//     providerType: 'linkedin'
//   };

//   // Check if integration already exists
//   const existing = await prisma.integration.findUnique({
//     where: { providerType: 'linkedin' }
//   });

//   if (existing) {
//     throw new Error('LinkedIn integration already exists. Use PUT to update.');
//   }

//   return await prisma.integration.create({
//     data: integrationData
//   });
// };

// exports.getIntegrations = async () => {
//   return await prisma.integration.findMany({
//     where: { providerType: 'linkedin' }
//   });
// };

// exports.getIntegration = async (id) => {
//   return await prisma.integration.findUnique({
//     where: { id }
//   });
// };

// exports.updateIntegration = async (id, data) => {
//   // Apply defaults for missing fields
//   const updateData = {
//     ...data,
//     ...(data.providerType === 'linkedin' ? LINKEDIN_DEFAULTS : {})
//   };

//   return await prisma.integration.update({
//     where: { id },
//     data: updateData
//   });
// };

// exports.deleteIntegration = async (id) => {
//   await prisma.integration.delete({
//     where: { id }
//   });
// };

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Default LinkedIn configuration
const LINKEDIN_DEFAULTS = {
  authorizedEndpointURL: 'https://www.linkedin.com/oauth/v2/authorization',
  tokenEndpointURL: 'https://www.linkedin.com/oauth/v2/accessToken',
  userInfoEndpointURL: 'https://api.linkedin.com/v2/me',
  defaultScopes: 'profile email w_member_social r_liteprofile r_emailaddress'
};

// ✅ NEW: Auto-detect latest LinkedIn integration
exports.getLatestLinkedInIntegration = async () => {
  const integration = await prisma.integration.findFirst({
    where: { 
      providerType: 'linkedin' 
    },
    orderBy: { createdAt: 'desc' } // Get most recent
  });

  if (!integration) {
    throw new Error('No LinkedIn integration found. Create one first.');
  }

  console.log(`🔍 Auto-detected LinkedIn integration ID: ${integration.id}`);
  return integration;
};

exports.createIntegration = async (data) => {
  if (data.providerType !== 'linkedin') {
    throw new Error('Only LinkedIn integration is supported');
  }

  const integrationData = {
    ...data,
    ...LINKEDIN_DEFAULTS,
    providerType: 'linkedin'
  };

  const existing = await prisma.integration.findUnique({
    where: { providerType: 'linkedin' }
  });

  if (existing) {
    throw new Error('LinkedIn integration already exists. Use PUT to update.');
  }

  return await prisma.integration.create({
    data: integrationData
  });
};

exports.getIntegrations = async () => {
  return await prisma.integration.findMany({
    where: { providerType: 'linkedin' }
  });
};

exports.getIntegration = async (id) => {
  return await prisma.integration.findUnique({
    where: { id }
  });
};

exports.updateIntegration = async (id, data) => {
  const updateData = {
    ...data,
    ...(data.providerType === 'linkedin' ? LINKEDIN_DEFAULTS : {})
  };

  return await prisma.integration.update({
    where: { id },
    data: updateData
  });
};

exports.deleteIntegration = async (id) => {
  await prisma.integration.delete({
    where: { id }
  });
};