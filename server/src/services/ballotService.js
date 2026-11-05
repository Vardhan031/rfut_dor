import mongoose from 'mongoose';
import { Ballot } from '../models/Ballot.js';
import { Voter } from '../models/Voter.js';
import { Nominee } from '../models/Nominee.js';
import { getSystemSettings } from './adminService.js';
import { RANK_POINTS, TOTAL_RANKINGS_REQUIRED, TOTAL_BALLOT_POINTS } from '../config/constants.js';

const isReplicaSetSupported = () => {
  try {
    const topology = mongoose.connection.client?.topology;
    if (!topology) return false;
    const type = topology.description?.type;
    return type === 'ReplicaSetWithPrimary' || type === 'ReplicaSetNoPrimary' || type === 'Sharded';
  } catch {
    return false;
  }
};

export const submitBallot = async (voterId, rawRankings) => {
  // 1. Check if voting is open
  const settings = await getSystemSettings();
  if (!settings.isVotingOpen) {
    const error = new Error('Voting is closed. Ballots cannot be submitted at this time.');
    error.statusCode = 403;
    throw error;
  }

  // 2. Check voter exists and has not voted
  const voter = await Voter.findById(voterId);
  if (!voter) {
    const error = new Error('Voter profile not found.');
    error.statusCode = 404;
    throw error;
  }

  if (voter.hasVoted) {
    const error = new Error('A ballot has already been submitted for this voter. Re-voting is strictly forbidden.');
    error.statusCode = 403;
    throw error;
  }

  // 3. Check existing ballot in DB as double safety
  const existingBallot = await Ballot.findOne({ voterId });
  if (existingBallot) {
    voter.hasVoted = true;
    await voter.save();
    const error = new Error('A ballot has already been recorded for this voter.');
    error.statusCode = 403;
    throw error;
  }

  // 4. Validate rankings payload structure
  if (!Array.isArray(rawRankings) || rawRankings.length !== TOTAL_RANKINGS_REQUIRED) {
    const error = new Error(`You must select and rank exactly ${TOTAL_RANKINGS_REQUIRED} different nominees.`);
    error.statusCode = 400;
    throw error;
  }

  const nomineeIdSet = new Set();
  const rankSet = new Set();
  const validatedRankings = [];

  for (const item of rawRankings) {
    const nomineeId = item.nomineeId ? item.nomineeId.toString() : '';
    const rank = parseInt(item.rank, 10);

    if (!nomineeId || !mongoose.Types.ObjectId.isValid(nomineeId)) {
      const error = new Error('Invalid nominee identifier in ranking.');
      error.statusCode = 400;
      throw error;
    }

    if (nomineeIdSet.has(nomineeId)) {
      const error = new Error('Duplicate nominee detected. Each nominee can only be selected once.');
      error.statusCode = 400;
      throw error;
    }
    nomineeIdSet.add(nomineeId);

    if (isNaN(rank) || rank < 1 || rank > TOTAL_RANKINGS_REQUIRED) {
      const error = new Error(`Rank must be an integer between 1 and ${TOTAL_RANKINGS_REQUIRED}.`);
      error.statusCode = 400;
      throw error;
    }

    if (rankSet.has(rank)) {
      const error = new Error(`Duplicate rank #${rank} assigned. Each rank from 1 to 10 must be unique.`);
      error.statusCode = 400;
      throw error;
    }
    rankSet.add(rank);

    // Strict backend points mapping (ignoring any client-sent points)
    const points = RANK_POINTS[rank];
    validatedRankings.push({
      nomineeId,
      rank,
      points
    });
  }

  // 5. Verify that all 10 nominees exist and are active in DB
  const nomineeDocs = await Nominee.find({
    _id: { $in: Array.from(nomineeIdSet) },
    isActive: true
  });

  if (nomineeDocs.length !== TOTAL_RANKINGS_REQUIRED) {
    const error = new Error('One or more selected nominees are invalid, inactive, or not found.');
    error.statusCode = 400;
    throw error;
  }

  // 6. Sort rankings by rank 1..10
  validatedRankings.sort((a, b) => a.rank - b.rank);

  // 7. Atomic or safe sequential execution
  let savedBallot;

  if (isReplicaSetSupported()) {
    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      const ballotDocs = await Ballot.create(
        [
          {
            voterId: voter._id,
            rankings: validatedRankings,
            submittedAt: new Date()
          }
        ],
        { session }
      );
      savedBallot = ballotDocs[0];

      voter.hasVoted = true;
      voter.votedAt = new Date();
      await voter.save({ session });

      await session.commitTransaction();
      session.endSession();
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  } else {
    // Standalone MongoDB execution with manual consistency
    savedBallot = await Ballot.create({
      voterId: voter._id,
      rankings: validatedRankings,
      submittedAt: new Date()
    });

    try {
      voter.hasVoted = true;
      voter.votedAt = new Date();
      await voter.save();
    } catch (voterErr) {
      await Ballot.findByIdAndDelete(savedBallot._id);
      throw voterErr;
    }
  }

  return {
    success: true,
    message: 'Your official ballot has been submitted and permanently locked.',
    receipt: {
      ballotId: savedBallot._id,
      voterDiscord: voter.discordUsername,
      category: voter.category,
      totalPointsDistributed: TOTAL_BALLOT_POINTS,
      submittedAt: savedBallot.submittedAt
    }
  };
};

export const getVoterBallot = async (voterId) => {
  const ballot = await Ballot.findOne({ voterId })
    .populate('rankings.nomineeId', 'displayName discordUsername imageUrl')
    .lean();
  return ballot;
};

export const getAllBallotsForAdmin = async () => {
  const ballots = await Ballot.find()
    .populate('voterId', 'discordUsername category hasVoted votedAt')
    .populate('rankings.nomineeId', 'displayName discordUsername imageUrl')
    .sort({ submittedAt: -1 })
    .lean();

  return ballots;
};

export const removeBallot = async (ballotId) => {
  const ballot = await Ballot.findById(ballotId);
  if (!ballot) {
    throw new Error('Ballot not found.');
  }

  const voterId = ballot.voterId;

  await Ballot.findByIdAndDelete(ballotId);

  let resetVoter = null;
  if (voterId) {
    resetVoter = await Voter.findByIdAndUpdate(
      voterId,
      { hasVoted: false, votedAt: null },
      { new: true }
    );
  }

  return {
    removedBallotId: ballotId,
    voter: resetVoter
      ? {
          _id: resetVoter._id,
          discordUsername: resetVoter.discordUsername,
          hasVoted: resetVoter.hasVoted
        }
      : null
  };
};

export const removeBallotByVoter = async (voterId) => {
  const ballot = await Ballot.findOne({ voterId });
  if (!ballot) {
    throw new Error('No ballot found for this voter.');
  }
  return removeBallot(ballot._id);
};
