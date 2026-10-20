import pool from '../config/db.js';

// Helper to verify trip ownership
const verifyTripOwnership = async (tripId, userId) => {
  const result = await pool.query('SELECT id, start_date, end_date, budget_limit FROM trips WHERE id = $1 AND user_id = $2', [tripId, userId]);
  return result.rows[0]; // Returns trip if owned, else undefined
};

// @desc    Create an expense
// @route   POST /api/trips/:tripId/expenses
// @access  Private
export const createExpense = async (req, res) => {
  const tripId = req.params.tripId;
  const userId = req.user.id;
  const { category, amount, description, date } = req.body;

  if (!category || !amount || amount <= 0) {
    return res.status(400).json({ success: false, message: 'Category and a positive amount are required' });
  }

  try {
    const trip = await verifyTripOwnership(tripId, userId);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found or unauthorized' });
    }
    
    const expenseDate = date || new Date().toISOString().split('T')[0];
    if (trip.start_date && trip.end_date) {
      const expD = new Date(expenseDate);
      const startD = new Date(trip.start_date);
      const endD = new Date(trip.end_date);
      if (expD < startD || expD > endD) {
        return res.status(400).json({ success: false, message: 'Expense date must be within the selected trip dates.' });
      }
    }

    const result = await pool.query(
      `INSERT INTO expenses (trip_id, category, amount, description, date) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [tripId, category, amount, description, expenseDate]
    );

    res.status(201).json({ success: true, expense: result.rows[0] });
  } catch (err) {
    console.error('Error creating expense:', err);
    res.status(500).json({ success: false, message: 'Server error creating expense' });
  }
};

// @desc    Get trip expenses
// @route   GET /api/trips/:tripId/expenses
// @access  Private
export const getExpenses = async (req, res) => {
  const tripId = req.params.tripId;
  const userId = req.user.id;

  try {
    const trip = await verifyTripOwnership(tripId, userId);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found or unauthorized' });
    }

    const result = await pool.query(
      'SELECT id, category, amount, description, date FROM expenses WHERE trip_id = $1 ORDER BY date DESC, id DESC',
      [tripId]
    );

    res.status(200).json({ success: true, expenses: result.rows });
  } catch (err) {
    console.error('Error fetching expenses:', err);
    res.status(500).json({ success: false, message: 'Server error fetching expenses' });
  }
};

// @desc    Update an expense
// @route   PUT /api/expenses/:id
// @access  Private
export const updateExpense = async (req, res) => {
  const expenseId = req.params.id;
  const userId = req.user.id;
  const { category, amount, description, date } = req.body;

  try {
    // We need to fetch the trip first to validate the date against its limits
    const checkRes = await pool.query(
      'SELECT trip_id FROM expenses WHERE id = $1',
      [expenseId]
    );
    if (checkRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Expense not found or unauthorized' });
    }
    const tId = checkRes.rows[0].trip_id;
    const trip = await verifyTripOwnership(tId, userId);
    
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Expense not found or unauthorized' });
    }

    if (date && trip.start_date && trip.end_date) {
      const expD = new Date(date);
      const startD = new Date(trip.start_date);
      const endD = new Date(trip.end_date);
      if (expD < startD || expD > endD) {
        return res.status(400).json({ success: false, message: 'Expense date must be within the selected trip dates.' });
      }
    }

    const result = await pool.query(
      `UPDATE expenses 
       SET category = COALESCE($1, category), 
           amount = COALESCE($2, amount), 
           description = COALESCE($3, description), 
           date = COALESCE($4, date)
       WHERE id = $5 AND trip_id IN (SELECT id FROM trips WHERE user_id = $6)
       RETURNING *`,
      [category, amount, description, date, expenseId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Expense not found or unauthorized' });
    }

    res.status(200).json({ success: true, expense: result.rows[0] });
  } catch (err) {
    console.error('Error updating expense:', err);
    res.status(500).json({ success: false, message: 'Server error updating expense' });
  }
};

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
// @access  Private
export const deleteExpense = async (req, res) => {
  const expenseId = req.params.id;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      'DELETE FROM expenses WHERE id = $1 AND trip_id IN (SELECT id FROM trips WHERE user_id = $2) RETURNING id',
      [expenseId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Expense not found or unauthorized' });
    }

    res.status(200).json({ success: true, message: 'Expense deleted successfully' });
  } catch (err) {
    console.error('Error deleting expense:', err);
    res.status(500).json({ success: false, message: 'Server error deleting expense' });
  }
};

// @desc    Get trip budget summary
// @route   GET /api/trips/:tripId/budget
// @access  Private
export const getBudgetSummary = async (req, res) => {
  const tripId = req.params.tripId;
  const userId = req.user.id;

  try {
    const trip = await verifyTripOwnership(tripId, userId);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found or unauthorized' });
    }

    // Calculate total spent and categories
    const expensesResult = await pool.query(
      'SELECT category, SUM(amount) as total FROM expenses WHERE trip_id = $1 GROUP BY category',
      [tripId]
    );

    let totalSpent = 0;
    const categories = {
      Flights: 0,
      Accommodation: 0,
      Activities: 0,
      Meals: 0,
      Transport: 0,
      'Shopping & Other': 0,
      Other: 0
    };

    expensesResult.rows.forEach(row => {
      const amount = parseFloat(row.total);
      totalSpent += amount;
      // Map basic categories
      const cat = row.category;
      if (categories.hasOwnProperty(cat)) {
        categories[cat] += amount;
      } else {
        categories.Other += amount;
      }
    });

    // Calculate days for avg per day
    let totalDays = 1;
    if (trip.start_date && trip.end_date) {
      const start = new Date(trip.start_date);
      const end = new Date(trip.end_date);
      totalDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1);
    }
    const averagePerDay = parseFloat((totalSpent / totalDays).toFixed(2));

    const budgetLimit = parseFloat(trip.budget_limit || 0);
    const budgetRemaining = budgetLimit > 0 ? parseFloat((budgetLimit - totalSpent).toFixed(2)) : 0;
    const isOverBudget = budgetLimit > 0 && totalSpent > budgetLimit;
    const percentageUsed = budgetLimit > 0 ? Math.min(100, Math.round((totalSpent / budgetLimit) * 100)) : 0;

    res.status(200).json({
      success: true,
      budget: {
        budgetLimit,
        totalSpent,
        budgetRemaining,
        averagePerDay,
        totalDays,
        isOverBudget,
        percentageUsed,
        categories
      }
    });
  } catch (err) {
    console.error('Error fetching budget summary:', err);
    res.status(500).json({ success: false, message: 'Server error fetching budget summary' });
  }
};
