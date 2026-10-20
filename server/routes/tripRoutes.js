import express from 'express';
import { createTrip, getTrips, getTripById, updateTrip, deleteTrip } from '../controllers/tripController.js';
import { addStop, reorderStops } from '../controllers/stopController.js';
import { getShareSettings, updateShareSettings } from '../controllers/shareController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createTrip)
  .get(protect, getTrips);

router.route('/:id')
  .get(protect, getTripById)
  .put(protect, updateTrip)
  .delete(protect, deleteTrip);

router.post('/:tripId/stops', protect, addStop);
router.put('/:tripId/stops/reorder', protect, reorderStops);

router.route('/:id/share')
  .get(protect, getShareSettings)
  .put(protect, updateShareSettings);

export default router;
