# AKM LMS — Backend API

Production-ready REST API for the AKM Learning Management System.
Node.js + Express + TypeScript + MongoDB (Mongoose) + JWT Auth.

## Features

- JWT auth (access + refresh tokens), bcrypt password hashing
- Role-based authorization (`admin`, `student`)
- **Two-device login restriction** for students, backed by a `Session` model
  (device ID, browser, OS, IP, login time, last activity). Admins can view,
  remove, or bulk-logout any student's sessions.
- Forgot/reset/change password flows (Nodemailer)
- Course → Section → Lesson → Video hierarchy, unlimited videos per lesson
- YouTube URL → embed URL conversion (only the original URL is stored)
- Preview / Locked video access control
- Admin-only enrollment (single, bulk, transfer, revoke)
- Progress tracking (videos/lessons/sections completed, resume position, bookmarks, % complete)
- Homepage CMS (hero, about, contact, footer, social links) + Team, Testimonials, FAQ, Settings
- Global search across courses/students/lessons/videos
- Security: Helmet, rate limiting, mongo-sanitize, express-validator, CORS

## Getting started

```bash
cp .env.example .env     # fill in MONGO_URI and JWT secrets at minimum
npm install
npm run seed              # creates the first admin user + default CMS content
npm run dev                # starts on http://localhost:5000
```

Default seeded admin login (override in `.env`):

```
email:    admin@akmlms.com
password: Admin@12345
```

## Scripts

| Command        | Description                                  |
|-----------------|-----------------------------------------------|
| `npm run dev`   | Start with nodemon + ts-node (hot reload)     |
| `npm run build` | Compile TypeScript to `dist/`                  |
| `npm start`     | Run the compiled server (`dist/server.js`)     |
| `npm run seed`  | Seed admin user + default homepage/team/FAQ    |

## Folder structure

```
src/
  config/        # env, db connection
  models/        # 14 Mongoose schemas (users, courses, sections, lessons,
                  # videos, enrollments, progress, sessions, homepage, team,
                  # testimonials, faq, settings, notifications)
  controllers/    # business logic per module
  routes/         # Express routers, wired in app.ts
  middlewares/    # auth, role guard, error handler, rate limiter, device parser
  utils/          # jwt, apiResponse/ApiError, youtube parser, email
  seed/           # seed.ts
  app.ts          # Express app + middleware wiring
  server.ts       # entry point
```

## Device login restriction — how it works

1. On login, the client sends an `X-Device-Id` header (a UUID it generates
   once and stores locally). If omitted, the server generates one, meaning
   the same browser without a stored ID will look like a new device.
2. A `Session` document is created/updated per `(user, deviceId)` pair.
3. Before creating a **new** session, the server counts the student's active
   sessions. If it's already at `MAX_DEVICES_PER_STUDENT` (default 2), the
   login is rejected with **"Maximum login limit reached."**
4. Every protected request refreshes `lastActivity` on that session, and the
   `protect` middleware rejects requests whose session was deactivated
   (e.g. by an admin removing that device).
5. Admins can list all sessions (`GET /api/sessions`), inspect a specific
   student's devices (`GET /api/sessions/user/:userId`), remove a single
   session, or force-logout every device for a student.

## Environment variables

See `.env.example` for the full list (Mongo URI, JWT secrets/expiry,
`MAX_DEVICES_PER_STUDENT`, SMTP credentials, rate limits, seeded admin
credentials).

## Deployment notes

- Set `NODE_ENV=production` and use strong, unique values for
  `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`.
- Point `MONGO_URI` at your MongoDB Atlas cluster (database name `akm_lms`).
- Set `CLIENT_URL` to your deployed frontend origin (used for CORS and
  password-reset links).
- Run `npm run build && npm start`, or deploy directly to Render/Railway/
  Fly.io/EC2 behind a process manager (PM2) and reverse proxy (Nginx).
