
# GlobeTrotter

> A modern, full-stack travel planning platform for designing multi-city adventures, generating intelligent day-wise itineraries, organizing activities on interactive Leaflet maps, tracking travel expenses, and collaborating with an integrated Gemini AI Copilot.

[![Repository](https://img.shields.io/badge/GitHub-yajashkhamar--python%2FGlobeTrotter-1d5bef?logo=github)](https://github.com/yajashkhamar-python/GlobeTrotter)
[![Vite](https://img.shields.io/badge/Frontend-React%2019%20%7C%20Vite%208-646CFF?logo=vite)](https://vitejs.dev/)
[![Node Express](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express%205-339933?logo=express)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1?logo=postgresql)](https://www.postgresql.org/)
[![AI](https://img.shields.io/badge/AI-Google%20Gemini%20Flash-4285F4?logo=googlegemini)](https://ai.google.dev/)

---

## Table of Contents

- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Application Architecture](#application-architecture)
- [Project Directory Structure](#project-directory-structure)
- [Prerequisites](#prerequisites)
- [Installation and Local Setup](#installation-and-local-setup)
- [Environment Variables](#environment-variables)
- [Database Documentation](#database-documentation)
- [API Documentation](#api-documentation)
- [Authentication and Security](#authentication-and-security)
- [Frontend Pages and Routes](#frontend-pages-and-routes)
- [External APIs and Third-Party Services](#external-apis-and-third-party-services)
- [Available Scripts](#available-scripts)
- [Error Handling and Troubleshooting](#error-handling-and-troubleshooting)
- [Deployment Guide](#deployment-guide)
- [Testing and Code Quality](#testing-and-code-quality)
- [Known Limitations and Future Roadmap](#known-limitations-and-future-roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Author and Acknowledgements](#author-and-acknowledgements)

---

## Project Overview

Planning a trip with multiple stops, varied schedules, fixed budgets, and different group preferences is often fractured across disjointed spreadsheets, map apps, and travel blogs. **GlobeTrotter** consolidates the entire travel lifecycle into a single, cohesive web application.

### Who It Is For
- **Independent Travelers & Backpackers:** Creating modular multi-city routes, scheduling day-by-day activities, and adhering to strict budgets.
- **Vacationers & Groups:** Sharing public read-only trip itineraries with friends or family via unique share tokens with one-click itinerary cloning.
- **Explorers:** Browsing curated global destinations, inspecting real-world country data (currencies, languages, capitals, flags), and bookmarking destinations to personal saved lists.

### What Users Can Accomplish
1. **Plan Multi-City Journeys:** Add ordered stops, customize arrival/departure dates, and attach day-by-day activities.
2. **Automated Itinerary Generation:** Feed dates, travel style (Relaxed, Moderate, Fast-Paced), interests, and party size into an algorithmic rule-based planner that constructs a complete proposed trip schedule.
3. **AI Travel Copilot:** Chat in real time with an embedded Google Gemini AI assistant that reads active trip context, suggests improvements, and applies schedule modifications directly.
4. **Interactive Geospatial Visualization:** View geographic trip stops and daily activity pins on a Leaflet / OpenStreetMap interface with auto-bounding and route polylines.
5. **Budget and Expense Tracking:** Allocate trip budgets, record category-wise expenses (transport, accommodation, meals, activities, other), and visualize real-time budget utilization percentages and category breakdowns.
6. **Notification System:** Receive real-time alerts for newly created trips, reminders, and activity recommendations via an interactive header drawer.
7. **Multi-Language & Dark Mode:** Native switching between English, Hindi, and Gujarati, paired with persistent theme toggle (Light, Dark, System).

---

## Key Features

### 1. User Authentication & Profile
- Secure email/password registration and login with bcrypt password hashing (10 salt rounds).
- Stateless JSON Web Token (`JWT`) authentication stored in client local storage and sent via Bearer headers.
- User profile editing with custom travel persona/bio, home city, favorite travel styles, password changing, and user preference persistence.

### 2. Trip Creation & Lifecycle Management
- Create trips with custom title, description, start and end dates, cover images, and maximum budget limits.
- Edit trip meta information, update stop sequences, and delete trips with cascading cleanup of associated stops, activities, and expenses.
- Overview of all upcoming, active, and past journeys on the My Trips dashboard.

### 3. Modular Itinerary & Stop Builder
- Multiple destination stops per trip, each with ordered arrival and departure timelines.
- Drag/reorder stops via backend stop-order management endpoints.
- Granular daily activity scheduling with custom time slots, duration, notes, and custom costs.

### 4. Automated Rule-Based Itinerary Planner
- Dedicated Trip Planner wizard (`/plan`) allowing users to choose a city, dates, travel style, party size, budget tier, and interests.
- Generates a full proposed draft itinerary from verified database activities before committing to the database.
- Saves generated drafts into persistent trips and activities with a single click.

### 5. AI Travel Copilot (Google Gemini)
- Integrated drawer chat inside the Trip Details view powered by Google Generative AI (`@google/generative-ai`).
- Context-aware: Feeds current trip stops, day schedules, planned activities, and expense data into Gemini.
- Proposes structured schedule modifications (add/replace activities, adjust pace) with retry handling and fallback model routing (`gemini-3.8-flash` falling back to `gemini-3.7-flash`).
- Users can preview and execute proposed AI alterations with one click.

### 6. Interactive Route & Map Visualization
- Leaflet and React-Leaflet integration rendered over OpenStreetMap tiles.
- Custom numbered destination pins, green activity pins, and connecting polyline routes.
- Day-by-day filter dropdown allowing travelers to isolate route paths for specific travel days.
- One-click `Fit All` bound calculation adjusting viewport zoom to match all itinerary points.

### 7. Budgeting & Financial Overview
- Dedicated Budget Dashboard (`/budget`) calculating total committed budget vs. total spent across all active trips.
- Category breakdowns (Transport, Accommodation, Activities, Meals, Other) with visual progress bars.
- Add, edit, and delete expense receipts linked to specific trips with date and category tags.

### 8. Destination Discovery & Country Profiles
- Explore catalog (`/explore`) with category filters (Culture, Nature, Food, Adventure, Architecture, Nightlife).
- Live search across destinations, regional filtering, and one-click bookmarking to user Saved Destinations.
- Country Details view (`/explore/country/:code`) powered by `world-countries` and Flags REST API, displaying native languages, currencies, population, capital, and localized destination lists.

### 9. Trip Sharing & Social Itinerary Discovery
- Generate unique UUID-based share tokens for any trip.
- Toggle trip visibility between private and public.
- Public read-only trip viewer (`/shared/:token`) allowing unauthorized visitors to view complete itineraries.
- One-click **"Copy to My Trips"** allowing authenticated visitors to duplicate a shared itinerary into their own account.
- Public discovery feed (`/api/shared/discover`) to explore community-shared trips.

### 10. Interactive Notifications
- Header bell badge indicating unread notification counts.
- Popover notification drawer displaying categorized alerts (trip reminders, recommendations, system notices).
- Mark individual notifications as read or batch update with "Mark all read".

### 11. Internationalization (i18n) & Customization
- Built-in lightweight i18n context supporting **English (`en`)**, **Hindi (`hi`)**, and **Gujarati (`gu`)**.
- Theme switching supporting **Light**, **Dark**, and **System default** modes, persisting through `localStorage` and `data-theme` HTML attributes.

---

## Technology Stack

| Layer | Technology | Version | Purpose in GlobeTrotter |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | React | `^19.2.8` | Component-driven UI architecture with hooks and context |
| **Frontend Build Tool** | Vite | `^8.3.0` | Ultra-fast development server, asset bundling, and ESM packaging |
| **Client Routing** | React Router DOM | `^7.18.3` | Client-side routing, protected auth shells, and dynamic params |
| **Mapping & Geospatial** | Leaflet / React-Leaflet | `^1.9.4` / `^5.0.0` | Interactive map rendering, marker pins, popups, and route polylines |
| **AI Integration** | Google Generative AI SDK | `^0.24.1` | Gemini integration for context-aware itinerary chat and adjustments |
| **Markdown Rendering** | React Markdown | `^10.1.0` | Rendering rich Markdown output from the AI copilot chat |
| **Geographic Dataset** | world-countries | `^5.1.0` | Static demographic, currency, and boundary data for 250+ countries |
| **Icons & Visuals** | Lucide React | `^1.45.0` | Consistent, accessible SVG iconography across navigation and components |
| **Backend Runtime** | Node.js | `>=18.x` | JavaScript runtime environment executing the REST API |
| **Web Application Server** | Express | `^5.2.1` | HTTP server, route controllers, and JSON request/response handling |
| **Database** | PostgreSQL | `>=14.x` | Relational database management system for relational trip models |
| **Database Client** | pg (node-postgres) | `^8.23.0` | Connection pooling and parameterized SQL query execution |
| **Authentication & Tokens**| jsonwebtoken (JWT) | `^9.0.3` | Signing and verifying stateless user authentication tokens |
| **Password Security** | bcryptjs | `^3.0.3` | One-way hashing of user passwords with salt generation |
| **CORS Middleware** | cors | `^2.8.6` | Cross-Origin Resource Sharing handling between frontend and API |
| **Environment Management** | dotenv | `^17.4.2` | Loading environment configurations into `process.env` |
| **Code Linting** | Oxlint | `^1.81.0` | High-performance linter for JavaScript and JSX code quality |

---

## Application Architecture

GlobeTrotter follows a clean, decoupled client-server architecture:

```mermaid
flowchart TD
    subgraph Client["Frontend Client (React 19 + Vite)"]
        UI[React UI Components / Pages]
        AuthCtx[Auth Context & JWT Storage]
        LangCtx[Language Context / i18n]
        ApiClient[Fetch API Client: src/services/api.js]
        LeafletMap[Leaflet Map / OSM Tiles]
    end

    subgraph Server["Backend API (Node.js + Express 5)"]
        Router[Express Route Handlers]
        AuthMid[JWT Auth Middleware: protect]
        Controllers[Controller Logic: Trips, AI, Budget, Cities]
        PlannerEngine[Algorithmic Planner Service]
        Pool[pg Connection Pool]
    end

    subgraph AI["External Intelligence"]
        Gemini[Google Gemini Generative AI]
    end

    subgraph Data["Persistence Layer"]
        Postgres[(PostgreSQL Database)]
    end

    UI --> AuthCtx
    UI --> LangCtx
    UI --> LeafletMap
    UI --> ApiClient
    ApiClient -- "HTTP / REST JSON (Bearer JWT)" --> Router
    Router --> AuthMid
    AuthMid --> Controllers
    Controllers --> PlannerEngine
    Controllers -- "SDK Prompt / Context" --> Gemini
    Gemini -- "Structured JSON Suggestions" --> Controllers
    Controllers --> Pool
    Pool -- "Parameterized SQL" --> Postgres
```

### Architectural Highlights
- **Stateless Authentication:** The client stores the JWT in `localStorage`. The API client in `src/services/api.js` automatically attaches the token as `Authorization: Bearer <token>` to all protected calls.
- **SQL Injection Prevention:** All database operations utilize parameterized queries through the `pg.Pool` instance.
- **Cascading Integrity:** Foreign keys use `ON DELETE CASCADE` across `trips`, `trip_stops`, `trip_activities`, `expenses`, `saved_destinations`, and `notifications`, guaranteeing that removing a parent record never leaves orphaned child data.
- **Dual Planning Paradigms:** Users can either craft custom trips manually, use the algorithmic recommendation engine to populate trips from cataloged activities, or consult the Gemini AI assistant to refine plans dynamically.

---

## Project Directory Structure

```text
GlobeTrotter/
├── dist/                               # Production build output generated by vite build
├── public/                             # Public static web assets
│   ├── favicon.svg                     # Browser favicon
│   ├── globe.svg                       # Platform logo asset
│   └── icons.svg                       # Icon bundle
├── server/                             # Backend application source code
│   ├── config/
│   │   └── db.js                       # PostgreSQL pg.Pool configuration
│   ├── controllers/                    # Route controller implementations
│   │   ├── activityController.js       # Activity lookup and management
│   │   ├── aiAssistantController.js    # Gemini chat and schedule modification engine
│   │   ├── authController.js           # Register, login, and profile fetching
│   │   ├── calendarController.js       # Scheduled itinerary events for calendar
│   │   ├── cityController.js           # Destination city queries
│   │   ├── dashboardController.js      # User summary statistics and recent trips
│   │   ├── expenseController.js        # Budget limits, receipts, and summaries
│   │   ├── notificationController.js   # Notification queries and read state toggles
│   │   ├── plannerController.js        # Draft itinerary generation and persistence
│   │   ├── preferencesController.js    # User travel style and pacing preferences
│   │   ├── profileController.js        # Profile info and password updates
│   │   ├── recommendationController.js # City recommendations based on preferences
│   │   ├── savedController.js          # Bookmarked destinations
│   │   ├── shareController.js          # Public trip sharing and duplication
│   │   ├── stopController.js           # Stop additions, dates, and reordering
│   │   ├── tripActivityController.js   # Activity assignment within stops
│   │   └── tripController.js           # Trip CRUD operations
│   ├── db/                             # Database schema and seed scripts
│   │   ├── README.md                   # Database setup guide
│   │   ├── runSeedPlanner.js           # Node script executing planner seeds
│   │   ├── schema.sql                  # Main PostgreSQL DDL schema definition
│   │   ├── seed.sql                    # Initial seed data
│   │   ├── seed_enhanced.sql           # Expanded destination and activity records
│   │   └── seed_planner.sql            # Comprehensive cities and activity library
│   ├── middleware/
│   │   └── authMiddleware.js           # JWT verification and route protection
│   ├── routes/                         # Express API route declarations (17 modules)
│   ├── services/
│   │   └── itineraryPlanner.js         # Algorithmic itinerary generation logic
│   └── server.js                       # Express application bootstrap and server entry point
├── src/                                # Frontend application source code
│   ├── assets/                         # Graphic assets and images
│   ├── components/                     # Modular reusable React components
│   │   ├── AIAssistant/                # Gemini chat drawer and modification UI
│   │   ├── common/                     # SafeImage, EmptyState, Modal components
│   │   ├── InteractiveMap/             # Leaflet map container and route controllers
│   │   ├── layout/                     # AppLayout, Header, Sidebar, ProtectedRoute
│   │   ├── planner/                    # Step wizard components for automated planner
│   │   └── trips/                      # Trip cards and summary widgets
│   ├── context/                        # React context providers
│   │   ├── AuthContext.jsx             # User state, login, logout, and token management
│   │   └── LanguageContext.jsx         # Locale state and i18n translation provider
│   ├── i18n/
│   │   └── translations.js             # Translation dictionaries (en, hi, gu)
│   ├── pages/                          # Primary application route pages
│   │   ├── Budget.jsx                  # Expense logging and budget breakdown
│   │   ├── Calendar.jsx                # Monthly/weekly schedule visualization
│   │   ├── CountryDetail.jsx           # Country profile and demographic lookup
│   │   ├── CreateTrip.jsx              # New journey form and editor
│   │   ├── Dashboard.jsx               # User dashboard and travel statistics
│   │   ├── Explore.jsx                 # Destination discovery directory
│   │   ├── Landing.jsx                 # Public landing page with showcase
│   │   ├── Login.jsx                   # Sign-in authentication form
│   │   ├── MyTrips.jsx                 # Grid of user journeys
│   │   ├── PlanTrip.jsx                # Multi-step automated itinerary builder
│   │   ├── Profile.jsx                 # Account details and travel preferences
│   │   ├── PublicTrip.jsx              # Unauthenticated public itinerary viewer
│   │   ├── Saved.jsx                   # Saved destinations collection
│   │   ├── Settings.jsx                # Theme, language, security, and preferences
│   │   ├── Signup.jsx                  # Account registration form
│   │   └── TripDetails.jsx             # Comprehensive itinerary, map, and stops view
│   ├── services/
│   │   └── api.js                      # Centralized Fetch API client with auth injection
│   ├── App.jsx                         # Main router configuration and theme initializer
│   ├── App.css                         # App-wide layout utilities
│   ├── index.css                       # Global design system, tokens, and CSS variables
│   └── main.jsx                        # React root entry point
├── .env.example                        # Safe environment variable template
├── .gitignore                          # Git ignore definitions
├── .oxlintrc.json                      # Oxlint linter configuration
├── index.html                          # Single Page Application HTML shell
├── package.json                        # Root package manifest, scripts, and dependencies
├── run_seed.js                         # Database seed runner utility
├── seed_notifications.cjs              # Notification test seed utility
└── vite.config.js                      # Vite bundler configuration
```

---

## Prerequisites

Before setting up GlobeTrotter locally, ensure your environment meets the following requirements:

1. **Node.js:** Active LTS version (`v18.x`, `v20.x`, or `v22.x` recommended; Node `v24.x` confirmed functional). Verify with:
   ```bash
   node -v
   ```
2. **Package Manager:** `npm` (included with Node.js) or `pnpm`/`yarn`.
3. **PostgreSQL Database:** PostgreSQL `14+` installed locally or an accessible hosted instance (e.g., Neon, Render, Supabase). Verify with:
   ```bash
   psql --version
   ```
4. **Git:** Installed and configured.
5. **Google Gemini API Key (Optional for AI Copilot):** A free API key from [Google AI Studio](https://aistudio.google.com/) if you wish to use the AI Copilot features.

---

## Installation and Local Setup

Follow these step-by-step instructions to get GlobeTrotter running locally.

### 1. Clone the Repository
```bash
git clone https://github.com/yajashkhamar-python/GlobeTrotter.git
cd GlobeTrotter
```

### 2. Install Project Dependencies
GlobeTrotter uses a single unified root `package.json` covering both frontend and backend dependencies:
```bash
npm install
```

### 3. Create the PostgreSQL Database
Open your PostgreSQL terminal (`psql` or pgAdmin) and create a fresh database:
```sql
CREATE DATABASE globetrotter;
```

### 4. Configure Environment Variables
Copy the template to create your `.env` file in the project root:
```bash
cp .env.example .env
```
Open `.env` and fill in your database credentials and configuration:
```env
PORT=5000
DATABASE_URL=postgres://postgres:your_password@localhost:5432/globetrotter
CLIENT_URL=http://localhost:5173
JWT_SECRET=your_super_secret_jwt_key_min_32_characters
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your_gemini_api_key_here
```

### 5. Initialize Database Tables
Execute the SQL schema file to create all tables, indexes, and constraints:
```bash
psql -U postgres -d globetrotter -f server/db/schema.sql
```
*(On Windows PowerShell, adjust `-U postgres` to match your local PostgreSQL user).*

### 6. Seed Sample Data
Populate the database with curated destinations, activities, and starter records:
```bash
# Seed cities and activities
node server/db/runSeedPlanner.js

# Optional: seed notification records
node seed_notifications.cjs
```

### 7. Start the Backend API Server
In a dedicated terminal window, run:
```bash
npm run server
```
The server will start on port `5000` (or your defined `PORT`). You can verify its health at:
[http://localhost:5000/api/health](http://localhost:5000/api/health)

### 8. Start the Frontend Development Server
In a second terminal window, run:
```bash
npm run dev
```
Vite will launch the application (typically at [http://localhost:5173](http://localhost:5173)). Open this URL in your web browser.

---

## Environment Variables

All configuration settings are managed via environment variables. Create a `.env` file in the root directory following this specification:

| Variable Name | Component | Required | Default / Format | Purpose |
| :--- | :--- | :---: | :--- | :--- |
| `PORT` | Backend | Optional | `5000` | Port on which the Express server listens. |
| `DATABASE_URL` | Backend | **Required** | `postgres://user:pass@host:5432/dbname` | Full connection URI for PostgreSQL connection pooling. |
| `CLIENT_URL` | Backend | Optional | `http://localhost:5173` | Allowed origin for Cross-Origin Resource Sharing (`CORS`). |
| `JWT_SECRET` | Backend | **Required** | High-entropy string | Cryptographic secret key used to sign and verify authentication JWTs. |
| `JWT_EXPIRES_IN` | Backend | Optional | `7d` | Lifetime duration before issued JWT tokens expire. |
| `GEMINI_API_KEY` | Backend | Optional* | String from Google AI Studio | API key for Gemini models. Required to enable the AI Travel Copilot. |
| `GEMINI_PRIMARY_MODEL`| Backend | Optional | `gemini-3.8-flash` | Primary Gemini model identifier for AI assistant chat. |
| `GEMINI_FALLBACK_MODEL`| Backend | Optional | `gemini-3.7-flash` | Fallback model if primary encounters rate limit/503 temporary errors. |
| `VITE_API_URL` | Frontend | Optional | `http://localhost:5000/api` | Base URL used by the client when communicating with the API. |

> [!CAUTION]
> **Security Notice:** Never commit `.env` files, production database passwords, JWT secrets, or Gemini API keys to GitHub. The `.gitignore` file is preconfigured to exclude `.env` files.

---

## Database Documentation

GlobeTrotter uses a normalized PostgreSQL relational schema designed for relational integrity, day-wise sequencing, and fast lookups.

### Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    users ||--o{ trips : "creates"
    users ||--o{ saved_destinations : "saves"
    users ||--o| user_preferences : "configures"
    users ||--o{ notifications : "receives"
    trips ||--o{ trip_stops : "contains"
    trips ||--o{ expenses : "tracks"
    trips ||--o| shared_trips : "shares"
    cities ||--o{ trip_stops : "located_at"
    cities ||--o{ activities : "offers"
    cities ||--o{ saved_destinations : "saved_as"
    trip_stops ||--o{ trip_activities : "schedules"
    activities ||--o{ trip_activities : "instantiates"

    users {
        int id PK
        varchar name
        varchar email UK
        varchar password
        text profile_photo
        varchar language
        timestamp created_at
    }

    trips {
        int id PK
        int user_id FK
        varchar name
        text description
        date start_date
        date end_date
        text cover_image
        decimal budget_limit
        timestamp created_at
    }

    cities {
        int id PK
        varchar name
        varchar country
        varchar region
        text description
        text image
        int cost_index
        int popularity
        decimal latitude
        decimal longitude
    }

    trip_stops {
        int id PK
        int trip_id FK
        int city_id FK
        date start_date
        date end_date
        int stop_order
    }

    activities {
        int id PK
        int city_id FK
        varchar name
        text description
        varchar type
        decimal cost
        varchar duration
        text image
    }

    trip_activities {
        int id PK
        int trip_stop_id FK
        int activity_id FK
        date date
        time start_time
        time end_time
        decimal custom_cost
        text notes
        int activity_order
    }

    expenses {
        int id PK
        int trip_id FK
        varchar category
        decimal amount
        text description
        date date
    }

    saved_destinations {
        int id PK
        int user_id FK
        int city_id FK
        timestamp created_at
    }

    shared_trips {
        int id PK
        int trip_id FK
        varchar share_token UK
        boolean is_public
        timestamp created_at
    }

    notifications {
        int id PK
        int user_id FK
        varchar type
        varchar title
        text message
        varchar link
        boolean is_read
        timestamp created_at
    }

    user_preferences {
        int id PK
        int user_id FK
        varchar budget_preference
        varchar trip_pace
        varchar travel_type
        text[] interests
        timestamp created_at
    }
```

### Table Definitions

1. **`users`**: Stores user credentials, contact details, profile photo URLs, and display language preferences.
2. **`trips`**: Primary journey entity belonging to a user; encapsulates dates, cover imagery, and total budget caps.
3. **`cities`**: Catalog of worldwide travel destinations with geographic coordinates (`latitude`, `longitude`) used by Leaflet maps, plus popularity and cost index metrics.
4. **`trip_stops`**: Junction connecting a trip to one or more visited cities with sequence indexing (`stop_order`) and stay durations.
5. **`activities`**: Curated activities and landmarks associated with each city, including cost, duration, and categories.
6. **`trip_activities`**: Concrete calendar occurrences linking an activity to a specific `trip_stop`, scheduled date, time window, custom costs, and traveler notes.
7. **`expenses`**: Ledger of financial transactions categorized under `transport`, `accommodation`, `activities`, `meals`, or `other`.
8. **`saved_destinations`**: Bookmarked destinations per user with unique composite constraints (`user_id`, `city_id`).
9. **`shared_trips`**: Secure sharing tokens mapping to trips, controlling public visibility flags.
10. **`notifications`**: Activity reminders, trip alerts, and system notices with unread state tracking.
11. **`user_preferences`**: User travel personas including pacing, budget tier, and interest tag arrays.

---

## API Documentation

All API endpoints are prefixed with `/api` and return standard JSON responses.

### 1. Authentication (`/api/auth`)

| Method | Path | Auth Required | Request Body | Description |
| :--- | :--- | :---: | :--- | :--- |
| `POST` | `/register` | No | `{ name, email, password }` | Register a new account and receive a JWT. |
| `POST` | `/login` | No | `{ email, password }` | Authenticate user and issue a JWT. |
| `GET` | `/me` | **Yes** | None | Fetch authenticated user's profile details. |

### 2. Trips & Stops (`/api/trips`)

| Method | Path | Auth Required | Request Body | Description |
| :--- | :--- | :---: | :--- | :--- |
| `GET` | `/` | **Yes** | None | List all trips for the authenticated user. |
| `POST` | `/` | **Yes** | `{ name, description, start_date, end_date, cover_image, budget_limit }` | Create a new trip; generates a notification. |
| `GET` | `/:id` | **Yes** | None | Get trip details including stops, activities, and budget. |
| `PUT` | `/:id` | **Yes** | `{ name, description, start_date, end_date, cover_image, budget_limit }` | Update an existing trip. |
| `DELETE`| `/:id` | **Yes** | None | Delete a trip and cascade all related data. |
| `POST` | `/:tripId/stops` | **Yes** | `{ city_id, start_date, end_date }` | Add a destination stop to an itinerary. |
| `PUT` | `/:tripId/stops/reorder` | **Yes** | `{ stopIds: [id1, id2, ...] }` | Reorder stop sequences. |
| `GET` | `/:id/share` | **Yes** | None | Get share token and public visibility status. |
| `PUT` | `/:id/share` | **Yes** | `{ is_public }` | Toggle public access for a trip share link. |

### 3. Automated Planner (`/api/planner`)

| Method | Path | Auth Required | Request Body | Description |
| :--- | :--- | :---: | :--- | :--- |
| `POST` | `/generate` | **Yes** | `{ cityId, startDate, endDate, travelStyle, interests, travelers, budget }` | Generate an algorithmic draft itinerary without saving. |
| `POST` | `/save` | **Yes** | `{ tripName, cityId, startDate, endDate, days: [...] }` | Persist an approved draft itinerary as a real trip. |

### 4. AI Travel Assistant (`/api/ai-assistant`)

| Method | Path | Auth Required | Request Body | Description |
| :--- | :--- | :---: | :--- | :--- |
| `POST` | `/chat` | **Yes** | `{ tripId, message, history: [...] }` | Query Gemini AI with trip context; receive text & proposed changes. |
| `POST` | `/apply-changes` | **Yes** | `{ tripId, changes: { addActivities, removeActivities, ... } }` | Execute proposed AI modifications against the database. |

### 5. Expenses & Budgeting (`/api`)

| Method | Path | Auth Required | Request Body | Description |
| :--- | :--- | :---: | :--- | :--- |
| `GET` | `/trips/:tripId/expenses` | **Yes** | None | Get all expense entries for a specific trip. |
| `POST` | `/trips/:tripId/expenses` | **Yes** | `{ category, amount, description, date }` | Record a new expense for a trip. |
| `GET` | `/trips/:tripId/budget` | **Yes** | None | Calculate total budget limit vs. spent and remaining amounts. |
| `PUT` | `/expenses/:id` | **Yes** | `{ category, amount, description, date }` | Update an existing expense record. |
| `DELETE`| `/expenses/:id` | **Yes** | None | Delete an expense entry. |

### 6. Notifications (`/api/notifications`)

| Method | Path | Auth Required | Request Body | Description |
| :--- | :--- | :---: | :--- | :--- |
| `GET` | `/` | **Yes** | None | Fetch the 50 most recent notifications for user. |
| `GET` | `/unread-count` | **Yes** | None | Get integer count of unread notifications. |
| `PATCH`| `/:id/read` | **Yes** | None | Mark a specific notification as read. |
| `PATCH`| `/read-all` | **Yes** | None | Mark all unread notifications as read. |

### 7. Public Sharing & Social Discovery (`/api/shared`)

| Method | Path | Auth Required | Request Body | Description |
| :--- | :--- | :---: | :--- | :--- |
| `GET` | `/discover` | No | None | Fetch public shared itineraries published by travelers. |
| `GET` | `/:token` | No | None | Fetch a complete public trip itinerary by share token. |
| `POST` | `/:token/copy` | **Yes** | None | Clone a public trip and all its stops into user's account. |

### 8. Destinations, Activities & Profile

| Method | Path | Auth Required | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/cities` | No | Fetch destination catalog with optional query parameters. |
| `GET` | `/api/activities` | No | Fetch curated activities, filterable by `city_id`. |
| `GET` | `/api/calendar` | **Yes** | Fetch all scheduled trip activities formatted for calendar views. |
| `GET` | `/api/dashboard/summary`| **Yes** | Aggregate statistics: total trips, upcoming trips, activities, expenses. |
| `GET` | `/api/saved` | **Yes** | Retrieve user's bookmarked destination cities. |
| `POST` | `/api/saved/:cityId` | **Yes** | Bookmark a destination city to saved list. |
| `DELETE`| `/api/saved/:cityId` | **Yes** | Remove destination city from saved list. |
| `GET` | `/api/preferences` | **Yes** | Retrieve user travel preferences (pace, budget, interests). |
| `PUT` | `/api/preferences` | **Yes** | Update user travel preferences. |
| `GET` | `/api/profile` | **Yes** | Retrieve detailed profile data. |
| `PUT` | `/api/profile` | **Yes** | Update profile name, home city, travel styles, and bio. |
| `PUT` | `/api/profile/password`| **Yes** | Change account password (requires old password). |

---

## Authentication and Security

- **Password Hashing:** Passwords are never stored in plaintext. They are encrypted using `bcryptjs` with salt round cost 10 before saving to PostgreSQL.
- **Stateless Tokens:** Authentication issues industry-standard signed JSON Web Tokens (`jsonwebtoken`) containing the user ID payload.
- **Route Guarding:**
  - **Backend:** Express middleware `protect` in `server/middleware/authMiddleware.js` extracts the `Authorization: Bearer <token>` header, decodes the token with `JWT_SECRET`, and attaches `req.user` to subsequent operations.
  - **Frontend:** `ProtectedRoute` wrapper component redirects unauthenticated visitors to `/login` when trying to access internal routes.
- **Sanitized SQL:** All SQL operations use PostgreSQL positional parameters (`$1, $2, ...`) eliminating SQL injection vectors.
- **CORS Restricted Origin:** Express CORS middleware verifies incoming requests against configured `CLIENT_URL`.

---

## Frontend Pages and Routes

| Route | Page Component | Access | Core Functionality |
| :--- | :--- | :---: | :--- |
| `/` | `Landing.jsx` | Public | Hero showcase, key features, destination preview, and registration CTA. |
| `/login` | `Login.jsx` | Public | User sign-in with email and password. |
| `/signup` | `Signup.jsx` | Public | Account registration form. |
| `/shared/:token` | `PublicTrip.jsx` | Public | Read-only shared itinerary view with one-click cloning. |
| `/dashboard` | `Dashboard.jsx` | **Protected** | Overview of upcoming trips, stats counter, quick actions, budget gauge. |
| `/trips` | `MyTrips.jsx` | **Protected** | Grid of all created journeys with status badges and deletion modal. |
| `/trips/create` | `CreateTrip.jsx` | **Protected** | Journey builder for title, dates, descriptions, cover images, budgets. |
| `/trips/:id` | `TripDetails.jsx` | **Protected** | Detailed day-by-day planner, Leaflet map, activity scheduler, Gemini AI. |
| `/plan` | `PlanTrip.jsx` | **Protected** | Step-by-step automated itinerary generator wizard. |
| `/explore` | `Explore.jsx` | **Protected** | Searchable catalog of worldwide destinations, categories, and quick-save. |
| `/explore/country/:code`| `CountryDetail.jsx`| **Protected** | Country metrics, flags, currencies, languages, and regional destinations. |
| `/calendar` | `Calendar.jsx` | **Protected** | Chronological calendar displaying multi-trip schedules and events. |
| `/budget` | `Budget.jsx` | **Protected** | Total trip expense ledger, category breakdown charts, and receipt logger. |
| `/saved` | `Saved.jsx` | **Protected** | Collection of bookmarked destination cities. |
| `/profile` | `Profile.jsx` | **Protected** | User bio, avatar initials, travel style preferences, and password changer. |
| `/settings` | `Settings.jsx` | **Protected** | Appearance theme toggle, language switcher, notification toggles. |

---

## External APIs and Third-Party Services

1. **Google Gemini API (`@google/generative-ai`):**
   - **Purpose:** Powers the AI Travel Copilot. Analyzes trip structure, explains itinerary recommendations, and produces structured adjustments.
   - **Requirement:** `GEMINI_API_KEY` environment variable.
2. **OpenStreetMap Tile Service:**
   - **Purpose:** Provides base map raster tiles (`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`) rendered via Leaflet.
   - **Requirement:** None (free, public attribution provided).
3. **Flags REST API (`https://flags.restcountries.com`):**
   - **Purpose:** Serves vector flag images for country profile displays based on ISO `cca2` country codes.
   - **Requirement:** None (public endpoint).
4. **world-countries (npm package):**
   - **Purpose:** Bundles local offline demographic, currency, and geographical data for 250+ countries.
   - **Requirement:** Local dependency, no external HTTP requests needed.

---

## Available Scripts

Defined in the root `package.json`:

| Command | Working Directory | Purpose |
| :--- | :---: | :--- |
| `npm run dev` | Root | Starts the Vite development server with Hot Module Replacement (`HMR`) at `http://localhost:5173`. |
| `npm run build` | Root | Compiles and minifies frontend React code into the production-ready `dist/` directory. |
| `npm run preview` | Root | Serves the production build locally for pre-deployment verification. |
| `npm run server` | Root | Starts the Express API server with Node.js at `http://localhost:5000`. |
| `npm run lint` | Root | Runs Oxlint across JavaScript and JSX files for high-speed static code quality checks. |

---

## Error Handling and Troubleshooting

### Common Setup Issues & Solutions

- **PostgreSQL Connection Refused (`ECONNREFUSED 127.0.0.1:5432`)**
  - Verify PostgreSQL service is running:
    ```bash
    # Windows PowerShell
    Get-Service postgresql*
    # Linux / macOS
    sudo systemctl status postgresql
    ```
  - Confirm the password, port, and username inside `DATABASE_URL` in your `.env` match your local PostgreSQL configuration.

- **Missing Column or Database Errors on Startup**
  - If database migrations were updated, re-execute the schema:
    ```bash
    psql -U postgres -d globetrotter -f server/db/schema.sql
    node server/db/runSeedPlanner.js
    ```

- **CORS Blocked Requests in Browser Console**
  - Ensure the client URL matches the `CLIENT_URL` configured in your `.env`. If using a non-default Vite port (e.g. `5174`), update `CLIENT_URL=http://localhost:5174` in `.env` and restart the backend.

- **Gemini AI Assistant Returns 500 / "Missing GEMINI_API_KEY"**
  - Verify that `GEMINI_API_KEY` is present in your `.env` file. You can obtain a free key at [Google AI Studio](https://aistudio.google.com/).
  - Ensure there are no surrounding quotes or trailing spaces around the key.

- **Vite Build Failures / Chunk Size Warnings**
  - Run `npm run build` to verify bundles. Large Leaflet or vendor chunks are expected and bundled cleanly into `dist/assets/`.

---

## Deployment Guide

GlobeTrotter is configured for deployment across modern cloud platforms:

### 1. Database (e.g., Render PostgreSQL / Neon / Supabase)
1. Provision a PostgreSQL instance.
2. Connect using `psql` and execute `server/db/schema.sql` to initialize all tables.
3. Run `node server/db/runSeedPlanner.js` pointing to the remote connection string to seed data.
4. Copy the external connection URI (`postgres://...`).

### 2. Backend (Render Web Service)
1. Connect your GitHub repository to Render.
2. Select **Web Service**, runtime: **Node**.
3. Set **Build Command**: `npm install`.
4. Set **Start Command**: `node server/server.js`.
5. Configure Environment Variables in Render Dashboard:
   - `DATABASE_URL`: Your hosted PostgreSQL connection string (append `?sslmode=require` if using cloud providers).
   - `JWT_SECRET`: A secure 32+ character random secret.
   - `CLIENT_URL`: The URL of your deployed frontend (e.g. `https://globetrotter.vercel.app`).
   - `GEMINI_API_KEY`: Your Google Gemini API key.
   - `PORT`: `10000` (or leave default for Render).

### 3. Frontend (Vercel)
1. Import the repository into Vercel.
2. Framework Preset: **Vite**.
3. Build Command: `npm run build`.
4. Output Directory: `dist`.
5. Configure Environment Variables:
   - `VITE_API_URL`: Your deployed backend API URL (e.g. `https://globetrotter-api.onrender.com/api`).
6. For client-side Single Page Application (`SPA`) routing, ensure a `vercel.json` rewrites all paths to `index.html`:
   ```json
   {
     "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
   }
   ```

---

## Testing and Code Quality

- **Automated Unit / Integration Tests:** Automated test suites (`jest` / `vitest` / `supertest`) are currently not configured in the project.
- **Static Code Analysis:** Oxlint is integrated for ultra-fast static linting:
  ```bash
  npm run lint
  ```
- **Production Build Validation:** Verified via Vite's production compiler:
  ```bash
  npm run build
  ```

---

## Known Limitations and Future Roadmap

### Current Known Limitations
- Real-time flight or hotel pricing is simulated/estimated via curated cost indexes rather than live third-party booking APIs (e.g., Amadeus or Skyscanner).
- Push notifications are delivered within the web application interface; browser Web Push notifications and email dispatches are not currently implemented.
- Offline support and PWA service workers are not yet configured.

### Planned Enhancements
- [ ] Integration with live flight and hotel booking engines (Amadeus / Booking.com API).
- [ ] Collaborative multi-user editing with WebSockets for real-time group planning.
- [ ] Automated PDF itinerary export with tickets, maps, and confirmation receipts.
- [ ] Native mobile wrapper using Capacitor or React Native.
- [ ] Comprehensive unit and end-to-end test suite using Vitest and Playwright.

---

## Contributing

Contributions are welcome from open-source developers, travel enthusiasts, and designers!

1. **Fork the Repository:** Click the `Fork` button at the top right of this repository.
2. **Create a Feature Branch:**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit Your Changes:**
   ```bash
   git commit -m "Add amazing feature"
   ```
4. **Push to Your Branch:**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request:** Navigate to the original repository and submit a PR with a description of your changes.

---

## License

This project does not currently have a formal open-source license specified. All rights are reserved by the author. You are welcome to inspect, study, and test the project for portfolio and evaluation purposes.

---

## Author and Acknowledgements

### Author
- **Yajash Khamar**
- GitHub: [@yajashkhamar-python](https://github.com/yajashkhamar-python)
- Email: `yajashkhamar@gmail.com`

### Acknowledgements
- [OpenStreetMap](https://www.openstreetmap.org/) contributors for open map tiles.
- [Unsplash](https://unsplash.com/) for high-resolution destination photography.
- [Google Gemini](https://ai.google.dev/) for AI generative capabilities.
- [Lucide](https://lucide.dev/) for crisp, accessible icons.
- [world-countries](https://github.com/mledoze/countries) for comprehensive demographic datasets.
