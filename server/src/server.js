import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';
import { seedInitialAdmin } from './utils/seedAdmin.js';
import { initKeepAlive } from './utils/keepAlive.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await seedInitialAdmin();

    app.listen(PORT, () => {
      console.log(`[RFUT-DOR-SERVER] Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      console.log(`[RFUT-DOR-SERVER] API endpoints ready at http://localhost:${PORT}/api`);
      initKeepAlive();
    });
  } catch (error) {
    console.error('[RFUT-DOR-SERVER] Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
