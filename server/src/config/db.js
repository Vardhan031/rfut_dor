import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mongoMemoryServerInstance = null;

export const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/rfut_dor';

  try {
    // Attempt connecting to local MongoDB service (timeout 1500ms)
    await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 1500
    });
    console.log(`[DB] Connected to primary MongoDB at ${primaryUri}`);
    return;
  } catch (err) {
    // Check if persistent embedded MongoDB at port 27018 is already running
    try {
      const existingUri = 'mongodb://127.0.0.1:27018/rfut_dor';
      await mongoose.connect(existingUri, { serverSelectionTimeoutMS: 1500 });
      console.log(`[DB] Connected to running embedded MongoDB at ${existingUri}`);
      return;
    } catch (existingErr) {
      // Not running, launch new embedded instance
      console.log('[DB] Launching standalone embedded MongoDB engine with disk persistence...');
    }

    try {
      const dataDir = path.resolve(__dirname, '../../data/db');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      mongoMemoryServerInstance = await MongoMemoryServer.create({
        instance: {
          port: 27018, // Dedicated persistent port
          dbPath: dataDir,
          dbName: 'rfut_dor',
          storageEngine: 'wiredTiger'
        }
      });

      const memUri = 'mongodb://127.0.0.1:27018/rfut_dor';
      await mongoose.connect(memUri);
      console.log(`[DB] Persistent embedded MongoDB successfully running at ${memUri} [Storage: ${dataDir}]`);
    } catch (memErr) {
      console.warn('[DB] Persistent port/dbPath retry with auto-assigned port...', memErr.message);
      // Fallback if port 27018 is already bound or lock file exists
      try {
        const memUri = 'mongodb://127.0.0.1:27018/rfut_dor';
        await mongoose.connect(memUri, { serverSelectionTimeoutMS: 2000 });
        console.log(`[DB] Connected to already running instance at ${memUri}`);
      } catch (retryErr) {
        // Ephemeral fallback
        mongoMemoryServerInstance = await MongoMemoryServer.create();
        const fallbackUri = mongoMemoryServerInstance.getUri();
        await mongoose.connect(fallbackUri);
        console.log(`[DB] Connected to fallback memory MongoDB at ${fallbackUri}`);
      }
    }
  }
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServerInstance) {
    await mongoMemoryServerInstance.stop();
  }
};
