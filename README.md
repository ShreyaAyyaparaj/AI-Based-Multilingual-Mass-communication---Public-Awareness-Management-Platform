# SAMVAAD
## Multilingual Public Communication Platform

SAMVAAD is an AI-ready multilingual public communication and mass awareness management platform developed as part of the Infosys Springboard Virtual Internship.

The platform provides an administrative interface for managing recipients, audience segments, awareness campaigns and communication templates.

---

## Milestone 1

Milestone 1 establishes the core database, backend API and administrative frontend foundation required for the communication management platform.

### Completed Modules

#### 1. Admin Authentication
- Admin login
- JWT-based authentication
- Protected API routes
- Admin profile management

#### 2. Dashboard
- Campaign statistics
- Recipient statistics
- Audience statistics
- Template statistics
- Quick navigation to major modules

#### 3. Recipient Management
- View recipients
- Add recipients
- Edit recipient information
- Deactivate recipients
- Recipient database populated with 100 records

#### 4. Audience Management
- Karnataka Recipients audience
- 100 audience members
- Audience management interface
- Backend CRUD APIs for audiences

#### 5. Campaign Management
- Dengue Awareness campaign
- Campaign status management
- Campaign-audience association
- Campaign management APIs

#### 6. Communication Templates
18 communication templates have been created across:

- Awareness
- Education
- Emergency
- Reminder
- General

#### 7. SAMVAAD Administrative UI
The frontend has been redesigned as a dedicated administrative platform with:

- SAMVAAD branding
- Blue-based visual identity
- Admin sidebar navigation
- Dashboard
- Recipient management
- Audience Hub
- Campaign management
- Message Library
- Settings
- Admin profile interface
- Campaign Studio workflow
- Communication channel selection
- Language configuration

---

# Technology Stack

## Frontend
- React
- TypeScript
- Vite
- CSS

## Backend
- Node.js
- Express.js
- JWT
- mysql2
- dotenv

## Database
- MySQL
- DBeaver for database management

---

# Project Structure

```text
AI-Powered-Multilingual-Public-Awareness-and-Mass-Communication-Platform-AUG-2026/
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── style.css
│   │   └── ...
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── src/
│   │   ├── server.js
│   │   └── db.js
│   ├── .env
│   ├── package.json
│   └── ...
│
├── database/
│   ├── ...
│   └── ...
│
└── README.md
```

---

# Backend Setup

Open a terminal in the project root and navigate to the backend:

```
cd backend
```

Install dependencies:

```
npm install
```

Create a `.env` file inside the `backend` folder:

```
PORT=5000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=communication_campaign

JWT_SECRET=your_jwt_secret
```

> Do not commit the `.env` file to GitHub.

Start the backend:

```
npm run dev
```

The backend runs on:

```
http://localhost:5000
```

### Test the Backend

```
curl.exe http://localhost:5000/api/health
```

Expected response:

```
{
  "status": "ok"
}
```

---

# Frontend Setup

Open a second terminal and navigate to the frontend:

```
cd frontend
```

Install dependencies:

```
npm install
```

Start the Vite development server:

```
npm run dev
```

Vite will display the local URL, for example:

```
http://localhost:5175/
```

Open the exact URL displayed by Vite in your browser.

> Do not use the VS Code "Go Live" extension. This project uses Vite and React.

---

# Running the Complete Application

Two terminals are required.

### Terminal 1 — Backend

```
cd backend
npm run dev
```

Backend:

```
http://localhost:5000
```

### Terminal 2 — Frontend

```
cd frontend
npm run dev
```

Frontend:

```
http://localhost:5175/
```

The frontend communicates with the backend through the API running on port `5000`.

---

# Admin Login

For local development, use the seeded administrator account:

```
Email: admin@communication.com
Password: Admin@123
```

---

# API Endpoints

## Authentication

```
POST /api/auth/login
```

## Health

```
GET /api/health
```

## Dashboard

```
GET /api/stats
```

## Recipients

```
GET    /api/recipients
POST   /api/recipients
PUT    /api/recipients/:id
DELETE /api/recipients/:id
```

## Audiences

```
GET    /api/audiences
POST   /api/audiences
PUT    /api/audiences/:id
DELETE /api/audiences/:id
```

## Campaigns

```
GET    /api/campaigns
POST   /api/campaigns
PUT    /api/campaigns/:id
DELETE /api/campaigns/:id
```

### Campaign-Audience Association

```
PUT /api/campaigns/:id/audience
```

## Communication Templates

```
GET    /api/templates
POST   /api/templates
PUT    /api/templates/:id
DELETE /api/templates/:id
```

---

# Current Development Status

## Completed

- MySQL database setup
- Database schema
- Initial seed data
- 100 recipients
- Karnataka Recipients audience
- 100 audience members
- Dengue Awareness campaign
- Campaign-audience association
- 18 communication templates
- Node.js/Express backend
- MySQL backend integration
- JWT authentication
- Recipient APIs
- Audience APIs
- Campaign APIs
- Template APIs
- React/TypeScript frontend
- SAMVAAD administrative interface
- Dashboard
- Recipient management UI
- Audience Hub UI
- Campaign management UI
- Message Library UI
- Settings/Profile UI
- Campaign Studio UI
