const supportedLanguages = [
  'English', 'Spanish', 'French', 'German', 'Italian', 
  'Portuguese', 'Dutch', 'Swedish', 'Norwegian', 'Danish', 
  'Russian', 'Turkish'
];

const supportedObjects = ['Account', 'Contact', 'Ticket'];
const supportedTemplateTypes = ['Text Based', 'Document Based'];
const supportedUsageTypes = ['Template', 'Signature'];

exports.validateCreateTemplate = (data) => {
  const errors = [];
  
  if (!data.name || data.name.trim() === '') {
    errors.push({ field: 'name', message: 'Name is required' });
  }
  
  if (!data.object || data.object.trim() === '') {
    errors.push({ field: 'object', message: 'Object is required' });
  }
  
  if (!data.language || data.language.trim() === '') {
    errors.push({ field: 'language', message: 'Language is required' });
  }
  
  if (!data.templateType || data.templateType.trim() === '') {
    errors.push({ field: 'templateType', message: 'Template Type is required' });
  }
  
  if (!data.usage || data.usage.trim() === '') {
    errors.push({ field: 'usage', message: 'Usage is required' });
  }
  
  // Subject required only for Template usage
  if (data.usage === 'Template' && (!data.subject || data.subject.trim() === '')) {
    errors.push({ field: 'subject', message: 'Subject is required for Template usage' });
  }
  
  return errors;
};


exports.validateUpdateTemplate = (data) => {
  // Same validation as create for updates
  return exports.validateCreateTemplate(data);
};

exports.validateTemplateId = (id) => {
  const errors = [];
  
  if (!id || isNaN(parseInt(id))) {
    errors.push({ field: 'id', message: 'Valid template ID is required' });
  }
  
  return errors;
};

exports.validateSearchQuery = (query) => {
  const errors = [];
  
  if (!query || query.trim() === '') {
    errors.push({ field: 'query', message: 'Search query is required' });
  } else if (query.length < 2) {
    errors.push({ field: 'query', message: 'Search query must be at least 2 characters' });
  }
  
  return errors;
};
