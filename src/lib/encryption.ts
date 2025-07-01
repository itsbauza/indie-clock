import crypto from 'crypto';

function getEncryptionKey(): string {
  const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
  
  if (!ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY environment variable is required');
  }
  
  if (ENCRYPTION_KEY.length !== 32) {
    throw new Error('ENCRYPTION_KEY must be exactly 32 characters long');
  }
  
  return ENCRYPTION_KEY;
}

export function encrypt(text: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher('aes-256-gcm', key);
  cipher.setAAD(Buffer.from('indie-clock-pat', 'utf8'));
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const tag = cipher.getAuthTag();
  
  // Combine IV, encrypted data, and auth tag
  return iv.toString('hex') + ':' + encrypted + ':' + tag.toString('hex');
}

export function decrypt(encryptedText: string): string {
  const key = getEncryptionKey();
  const parts = encryptedText.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted text format');
  }
  
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  const tag = Buffer.from(parts[2], 'hex');
  
  const decipher = crypto.createDecipher('aes-256-gcm', key);
  decipher.setAAD(Buffer.from('indie-clock-pat', 'utf8'));
  decipher.setAuthTag(tag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
} 