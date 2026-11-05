import * as voterService from '../services/voterService.js';
import * as ballotService from '../services/ballotService.js';
import * as nomineeService from '../services/nomineeService.js';

// Public endpoint for voters to verify code and receive session token
export const verifyCode = async (req, res, next) => {
  try {
    const { code } = req.body;
    const session = await voterService.verifyCodeAndStartSession(code);
    res.json({
      success: true,
      message: 'Code verified successfully. Voting session unlocked.',
      ...session
    });
  } catch (error) {
    const status = error.statusCode || 400;
    res.status(status).json({
      success: false,
      message: error.message,
      code: error.code || 'VERIFICATION_FAILED'
    });
  }
};

// Voter endpoint to get current authenticated profile & status
export const getVoterProfile = async (req, res, next) => {
  try {
    const voter = req.voter;
    res.json({
      success: true,
      data: {
        id: voter._id,
        discordUsername: voter.discordUsername,
        category: voter.category,
        hasVoted: voter.hasVoted,
        votedAt: voter.votedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// Voter endpoint to fetch list of candidates (strictly active nominees without scores)
export const getNomineesForVoter = async (req, res, next) => {
  try {
    const nominees = await nomineeService.getNominees(false);
    res.json({
      success: true,
      data: nominees
    });
  } catch (error) {
    next(error);
  }
};

// Voter endpoint to retrieve authenticated voter's sealed ballot
export const getVoterBallot = async (req, res, next) => {
  try {
    const voterId = req.voter._id;
    const ballot = await ballotService.getVoterBallot(voterId);
    if (!ballot) {
      return res.status(404).json({ success: false, message: 'No ballot found for this voter.' });
    }
    res.json({
      success: true,
      data: ballot
    });
  } catch (error) {
    next(error);
  }
};

// Voter endpoint to submit ranked Top 10 ballot
export const submitVoterBallot = async (req, res, next) => {
  try {
    const voterId = req.voter._id;
    const { rankings } = req.body;
    const result = await ballotService.submitBallot(voterId, rankings);
    res.status(201).json(result);
  } catch (error) {
    const status = error.statusCode || 400;
    res.status(status).json({
      success: false,
      message: error.message
    });
  }
};

// Admin endpoints for code management
export const generateSingleCode = async (req, res, next) => {
  try {
    const { discordUsername, category, generateCode } = req.body;
    const result = await voterService.generateSingleCode({ discordUsername, category, generateCode });
    res.status(201).json({
      success: true,
      message: `Voter ${discordUsername} registered successfully.`,
      ...result
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const generateBulkCodes = async (req, res, next) => {
  try {
    const { voters } = req.body; // Array of { discordUsername, category }
    const result = await voterService.generateBulkCodes(voters);
    res.status(201).json({
      success: true,
      message: `Generated ${result.generatedCount} voting codes successfully.`,
      ...result
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getVotersList = async (req, res, next) => {
  try {
    const { search, category, status, page, limit } = req.query;
    const result = await voterService.getAllVoters({ search, category, status, page, limit });
    res.json({
      success: true,
      data: result.voters,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

export const exportVotersCsv = async (req, res, next) => {
  try {
    const data = await voterService.getVotersCsvData();
    res.json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

export const generateCodeForVoter = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await voterService.generateCodeForVoter(id);
    res.json({
      success: true,
      message: `New voting code generated for ${result.voter.discordUsername}.`,
      ...result
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteCodeForVoter = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await voterService.deleteCodeForVoter(id);
    res.json({
      success: true,
      message: `Voting code removed for ${result.voter.discordUsername}.`,
      ...result
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getVoterCode = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await voterService.getVoterCode(id);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

export const deleteVoter = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await voterService.deleteVoter(id);
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const removeVoterBallot = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await ballotService.removeBallotByVoter(id);
    res.json({
      success: true,
      message: 'Voter ballot removed and deducted from leaderboard.',
      ...result
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteAllVoters = async (req, res, next) => {
  try {
    const result = await voterService.deleteAllVoters();
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
