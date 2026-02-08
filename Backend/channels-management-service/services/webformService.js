const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class WebformService {

  // Generate unique webform ID
  generateWebformId() {
    return `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Generate unique URL
  generateUniqueUrl(formName) {
    const sanitized = formName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const uniquePart = Math.random().toString(36).substr(2, 6);
    return `${sanitized}-${uniquePart}`;
  }

  // Generate embed code
  generateEmbedCode(webformData) {
    const formId = `webform${Date.now()}`;
    const fieldsHtml = webformData.fields.map(field => {
      const fieldId = field.label.replace(/\s+/g, '_');
      return `
        <div class='zcwf_row'>
          <div class='zcwf_col_lab' style='font-size:12px; font-family: Arial;'>
            <label for='${fieldId}'>${field.label}${field.required ? " <span style='color:red;'>*</span>" : ""}</label>
          </div>
          <div class='zcwf_col_fld'>
            ${field.label === "Email Opt Out"
          ? `<input type='checkbox' id='${fieldId}' name='${field.label}'></input>`
          : field.label === "Description"
            ? `<textarea id='${fieldId}' name='${field.label}' rows='4' maxlength='500'></textarea>`
            : `<input type='text' id='${fieldId}' ${field.required ? "aria-required='true'" : ""} name='${field.label}' maxlength='200'></input>`
        }
            <div class='zcwf_col_help'></div>
          </div>
        </div>`;
    }).join('');

    const mandatoryFields = webformData.fields
      .filter(f => f.required)
      .map(f => `'${f.label.replace(/\s+/g, '_')}'`)
      .join(', ');

    const mandatoryLabels = webformData.fields
      .filter(f => f.required)
      .map(f => `'${f.label}'`)
      .join(', ');

    return `<!-- Webform Embed Code -->
<div id='crmWebToEntityForm' class='zcwf_lblLeft crmWebToEntityForm' style='background-color: white;color: black;max-width: 600px;'>
  <meta name='viewport' content='width=device-width, initial-scale=1.0'>
  <META HTTP-EQUIV='content-type' CONTENT='text/html;charset=UTF-8'>
  <form id='${formId}' action='${process.env.API_URL || 'http://localhost:4008'}/api/lead-form-submissions' name='WebTo${webformData.module}${formId}' method='POST' onSubmit='javascript:return checkMandatory${formId}()' accept-charset='UTF-8'>
    <input type='hidden' name='webformId' value='${webformData.webformId}'></input>
    <input type='hidden' name='returnURL' value='${webformData.customRedirectUrl || ''}'></input>
    
    <style>
      html,body{ margin: 0px; }
      .formsubmit.zcwf_button{ color: white !important; background: linear-gradient(0deg, #0279FF 0%, #00A3F3 100%); }
      #crmWebToEntityForm.zcwf_lblLeft{ width: 100%; padding: 25px; margin: 0 auto; box-sizing: border-box; }
      #crmWebToEntityForm.zcwf_lblLeft *{ box-sizing: border-box; }
      #crmWebToEntityForm {text-align: left; }
      .zcwf_lblLeft .zcwf_title{ word-wrap: break-word; padding: 0px 6px 10px; font-weight: bold; }
      .zcwf_lblLeft .zcwf_col_fld input[type=text], .zcwf_lblLeft .zcwf_col_fld textarea{ 
        width: 60%; border: 1px solid #c0c6cc !important; resize: vertical; 
        border-radius: 2px; float: left; padding: 8px;
      }
      .zcwf_lblLeft .zcwf_col_lab{ 
        width: 30%; word-break: break-word; padding: 0px 6px 0px; 
        margin-right: 10px; margin-top: 5px; float: left; min-height: 1px; 
      }
      .zcwf_lblLeft .zcwf_col_fld{ float: left; width: 68%; padding: 0px 6px 0px; position: relative; margin-top: 5px; }
      .zcwf_lblLeft .zcwf_row:after, .zcwf_lblLeft .zcwf_col_fld:after{ content: ''; display: table; clear: both; }
      .zcwf_lblLeft .zcwf_row {margin: 15px 0px; }
      .zcwf_lblLeft .formsubmit{ margin-right: 5px; cursor: pointer; color: #313949; font-size: 12px; }
      .zcwf_lblLeft .zcwf_button{ 
        font-size: 12px; color: #313949; border: 1px solid #c0c6cc; 
        padding: 8px 16px; border-radius: 4px; cursor: pointer; 
      }
      @media all and (max-width: 600px){
        .zcwf_lblLeft .zcwf_col_lab, .zcwf_lblLeft .zcwf_col_fld{ width: auto; float: none !important; }
      }
    </style>
    
    <div class='zcwf_title' style='max-width: 600px;color: black; font-family:Arial;'>${webformData.name}</div>
    ${fieldsHtml}
    
    <div class='zcwf_row'>
      <div class='zcwf_col_lab'></div>
      <div class='zcwf_col_fld'>
        <input type='submit' id='formsubmit' role='button' class='formsubmit zcwf_button' value='Submit' title='Submit'>
        <input type='reset' class='zcwf_button' role='button' name='reset' value='Reset' title='Reset'>
      </div>
    </div>
    
    <script>
      function checkMandatory${formId}(){
        var mndFileds = new Array(${mandatoryFields});
        var fldLangVal = new Array(${mandatoryLabels});
        for(i=0;i<mndFileds.length;i++){
          var fieldObj=document.forms['WebTo${webformData.module}${formId}'][mndFileds[i]];
          if(fieldObj){
            if(((fieldObj.value).replace(/^\\s+|\\s+$/g,'')).length==0){
              alert(fldLangVal[i]+' cannot be empty.');
              fieldObj.focus();
              return false;
            }else if(fieldObj.nodeName=='SELECT'){
              if(fieldObj.options[fieldObj.selectedIndex].value=='-None-'){
                alert(fldLangVal[i]+' cannot be none.');
                fieldObj.focus();
                return false;
              }
            }else if(fieldObj.type=='checkbox'){
              if(fieldObj.checked==false){
                alert('Please accept '+fldLangVal[i]);
                fieldObj.focus();
                return false;
              }
            }
          }
        }
        document.querySelector('.crmWebToEntityForm .formsubmit').setAttribute('disabled', true);
      }
    </script>
  </form>
</div>`;
  }

  // Create webform
  async createWebform(data) {
    try {
      const webformId = this.generateWebformId();
      const url = data.url || this.generateUniqueUrl(data.name);

      // Check if URL already exists
      const existingWebform = await prisma.webform.findUnique({
        where: { url }
      });

      if (existingWebform) {
        throw new Error('URL already exists. Please use a different URL.');
      }

      // Generate embed code
      const embedData = {
        webformId,
        name: data.name,
        module: data.module,
        fields: data.fields || [],
        customRedirectUrl: data.customRedirectUrl
      };
      const embedCode = this.generateEmbedCode(embedData);

      const webform = await prisma.webform.create({
        data: {
          webformId,
          name: data.name,
          url,
          module: data.module,
          fields: data.fields || [],
          formLocationUrls: data.formLocationUrls || [],
          actionOnSubmission: data.actionOnSubmission || 'thankyou',
          customRedirectUrl: data.customRedirectUrl || null,
          thankYouMessage: data.thankYouMessage || 'Thank you for your response.',
          assignedOwner: data.assignedOwner || null,
          enableContactCreation: data.enableContactCreation || false,
          tags: data.tags || [],
          embedCode: embedCode
        }
      });

      return webform;
    } catch (error) {
      console.error('Service error creating webform:', error);
      throw error;
    }
  }

  // Get all webforms
  async getAllWebforms(module) {
    try {
      const where = module ? { module } : {};

      const webforms = await prisma.webform.findMany({
        where,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          _count: {
            select: { submissions: true }
          }
        }
      });

      return webforms;
    } catch (error) {
      console.error('Service error fetching webforms:', error);
      throw error;
    }
  }

  // Get webform by URL
  async getWebformByUrl(url) {
    try {
      const webform = await prisma.webform.findUnique({
        where: { url },
        include: {
          _count: {
            select: { submissions: true }
          }
        }
      });

      return webform;
    } catch (error) {
      console.error('Service error fetching webform by URL:', error);
      throw error;
    }
  }

  // Get webform by ID
  async getWebformById(id) {
    try {
      const webform = await prisma.webform.findUnique({
        where: { id },
        include: {
          _count: {
            select: { submissions: true }
          }
        }
      });

      return webform;
    } catch (error) {
      console.error('Service error fetching webform by ID:', error);
      throw error;
    }
  }

  // Update webform
  async updateWebform(id, data) {
    try {
      // Check if webform exists
      const existingWebform = await prisma.webform.findUnique({
        where: { id }
      });

      if (!existingWebform) {
        throw new Error('Webform not found');
      }

      // If URL is being updated, check uniqueness
      if (data.url && data.url !== existingWebform.url) {
        const urlExists = await prisma.webform.findUnique({
          where: { url: data.url }
        });

        if (urlExists) {
          throw new Error('URL already exists. Please use a different URL.');
        }
      }

      // Prepare update data - only include fields that are provided
      const updateData = {};

      if (data.name !== undefined) updateData.name = data.name;
      if (data.url !== undefined) updateData.url = data.url;
      if (data.module !== undefined) updateData.module = data.module;
      if (data.fields !== undefined) updateData.fields = data.fields;
      if (data.formLocationUrls !== undefined) updateData.formLocationUrls = data.formLocationUrls;
      if (data.actionOnSubmission !== undefined) updateData.actionOnSubmission = data.actionOnSubmission;
      if (data.customRedirectUrl !== undefined) updateData.customRedirectUrl = data.customRedirectUrl;
      if (data.thankYouMessage !== undefined) updateData.thankYouMessage = data.thankYouMessage;
      if (data.assignedOwner !== undefined) updateData.assignedOwner = data.assignedOwner;
      if (data.enableContactCreation !== undefined) updateData.enableContactCreation = data.enableContactCreation;
      if (data.tags !== undefined) updateData.tags = data.tags;
      if (data.isActive !== undefined) updateData.isActive = data.isActive;
      if (data.embedCode !== undefined) updateData.embedCode = data.embedCode;

      const webform = await prisma.webform.update({
        where: { id },
        data: updateData
      });

      return webform;
    } catch (error) {
      console.error('Service error updating webform:', error);
      throw error;
    }
  }

  // Delete webform
  async deleteWebform(id) {
    try {
      const existingWebform = await prisma.webform.findUnique({
        where: { id }
      });

      if (!existingWebform) {
        throw new Error('Webform not found');
      }

      await prisma.webform.delete({
        where: { id }
      });

      return true;
    } catch (error) {
      console.error('Service error deleting webform:', error);
      throw error;
    }
  }

  // Submit webform
  async submitWebform(data) {
    try {
      // Verify webform exists
      const webform = await prisma.webform.findUnique({
        where: { id: data.webformId }
      });

      if (!webform) {
        throw new Error('Webform not found');
      }

      if (!webform.isActive) {
        throw new Error('This webform is no longer active');
      }

      const submission = await prisma.webformSubmission.create({
        data: {
          webformId: data.webformId,
          submissionData: data.submissionData,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent
        }
      });

      return submission;
    } catch (error) {
      console.error('Service error submitting webform:', error);
      throw error;
    }
  }

  // Get submissions for a webform
  async getWebformSubmissions(webformId) {
    try {
      const submissions = await prisma.webformSubmission.findMany({
        where: { webformId },
        orderBy: {
          submittedAt: 'desc'
        },
        include: {
          webform: {
            select: {
              name: true,
              module: true
            }
          }
        }
      });

      return submissions;
    } catch (error) {
      console.error('Service error fetching submissions:', error);
      throw error;
    }
  }
}

module.exports = new WebformService();
