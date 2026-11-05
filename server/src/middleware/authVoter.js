import { verifyToken } from '../utils/jwt.js';
import { Voter } from '../models/Voter.js';

export const authVoter = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Voting session required. Please enter your code.' });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Voting session expired or invalid. Please re-enter your code.' });
    }

    if (decoded.role !== 'voter' || !decoded.voterId) {
      return res.status(403).json({ success: false, message: 'Invalid voting token.' });
    }

    const voter = await Voter.findById(decoded.voterId);
    if (!voter) {
      return res.status(401).json({ success: false, message: 'Voter profile not found.' });
    }

    req.voter = voter;
    next();
  } catch (error) {
    next(error);
  }
};
