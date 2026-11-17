# ⚡ Command Snippet Manager

**Author:** Maksymilian Sienkiewicz
**Role:** Full-Stack / Front-end Developer

A modern, fast, and containerized Full-Stack web application designed to store, organize, and quickly retrieve your daily developer terminal commands and code snippets. Built with a dark-mode focused UI, instant copy-to-clipboard functionality, category color-coding, pattern search, and server-side pagination.

---

## 🛠️ Tech Stack

### Backend
* **Runtime:** Node.js (v18+)
* **Language:** TypeScript 5+ (Full **ESM / `nodenext`** mode)
* **Framework:** Express.js
* **Database:** PostgreSQL 15+ (PostgreSQL Client `pg` pool)
* **Testing:** Jest + Supertest (Integration tests with mocked database layer)

### Frontend
* **Framework:** React 18+
* **Build Tool:** Vite
* **Language:** TypeScript
* **Styling:** CSS3 (Modern dark-theme with responsive grid & glowing category tags)

### Infrastructure & Deployment
* **Containerization:** Docker & Docker Compose
* **Web Server / Reverse Proxy:** Nginx (alpine)
* **Process Manager (Non-Docker):** PM2

---

## 🚀 Quick Start

### Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher)
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) or Docker Engine + Compose plugin installed.

---

### Option A: Complete Containerized Environment (Production Preview)

Run the entire application stack (Database + Express API + React served via Nginx) using a single command:

1. Clone the repository and create the root environment file:
   ```bash
   git clone https://github.com/YourUsername/snippet-manager.git
   cd snippet-manager
   ```

2. Create a `.env` file in the project root folder:
   ```env
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=Your_Password_Here
   POSTGRES_DB=snippets_db

   BACKEND_PORT=5001
   FRONTEND_PORT=80
   ```

3. Build and launch all containers in detached mode:
   ```bash
   docker compose up -d --build
   ```

4. Open your browser and navigate to:
   * **Web App:** `http://localhost` (or `http://localhost:80` / `http://localhost:81` depending on `FRONTEND_PORT`)
   * **Direct Database Port:** `localhost:5000` (mapped for external DB managers like WebStorm or DBeaver).

---

### Option B: Local Development Mode (Hot-Reloading)

If you are actively tweaking code and want immediate Hot-Module Reloading (HMR) without rebuilding Docker images on every edit:

1. **Start only the PostgreSQL Database container:**
   ```bash
   docker compose up db -d
   ```

2. **Configure & Start the Backend:**
   Create `backend/.env`:
   ```env
   PORT=5001
   DB_HOST=localhost
   DB_PORT=5000
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=Your_Password_Here
   POSTGRES_DB=snippets_db
   ```
   Run the backend development server:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

3. **Start the Frontend:**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```
   Access the frontend dev server at `http://localhost:5173`.

---

## 🧪 Automated Testing

The backend business logic and API validation layers can be tested without a running database or Docker daemon:

```bash
cd backend
npm install
npm test
```
> **Note:** Tests are configured using native ECMAScript Modules (`--experimental-vm-modules`).

---

## 🗄️ Database Schema & Auto-Initialization

The backend features an automated schema initialization function (`CREATE TABLE IF NOT EXISTS`) that fires upon server boot. Alternatively, you can run the SQL schema manually:

```sql
CREATE TABLE IF NOT EXISTS snippets (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    command TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Performance indexes for category filtering and pattern search
CREATE INDEX IF NOT EXISTS idx_snippets_category ON snippets(category);
CREATE INDEX IF NOT EXISTS idx_snippets_title ON snippets(title);
```

### Sample Seeding (Stress-Test Dataset)
To populate 1,000 dummy snippets for testing server-side pagination performance:

```sql
INSERT INTO snippets (title, command, category, description)
SELECT
    'CLI Command #' || i AS title,
    'docker exec -it container_' || i || ' sh' AS command,
    (ARRAY['Git', 'Docker', 'Linux', 'SQL', 'Server'])[floor(random() * 5 + 1)] AS category,
    'Generated test snippet number ' || i AS description
FROM generate_series(1, 1000) s(i);
```

---

## 🖥️ Bare-Metal / Non-Docker Server Deployment

If you are hosting on a lightweight VPS or Home Server without Docker:

1. **Database:** Install `postgresql`, create the database `snippets_db`, user `postgres`, and grant schema privileges.
2. **Backend:** Compile TypeScript (`npm run build`) and launch with PM2:
   ```bash
   cd backend
   npm install && npm run build
   pm2 start dist/index.js --name "snippet-backend"
   pm2 save
   ```
3. **Frontend:** Build production static assets:
   ```bash
   cd frontend
   npm install && npm run build
   ```
4. **Nginx:** Serve `frontend/dist` on port 80 and proxy `/api/` requests to `http://localhost:5001/api/`.

---

## 🛡️ Features & Security

* **Relative API Routing:** Frontend issues requests to `/api/snippets`, eliminating CORS issues when proxied through Nginx.
* **SQL Injection Prevention:** All database operations utilize parameterized queries (`$1, $2`).
* **Environment Separation:** Sensitive credentials are fully extracted to `.env` configurations.