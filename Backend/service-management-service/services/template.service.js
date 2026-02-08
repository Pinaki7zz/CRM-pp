const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper functions to map frontend strings to Prisma enum values
function mapToObjectType(value) {
  switch(value) {
    case 'Account': return 'ACCOUNT';
    case 'Contact': return 'CONTACT'; 
    case 'Ticket': return 'TICKET';
    default: return 'ACCOUNT';
  }
}

function mapToTemplateType(value) {
  switch(value) {
    case 'Text Based': return 'TEXT_BASED';
    case 'Document Based': return 'DOCUMENT_BASED';
    default: return 'TEXT_BASED';
  }
}

function mapToUsage(value) {
  switch(value) {
    case 'Template': return 'TEMPLATE';
    case 'Signature': return 'SIGNATURE';
    default: return 'TEMPLATE';
  }
}

function mapToLanguage(value) {
  switch(value) {
    case 'English': return 'ENGLISH';
    case 'Spanish': return 'SPANISH';
    case 'French': return 'FRENCH';
    case 'German': return 'GERMAN';
    case 'Italian': return 'ITALIAN';
    case 'Portuguese': return 'PORTUGUESE';
    case 'Dutch': return 'DUTCH';
    case 'Swedish': return 'SWEDISH';
    case 'Norwegian': return 'NORWEGIAN';
    case 'Danish': return 'DANISH';
    case 'Russian': return 'RUSSIAN';
    case 'Turkish': return 'TURKISH';
    default: return 'ENGLISH';
  }
}

exports.createTemplate = async (data) => {
  console.log('🔍 Service received data:', data);
  console.log('🔍 Service createdBy value:', data.createdBy);
  
  const templateCreateData = {
    name: data.name,
    object: mapToObjectType(data.object),
    language: mapToLanguage(data.language),
    templateType: mapToTemplateType(data.templateType),
    usage: mapToUsage(data.usage),
    subject: data.subject || null,
    content: data.content || null,
    fileName: data.fileName || null,
    fileData: data.fileData || null,
    createdBy: data.createdBy || 'System'
  };
  
  console.log('🔍 Data being sent to Prisma:', templateCreateData);
  console.log('🔍 Prisma createdBy:', templateCreateData.createdBy);
  
  const template = await prisma.template.create({
    data: templateCreateData
  });
  
  console.log('🔍 Template created by Prisma:', template);
  console.log('🔍 Final createdBy from DB:', template.createdBy);
  
  return template;
};


exports.getTemplates = async (filters = {}) => {
  try {
    const templates = await prisma.template.findMany({
      where: filters,
      orderBy: { createdAt: 'desc' }
    });
    console.log('Service found templates:', templates.length); // Debug log
    return templates;
  } catch (error) {
    console.error('Service error:', error);
    throw error;
  }
};

exports.getTemplateById = async (id) => {
  return await prisma.template.findUnique({
    where: { id }
  });
};

exports.updateTemplate = async (id, data) => {
  try {
    const updatedTemplate = await prisma.template.update({
      where: { id },
      data: {
        name: data.name,
        object: mapToObjectType(data.object),
        language: mapToLanguage(data.language),
        templateType: mapToTemplateType(data.templateType),
        usage: mapToUsage(data.usage),
        subject: data.subject || null,
        content: data.content || null,
        fileName: data.fileName || null,
        fileData: data.fileData || null,
        updatedAt: new Date()
      }
    });
    return updatedTemplate;
  } catch (error) {
    if (error.code === 'P2025') {
      return null; // Record not found
    }
    throw error;
  }
};

exports.deleteTemplate = async (id) => {
  try {
    await prisma.template.delete({
      where: { id }
    });
    return true;
  } catch (error) {
    if (error.code === 'P2025') {
      return false; // Record not found
    }
    throw error;
  }
};

exports.searchTemplates = async (searchTerm) => {
  return await prisma.template.findMany({
    where: {
      OR: [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { subject: { contains: searchTerm, mode: 'insensitive' } }
      ]
    },
    orderBy: { createdAt: 'desc' }
  });
};

exports.getTemplatesByUsage = async (usage) => {
  return await prisma.template.findMany({
    where: { 
      usage: mapToUsage(usage) 
    },
    orderBy: { createdAt: 'desc' }
  });
};
