# GlobeTrotter Database Setup

Follow these steps to set up the local PostgreSQL database for GlobeTrotter.

## 1. Create the Database

Ensure PostgreSQL is installed and running on your machine.
Open your PostgreSQL terminal (e.g., `psql`) and run:

```sql
CREATE DATABASE globetrotter;
```

## 2. Configure Environment Variables

In the root of the project, locate the `.env` file (or create one if it doesn't exist). Update the `DATABASE_URL` with your local PostgreSQL credentials. 

For example:
```env
PORT=5000
DATABASE_URL=postgres://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/globetrotter
CLIENT_URL=http://localhost:5173
```

## 3. Run the Schema and Seed Scripts

You can execute the SQL files directly using `psql` from the root of your project:

```bash
# Create the tables
psql -U YOUR_USERNAME -d globetrotter -f server/db/schema.sql

# Insert initial sample data
psql -U YOUR_USERNAME -d globetrotter -f server/db/seed.sql
```

*(Note: Replace `YOUR_USERNAME` with your PostgreSQL username, typically `postgres`)*

## 4. Start the Backend

Run the following command from the root of the project:

```bash
npm run server
```

## 5. Test the Connection

Verify the server is running and the database connection is successful by visiting:

[http://localhost:5000/api/health](http://localhost:5000/api/health)

You should see a JSON response confirming the API is running. Check your terminal to ensure there are no database connection errors.
