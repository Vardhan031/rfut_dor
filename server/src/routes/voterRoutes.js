import { Router } from 'express';
import * as voterController from '../controllers/voterController.js';
import { authVoter } from '../middleware/authVoter.js';
import { verifyCodeLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Public code verification with brute-force rate limiter
router.post('/verify-code', verifyCodeLimiter, voterController.verifyCode);

// Authenticated voter session endpoints
router.use(authVoter);

router.get('/me', voterController.getVoterProfile);
router.get('/nominees', voterController.getNomineesForVoter);
router.get('/ballot', voterController.getVoterBallot);
router.post('/ballot', voterController.submitVoterBallot);

export default router;
