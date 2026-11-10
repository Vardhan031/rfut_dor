import * as nomineeService from '../services/nomineeService.js';
import { verifyToken } from '../utils/jwt.js';

export const getNominees = async (req, res, next) => {
  try {
    let isAdmin = Boolean(req.admin);
    const authHeader = req.headers.authorization;
    if (!isAdmin && authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const decoded = verifyToken(authHeader.split(' ')[1]);
        if (decoded.role === 'admin') isAdmin = true;
      } catch {}
    }

    const nominees = await nomineeService.getNominees(isAdmin);
    res.json({
      success: true,
      data: nominees
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminNominees = async (req, res, next) => {
  try {
    const nominees = await nomineeService.getNominees(true);
    res.json({
      success: true,
      data: nominees
    });
  } catch (error) {
    next(error);
  }
};

export const createNominee = async (req, res, next) => {
  try {
    const { displayName, discordUsername, imageUrl, description, isActive } = req.body;
    const nominee = await nomineeService.createNominee({
      displayName,
      discordUsername,
      imageUrl,
      description,
      isActive
    });
    res.status(201).json({
      success: true,
      message: 'Nominee created successfully.',
      data: nominee
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateNominee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const nominee = await nomineeService.updateNominee(id, req.body);
    res.json({
      success: true,
      message: 'Nominee updated successfully.',
      data: nominee
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteNominee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await nomineeService.deleteNominee(id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const toggleNomineeActive = async (req, res, next) => {
  try {
    const { id } = req.params;
    const nominee = await nomineeService.toggleNomineeActive(id);
    res.json({
      success: true,
      message: `Nominee is now ${nominee.isActive ? 'active' : 'inactive'}.`,
      data: nominee
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteAllNominees = async (req, res, next) => {
  try {
    const result = await nomineeService.deleteAllNominees();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const bulkCreateNominees = async (req, res, next) => {
  try {
    const { nominees } = req.body;
    const result = await nomineeService.bulkCreateNominees(nominees);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
