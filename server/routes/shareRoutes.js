import express from 'express';
import { getPublicTrip, copyPublicTrip, discoverPublicTrips } from '../controllers/shareController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/discover', discoverPublicTrips);
router.get('/:token', getPublicTrip);
router.post('/:token/copy', protect, copyPublicTrip);

export default router;
