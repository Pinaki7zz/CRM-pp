const emailConfig = require('../config/emailConfig');

class EmailParserService {
  
  // Main parsing function
  parseEmailForLeads(headers, body) {
    try {
      const leadData = {
        // From headers
        email: this.extractEmailFromHeader(headers.from),
        name: this.extractNameFromHeader(headers.from),
        subject: this.extractSubject(headers.subject),
        receivedDate: this.extractDate(headers.date),
        
        // From body parsing
        phone: this.extractPhone(body),
        company: this.extractCompany(body),
        jobTitle: this.extractJobTitle(body),
        additionalEmails: this.extractAdditionalEmails(body),
        
        // Metadata
        originalEmail: body,
        parseStatus: 'SUCCESS'
      };
      
      // Clean and validate data
      return this.cleanLeadData(leadData);
      
    } catch (error) {
      console.error('Error parsing email:', error);
      return {
        parseStatus: 'FAILED',
        error: error.message,
        originalEmail: body
      };
    }
  }

  // Extract email from header
  extractEmailFromHeader(fromHeader) {
    if (!fromHeader || !fromHeader[0]) return null;
    
    const emailMatch = fromHeader[0].match(emailConfig.patterns.email);
    return emailMatch ? emailMatch[0].toLowerCase() : null;
  }

  // Extract name from header
  extractNameFromHeader(fromHeader) {
    if (!fromHeader || !fromHeader[0]) return null;
    
    const headerText = fromHeader[0];
    
    // Try to extract name from "Name <email@domain.com>" format
    const nameMatch = headerText.match(/^(.+?)\s*<.+@.+>/);
    if (nameMatch) {
      return nameMatch[1].trim().replace(/['"]/g, '');
    }
    
    // If no name in header, try to extract from email prefix
    const emailMatch = headerText.match(/([^@]+)@/);
    if (emailMatch) {
      return this.formatNameFromEmail(emailMatch[1]);
    }
    
    return null;
  }

  // Extract subject
  extractSubject(subjectHeader) {
    if (!subjectHeader || !subjectHeader[0]) return null;
    return subjectHeader[0].trim();
  }

  // Extract date
  extractDate(dateHeader) {
    if (!dateHeader || !dateHeader[0]) return new Date();
    return new Date(dateHeader[0]);
  }

  // Extract phone numbers
  extractPhone(body) {
    if (!body) return null;
    
    const phoneMatches = body.match(emailConfig.patterns.phone);
    if (phoneMatches && phoneMatches.length > 0) {
      // Return the first phone number found, cleaned
      return this.cleanPhoneNumber(phoneMatches[0]);
    }
    return null;
  }

  // Extract company name
  extractCompany(body) {
    if (!body) return null;
    
    const lines = body.split('\n');
    
    // Look for company indicators
    for (let line of lines) {
      const companyMatch = line.match(emailConfig.patterns.company);
      if (companyMatch) {
        // Extract the line containing company info
        const companyLine = line.trim();
        if (companyLine.length > 3 && companyLine.length < 100) {
          return companyLine;
        }
      }
    }
    
    // Look for common company patterns in signature
    const signatureSection = this.extractSignatureSection(body);
    if (signatureSection) {
      const companyMatch = signatureSection.match(emailConfig.patterns.companyInSignature);
      if (companyMatch) {
        return companyMatch[0].trim();
      }
    }
    
    return null;
  }

  // Extract job title
  extractJobTitle(body) {
    if (!body) return null;
    
    const lines = body.split('\n');
    
    // Look for job title patterns
    for (let line of lines) {
      const jobMatches = line.match(emailConfig.patterns.jobTitle);
      if (jobMatches) {
        // Find the line with job title
        const titleLine = line.trim();
        if (titleLine.length > 2 && titleLine.length < 50) {
          return titleLine;
        }
      }
    }
    
    return null;
  }

  // Extract additional emails from body
  extractAdditionalEmails(body) {
    if (!body) return [];
    
    const emailMatches = body.match(emailConfig.patterns.email);
    if (emailMatches) {
      // Remove duplicates and return as array
      return [...new Set(emailMatches.map(email => email.toLowerCase()))];
    }
    return [];
  }

  // Extract signature section (usually last part of email)
  extractSignatureSection(body) {
    if (!body) return null;
    
    const lines = body.split('\n');
    // Get last 10 lines as potential signature
    const signatureLines = lines.slice(-10);
    return signatureLines.join('\n');
  }

  // Clean phone number
  cleanPhoneNumber(phone) {
    if (!phone) return null;
    
    // Remove all non-digit characters except + at the beginning
    return phone.replace(/[^\d+]/g, '').replace(/\+(?!^)/g, '');
  }

  // Format name from email prefix
  formatNameFromEmail(emailPrefix) {
    if (!emailPrefix) return null;
    
    // Replace dots, underscores, numbers with spaces
    let name = emailPrefix.replace(/[._\d]/g, ' ');
    
    // Capitalize first letter of each word
    return name.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
      .trim();
  }

  // Clean and validate lead data
  cleanLeadData(leadData) {
    return {
      ...leadData,
      name: leadData.name ? leadData.name.trim() : null,
      email: leadData.email ? leadData.email.toLowerCase().trim() : null,
      phone: leadData.phone ? leadData.phone.trim() : null,
      company: leadData.company ? leadData.company.trim() : null,
      jobTitle: leadData.jobTitle ? leadData.jobTitle.trim() : null,
      subject: leadData.subject ? leadData.subject.trim() : null
    };
  }

  // Email validation utility
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

module.exports = new EmailParserService();