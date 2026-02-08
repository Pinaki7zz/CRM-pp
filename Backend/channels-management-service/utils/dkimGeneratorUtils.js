const crypto = require('crypto');

/**
 * Generates a unique DKIM selector.
 * @returns {string} A unique selector string.
 */
const generateDkimSelector = () => {
    // A more robust selector could incorporate a hash of the domain + a UUID
    // For simplicity, we'll use a timestamp-based prefix.
    return `crm-${Date.now()}`;
};

/**
 * Generates an RSA public/private key pair.
 * @returns {{publicKey: string, privateKey: string}} The generated key pair in PEM format.
 */
const generateRsaKeyPair = () => {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048, // Standard for DKIM
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem'
        }
    });
    return { publicKey, privateKey };
};

/**
 * Extracts the clean base64 public key string from PEM format.
 * @param {string} pemPublicKey The public key in PEM format.
 * @returns {string} The base64 encoded public key string without PEM headers/footers.
 */
const getCleanPublicKey = (pemPublicKey) => {
    return pemPublicKey
        .replace('-----BEGIN PUBLIC KEY-----', '')
        .replace('-----END PUBLIC KEY-----', '')
        .replace(/\n/g, ''); // Remove newlines
};

/**
 * Simulates storing the DKIM private key securely.
 * IMPORTANT: In a real application, this would involve storing in a secure database
 * linked to the user's domain and ensuring proper encryption and access control.
 * This function just logs it for demonstration.
 * @param {string} domain The domain the key is for.
 * @param {string} selector The DKIM selector.
 * @param {string} privateKey The private key to store.
 */
const storeDkimPrivateKey = (domain, selector, privateKey) => {
    console.log(`\n--- IMPORTANT: For domain: ${domain}, selector: ${selector} ---`);
    console.log(`--- Store this Private Key SECURELY in your database ---`);
    console.log(privateKey);
    console.log('------------------------------------------------------------------\n');
    // In a production app, you'd save this privateKey and selector
    // to your persistent storage (e.g., PostgreSQL, MongoDB)
    // associated with the domain. Your email sending service would then retrieve this.
};

module.exports = {
    generateDkimSelector,
    generateRsaKeyPair,
    getCleanPublicKey,
    storeDkimPrivateKey
};