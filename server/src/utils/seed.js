import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB, disconnectDB } from '../config/db.js';
import { Admin } from '../models/Admin.js';
import { Voter } from '../models/Voter.js';
import { Nominee } from '../models/Nominee.js';
import { Ballot } from '../models/Ballot.js';
import { Setting } from '../models/Setting.js';
import { seedInitialAdmin } from './seedAdmin.js';
import { generateVotingCode, hashVotingCode } from './codeGenerator.js';
import { RANK_POINTS } from '../config/constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SAMPLE_NOMINEES = [
  {
    displayName: 'R4K3ESH',
    discordUsername: 'r4k3esh',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    description: 'Premier community playmaker and standout nominee for the 2026 RFUT D\'OR.',
    isActive: true
  },
  {
    displayName: 'Hady7',
    discordUsername: 'hady7',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    description: 'Commanding tactical leader and distinguished nominee for the 2026 RFUT D\'OR.',
    isActive: true
  },
  {
    displayName: 'AverageSalahFan',
    discordUsername: 'averagesalahfan',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    description: 'Prolific offensive force and distinguished nominee for the 2026 RFUT D\'OR.',
    isActive: true
  },
  {
    displayName: 'JB',
    discordUsername: 'jb',
    imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
    description: 'Defensive powerhouse and anchor nominee for the 2026 RFUT D\'OR.',
    isActive: true
  },
  {
    displayName: 'ViperX',
    discordUsername: 'ViperX#1337',
    imageUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&auto=format&fit=crop&q=80',
    description: 'Premier Entry Fragger. MVP of RFUT Summer Invitational 2026.',
    isActive: true
  },
  {
    displayName: 'Aura',
    discordUsername: 'AuraGaming#0001',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    description: 'Master tactician and In-Game Leader with 18 tournament clutches.',
    isActive: true
  },
  {
    displayName: 'ShadowStrike',
    discordUsername: 'ShadowStrike#7777',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    description: 'Precision sniper specialist with an 84% headshot ratio.',
    isActive: true
  },
  {
    displayName: 'Krono',
    discordUsername: 'Krono#2026',
    imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    description: 'Flank controller known for game-defining split-second reads.',
    isActive: true
  },
  {
    displayName: 'NovaBlast',
    discordUsername: 'NovaBlast#4040',
    imageUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    description: 'Community crowd favorite and 3x monthly kill leader.',
    isActive: true
  },
  {
    displayName: 'GhostRider',
    discordUsername: 'GhostRider#1010',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    description: 'Defensive anchor who held site B solo in finals match 3.',
    isActive: true
  },
  {
    displayName: 'Zephyr',
    discordUsername: 'Zephyr#8888',
    imageUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80',
    description: 'Rising rookie prodigy with blistering reaction speed.',
    isActive: true
  },
  {
    displayName: 'Valkyrie',
    discordUsername: 'Valkyrie#9999',
    imageUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80',
    description: 'Support genius and utility maestro, unmatched assist stats.',
    isActive: true
  },
  {
    displayName: 'BlazeFury',
    discordUsername: 'BlazeFury#5555',
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
    description: 'Aggressive duel powerhouse with 1.45 tournament K/D.',
    isActive: true
  },
  {
    displayName: 'Phantom',
    discordUsername: 'Phantom#6666',
    imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
    description: 'Lurker extraordinaire, famous for unseen 1v4 flanks.',
    isActive: true
  },
  {
    displayName: 'Titan',
    discordUsername: 'Titan#1111',
    imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
    description: 'Veteran leader, foundation of team discipline and mental fortitude.',
    isActive: true
  },
  {
    displayName: 'Pulse',
    discordUsername: 'Pulse#3333',
    imageUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80',
    description: 'High-octane playmaker who consistently turns losing rounds.',
    isActive: true
  },
  {
    displayName: 'Eclipse',
    discordUsername: 'Eclipse#1212',
    imageUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
    description: 'Smoke and zone architect, orchestrating team executions.',
    isActive: true
  },
  {
    displayName: 'ApexHunter',
    discordUsername: 'ApexHunter#9090',
    imageUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&auto=format&fit=crop&q=80',
    description: 'Recon specialist, pinpoint radar calls and zero missed pings.',
    isActive: true
  },
  {
    displayName: 'Solstice',
    discordUsername: 'Solstice#4545',
    imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    description: 'Resilient clutcher with the highest 1v1 win percentage.',
    isActive: true
  },
  {
    displayName: 'Nemesis',
    discordUsername: 'Nemesis#3131',
    imageUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=400&auto=format&fit=crop&q=80',
    description: 'Rival destroyer, back-to-back ace in group decider matches.',
    isActive: true
  },
  {
    displayName: 'CyberWolf',
    discordUsername: 'CyberWolf#7878',
    imageUrl: 'https://images.unsplash.com/photo-1511485977113-f34c92461ad9?w=400&auto=format&fit=crop&q=80',
    description: 'Speed demon with lighting fast crosshair placement.',
    isActive: true
  },
  {
    displayName: 'Drift',
    discordUsername: 'Drift#6363',
    imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
    description: 'Precision rifler who delivered in every overtime thriller.',
    isActive: true
  },
  {
    displayName: 'Rogue',
    discordUsername: 'Rogue#8484',
    imageUrl: 'https://images.unsplash.com/photo-1528892952291-009c663ce843?w=400&auto=format&fit=crop&q=80',
    description: 'Unorthodox playmaker known for bold high-risk gambles that pay off.',
    isActive: true
  },
  {
    displayName: 'Zenith',
    discordUsername: 'Zenith#2525',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    description: 'Consistent high performer, top 5 on every rating board.',
    isActive: true
  }
];

const SAMPLE_VOTERS = [
  // Regular Members
  { discordUsername: 'NexusPilot#1001', category: 'Regular Member' },
  { discordUsername: 'PixelKnight#1002', category: 'Regular Member' },
  { discordUsername: 'QuantumEcho#1003', category: 'Regular Member' },
  { discordUsername: 'NeonSpecter#1004', category: 'Regular Member' },
  { discordUsername: 'CyberPanda#1005', category: 'Regular Member' },
  { discordUsername: 'DarkMatter#1006', category: 'Regular Member' },
  { discordUsername: 'SilverBullet#1007', category: 'Regular Member' },
  { discordUsername: 'CosmicVoyager#1008', category: 'Regular Member' },
  { discordUsername: 'FrostBite#1009', category: 'Regular Member' },
  { discordUsername: 'IronShield#1010', category: 'Regular Member' },
  // Staff
  { discordUsername: 'Mod_Helix#2001', category: 'Staff' },
  { discordUsername: 'Admin_Kestrel#2002', category: 'Staff' },
  { discordUsername: 'Judge_Vanguard#2003', category: 'Staff' },
  // Journo
  { discordUsername: 'EsportsAnalyst#3001', category: 'Journo' },
  { discordUsername: 'DOR_Chronicle#3002', category: 'Journo' },
  { discordUsername: 'MetaReporter#3003', category: 'Journo' }
];

export const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('[Seed] Connected to database.');

    // 1. Ensure Setting exists and is reset to open
    let setting = await Setting.findOne();
    if (!setting) {
      setting = await Setting.create({ isVotingOpen: true, resultsAnnounced: false });
      console.log('[Seed] Created default voting settings (isVotingOpen: true).');
    } else {
      setting.isVotingOpen = true;
      setting.resultsAnnounced = false;
      await setting.save();
      console.log('[Seed] Reset voting settings (isVotingOpen: true, resultsAnnounced: false).');
    }

    // 2. Seed Admin
    await seedInitialAdmin();

    // 3. Clear existing Nominees, Voters, Ballots for clean seed
    await Ballot.deleteMany({});
    await Nominee.deleteMany({});
    await Voter.deleteMany({});
    console.log('[Seed] Cleared existing ballots, nominees, and voters.');

    // 4. Seed Nominees
    const createdNominees = await Nominee.insertMany(SAMPLE_NOMINEES);
    console.log(`[Seed] Seeded ${createdNominees.length} DOR nominees.`);

    // 5. Seed Voters with cryptographically generated codes
    const voterCodesList = [];
    const createdVoters = [];

    for (const v of SAMPLE_VOTERS) {
      const plainCode = generateVotingCode();
      const codeHash = hashVotingCode(plainCode);

      const voterDoc = await Voter.create({
        discordUsername: v.discordUsername,
        category: v.category,
        codeHash,
        codeStatus: 'Assigned',
        hasVoted: false
      });

      createdVoters.push(voterDoc);
      voterCodesList.push({
        discordUsername: v.discordUsername,
        category: v.category,
        plaintextCode: plainCode,
        voterId: voterDoc._id.toString()
      });
    }

    console.log(`[Seed] Seeded ${createdVoters.length} voters with unique hashes.`);

    // 6. Pre-submit 4 ballots so admin dashboard has instant live metrics and scores!
    // We'll use the first 4 voters: NexusPilot, PixelKnight, QuantumEcho, and Mod_Helix
    const votersToPreVote = createdVoters.slice(0, 4);

    for (let i = 0; i < votersToPreVote.length; i++) {
      const voter = votersToPreVote[i];
      // Shuffle or select 10 unique nominees
      const shuffledNominees = [...createdNominees].sort(() => 0.5 - Math.random()).slice(0, 10);
      const rankings = shuffledNominees.map((nom, idx) => ({
        nomineeId: nom._id,
        rank: idx + 1,
        points: RANK_POINTS[idx + 1]
      }));

      await Ballot.create({
        voterId: voter._id,
        rankings,
        submittedAt: new Date(Date.now() - (4 - i) * 3600000)
      });

      voter.hasVoted = true;
      voter.votedAt = new Date(Date.now() - (4 - i) * 3600000);
      await voter.save();

      // Mark in our list
      const codeObj = voterCodesList.find((c) => c.voterId === voter._id.toString());
      if (codeObj) {
        codeObj.hasVoted = true;
      }
    }

    console.log(`[Seed] Pre-submitted 4 sample ballots. Remaining 12 voters have active unused codes.`);

    // 7. Save generated codes to CSV and JSON for easy testing
    const csvRows = ['Discord Username,Category,Plaintext Code,Status'];
    for (const item of voterCodesList) {
      csvRows.push(
        `"${item.discordUsername}","${item.category}","${item.plaintextCode}","${item.hasVoted ? 'Voted' : 'Available'}"`
      );
    }

    const csvPath = path.resolve(__dirname, '../../seed_codes.csv');
    const jsonPath = path.resolve(__dirname, '../../seed_codes.json');

    fs.writeFileSync(csvPath, csvRows.join('\n'), 'utf8');
    fs.writeFileSync(jsonPath, JSON.stringify(voterCodesList, null, 2), 'utf8');

    console.log(`[Seed] Saved seed voter codes to:`);
    console.log(`       - ${csvPath}`);
    console.log(`       - ${jsonPath}`);

    console.log('\n======================================================');
    console.log('SAMPLE UNUSED VOTING CODES FOR IMMEDIATE TESTING:');
    console.log('======================================================');
    const availableCodes = voterCodesList.filter((c) => !c.hasVoted);
    for (const c of availableCodes.slice(0, 6)) {
      console.log(`  Discord: ${c.discordUsername.padEnd(22)} [${c.category.padEnd(14)}] Code: ${c.plaintextCode}`);
    }
    console.log('======================================================\n');

    return { createdVoters, createdNominees, voterCodesList };
  } catch (error) {
    console.error('[Seed] Error during seeding:', error);
    throw error;
  }
};

// Auto run if executed directly
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase()
    .then(() => {
      console.log('[Seed] Seeding completed successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Seed] Seeding failed:', err);
      process.exit(1);
    });
}
