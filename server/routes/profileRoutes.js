import express from 'express';
import { getProfile, updateProfile, updatePassword, updateLanguage, deleteAccount } from '../controllers/profileController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getProfile);
router.put('/', protect, updateProfile);
router.put('/password', protect, updatePassword);
router.put('/language', protect, updateLanguage);
router.delete('/', protect, deleteAccount);

export default router;
