import crypto from 'crypto';

const CODE_CHARSET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // 32 characters, no ambiguous chars like 0, O, 1, I
const SALT = process.env.CODE_SALT || 'rfut_dor_secure_salt_2026';

/**
 * Generate a cryptographically secure random voting code in generalized format (e.g. XXXX-XXXX)
 */
export const generateVotingCode = () => {
  const bytes = crypto.randomBytes(8);
  let part1 = '';
  let part2 = '';

  for (let i = 0; i < 4; i++) {
    part1 += CODE_CHARSET[bytes[i] % CODE_CHARSET.length];
  }
  for (let i = 4; i < 8; i++) {
    part2 += CODE_CHARSET[bytes[i] % CODE_CHARSET.length];
  }

  return `${part1}-${part2}`;
};

/**
 * Normalize voting code: uppercase, trim, remove unexpected characters
 */
export const normalizeCode = (rawCode) => {
  if (!rawCode || typeof rawCode !== 'string') return '';
  return rawCode.trim().toUpperCase().replace(/\s+/g, '');
};

/**
 * Compute SHA-256 hash of normalized code with cryptographic salt
 */
export const hashVotingCode = (code) => {
  const normalized = normalizeCode(code);
  return crypto
    .createHash('sha256')
    .update(`${normalized}:${SALT}`)
    .digest('hex');
};

/**
 * Verify a plain code against a stored hash
 */
export const verifyVotingCode = (plainCode, storedHash) => {
  const computedHash = hashVotingCode(plainCode);
  return crypto.timingSafeEqual(Buffer.from(computedHash), Buffer.from(storedHash));
};
