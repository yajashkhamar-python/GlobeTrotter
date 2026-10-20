import express from 'express';
import { chatWithAssistant, applyChanges } from '../controllers/aiAssistantController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/chat', protect, chatWithAssistant);
router.post('/apply-changes', protect, applyChanges);

export default router;
