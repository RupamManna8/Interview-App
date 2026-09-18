# AI Interview & Proctoring Platform (Full-Stack)

A production-grade, AI-driven technical interview and proctoring application. The platform provides automated, real-time interview simulations across **Technical**, **Coding**, and **Behavioral** rounds with intelligent question generation, automated response evaluation, anti-cheat proctoring, resume parsing, and actionable analytics.

---

## 📑 Table of Contents
1. [Platform Overview](#platform-overview)
2. [Key Features](#key-features)
3. [Architecture & Tech Stack](#architecture--tech-stack)
4. [Supported Roles & Interview Types](#supported-roles--interview-types)
5. [Getting Started & Local Setup](#getting-started--local-setup)
   - [Prerequisites](#prerequisites)
   - [Backend Setup](#1-backend-setup)
   - [Frontend Setup](#2-frontend-setup)
6. [Environment Variables](#environment-variables)
7. [API Endpoints Reference](#api-endpoints-reference)
8. [Project Directory Structure](#project-directory-structure)
9. [Proctoring & Anti-Cheat Capabilities](#proctoring--anti-cheat-capabilities)
10. [Recent Updates & Enhancements](#recent-updates--enhancements)

---

## 🚀 Platform Overview

Hiring engineers requires considerable engineering bandwidth and often produces subjective evaluations. **Interview App** provides an automated, standardized, and secure interview platform that:
- Conducts realistic, multi-stage interviews customized to specific engineering domains.
- Evaluates code execution and technical explanations in real time.
- Assesses candidate behavior and confidence with detailed voice and answer metrics.
- Monitors visual, audio, and browser integrity with automated proctoring.
- Generates comprehensive performance dashboards highlighting candidate strengths, weaknesses, and readiness benchmarks.

---

## ✨ Key Features

- 🎯 **Domain-Focused Tech Roles**: Tailored specifically for **Frontend Developer**, **Backend Developer**, **Full Stack Developer**, and **SDE**.
- 📄 **Smart Resume Analysis**: Upload resumes to automatically parse qualifications and extract eligible roles using AI and OCR.
- 💻 **Live Coding IDE**: In-browser code editor with multi-language support (JavaScript, Python, Java, C++) and real-time execution via OneCompiler API.
- 🎙️ **Behavioral Canvas & Speech Analysis**: Voice-interactive behavioral rounds with TTS/STT and communication assessment.
- 🛡️ **Autonomous Proctoring**:
  - Multi-face and missing-face detection.
  - Tab switching and browser-focus enforcement.
  - Fullscreen lock with violation counters.
  - Audio and ambient noise tracking.
- 📊 **Decision-Focused Analytics Dashboard**:
  - Overall readiness score and performance benchmarks.
  - Radar breakdown across core competencies.
  - Strengths, Weaknesses, and Improvements (SWI) for Technical and Behavioral sections.
  - Downloadable JSON analytics reports.
- 🔐 **Secure Authentication**: Google OAuth 2.0 integration alongside JWT session management and HTTP-only cookies.

---

## 🏗️ Architecture & Tech Stack

```mermaid
graph TD
    Client["React 18 + Vite Frontend (Port 5173)"]
    Backend["Express 5 / Node.js Backend (Port 5000)"]
    DB[(MongoDB Atlas / Local)]
    AI1["Google Gemini AI"]
    AI2["Cohere AI"]
    Compiler["OneCompiler Code Engine"]

    Client <-->|REST API + CORS Credentials| Backend
    Client <-->|Webcam / Face Mesh (TensorFlow.js)| Client
    Backend <-->|Mongoose Schemas| DB
    Backend <-->|Question Gen & Evaluation| AI1
    Backend <-->|Resume Parsing & Embeddings| AI2
    Client <-->|Code Compilation| Compiler
```

### Frontend (`/Interview`)
- **Core**: React 18, Vite, React Router v7
- **Styling & UI**: Tailwind CSS, Framer Motion, Lucide React
- **Code Editor**: Monaco Editor, CodeMirror 6 (`@uiw/react-codemirror`)
- **Proctoring**: TensorFlow.js (`@tensorflow/tfjs`, `@tensorflow-models/face-detection`)
- **Data Visualization**: Recharts
- **Auth**: `@react-oauth/google`

### Backend (`/backend`)
- **Core**: Node.js (ES Modules), Express.js 5
- **Database**: MongoDB with Mongoose (ODM)
- **AI Engines**: Google Generative AI (`@google/generative-ai`), Cohere AI (`cohere-ai`), OpenAI
- **File & OCR Processing**: Multer, `pdf-parse-fork`, `tesseract.js`
- **Security**: JWT (`jsonwebtoken`), `bcryptjs`, `cookie-parser`, `cors`

---

## 🎯 Supported Roles & Interview Types

### 1. Supported Roles
The platform focuses exclusively on core engineering tracks:
- **Frontend Developer**
- **Backend Developer**
- **Full Stack Developer**
- **SDE (Software Development Engineer)**

### 2. Interview Tracks
| Track | Description | Interface Canvas |
|---|---|---|
| **Technical** | CS fundamentals, architecture, system design concepts, and domain-specific Q&A | `TechnicalCanvas.jsx` |
| **Coding** | Live algorithm and problem-solving challenges with syntax highlighting and instant compilation | `CodingCanvas.jsx` |
| **Behavioral** | Leadership, situational judgment, and communication evaluation with speech support | `BehaviorallCanvas.jsx` |

---

## ⚙️ Getting Started & Local Setup

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- **MongoDB**: Local instance running on `mongodb://localhost:27017` or MongoDB Atlas URI

---

### 1. Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in `backend/`:
   ```env
   PORT=5000
   CLIENT_URL=http://localhost:5173
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/Interview
   JWT_SECRET=your_jwt_secret_key
   GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
   GEMINI_API_KEY=your_google_gemini_api_key
   COHERE_KEY=your_cohere_api_key
   SAMBANOVA_API_KEY=your_sambanova_api_key
   ONECOMPILER_API_KEY=your_onecompiler_api_key
   ```

4. **Start the backend development server**:
   ```bash
   npm start
   ```
   *The server runs on `http://localhost:5000` with nodemon auto-reloading.*

---

### 2. Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd Interview
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in `Interview/`:
   ```env
   VITE_SERVER_URL=http://localhost:5000
   VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
   VITE_CAMB_API_KEY=your_camb_voice_api_key
   VITE_ONECOMPILER_API_KEY=your_onecompiler_api_key
   ```

4. **Start the frontend Vite server**:
   ```bash
   npm run dev
   ```
   *The frontend will be accessible at `http://localhost:5173`.*

5. **Build for production**:
   ```bash
   npm run build
   ```

---

## 🔐 Environment Variables

### Backend (`/backend/.env`)
| Variable | Description |
|---|---|
| `PORT` | Port number for Express server (default: `5000`) |
| `CLIENT_URL` | Allowed client origin for CORS (`http://localhost:5173`) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for signing authentication tokens |
| `GOOGLE_CLIENT_ID` | OAuth 2.0 client ID for Google authentication |
| `GEMINI_API_KEY` | API key for Google Gemini model |
| `COHERE_KEY` | API key for Cohere LLM & resume analysis |
| `ONECOMPILER_API_KEY` | Code execution API key |

### Frontend (`/Interview/.env`)
| Variable | Description |
|---|---|
| `VITE_SERVER_URL` | Base URL of the backend API (`http://localhost:5000`) |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID matching the backend |
| `VITE_ONECOMPILER_API_KEY` | API key for in-browser code compilation |
| `VITE_CAMB_API_KEY` | AI voice integration API key |

---

## 📡 API Endpoints Reference

### Authentication (`/auth`)
- `POST /auth/signup` — Register a new user account.
- `POST /auth/login` — Log in with email and password.
- `POST /auth/google` — Google OAuth token verification and login.
- `GET /auth/current-user` — Retrieve currently logged-in user profile.
- `POST /auth/logout` — Invalidate user session and clear cookies.

### Interview Service (`/service`)
- `POST /service/initiate-interview` — Initialize an interview session and generate questions.
- `GET /service/interview/:interviewId` — Fetch session questions and state.
- `POST /service/evaluate-answer` — Evaluate an individual answer in real time.
- `POST /service/submit-interview` — Complete session, compute scores, and trigger analytics generation.

### Resume Manager (`/service/resume`)
- `POST /service/resume/upload` — Upload PDF resume for parsing and role extraction.
- `GET /service/resume` — List user's uploaded and analyzed resumes.
- `DELETE /service/resume/:resumeId` — Remove a stored resume.

### Analytics & Proctoring (`/api`)
- `GET /api/analytics` — Fetch aggregated candidate performance analytics and breakdown.
- `POST /api/proctoring/event` — Log proctoring anomaly (tab switch, face anomaly, audio spike).

---

## 📁 Project Directory Structure

```text
InterviewApp/
├── backend/                              # Express & Node.js Server
│   ├── Config/                           # DB, Gemini, Cohere & Resume configs
│   ├── Controllers/                      # Auth, Interview, Analytics, Proctoring, Resume controllers
│   ├── Middlewares/                      # JWT auth & Multer file upload handlers
│   ├── Models/                           # Mongoose models (User, Interview, Resume, Analytics, etc.)
│   ├── Routes/                           # REST route definitions
│   ├── .env                              # Backend configuration
│   ├── package.json                      # Backend dependencies & scripts
│   └── server.js                         # Server entry point
│
├── Interview/                            # React + Vite Frontend
│   ├── src/
│   │   ├── Components/
│   │   │   ├── InterViewComponents/      # TechnicalCanvas, CodingCanvas, BehaviorallCanvas
│   │   │   ├── Layout/                   # Navbar, Footer, Sidebar
│   │   │   └── ui/                       # Reusable UI primitives (Buttons, Cards, Dialogs)
│   │   ├── Context/                      # UserContext & global authentication state
│   │   ├── features/proctoring/          # EnvironmentCheckModal & ProctoringManager
│   │   ├── Pages/
│   │   │   ├── Analytics/                # AnalyticsDashboard page
│   │   │   ├── Auth/                     # LoginSignup & ForgotPassword
│   │   │   ├── Dashboard/                # Candidate overview dashboard
│   │   │   ├── Interview/                # InterviewSetup wizard & InterviewPage container
│   │   │   ├── ResumeManager/            # Resume upload & parsing UI
│   │   │   └── Session-History/          # Past interview review
│   │   ├── Routes/                       # Route paths & param guards
│   │   ├── App.jsx                       # Master app router
│   │   ├── main.jsx                      # React root with GoogleOAuthProvider
│   │   └── index.css                     # Global Tailwind & design tokens
│   ├── .env                              # Frontend configuration
│   ├── package.json                      # Frontend dependencies & scripts
│   └── vite.config.js                    # Vite bundler config
│
├── context.md                            # Comprehensive architectural index
└── README.md                             # Global project documentation
```

---

## 🛡️ Proctoring & Anti-Cheat Capabilities

1. **Environment Verification**: Before launching into an interview, the candidate completes an environment check verifying camera access, microphone levels, and browser fullscreen readiness.
2. **On-Device Vision Monitoring**: TensorFlow.js face landmark detection checks that exactly one face is positioned in the camera frame without sending raw video streams off-device.
3. **Focus & Fullscreen Enforcement**: Monitors `visibilitychange` and `fullscreenchange` events, registering warnings and triggering disqualification thresholds if violated repeatedly.
4. **Detailed Audit Trail**: Violations and timestamps are stored and compiled into an Integrity Score visible in session reports.

---

## 🔄 Recent Updates & Enhancements

- **Strict Tech Scope**: Restricted to 4 core engineering roles: *Frontend Developer*, *Backend Developer*, *Full Stack Developer*, and *SDE*.
- **Resume Role Matching**: Added smart role extraction with fallback handling (*"Unable to take interview for this resume and role"*).
- **Deferred Permissions**: Media devices (camera/mic) are no longer requested prematurely on page load; permissions trigger strictly upon interview launch in the environment verification modal.
- **Enhanced Analytics**: Realigned non-technical evaluation metrics to dedicated Behavioral analysis sections.
- **OAuth & Auth Hardening**: Resolved token verification and environment configuration alignments across client and server.
