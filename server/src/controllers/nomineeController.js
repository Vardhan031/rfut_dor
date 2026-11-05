import * as nomineeService from '../services/nomineeService.js';

export const getNominees = async (req, res, next) => {
  try {
    const isAdmin = Boolean(req.admin);
    const nominees = await nomineeService.getNominees(isAdmin);
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
