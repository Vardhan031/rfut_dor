import bcrypt from 'bcryptjs';
import { Admin } from '../models/Admin.js';

export const seedInitialAdmin = async () => {
  const targetEmail = (process.env.ADMIN_DEFAULT_EMAIL || 'notapro@dor.com').toLowerCase().trim();
  const targetUsername = (process.env.ADMIN_DEFAULT_USERNAME || targetEmail).toLowerCase().trim();
  const targetPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'Notapro@rfutdor';

  // 1. Purge legacy default "admin" account if present
  const purgeResult = await Admin.deleteMany({
    username: { $in: ['admin', 'default', 'root'] }
  });
  if (purgeResult.deletedCount > 0) {
    console.log(`[SeedAdmin] Removed ${purgeResult.deletedCount} legacy admin account(s).`);
  }

  // 2. Hash target password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(targetPassword, salt);

  // 3. Upsert configured admin account
  const existing = await Admin.findOne({
    $or: [{ username: targetUsername }, { email: targetEmail }]
  });

  if (!existing) {
    await Admin.create({
      username: targetUsername,
      email: targetEmail,
      passwordHash
    });
    console.log(`[SeedAdmin] Admin account created: "${targetEmail}".`);
  } else {
    existing.username = targetUsername;
    existing.email = targetEmail;
    existing.passwordHash = passwordHash;
    await existing.save();
    console.log(`[SeedAdmin] Admin account updated: "${targetEmail}".`);
  }
};
