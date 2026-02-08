const domainAuthService = require('../services/domainAuthService');

/**
 * Handles the request to generate SPF, DKIM, and DMARC records.
 */
exports.generateRecords = async (req, res) => {
    const { domain } = req.body;

    if (!domain) {
        return res.status(400).json({ error: 'Domain name is required.' });
    }

    try {
        const records = await domainAuthService.generateAuthRecords(domain);
        res.json(records);
    } catch (error) {
        console.error('Error in generateRecords controller:', error);
        res.status(500).json({ error: 'Failed to generate DNS records.' });
    }
};

/**
 * Handles the request to verify SPF, DKIM, and DMARC records.
 */
exports.verifyRecords = async (req, res) => {
    const { domain, dkimSelector } = req.body; // Expect selector from frontend

    if (!domain) {
        return res.status(400).json({ error: 'Domain name is required.' });
    }
    // DKIM selector is optional for the overall check, but crucial for DKIM specifically
    // if (!dkimSelector) {
    //     return res.status(400).json({ error: 'DKIM selector is required for verification.' });
    // }

    try {
        const verificationResults = await domainAuthService.verifyAuthRecords(domain, dkimSelector);
        res.json(verificationResults);
    } catch (error) {
        console.error('Error in verifyRecords controller:', error);
        res.status(500).json({ error: 'Failed to verify DNS records.' });
    }
};