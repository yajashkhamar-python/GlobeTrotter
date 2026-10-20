import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getSavedDestinations, saveDestination, unsaveDestination } from '../controllers/savedController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/destinations', getSavedDestinations);
router.post('/destinations', saveDestination);
router.delete('/destinations/:cityId', unsaveDestination);

export default router;
