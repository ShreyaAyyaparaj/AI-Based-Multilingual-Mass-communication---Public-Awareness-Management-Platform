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
# SAMVAAD

## Intelligent Multilingual Public Communication Platform

SAMVAAD is an AI-powered multilingual public communication platform designed to help administrators create, personalize, translate, validate, and manage public-awareness campaigns for diverse audiences.

The platform is designed for communication scenarios such as:

- Public awareness campaigns
- Emergency alerts
- Educational notifications
- Organizational announcements
- Community information campaigns

SAMVAAD focuses on reducing language barriers, simplifying campaign creation, and improving the quality and consistency of public communication.

---

## Project Objective

Organizations often need to communicate important information to large and linguistically diverse audiences.

Traditional communication workflows can involve:

- Manual content creation
- Repeated translation work
- Limited audience personalization
- Inconsistent messaging across communication channels
- Lack of automated content-quality validation

SAMVAAD addresses these challenges by combining:

**Audience Management + AI Content Generation + Multilingual Communication + Personalization + NLP-based Quality Validation**

The current implementation focuses on the first two stages of the platform and the AI quality-validation layer.

---

# Current Implementation

## 1. Admin Management

The platform provides an admin-only dashboard with:

- Secure administrator login
- JWT-based authentication
- Admin profile management
- Dashboard statistics
- Protected API endpoints

---

## 2. Recipient Management

Administrators can manage communication recipients using information such as:

- Name
- Phone number
- Email
- Age
- Gender
- State
- District
- City
- Preferred language
- Occupation
- Active / inactive status

Recipient language and geographic information are used by the AI communication engine for audience-aware content generation.

---

## 3. Audience Management

SAMVAAD supports audience groups that can be associated with campaigns.

Examples include:

- Tamil Nadu Residents
- Chennai Residents
- Kanchipuram Residents
- Thanjavur Residents
- Tiruchirappalli Residents
- Coimbatore Residents
- Madurai Residents
- Salem Residents
- Tirunelveli Residents
- Vellore Residents
- Erode Residents
- Kerala Residents
- Karnataka Residents

Audience membership is stored separately from recipient records, allowing campaigns to target selected recipient groups.

---

# 4. Campaign Management

Administrators can create and manage campaigns with:

- Campaign name
- Communication scenario
- Target audience
- Location
- Tone
- Languages
- Communication channels
- Campaign status

A campaign can be saved and associated with an audience before AI content generation.

Example:

> Dengue cases are increasing during the monsoon. Residents should remove stagnant water around their homes and take precautions against mosquito bites.

SAMVAAD converts this scenario into a structured communication brief for the AI engine.

---

# 5. Gemini AI Communication Engine

SAMVAAD uses **Google Gemini 2.5 Flash** for AI-assisted public communication generation.

The administrator provides:

- Campaign
- Scenario
- Audience
- Location
- Tone
- Languages
- Communication channels
- Audience preference information

The AI engine generates:

- Master communication content
- Localized language versions
- Channel-specific communication versions
- Audience personalization score
- Sentiment / tone optimization score
- AI quality notes

The system is designed to produce review-ready communication rather than automatically distribute content without administrator review.

### Example channels

- SMS
- WhatsApp

Additional communication channels can be integrated in later modules.

---

# 6. Multilingual Communication

SAMVAAD supports multilingual public communication using recipient language information and administrator-selected languages.

The AI engine can prepare localized versions for languages such as:

- English
- Tamil
- Kannada
- Hindi
- Malayalam
- Telugu

When preferred-language mode is enabled, the system can inspect the selected audience and determine the language distribution of active recipients.

For example:

```text
English   → 40 recipients
Tamil     → 35 recipients
Kannada   → 15 recipients
Hindi     → 10 recipients

This allows the generated communication to reflect the actual language requirements of the target audience.

Localized content is presented for administrator review before approval.

7. Audience Personalization

SAMVAAD evaluates how well the generated communication matches the target audience.

The personalization evaluation considers:

Target audience
Geographic location
Campaign scenario
Recipient language distribution
Communication objective

The system returns an audience personalization score out of 100.

Example:

Audience Personalization
91 / 100

The score is intended as an AI-generated review indicator and not as a claim of perfect personalization.

8. Sentiment & Tone Optimization

SAMVAAD evaluates whether the generated communication is appropriate for the selected tone and public-awareness context.

Supported tone examples include:

Informative
Friendly
Urgent
Encouraging
Professional

The AI engine returns a tone optimization score.

Example:

Sentiment & Tone Optimization
94 / 100

The administrator can review the result before proceeding to quality validation.

9. AI Quality & Compliance Check

Generated communication is subjected to a dedicated quality and compliance evaluation.

The current quality framework evaluates:

Grammar
Clarity
Tone appropriateness
Factual accuracy
Sensitive content
Compliance

Each dimension receives a score from 0–100.

The platform calculates an overall quality score:

Overall Quality Score
91 / 100

The quality-check response also provides:

Evaluation summary
Individual quality notes
Review flags
Language-specific analysis
NLP analysis information
Overall review status

The quality-check layer is intended to identify content that should be reviewed or revised before approval.

10. NLP Integration

SAMVAAD includes a Python-based NLP quality-analysis service.

The current NLP layer uses:

spaCy
Indic NLP Library

The NLP service can analyze generated content and provide structural language information such as:

Sentence count
Token count
Language-specific analysis
NLP flags

This NLP information is combined with the semantic evaluation performed by Gemini.

The resulting architecture is:

Administrator
      ↓
Campaign Scenario
      ↓
Gemini AI
      ↓
Generated Multilingual Content
      ↓
Audience Personalization
      ↓
Tone Optimization
      ↓
spaCy + Indic NLP
      ↓
AI Quality & Compliance Review
      ↓
Administrator Approval
11. API Documentation

SAMVAAD exposes API documentation through Swagger UI.

After starting the backend:

http://localhost:5000/api-docs

The Swagger interface documents:

Authentication
POST /api/auth/login
Campaign APIs
GET    /api/campaigns
POST   /api/campaigns
PUT    /api/campaigns/{id}
DELETE /api/campaigns/{id}
PUT    /api/campaigns/{id}/audience
AI Campaign Configuration
GET /api/campaigns/{id}/ai-config
PUT /api/campaigns/{id}/ai-config
AI Communication
POST /api/ai/generate-content
POST /api/ai/translate-content
AI Quality & Compliance
POST /api/ai/quality-check
Audience APIs
GET  /api/audiences
POST /api/audiences
GET  /api/audiences/{id}/recipients
POST /api/admin/seed-regional-audiences

The API uses JWT Bearer authentication for protected endpoints.

Technology Stack
Frontend
React
TypeScript
Vite
CSS
Backend
Node.js
Express.js
JWT
MySQL
Swagger UI
Artificial Intelligence
Google Gemini API
Gemini 2.5 Flash
NLP
Python
spaCy
Indic NLP Library
Database
MySQL
Development Tools
Git
GitHub
VS Code
Swagger UI
System Architecture
                    ┌─────────────────────┐
                    │     Admin User      │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   React Frontend    │
                    │   TypeScript/Vite   │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Node.js / Express   │
                    │      Backend        │
                    └───────┬─────┬───────┘
                            │     │
                ┌───────────┘     └────────────┐
                ▼                              ▼
        ┌───────────────┐              ┌────────────────┐
        │     MySQL     │              │ Gemini 2.5     │
        │   Database    │              │     Flash      │
        └───────────────┘              └───────┬────────┘
                                               │
                                               ▼
                                      ┌──────────────────┐
                                      │ Multilingual     │
                                      │ Content          │
                                      └────────┬─────────┘
                                               │
                                               ▼
                                      ┌──────────────────┐
                                      │ spaCy + Indic    │
                                      │ NLP Analysis     │
                                      └────────┬─────────┘
                                               │
                                               ▼
                                      ┌──────────────────┐
                                      │ AI Quality &     │
                                      │ Compliance Check │
                                      └──────────────────┘
Project Structure
AI-Powered-Multilingual-Public-Awareness-and-Mass-Communication-Platform-AUG-2026
│
├── backend
│   ├── nlp_service
│   │   └── quality_check.py
│   │
│   ├── src
│   │   ├── db.js
│   │   ├── server.js
│   │   ├── swagger.js
│   │   └── ...
│   │
│   ├── .env
│   ├── package.json
│   └── ...
│
├── frontend
│   ├── src
│   │   ├── main.tsx
│   │   ├── style.css
│   │   ├── milestone2-preview.css
│   │   └── ...
│   │
│   ├── index.html
│   ├── package.json
│   └── ...
│
└── README.md
Environment Configuration

Create a .env file inside the backend directory.

Example:

PORT=5000

JWT_SECRET=your_jwt_secret

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=communication_campaign

GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
Security

Never commit .env to GitHub.

The .gitignore configuration excludes environment files.

Installation
Backend

Navigate to the backend:

cd backend

Install dependencies:

npm install

Start the backend:

npm run dev

The backend runs on:

http://localhost:5000

Health check:

http://localhost:5000/api/health

Swagger:

http://localhost:5000/api-docs
NLP Setup

Install the Python NLP dependencies:

py -m pip install spacy indic-nlp-library

The backend invokes the NLP quality-check service when evaluating generated content.

Frontend

Navigate to the frontend:

cd frontend

Install dependencies:

npm install

Start the development server:

npm run dev

The frontend is available through the Vite development server, typically:

http://localhost:5173
AI Content Generation Flow

The current campaign workflow is:

Campaigns
    ↓
Create Campaign
    ↓
Campaign Scenario
    ↓
Select Audience
    ↓
Select Location
    ↓
Select Tone
    ↓
Select Languages
    ↓
Select Channels
    ↓
Generate Communication
    ↓
Gemini 2.5 Flash
    ↓
Generated Content
    ↓
Localized Versions
    ↓
Audience Personalization
    ↓
Sentiment & Tone Optimization
    ↓
AI Quality & Compliance Check

The administrator remains responsible for reviewing generated communication before approval.

Example Campaign
Campaign
Dengue Prevention Awareness
Scenario
Dengue cases are increasing during the monsoon.
Residents should remove stagnant water around their
homes and take precautions against mosquito bites.
Audience
Chennai Residents
Languages
English
Tamil
Channels
SMS
WhatsApp
AI Output
Master Content
Localized Content
Channel Versions
Audience Personalization Score
Tone Optimization Score
Quality Notes
Quality Validation
Grammar
Clarity
Tone Appropriateness
Factual Accuracy
Sensitive Content
Compliance
-------------------------
Overall Score / 100
Current Scope

The current implementation focuses on:

Admin authentication
Recipient management
Audience management
Campaign management
Campaign-audience association
Communication templates
Gemini AI content generation
Multilingual content generation
Audience personalization scoring
Tone optimization scoring
NLP-based content analysis
AI quality and compliance evaluation
Swagger API documentation
Future Scope

The following capabilities are planned for later stages:

Dynamic audience segmentation
CSV / Excel recipient import
Advanced audience rules
Campaign scheduling
Email delivery
SMS delivery
WhatsApp Business API integration
Push notifications
Multi-channel distribution
Delivery tracking
Retry mechanisms
Engagement analytics
Click and response tracking
Sentiment analysis of audience feedback
Campaign performance dashboards
Audit logging
Additional AI personalization models
Development Notes

SAMVAAD is being developed as part of an 8-week Infosys Virtual Internship project.

The platform is being built incrementally, with the AI communication engine integrated after the initial audience and campaign-management foundation.

The system is designed so that AI-generated communication is reviewed and validated before later distribution modules are introduced.