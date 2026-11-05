import { Router } from 'express';
import * as adminController from '../controllers/adminController.js';
import * as voterController from '../controllers/voterController.js';
import { authAdmin } from '../middleware/authAdmin.js';

const router = Router();

// Public admin authentication
router.post('/login', adminController.login);

// Protected admin endpoints
router.use(authAdmin);

router.get('/overview', adminController.getOverview);
router.get('/results', adminController.getResults);
router.post('/controls', adminController.updateControl);
router.get('/ballots', adminController.getBallots);

// Voter & code management endpoints
router.get('/voters', voterController.getVotersList);
router.post('/voters/generate', voterController.generateSingleCode);
router.post('/voters/bulk-generate', voterController.generateBulkCodes);
router.get('/voters/export', voterController.exportVotersCsv);

export default router;
