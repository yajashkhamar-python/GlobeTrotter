import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
  getBudgetSummary
} from '../controllers/expenseController.js';

const router = express.Router();

router.post('/trips/:tripId/expenses', protect, createExpense);
router.get('/trips/:tripId/expenses', protect, getExpenses);
router.get('/trips/:tripId/budget', protect, getBudgetSummary);

router.put('/expenses/:id', protect, updateExpense);
router.delete('/expenses/:id', protect, deleteExpense);

export default router;
