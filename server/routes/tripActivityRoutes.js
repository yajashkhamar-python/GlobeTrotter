import express from 'express';
import { updateTripActivity, deleteTripActivity } from '../controllers/tripActivityController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.put('/:id', protect, updateTripActivity);
router.delete('/:id', protect, deleteTripActivity);

export default router;
