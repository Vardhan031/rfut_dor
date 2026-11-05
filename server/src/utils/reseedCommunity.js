import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Nominee } from '../models/Nominee.js';
import { Voter } from '../models/Voter.js';
import { Ballot } from '../models/Ballot.js';
import { generateVotingCode, hashVotingCode } from './codeGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NOMINEES_LIST = [
  {
    displayName: 'JB',
    discordUsername: 'jb',
    imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
    description: 'Premier defensive anchor and standout competitor for RFUT D\'OR 2026.'
  },
  {
    displayName: 'Hady7',
    discordUsername: 'hady7',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    description: 'Commanding playmaker and tactical leader nominated for RFUT D\'OR 2026.'
  },
  {
    displayName: 'TouchMe',
    discordUsername: 'touchme',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    description: 'Electrifying midfield maestro nominated for the RFUT D\'OR 2026.'
  },
  {
    displayName: 'Biryani',
    discordUsername: 'biryani',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    description: 'Prolific attacking sensation and high-impact competitor for RFUT D\'OR 2026.'
  },
  {
    displayName: 'Tetra',
    discordUsername: 'tetra',
    imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    description: 'Consistent high-calibre specialist nominated for the RFUT D\'OR 2026.'
  },
  {
    displayName: 'Biryani',
    discordUsername: 'biryani2',
    imageUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    description: 'Distinguished community contender nominated for the RFUT D\'OR 2026.'
  },
  {
    displayName: 'ElPatron',
    discordUsername: 'elpatron',
    imageUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80',
    description: 'Dominant midfield force and master strategist for RFUT D\'OR 2026.'
  },
  {
    displayName: 'Soham',
    discordUsername: 'soham',
    imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
    description: 'Precision playmaker known for clutch performances throughout 2026.'
  },
  {
    displayName: 'satan.glazer',
    discordUsername: 'satan.glazer',
    imageUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80',
    description: 'Ruthless offensive finisher and standout candidate for RFUT D\'OR 2026.'
  },
  {
    displayName: 'gueste',
    discordUsername: 'gueste',
    imageUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
    description: 'Unflappable defensive rock nominated for the RFUT D\'OR 2026.'
  },
  {
    displayName: 'foolsfr',
    discordUsername: 'foolsfr',
    imageUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&auto=format&fit=crop&q=80',
    description: 'Dynamic tempo controller nominated for the RFUT D\'OR 2026.'
  },
  {
    displayName: 'Leao',
    discordUsername: 'leao',
    imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    description: 'Pacey wing maestro with game-changing flair in RFUT D\'OR 2026.'
  },
  {
    displayName: 'Spectrum',
    discordUsername: 'spectrum',
    imageUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=400&auto=format&fit=crop&q=80',
    description: 'Creative engine with exceptional vision nominated for RFUT D\'OR 2026.'
  },
  {
    displayName: 'Fallout',
    discordUsername: 'fallout',
    imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
    description: 'Powerful forward with explosive goal-scoring power for RFUT D\'OR 2026.'
  },
  {
    displayName: 'GTV',
    discordUsername: 'gtv',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    description: 'Tenacious box-to-box general nominated for the RFUT D\'OR 2026.'
  },
  {
    displayName: 'Fercg',
    discordUsername: 'fercg',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    description: 'Skilled tactician and vital team contributor for RFUT D\'OR 2026.'
  },
  {
    displayName: 'Cafyune',
    discordUsername: 'cafyune',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    description: 'Sharpshooting talisman and fan-favorite contender for RFUT D\'OR 2026.'
  },
  {
    displayName: 'Mau',
    discordUsername: 'mau',
    imageUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80',
    description: 'Resilient playmaker with extraordinary consistency in RFUT D\'OR 2026.'
  },
  {
    displayName: 'Moredor',
    discordUsername: 'moredor',
    imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
    description: 'Defensive powerhouse and aerial titan nominated for RFUT D\'OR 2026.'
  },
  {
    displayName: 'Omarsito',
    discordUsername: 'omarsito',
    imageUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80',
    description: 'Sublime technician with game-winning vision for RFUT D\'OR 2026.'
  }
];

const connect = async () => {
  // First try persistent port 27018
  try {
    await mongoose.connect('mongodb://127.0.0.1:27018/rfut_dor', { serverSelectionTimeoutMS: 2000 });
    console.log('[DB] Connected to embedded MongoDB (port 27018)');
    return;
  } catch (err) {
    // Try primary
    const primary = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/rfut_dor';
    await mongoose.connect(primary, { serverSelectionTimeoutMS: 2000 });
    console.log(`[DB] Connected to MongoDB at ${primary}`);
  }
};

const run = async () => {
  try {
    await connect();

    console.log('[RESEED] Clearing old ballots, nominees, and voters...');
    await Ballot.deleteMany({});
    await Nominee.deleteMany({});
    await Voter.deleteMany({});

    console.log('[RESEED] Inserting 20 official nominees...');
    const createdNominees = [];
    for (const item of NOMINEES_LIST) {
      const nominee = await Nominee.create({
        displayName: item.displayName,
        discordUsername: item.discordUsername,
        imageUrl: item.imageUrl,
        description: item.description,
        isActive: true
      });
      createdNominees.push(nominee);
    }
    console.log(`[RESEED] Inserted ${createdNominees.length} nominees successfully.`);

    console.log('[RESEED] Generating 20 voting codes for the 20 users...');
    const voterCodes = [];

    for (const item of NOMINEES_LIST) {
      let code = generateVotingCode();
      let codeHash = hashVotingCode(code);

      // Verify uniqueness
      let exists = await Voter.findOne({ codeHash });
      while (exists) {
        code = generateVotingCode();
        codeHash = hashVotingCode(code);
        exists = await Voter.findOne({ codeHash });
      }

      const voter = await Voter.create({
        discordUsername: item.discordUsername,
        category: 'Regular Member',
        codeHash,
        codeStatus: 'Assigned',
        hasVoted: false
      });

      voterCodes.push({
        displayName: item.displayName,
        discordUsername: item.discordUsername,
        code,
        voterId: voter._id.toString()
      });
    }

    // Save codes to server/data/voter_codes_2026.json
    const outDir = path.resolve(__dirname, '../../data');
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    const outPath = path.resolve(outDir, 'voter_codes_2026.json');
    fs.writeFileSync(outPath, JSON.stringify(voterCodes, null, 2), 'utf-8');
    console.log(`[RESEED] Saved voter codes to ${outPath}`);

    console.log('\n======================================================');
    console.log('         RFUT D\'OR 2026 - 20 OFFICIAL VOTER CODES       ');
    console.log('======================================================');
    voterCodes.forEach((v, idx) => {
      const num = String(idx + 1).padStart(2, '0');
      console.log(`${num}. ${v.displayName.padEnd(16)} (@${v.discordUsername.padEnd(14)}) => [ ${v.code} ]`);
    });
    console.log('======================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('[RESEED ERROR]', err);
    process.exit(1);
  }
};

run();
