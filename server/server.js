import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './config/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration supporting single or multiple comma-separated client origins
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map(o => o.trim()).filter(Boolean)
  : ['http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser tools (curl, mobile, server-to-server) where origin is undefined
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked request from origin: ${origin}`));
  },
  credentials: true
}));

app.use(express.json());

import authRoutes from './routes/authRoutes.js';
import tripRoutes from './routes/tripRoutes.js';
import cityRoutes from './routes/cityRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import stopRoutes from './routes/stopRoutes.js';
import tripActivityRoutes from './routes/tripActivityRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import calendarRoutes from './routes/calendarRoutes.js';
import shareRoutes from './routes/shareRoutes.js';
import preferencesRoutes from './routes/preferencesRoutes.js';
import recommendationRoutes from './routes/recommendationRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import savedRoutes from './routes/savedRoutes.js';
import plannerRoutes from './routes/plannerRoutes.js';
import aiAssistantRoutes from './routes/aiAssistantRoutes.js';

// Basic error handling for invalid JSON
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ success: false, message: 'Invalid JSON payload' });
  }
  next();
});

// Routes
app.use('/api', expenseRoutes); // Mount first to catch /trips/:tripId/expenses and /expenses/:id
app.use('/api/calendar', calendarRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/cities', cityRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/stops', stopRoutes);
app.use('/api/trip-activities', tripActivityRoutes);
app.use('/api/shared', shareRoutes);
app.use('/api/preferences', preferencesRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/saved', savedRoutes);
app.use('/api/planner', plannerRoutes);
app.use('/api/ai-assistant', aiAssistantRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Optional: verify DB connection in health check
    await db.query('SELECT 1');
    res.json({
      success: true,
      message: 'GlobeTrotter API is running',
      database: 'connected'
    });
  } catch (error) {
    console.error('Database connection failed:', error);
    res.status(500).json({
      success: false,
      message: 'GlobeTrotter API is running, but database connection failed',
      database: 'disconnected',
      error: error.message
    });
  }
});

// Start server
async function startServer() {
  try {
    // 1. Test database connection
    await db.query('SELECT 1');
    console.log('Successfully connected to PostgreSQL database.');

    // 1b. Temporary diagnostic check for schema/database context
    try {
      const diagQuery = `
        SELECT 
          current_database() AS database_name, 
          current_schema() AS current_schema, 
          current_setting('search_path') AS search_path, 
          to_regclass('public.users')::text AS public_users_table, 
          to_regclass('users')::text AS unqualified_users_table
      `;
      const diagRes = await db.query(diagQuery);
      if (diagRes && diagRes.rows && diagRes.rows[0]) {
        console.log('[DB Diagnostic]', {
          database_name: diagRes.rows[0].database_name,
          current_schema: diagRes.rows[0].current_schema,
          search_path: diagRes.rows[0].search_path,
          public_users_table: diagRes.rows[0].public_users_table,
          unqualified_users_table: diagRes.rows[0].unqualified_users_table,
        });
      }
    } catch (diagErr) {
      console.warn('[DB Diagnostic Error]', diagErr.message);
    }

    // 2. Start HTTP server
    app.listen(PORT, (err) => {
      if (err) {
        console.error('Failed to start server:', err.message || err);
        process.exit(1);
      }
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('CRITICAL: Database connection failed during startup.');
    console.error(error.message);
    process.exit(1);
  }
}

startServer();
