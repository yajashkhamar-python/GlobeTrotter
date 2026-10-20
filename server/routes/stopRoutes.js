import express from 'express';
import { updateStop, deleteStop } from '../controllers/stopController.js';
import { addTripActivity } from '../controllers/tripActivityController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.put('/:stopId', protect, updateStop);
router.delete('/:stopId', protect, deleteStop);
router.post('/:stopId/activities', protect, addTripActivity);

export default router;
