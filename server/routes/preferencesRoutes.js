import express from 'express';
import { getPreferences, savePreferences } from '../controllers/preferencesController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getPreferences)
  .post(protect, savePreferences)
  .put(protect, savePreferences);

export default router;
