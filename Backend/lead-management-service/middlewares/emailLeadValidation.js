// middlewares/emailLeadValidation.js
class EmailLeadValidation {
  
  // Validate parsed email lead data
  validateParsedLeadData(leadData) {
    const errors = [];
    
    // Required fields validation
    if (!leadData.email) {
      errors.push('Email is required');
    } else if (!this.isValidEmail(leadData.email)) {
      errors.push('Invalid email format');
    }
    
    if (!leadData.name) {
      errors.push('Name could not be extracted');
    }
    
    // Optional field validation
    if (leadData.phone && !this.isValidPhone(leadData.phone)) {
      errors.push('Invalid phone number format');
    }
    
    if (leadData.company && leadData.company.length > 100) {
      errors.push('Company name too long');
    }
    
    if (leadData.jobTitle && leadData.jobTitle.length > 100) {
      errors.push('Job title too long');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors,
      leadData: this.sanitizeLeadData(leadData)
    };
  }
  
  // Sanitize lead data
  sanitizeLeadData(leadData) {
    return {
      ...leadData,
      email: leadData.email ? leadData.email.toLowerCase().trim() : null,
      name: leadData.name ? leadData.name.trim() : null,
      phone: leadData.phone ? leadData.phone.trim() : null,
      company: leadData.company ? leadData.company.trim() : null,
      jobTitle: leadData.jobTitle ? leadData.jobTitle.trim() : null
    };
  }
  
  // Email validation
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  // Phone validation
  isValidPhone(phone) {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  }
}

module.exports = new EmailLeadValidation();