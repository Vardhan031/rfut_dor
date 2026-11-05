import { verifyToken } from '../utils/jwt.js';
import { Admin } from '../models/Admin.js';

export const authAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Invalid or expired session token.' });
    }

    if (decoded.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied: Admin role required.' });
    }

    const admin = await Admin.findById(decoded.id).select('-passwordHash');
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Admin account not found or deactivated.' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    next(error);
  }
};
