import * as adminService from '../services/adminService.js';
import * as ballotService from '../services/ballotService.js';

export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const result = await adminService.loginAdmin(username, password);
    res.json({
      success: true,
      message: 'Admin authentication successful.',
      ...result
    });
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
};

export const getOverview = async (req, res, next) => {
  try {
    const overview = await adminService.getDashboardOverview();
    res.json({
      success: true,
      data: overview
    });
  } catch (error) {
    next(error);
  }
};

export const getResults = async (req, res, next) => {
  try {
    const results = await adminService.getResultsAndLeaderboard();
    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    next(error);
  }
};

export const updateControl = async (req, res, next) => {
  try {
    const { isVotingOpen, resultsAnnounced } = req.body;
    const updated = await adminService.updateVotingControl({
      isVotingOpen,
      resultsAnnounced,
      updatedBy: req.admin?.username || 'admin'
    });
    res.json({
      success: true,
      message: 'Voting platform controls updated successfully.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

export const getBallots = async (req, res, next) => {
  try {
    const ballots = await ballotService.getAllBallotsForAdmin();
    res.json({
      success: true,
      data: ballots
    });
  } catch (error) {
    next(error);
  }
};
