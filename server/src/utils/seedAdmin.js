import bcrypt from 'bcryptjs';
import { Admin } from '../models/Admin.js';

export const seedInitialAdmin = async () => {
  const username = (process.env.ADMIN_DEFAULT_USERNAME || 'admin').toLowerCase().trim();
  const password = process.env.ADMIN_DEFAULT_PASSWORD || 'AdminPassword123!';

  const existing = await Admin.findOne({ username });
  if (!existing) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    await Admin.create({ username, passwordHash });
    console.log(`[SeedAdmin] Default admin created: "${username}" with configured password.`);
  }
};
