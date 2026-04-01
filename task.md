# Collaborative Syllabus Tracker — Task List

## Planning
- [x] Create implementation plan
- [ ] Get user approval

## Project Setup
- [ ] Initialize folder structure (`frontend/`, `backend/`)
- [ ] Initialize backend with `npm init`, install deps
- [ ] Initialize frontend with Vite + React + Tailwind
- [ ] Setup ESLint / Prettier (optional)

## Backend
### Config & Server
- [ ] `backend/server.js` — Express + Socket.IO bootstrap
- [ ] `backend/config/db.js` — Mongoose connection
- [ ] `backend/config/passport.js` — Google OAuth strategy
- [ ] `.env` template

### Models (Mongoose)
- [ ] `User` model
- [ ] `Subject` model (nested syllabus tree)
- [ ] `Progress` model

### Routes & Controllers
- [ ] Auth routes (`/auth/google`, `/auth/logout`, `/auth/me`)
- [ ] Subject routes (CRUD + invite link)
- [ ] Progress routes (toggle, bulk fetch)
- [ ] Group routes (join, members, admin actions)
- [ ] User routes (profile stats)

### Middleware
- [ ] `isAuthenticated` guard
- [ ] `isAdmin` guard
- [ ] Error handler

### Realtime (Socket.IO)
- [ ] Progress toggle broadcast
- [ ] Member join/leave events
- [ ] Topic lock events

## Frontend
### Project Configuration
- [ ] Tailwind config + global styles
- [ ] React Router setup
- [ ] Axios instance + interceptors
- [ ] Socket.IO client hook

### Context / Hooks
- [ ] `AuthContext` (Google OAuth state)
- [ ] `useSocket` hook
- [ ] `useSubject` hook

### Pages
- [ ] `LoginPage` — Google OAuth button
- [ ] `DashboardPage` — tabs: My Subjects, Joined Groups, Create Subject, Explore
- [ ] `SubjectPage` — syllabus tree, progress, members
- [ ] `ProfilePage` — stats, contribution count
- [ ] `ExplorePage` — public subjects list

### Components
- [ ] `Sidebar` + `Navbar`
- [ ] `SubjectCard`
- [ ] `SyllabusTree` (collapsible, recursive)
- [ ] `TopicNode` (checkbox toggle, status badge, notes)
- [ ] `ProgressBar` + `ProgressRing`
- [ ] `MembersPanel`
- [ ] `InviteLinkModal`
- [ ] `DarkModeToggle`
- [ ] `SearchBar`
- [ ] Charts: `OverallProgressBar`, `TopicHeatmap`, `ContributionHeatmap` (Recharts)
- [ ] `ExportPDFButton` (html2pdf.js)

## Verification
- [ ] Backend starts without error
- [ ] Google OAuth flow works (redirect + callback)
- [ ] Subject CRUD works via API
- [ ] Progress toggle broadcasts via Socket.IO
- [ ] PDF export generates correctly
- [ ] Charts render with mock data
- [ ] Dark mode toggle works
- [ ] Responsive design on mobile viewport

## Documentation
- [ ] `README.md` with setup steps
