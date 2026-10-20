const { Pool } = require('pg'); require('dotenv').config({path: './server/.env'}); const pool = new Pool({connectionString: process.env.DATABASE_URL}); 
