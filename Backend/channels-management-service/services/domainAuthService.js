const dns = require('dns').promises; // Node.js built-in DNS resolver
const { SPF, DKIM, DMARC } = require('mailauth'); // From mailauth library
const {
    generateDkimSelector,
    generateRsaKeyPair,
    getCleanPublicKey,
    storeDkimPrivateKey
} = require('../utils/dkimGeneratorUtils');

const CRM_SENDING_DOMAIN = process.env.CRM_SENDING_DOMAIN;
const DMARC_REPORT_EMAIL_AGGREGATE = process.env.DMARC_REPORT_EMAIL_AGGREGATE;
const DMARC_REPORT_EMAIL_FORENSIC = process.env.DMARC_REPORT_EMAIL_FORENSIC;

/**
 * Generates SPF, DKIM, and DMARC record strings for a given domain.
 * @param {string} domain The domain name for which to generate records.
 * @returns {Promise<object>} An object containing the SPF, DKIM, DMARC records and the DKIM selector.
 */
exports.generateAuthRecords = async (domain) => {
    // 1. Generate SPF Record
    const spfRecord = `v=spf1 include:${CRM_SENDING_DOMAIN} ~all`;

    // 2. Generate DKIM Record
    const selector = generateDkimSelector();
    const { publicKey, privateKey } = generateRsaKeyPair();
    const dkimPublicKeyClean = getCleanPublicKey(publicKey);
    const dkimRecord = `${selector}._domainkey IN TXT "v=DKIM1; k=rsa; p=${dkimPublicKeyClean}"`;

    // IMPORTANT: Store the private key securely in your actual database
    // For this example, it's just logged via the util function.
    storeDkimPrivateKey(domain, selector, privateKey);

    // 3. Generate DMARC Record
    const dmarcRecord = `v=DMARC1; p=none; rua=mailto:${DMARC_REPORT_EMAIL_AGGREGATE}; ruf=mailto:${DMARC_REPORT_EMAIL_FORENSIC};`;

    return {
        spf: spfRecord,
        dkim: dkimRecord,
        dmarc: dmarcRecord,
        dkimSelector: selector // Useful for the verification step
    };
};

/**
 * Verifies the existence and validity of SPF, DKIM, and DMARC records for a domain.
 * @param {string} domain The domain name to verify.
 * @param {string} dkimSelector The DKIM selector that was used during generation.
 * @returns {Promise<object>} An object with verification status for each record type.
 */
exports.verifyAuthRecords = async (domain, dkimSelector) => {
    const results = {
        spf: { status: 'not_found', record: null, message: 'SPF record not found or invalid.' },
        dkim: { status: 'not_found', record: null, message: 'DKIM record not found or invalid.' },
        dmarc: { status: 'not_found', record: null, message: 'DMARC record not found or invalid.' }
    };

    // --- SPF Verification ---
    try {
        const spfResult = await SPF.lookup(domain);
        if (spfResult && spfResult.record) {
            // Check if our CRM's sending domain is included
            if (spfResult.record.includes(`include:${CRM_SENDing_DOMAIN}`)) {
                results.spf.status = 'valid';
                results.spf.record = spfResult.record;
                results.spf.message = 'SPF record found and includes CRM sending domain.';
            } else {
                results.spf.status = 'invalid_include';
                results.spf.record = spfResult.record;
                results.spf.message = `SPF record found but does not include ${CRM_SENDING_DOMAIN}.`;
            }
        }
    } catch (error) {
        // Handle specific DNS errors if needed, e.g., NXDOMAIN (domain not found)
        console.warn(`SPF lookup failed for ${domain}: ${error.message}`);
    }

    // --- DKIM Verification ---
    if (dkimSelector) {
        try {
            // mailauth's DKIM.lookup expects an options object
            const dkimResult = await DKIM.lookup({ domain: domain, selector: dkimSelector });
            if (dkimResult && dkimResult.record) {
                // Here, we're just checking for existence and basic validity as parsed by mailauth.
                // A full verification would involve trying to sign/verify a test email.
                results.dkim.status = 'valid';
                results.dkim.record = dkimResult.record;
                results.dkim.message = 'DKIM record found and appears valid.';
            }
        } catch (error) {
            console.warn(`DKIM lookup failed for ${domain} (selector ${dkimSelector}): ${error.message}`);
        }
    } else {
        results.dkim.message = 'DKIM selector not provided for verification.';
    }


    // --- DMARC Verification ---
    try {
        const dmarcResult = await DMARC.lookup(domain);
        if (dmarcResult && dmarcResult.record) {
            results.dmarc.status = 'valid';
            results.dmarc.record = dmarcResult.record;
            results.dmarc.message = `DMARC record found with policy: ${dmarcResult.policy}.`;
            // You can also expose dmarcResult.policy, dmarcResult.rua, etc.
        }
    } catch (error) {
        console.warn(`DMARC lookup failed for ${domain}: ${error.message}`);
    }

    return results;
};