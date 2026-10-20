import pool from '../config/db.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const initGemini = () => {
  if (!process.env.GEMINI_API_KEY) return null;
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
};

export const chatWithAssistant = async (req, res) => {
  try {
    const { tripId, message, history } = req.body;
    const userId = req.user.id;

    if (!tripId || !message) {
      return res.status(400).json({ success: false, message: 'Trip ID and message are required' });
    }

    const genAI = initGemini();
    if (!genAI) {
      return res.status(500).json({ success: false, message: 'AI Assistant is not configured. Missing GEMINI_API_KEY.' });
    }

    // 1. Fetch Trip Basics
    const tripRes = await pool.query(
      'SELECT * FROM trips WHERE id = $1 AND user_id = $2',
      [tripId, userId]
    );
    if (tripRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Trip not found or unauthorized' });
    }
    const trip = tripRes.rows[0];

    // 2. Fetch Stops
    const stopsRes = await pool.query(
      `SELECT ts.id, ts.start_date, ts.end_date, ts.stop_order, c.name as city_name, c.country 
       FROM trip_stops ts 
       JOIN cities c ON ts.city_id = c.id 
       WHERE ts.trip_id = $1 ORDER BY ts.stop_order ASC`,
      [tripId]
    );
    
    // 3. Fetch Activities
    const activitiesRes = await pool.query(
      `SELECT ta.id, ta.date as trip_date, ta.start_time, ta.end_time, ta.custom_cost as cost, ta.notes,
              a.id as activity_id, a.name as activity_name, a.type as activity_type, a.description,
              c.name as city_name
       FROM trip_activities ta
       JOIN activities a ON ta.activity_id = a.id
       JOIN trip_stops ts ON ta.trip_stop_id = ts.id
       JOIN cities c ON ts.city_id = c.id
       WHERE ts.trip_id = $1
       ORDER BY ta.date ASC, ta.start_time ASC`,
      [tripId]
    );

    // 4. Fetch Budget / Expenses
    const expenseRes = await pool.query(
      'SELECT amount, category, description, date FROM expenses WHERE trip_id = $1',
      [tripId]
    );

    // Build context
    const tripContext = `
      Trip Name: ${trip.name}
      Dates: ${trip.start_date} to ${trip.end_date}
      Stops: ${stopsRes.rows.map(s => `${s.city_name}, ${s.country} (${s.start_date} to ${s.end_date})`).join(' | ')}
      Planned Activities:
      ${activitiesRes.rows.map(a => `- ${a.activity_name} (${a.city_name}) on ${a.trip_date} ${a.start_time ? `at ${a.start_time}` : ''}. Cost: ${a.cost || 'Unknown'}. Type: ${a.activity_type}`).join('\n')}
      Expenses so far: ${expenseRes.rows.length > 0 ? expenseRes.rows.map(e => `${e.amount} on ${e.category} (${e.description})`).join(', ') : 'None recorded'}
    `;

    const systemPrompt = `You are a professional travel planning assistant. The user is currently planning a trip.

IMPORTANT RULES:
1. You can answer general knowledge, technology, geography, food, and everyday questions. Do not force every question into the context of the current trip.
2. If the user asks about their current trip, use the context provided below. Otherwise, answer the user's question directly.
3. Keep answers concise. Do not invent facts if you do not know the answer.
4. If you propose concrete itinerary changes (like adding, replacing, or moving an activity) for the user's trip, YOU MUST output a JSON block at the very end of your response wrapped in \`\`\`json and \`\`\` containing the array of proposed changes.
   Example JSON:
   \`\`\`json
   [
     {
       "action": "replace",
       "old_activity_name": "Old Activity",
       "activity_name": "New Alternative",
       "city": "Paris",
       "date": "2026-10-16",
       "explanation": "Better alternative."
     }
   ]
   \`\`\`

--- CURRENT TRIP CONTEXT (Ignore if user asks a general question) ---
${tripContext}
`;

    let validHistory = (history || []).map(h => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.text }]
    })).slice(-10); // Limit to recent messages for performance
    
    // Gemini requires the first history message to be from 'user'
    while (validHistory.length > 0 && validHistory[0].role !== 'user') {
      validHistory.shift();
    }

    const attemptRequest = async (modelName, maxRetries = 3) => {
      const model = genAI.getGenerativeModel({ model: modelName });
      const chat = model.startChat({ history: validHistory });
      const prompt = `Context reminder: ${systemPrompt}\n\nUser Request: ${message}`;
      
      let attempt = 0;
      while (attempt <= maxRetries) {
        try {
          return await chat.sendMessage(prompt);
        } catch (error) {
          const isTemporary = error.status === 503 || error.status === 429;
          if (!isTemporary || attempt === maxRetries) throw error;
          
          attempt++;
          const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500;
          console.warn(`[AI] ${modelName} returned ${error.status}. Retry ${attempt}/${maxRetries} in ${Math.round(delay)}ms...`);
          await new Promise(res => setTimeout(res, delay));
        }
      }
    };

    const primaryModelName = process.env.GEMINI_PRIMARY_MODEL || "gemini-3.8-flash";
    const fallbackModelName = process.env.GEMINI_FALLBACK_MODEL || "gemini-3.7-flash";

    let result;
    try {
      result = await attemptRequest(primaryModelName, 3);
    } catch (error) {
      const isTemporary = error.status === 503 || error.status === 429;
      if (isTemporary && fallbackModelName && fallbackModelName !== primaryModelName) {
        console.warn(`[AI] Primary model ${primaryModelName} failed. Falling back to ${fallbackModelName}`);
        result = await attemptRequest(fallbackModelName, 2);
      } else {
        throw error;
      }
    }
    const rawResponse = result.response.text();
    
    let responseText = rawResponse;
    let proposedChanges = null;
    
    // Parse JSON block if present
    const jsonMatch = rawResponse.match(/\`\`\`json\s*([\s\S]*?)\s*\`\`\`/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        proposedChanges = JSON.parse(jsonMatch[1]);
        // Remove the json block from the text response
        responseText = rawResponse.replace(jsonMatch[0], '').trim();
      } catch (err) {
        console.error("Failed to parse AI JSON proposed changes", err);
      }
    }

    res.json({ success: true, response: responseText, proposedChanges });
  } catch (error) {
    console.error('AI Assistant Error [Name]:', error.name);
    console.error('AI Assistant Error [Message]:', error.message);
    if (error.status) console.error('AI Assistant Error [Status]:', error.status);
    res.status(500).json({ success: false, message: error.message || 'An error occurred processing your request.' });
  }
};

export const applyChanges = async (req, res) => {
  const { tripId, changes } = req.body;
  const userId = req.user.id;
  
  if (!tripId || !changes || !Array.isArray(changes)) {
    return res.status(400).json({ success: false, message: 'Invalid payload' });
  }

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // 1. Verify trip ownership
    const tripRes = await client.query('SELECT id FROM trips WHERE id = $1 AND user_id = $2', [tripId, userId]);
    if (tripRes.rows.length === 0) {
      throw new Error('Unauthorized or Trip not found');
    }

    for (const change of changes) {
      const { action, activity_name, city, date } = change;
      
      if (action === 'add' || action === 'replace') {
        // Find activity ID by name
        const actRes = await client.query('SELECT id FROM activities WHERE name ILIKE $1', [activity_name]);
        if (actRes.rows.length === 0) continue;
        const activityId = actRes.rows[0].id;
        
        // Find trip_stop_id for the given city and date
        const stopRes = await client.query(`
          SELECT ts.id 
          FROM trip_stops ts
          JOIN cities c ON ts.city_id = c.id
          WHERE ts.trip_id = $1 AND c.name ILIKE $2
        `, [tripId, city]);
        if (stopRes.rows.length === 0) continue;
        const stopId = stopRes.rows[0].id;

        if (action === 'add') {
          await client.query(
            'INSERT INTO trip_activities (trip_stop_id, activity_id, date) VALUES ($1, $2, $3)',
            [stopId, activityId, date]
          );
        } else if (action === 'replace') {
          // Find old activity ID to replace
          // Simplification: we might not know exactly which trip_activity_id, so we find by name and date
          const oldActRes = await client.query(`
            SELECT ta.id 
            FROM trip_activities ta
            JOIN activities a ON ta.activity_id = a.id
            WHERE ta.trip_stop_id = $1 AND a.name ILIKE $2 AND ta.date = $3
          `, [stopId, change.old_activity_name || activity_name, date]); // In prompt we asked for old activity name if possible, or we can just try to update.
          // Wait, replace needs the old activity name. The AI might provide it if we tell it to.
          // Alternatively, just insert new. Let's assume we do INSERT and DELETE.
          await client.query('INSERT INTO trip_activities (trip_stop_id, activity_id, date) VALUES ($1, $2, $3)', [stopId, activityId, date]);
          if (change.old_activity_name) {
             const oldAct = await client.query('SELECT id FROM activities WHERE name ILIKE $1', [change.old_activity_name]);
             if (oldAct.rows.length > 0) {
               await client.query('DELETE FROM trip_activities WHERE trip_stop_id = $1 AND activity_id = $2 AND date = $3', [stopId, oldAct.rows[0].id, date]);
             }
          }
        }
      } else if (action === 'remove') {
        const actRes = await client.query('SELECT id FROM activities WHERE name ILIKE $1', [activity_name]);
        if (actRes.rows.length > 0) {
          const stopRes = await client.query(`
            SELECT ts.id FROM trip_stops ts JOIN cities c ON ts.city_id = c.id WHERE ts.trip_id = $1 AND c.name ILIKE $2
          `, [tripId, city]);
          if (stopRes.rows.length > 0) {
            await client.query('DELETE FROM trip_activities WHERE trip_stop_id = $1 AND activity_id = $2 AND date = $3', [stopRes.rows[0].id, actRes.rows[0].id, date]);
          }
        }
      }
    }
    
    await client.query('COMMIT');
    res.json({ success: true, message: 'Changes applied successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error applying AI changes:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to apply changes' });
  } finally {
    client.release();
  }
};
