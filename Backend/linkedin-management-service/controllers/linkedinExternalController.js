const linkedinExternalService = require('../services/linkedinExternalService');
const integrationService = require('../services/integrationService'); // New import
const { linkedinExternalSchema } = require('../validations/linkedinExternalValidation');

exports.createLinkedinExternal = async (req, res) => {
  try {
    const { error, value } = linkedinExternalSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    // ✅ AUTO-ASSIGN: Get the latest LinkedIn integration automatically
    const integration = await integrationService.getLatestLinkedInIntegration();
    if (!integration) {
      return res.status(400).json({ 
        error: 'LinkedIn Integration not configured. Create Integration first.',
        nextStep: 'POST /integrations to set up LinkedIn configuration'
      });
    }

    // Auto-add integrationId to the request data
    const dataWithIntegration = {
      ...value,
      integrationId: integration.id  // ✅ Automatically assigned
    };

    const linkedinExternal = await linkedinExternalService.createLinkedinExternal(dataWithIntegration);
    res.status(201).json({ 
      message: 'LinkedIn External Credential created successfully',
      linkedinExternalId: linkedinExternal.id,
      autoAssigned: {
        integrationId: integration.id,
        integrationName: integration.providerName
      },
      linkedinExternal,
      nextStep: 'Use this ID to initiate LinkedIn login: GET /linkedin-externals/:id/login/initiate'
    });
  } catch (error) {
    console.error('LinkedinExternal creation error:', error);
    res.status(500).json({ error: 'Failed to create LinkedIn External Credential' });
  }
};

// Rest of methods unchanged...
exports.getLinkedinExternals = async (req, res) => {
  try {
    const linkedinExternals = await linkedinExternalService.getLinkedinExternals();
    res.json({ 
      message: 'LinkedIn External Credentials retrieved successfully',
      count: linkedinExternals.length,
      linkedinExternals 
    });
  } catch (error) {
    console.error('Get LinkedinExternals error:', error);
    res.status(500).json({ error: 'Failed to fetch LinkedIn External Credentials' });
  }
};

exports.getLinkedinExternal = async (req, res) => {
  try {
    const { id } = req.params;
    const linkedinExternal = await linkedinExternalService.getLinkedinExternal(parseInt(id));
    if (!linkedinExternal) return res.status(404).json({ error: 'LinkedIn External Credential not found' });
    
    res.json({ 
      message: 'LinkedIn External Credential retrieved successfully',
      linkedinExternal 
    });
  } catch (error) {
    console.error('Get LinkedinExternal error:', error);
    res.status(500).json({ error: 'Failed to fetch LinkedIn External Credential' });
  }
};

exports.updateLinkedinExternal = async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = linkedinExternalSchema.validate(req.body, { allowUnknown: true });
    if (error) return res.status(400).json({ error: error.details[0].message });

    const linkedinExternal = await linkedinExternalService.updateLinkedinExternal(parseInt(id), value);
    res.json({ 
      message: 'LinkedIn External Credential updated successfully',
      linkedinExternal 
    });
  } catch (error) {
    console.error('Update LinkedinExternal error:', error);
    res.status(500).json({ error: 'Failed to update LinkedIn External Credential' });
  }
};

exports.deleteLinkedinExternal = async (req, res) => {
  try {
    const { id } = req.params;
    await linkedinExternalService.deleteLinkedinExternal(parseInt(id));
    res.json({ message: 'LinkedIn External Credential deleted successfully' });
  } catch (error) {
    console.error('Delete LinkedinExternal error:', error);
    res.status(500).json({ error: 'Failed to delete LinkedIn External Credential' });
  }
};

// LinkedIn Login Flow
exports.initiateLinkedInLogin = async (req, res) => {
  try {
    const { id } = req.params;
    const linkedinExternal = await linkedinExternalService.getLinkedinExternal(parseInt(id));
    if (!linkedinExternal) return res.status(404).json({ error: 'LinkedIn External Credential not found' });

    const integration = await linkedinExternalService.getIntegration(linkedinExternal.integrationId);
    if (!integration) return res.status(400).json({ error: 'LinkedIn Integration not found' });

    const authUrl = `${integration.authorizedEndpointURL}?` +
      `response_type=code&` +
      `client_id=${integration.clientId}&` +
      `redirect_uri=${encodeURIComponent(integration.callBackURL)}&` +
      `scope=${linkedinExternal.scope || integration.defaultScopes}`;

    console.log(`🔗 Initiating LinkedIn login for External ID ${id}`);
    
    res.json({ 
      message: 'LinkedIn login initiated',
      authUrl,
      instructions: '1. Open this URL in browser\n2. Login to LinkedIn\n3. Authorize the app\n4. Copy the "code" from callback URL\n5. Use in callback endpoint',
      callbackUrl: `${req.protocol}://${req.get('host')}/linkedin-externals/${id}/login/callback`
    });
  } catch (error) {
    console.error('Initiate LinkedIn login error:', error);
    res.status(500).json({ error: 'Failed to initiate LinkedIn login' });
  }
};

exports.handleLinkedInCallback = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, error: authError } = req.query;

    if (authError) {
      return res.status(400).json({ 
        error: 'LinkedIn authorization failed',
        details: authError 
      });
    }

    if (!code) {
      return res.status(400).json({ 
        error: 'Authorization code missing from LinkedIn callback' 
      });
    }

    console.log(`🔄 Processing LinkedIn callback for External ID ${id}`);

    const linkedinExternal = await linkedinExternalService.getLinkedinExternal(parseInt(id));
    if (!linkedinExternal) return res.status(404).json({ error: 'LinkedIn External Credential not found' });

    const integration = await linkedinExternalService.getIntegration(linkedinExternal.integrationId);
    if (!integration) return res.status(400).json({ error: 'LinkedIn Integration not found' });

    const tokens = await linkedinExternalService.exchangeLinkedInCode(code, integration);

    if (!tokens.access_token) {
      return res.status(401).json({ 
        error: 'Failed to get LinkedIn access token',
        details: tokens.error_description || 'Unknown error'
      });
    }

    // Update principal status to CONFIGURED
    const principalName = linkedinExternal.externalCredentialName.replace('_Credential', ''); // Extract principal name
    const updatedCount = await linkedinExternalService.updatePrincipalStatusAfterLogin(
      principalName, 
      linkedinExternal.integrationId
    );

    console.log(`✅ LinkedIn login successful! Principal "${principalName}" updated`);

    res.json({ 
      message: 'LinkedIn login successful! Principal status updated to CONFIGURED',
      tokens: {
        access_token: tokens.access_token.substring(0, 20) + '...', // Partial for security
        expires_in: tokens.expires_in,
        scope: tokens.scope
      },
      principalUpdated: updatedCount > 0,
      principalName: principalName,
      nextStep: 'Integration is ready! CRM users can now generate leads.'
    });
  } catch (error) {
    console.error('LinkedIn callback error:', error);
    res.status(500).json({ 
      error: 'LinkedIn login failed',
      details: error.message 
    });
  }
};