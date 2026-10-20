import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getCalendarData } from '../controllers/calendarController.js';

const router = express.Router();

router.get('/', protect, getCalendarData);

export default router;
