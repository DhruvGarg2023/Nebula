import { createHash, randomBytes, createCipheriv, createDecipheriv } from 'node:crypto';

/**
 * Cryptographic utility functions for authentication and secret encryption.
 */

export function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

export function generateSecureToken(bytes = 32) {
  return randomBytes(bytes).toString('hex');
}

/**
 * Encrypt a plaintext string using AES-256-GCM.
 * Output format: `ivHex:authTagHex:encryptedDataHex`
 *
 * @param {string} text - Plaintext to encrypt
 * @param {string} secretKey - Secret key (at least 32 bytes or hashed to 32 bytes)
 * @returns {string} Encrypted token string
 */
export function encryptSymmetric(text, secretKey = process.env.ENCRYPTION_KEY || 'default-encryption-key-must-be-32!!') {
  if (!text) return text;
  const key = createHash('sha256').update(secretKey).digest(); // Always 32 bytes
  const iv = randomBytes(12); // 96-bit IV for GCM
  const cipher = createCipheriv('aes-256-gcm', key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag().toString('hex');

  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypt an AES-256-GCM encrypted string.
 *
 * @param {string} encryptedText - Encrypted token string (`iv:tag:cipher`)
 * @param {string} secretKey - Secret key used for encryption
 * @returns {string} Decrypted plaintext
 */
export function decryptSymmetric(encryptedText, secretKey = process.env.ENCRYPTION_KEY || 'default-encryption-key-must-be-32!!') {
  if (!encryptedText) return encryptedText;
  const parts = encryptedText.split(':');
  if (parts.length !== 3) {
    // Return raw text if not in encrypted format (e.g. dev/unencrypted tokens)
    return encryptedText;
  }

  const [ivHex, authTagHex, encryptedDataHex] = parts;
  const key = createHash('sha256').update(secretKey).digest();
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedDataHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

