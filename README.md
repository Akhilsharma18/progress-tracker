# SyllabiQ — Collaborative Syllabus Tracker

A full-stack platform for students to track syllabus progress, collaborate in groups, visualize completion, and export PDF reports — all in real-time.

## Tech Stack
- **Frontend:** React + Tailwind CSS + React Router v6 + Recharts + html2pdf.js
- **Backend:** Node.js + Express + Socket.IO
- **Database:** MongoDB + Mongoose
- **Auth:** Passport.js (Google OAuth 2.0)

---

## Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Google Cloud Console project with OAuth 2.0 credentials

---

## Quick Setup

### 1. Clone / open the project
```bash
cd "progress tracker"
```

### 2. Configure Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials
2. Create OAuth 2.0 Client ID (Web application)
3. Add Authorized redirect URI: `http://localhost:5000/auth/google/callback`
4. Copy Client ID and Client Secret

### 3. Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env with your values
npm install
npm run dev
```

Your `.env` should look like:
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.xxxxx.mongodb.net/syllabus-tracker
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SESSION_SECRET=change_this_to_a_random_string
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 5. Open the app
Navigate to `http://localhost:5173` in your browser.

---

## Features

| Feature | Description |
|---------|-------------|
| 🔐 Google OAuth | Sign in with Google |
| 📚 Subject CRUD | Create subjects with tags |
| 🌲 Nested Syllabus | Topics → Subtopics → Sub-subtopics |
| ✅ Progress Tracking | Per-user checkbox with status |
| ⚡ Real-time Sync | Socket.IO broadcasts updates instantly |
| 👥 Group Collaboration | Invite via unique 8-character code |
| 🔒 Topic Lock | Admins can lock topics |
| 📊 Charts | Donut chart, heatmap, contribution chart |
| 📄 PDF Export | Download styled progress report |
| 🌙 Dark Mode | Persists across sessions |
| 🔍 Search & Sort | Filter subjects by name |
| 🌐 Public Subjects | Explore and copy community subjects |

---

## Project Structure
```
progress tracker/
├── backend/
│   ├── config/         # DB + Passport config
│   ├── controllers/    # Business logic
│   ├── middleware/      # Auth + Admin guards
│   ├── models/         # Mongoose schemas
│   ├── routes/         # Express routers
│   ├── server.js       # Entry point
│   └── .env.example
└── frontend/
    └── src/
        ├── components/ # Reusable UI components
        │   └── charts/ # Recharts visualizations
        ├── context/    # AuthContext
        ├── hooks/      # useSocket, useSubject
        ├── pages/      # Full page components
        └── utils/      # Axios instance
```

---

## API Reference

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/auth/google` | Start Google OAuth |
| GET | `/auth/me` | Current user |
| GET | `/api/subjects` | My subjects |
| GET | `/api/subjects/public` | Public subjects |
| POST | `/api/subjects` | Create subject |
| PUT | `/api/subjects/:id` | Update subject |
| DELETE | `/api/subjects/:id` | Delete subject |
| POST | `/api/subjects/:id/topics` | Add topic |
| PATCH | `/api/subjects/:id/topics/:tid/lock` | Lock/unlock topic |
| POST | `/api/groups/join` | Join via invite code |
| DELETE | `/api/groups/:id/members/:uid` | Remove member |
| GET | `/api/progress/:subjectId` | Get all progress |
| POST | `/api/progress` | Update progress |
| GET | `/api/users/me` | Profile + stats |
| PUT | `/api/users/me` | Update profile |

---

## Deployment

### Backend (Render)
1. Connect GitHub repo
2. Set **Build Command:** `npm install`
3. Set **Start Command:** `npm start`
4. Add all `.env` variables

### Frontend (Vercel)
1. Connect GitHub repo (set root to `frontend/`)
2. Build Command: `npm run build`
3. Update `VITE_API_URL` and backend CORS `CLIENT_URL`

---

Built with ❤️ for students · SyllabiQ 2024
