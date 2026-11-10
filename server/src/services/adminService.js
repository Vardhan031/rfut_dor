import bcrypt from 'bcryptjs';
import { Admin } from '../models/Admin.js';
import { Voter } from '../models/Voter.js';
import { Nominee } from '../models/Nominee.js';
import { Ballot } from '../models/Ballot.js';
import { Setting } from '../models/Setting.js';
import { signAdminToken } from '../utils/jwt.js';

export const getSystemSettings = async () => {
  let setting = await Setting.findOne();
  if (!setting) {
    setting = await Setting.create({ isVotingOpen: true, resultsAnnounced: false });
  }
  return setting;
};

export const updateVotingControl = async ({ isVotingOpen, resultsAnnounced, updatedBy = 'admin' }) => {
  let setting = await Setting.findOne();
  if (!setting) {
    setting = new Setting();
  }
  if (typeof isVotingOpen === 'boolean') {
    setting.isVotingOpen = isVotingOpen;
  }
  if (typeof resultsAnnounced === 'boolean') {
    setting.resultsAnnounced = resultsAnnounced;
  }
  setting.updatedBy = updatedBy;
  await setting.save();
  return setting;
};

export const loginAdmin = async (identifier, password) => {
  if (!identifier || !password) {
    throw new Error('Email/username and password are required.');
  }

  const clean = identifier.toLowerCase().trim();
  const admin = await Admin.findOne({
    $or: [{ username: clean }, { email: clean }]
  });
  if (!admin) {
    throw new Error('Invalid credentials.');
  }

  const isMatch = await bcrypt.compare(password, admin.passwordHash);
  if (!isMatch) {
    throw new Error('Invalid credentials.');
  }

  const token = signAdminToken(admin);
  return {
    admin: {
      id: admin._id,
      username: admin.username,
      email: admin.email || admin.username,
      createdAt: admin.createdAt
    },
    token
  };
};

export const getDashboardOverview = async () => {
  const [totalVoters, totalSubmitted, totalNominees, setting] = await Promise.all([
    Voter.countDocuments(),
    Voter.countDocuments({ hasVoted: true }),
    Nominee.countDocuments({ isActive: true }),
    getSystemSettings()
  ]);

  const totalPending = totalVoters - totalSubmitted;
  const participationPercentage = totalVoters > 0
    ? Number(((totalSubmitted / totalVoters) * 100).toFixed(1))
    : 0;

  // Breakdown by category
  const [regularVoted, regularTotal, staffVoted, staffTotal, journoVoted, journoTotal] = await Promise.all([
    Voter.countDocuments({ category: 'Regular Member', hasVoted: true }),
    Voter.countDocuments({ category: 'Regular Member' }),
    Voter.countDocuments({ category: 'Staff', hasVoted: true }),
    Voter.countDocuments({ category: 'Staff' }),
    Voter.countDocuments({ category: { $in: ['Journalist', 'Journo'] }, hasVoted: true }),
    Voter.countDocuments({ category: { $in: ['Journalist', 'Journo'] } })
  ]);

  return {
    totalVoters,
    totalSubmitted,
    totalPending,
    totalNominees,
    participationPercentage,
    isVotingOpen: setting.isVotingOpen,
    resultsAnnounced: setting.resultsAnnounced,
    categoryBreakdown: {
      regular: { voted: regularVoted, total: regularTotal },
      staff: { voted: staffVoted, total: staffTotal },
      journalist: { voted: journoVoted, total: journoTotal },
      journo: { voted: journoVoted, total: journoTotal }
    }
  };
};

export const getResultsAndLeaderboard = async () => {
  const [nominees, ballots, setting] = await Promise.all([
    Nominee.find().lean(),
    Ballot.find().populate('rankings.nomineeId', 'displayName discordUsername').lean(),
    getSystemSettings()
  ]);

  const totalBallots = ballots.length;

  // Map each nominee to score metrics
  const statsMap = new Map();
  for (const nom of nominees) {
    statsMap.set(nom._id.toString(), {
      _id: nom._id,
      displayName: nom.displayName,
      discordUsername: nom.discordUsername,
      imageUrl: nom.imageUrl,
      isActive: nom.isActive,
      description: nom.description,
      totalPoints: 0,
      firstPlaceVotes: 0,
      secondPlaceVotes: 0,
      thirdPlaceVotes: 0,
      top10Appearances: 0,
      rankBreakdown: {
        1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0
      }
    });
  }

  // Aggregate ballots
  for (const ballot of ballots) {
    for (const r of ballot.rankings) {
      if (!r.nomineeId) continue;
      const nomId = (r.nomineeId._id || r.nomineeId).toString();
      const nomStat = statsMap.get(nomId);
      if (nomStat) {
        nomStat.totalPoints += r.points;
        nomStat.top10Appearances += 1;
        nomStat.rankBreakdown[r.rank] = (nomStat.rankBreakdown[r.rank] || 0) + 1;

        if (r.rank === 1) nomStat.firstPlaceVotes += 1;
        if (r.rank === 2) nomStat.secondPlaceVotes += 1;
        if (r.rank === 3) nomStat.thirdPlaceVotes += 1;
      }
    }
  }

  // Convert to array and sort by tie-breaker rules
  // 1. Higher total points
  // 2. Higher first-place votes
  // 3. Higher second-place votes
  // 4. Higher third-place votes
  const sorted = Array.from(statsMap.values()).sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) {
      return b.totalPoints - a.totalPoints;
    }
    if (b.firstPlaceVotes !== a.firstPlaceVotes) {
      return b.firstPlaceVotes - a.firstPlaceVotes;
    }
    if (b.secondPlaceVotes !== a.secondPlaceVotes) {
      return b.secondPlaceVotes - a.secondPlaceVotes;
    }
    if (b.thirdPlaceVotes !== a.thirdPlaceVotes) {
      return b.thirdPlaceVotes - a.thirdPlaceVotes;
    }
    return 0; // Tied
  });

  // Assign ranks, handling ties
  let currentRank = 1;
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0) {
      const prev = sorted[i - 1];
      const curr = sorted[i];
      const isIdentical =
        prev.totalPoints === curr.totalPoints &&
        prev.firstPlaceVotes === curr.firstPlaceVotes &&
        prev.secondPlaceVotes === curr.secondPlaceVotes &&
        prev.thirdPlaceVotes === curr.thirdPlaceVotes;

      if (isIdentical) {
        curr.rank = prev.rank;
        curr.isTied = true;
        prev.isTied = true;
      } else {
        curr.rank = i + 1;
        curr.isTied = false;
      }
    } else {
      sorted[0].rank = 1;
      sorted[0].isTied = false;
    }
  }

  return {
    totalBallots,
    isVotingOpen: setting.isVotingOpen,
    resultsAnnounced: setting.resultsAnnounced,
    leaderboard: sorted
  };
};
