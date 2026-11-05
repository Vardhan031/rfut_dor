import { Router } from 'express';
import * as nomineeController from '../controllers/nomineeController.js';
import { authAdmin } from '../middleware/authAdmin.js';

const router = Router();

// Public / voter view of nominees
router.get('/', nomineeController.getNominees);

// Protected admin nominee management
router.post('/', authAdmin, nomineeController.createNominee);
router.put('/:id', authAdmin, nomineeController.updateNominee);
router.delete('/:id', authAdmin, nomineeController.deleteNominee);
router.patch('/:id/toggle', authAdmin, nomineeController.toggleNomineeActive);

export default router;
