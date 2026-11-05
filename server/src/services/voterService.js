import { Voter } from '../models/Voter.js';
import { generateVotingCode, hashVotingCode, normalizeCode } from '../utils/codeGenerator.js';
import { signVoterToken } from '../utils/jwt.js';
import { getSystemSettings } from './adminService.js';
import { VOTER_CATEGORIES, CODE_STATUS } from '../config/constants.js';

export const verifyCodeAndStartSession = async (plainCode) => {
  if (!plainCode) {
    throw new Error('Voting code is required.');
  }

  const normalized = normalizeCode(plainCode);
  const codeHash = hashVotingCode(normalized);

  // Find voter matching code hash (codeHash has select: false on schema, so we explicitly select it)
  const voter = await Voter.findOne({ codeHash }).select('+codeHash');
  if (!voter) {
    throw new Error('Invalid voting code. Please check your code and try again.');
  }

  // Check if voting is open for voters who have not cast a ballot yet
  const settings = await getSystemSettings();
  if (!voter.hasVoted && !settings.isVotingOpen) {
    const error = new Error('Voting is currently closed. New ballots are not being accepted at this time.');
    error.statusCode = 403;
    error.code = 'VOTING_CLOSED';
    throw error;
  }

  // Generate secure voting session token
  const token = signVoterToken(voter);

  return {
    voter: {
      id: voter._id,
      discordUsername: voter.discordUsername,
      category: voter.category,
      hasVoted: voter.hasVoted,
      codeStatus: voter.codeStatus
    },
    token
  };
};

export const generateSingleCode = async ({ discordUsername, category }) => {
  if (!discordUsername || !discordUsername.trim()) {
    throw new Error('Discord username is required.');
  }

  const trimmedUsername = discordUsername.trim();
  const validCategory = VOTER_CATEGORIES.includes(category) ? category : 'Regular Member';

  // Check if discord username already registered
  const existing = await Voter.findOne({ discordUsername: trimmedUsername });
  if (existing) {
    throw new Error(`A voter with Discord username "${trimmedUsername}" already exists.`);
  }

  let code;
  let codeHash;
  let isUnique = false;
  let attempts = 0;

  // Ensure collision-free code generation
  while (!isUnique && attempts < 10) {
    code = generateVotingCode();
    codeHash = hashVotingCode(code);
    const clash = await Voter.findOne({ codeHash });
    if (!clash) {
      isUnique = true;
    }
    attempts++;
  }

  if (!isUnique) {
    throw new Error('Failed to generate a unique code. Please try again.');
  }

  const voter = await Voter.create({
    discordUsername: trimmedUsername,
    category: validCategory,
    plaintextCode: code,
    codeHash,
    codeStatus: CODE_STATUS.ASSIGNED,
    hasVoted: false
  });

  return {
    voter: {
      _id: voter._id,
      discordUsername: voter.discordUsername,
      category: voter.category,
      codeStatus: voter.codeStatus,
      hasVoted: voter.hasVoted,
      createdAt: voter.createdAt
    },
    plaintextCode: code // Exposed ONLY here upon generation for admin display/CSV
  };
};

export const generateBulkCodes = async (entries) => {
  if (!Array.isArray(entries) || entries.length === 0) {
    throw new Error('A list of voter entries is required for bulk generation.');
  }

  const results = [];
  const errors = [];

  for (const item of entries) {
    const username = (item.discordUsername || item.username || '').trim();
    if (!username) continue;

    const category = VOTER_CATEGORIES.includes(item.category) ? item.category : 'Regular Member';

    try {
      const generated = await generateSingleCode({ discordUsername: username, category });
      results.push({
        discordUsername: generated.voter.discordUsername,
        category: generated.voter.category,
        plaintextCode: generated.plaintextCode,
        createdAt: generated.voter.createdAt
      });
    } catch (err) {
      errors.push({
        discordUsername: username,
        error: err.message
      });
    }
  }

  return {
    generatedCount: results.length,
    results,
    errors
  };
};

export const getAllVoters = async ({ search = '', category = '', status = '', page = 1, limit = 50 }) => {
  const query = {};

  if (search) {
    query.discordUsername = { $regex: search.trim(), $options: 'i' };
  }

  if (category && category !== 'ALL') {
    query.category = category;
  }

  if (status === 'VOTED') {
    query.hasVoted = true;
  } else if (status === 'PENDING') {
    query.hasVoted = false;
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = Math.min(200, Math.max(1, parseInt(limit, 10) || 50));
  const skip = (pageNum - 1) * pageSize;

  const [voters, total] = await Promise.all([
    Voter.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .lean(),
    Voter.countDocuments(query)
  ]);

  return {
    voters,
    pagination: {
      total,
      page: pageNum,
      limit: pageSize,
      totalPages: Math.ceil(total / pageSize)
    }
  };
};

export const generateCodeForVoter = async (voterId) => {
  const voter = await Voter.findById(voterId);
  if (!voter) {
    throw new Error('Voter not found.');
  }

  let code;
  let codeHash;
  let isUnique = false;
  let attempts = 0;

  while (!isUnique && attempts < 15) {
    code = generateVotingCode();
    codeHash = hashVotingCode(code);
    const clash = await Voter.findOne({ codeHash, _id: { $ne: voter._id } });
    if (!clash) {
      isUnique = true;
    }
    attempts++;
  }

  if (!isUnique) {
    throw new Error('Failed to generate a unique voting code. Please try again.');
  }

  voter.plaintextCode = code;
  voter.codeHash = codeHash;
  voter.codeStatus = CODE_STATUS.ASSIGNED;
  await voter.save();

  return {
    voter: {
      _id: voter._id,
      discordUsername: voter.discordUsername,
      category: voter.category,
      codeStatus: voter.codeStatus,
      plaintextCode: voter.plaintextCode,
      hasVoted: voter.hasVoted,
      votedAt: voter.votedAt,
      createdAt: voter.createdAt
    },
    plaintextCode: code
  };
};

export const deleteCodeForVoter = async (voterId) => {
  const voter = await Voter.findById(voterId);
  if (!voter) {
    throw new Error('Voter not found.');
  }

  voter.plaintextCode = null;
  voter.codeHash = null;
  voter.codeStatus = CODE_STATUS.UNASSIGNED;
  await voter.save();

  return {
    voter: {
      _id: voter._id,
      discordUsername: voter.discordUsername,
      category: voter.category,
      codeStatus: voter.codeStatus,
      plaintextCode: null,
      hasVoted: voter.hasVoted,
      votedAt: voter.votedAt,
      createdAt: voter.createdAt
    }
  };
};

export const getVoterCode = async (voterId) => {
  const voter = await Voter.findById(voterId);
  if (!voter) {
    throw new Error('Voter not found.');
  }

  return {
    voterId: voter._id,
    discordUsername: voter.discordUsername,
    category: voter.category,
    plaintextCode: voter.plaintextCode,
    codeStatus: voter.codeStatus,
    hasVoted: voter.hasVoted,
    votedAt: voter.votedAt
  };
};

export const deleteVoter = async (voterId) => {
  const voter = await Voter.findById(voterId);
  if (!voter) {
    throw new Error('Voter not found.');
  }

  await Voter.findByIdAndDelete(voterId);
  return { success: true, message: `Voter "${voter.discordUsername}" deleted successfully.` };
};

export const getVotersCsvData = async () => {
  const voters = await Voter.find().sort({ discordUsername: 1 }).lean();
  return voters.map((v) => ({
    'Discord Username': v.discordUsername,
    Category: v.category,
    'Plaintext Code': v.plaintextCode || 'N/A',
    'Code Status': v.codeStatus,
    'Ballot Status': v.hasVoted ? 'Voted' : 'Pending',
    'Voted At': v.votedAt ? new Date(v.votedAt).toISOString() : 'N/A',
    'Created At': new Date(v.createdAt).toISOString()
  }));
};
