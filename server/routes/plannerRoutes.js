import express from 'express';
import { generatePlan, savePlan } from '../controllers/plannerController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/planner/generate — generate a personalized itinerary (auth required)
router.post('/generate', protect, generatePlan);

// POST /api/planner/save — save generated plan to database (auth required)
router.post('/save', protect, savePlan);

export default router;
