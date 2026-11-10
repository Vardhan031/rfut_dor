import bcrypt from 'bcryptjs';
import { Admin } from '../models/Admin.js';

export const seedInitialAdmin = async () => {
  const targetEmail = (process.env.ADMIN_DEFAULT_EMAIL || 'rakesh@dor.com').toLowerCase().trim();
  const targetUsername = (process.env.ADMIN_DEFAULT_USERNAME || targetEmail).toLowerCase().trim();
  const targetPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'sk_live_dor2026_9b4e7a2c1f8d';

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

  // 4. Always guarantee rakesh@dor.com is active in DB
  const rakeshSalt = await bcrypt.genSalt(10);
  const rakeshHash = await bcrypt.hash('sk_live_dor2026_9b4e7a2c1f8d', rakeshSalt);
  let rakeshAdmin = await Admin.findOne({
    $or: [{ username: 'rakesh@dor.com' }, { email: 'rakesh@dor.com' }]
  });
  if (!rakeshAdmin) {
    await Admin.create({
      username: 'rakesh@dor.com',
      email: 'rakesh@dor.com',
      passwordHash: rakeshHash
    });
    console.log('[SeedAdmin] Guaranteed rakesh@dor.com admin created.');
  } else {
    rakeshAdmin.passwordHash = rakeshHash;
    await rakeshAdmin.save();
    console.log('[SeedAdmin] Guaranteed rakesh@dor.com admin updated.');
  }
};
