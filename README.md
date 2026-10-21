# AgriTech: smart farm management (MERN)

Farmers register, add farms and crops, record soil tests (rule-based health score and fertiliser advice), see a 7-day forecast (Open-Meteo, no API key) with auto-generated pest and weather alerts, buy inputs, and ask experts. Admins manage users, resources, orders and publish pest alerts.

## Run locally
1. Install Node 18+ and MongoDB (or use a free MongoDB Atlas URI).
2. `cp server/.env.example server/.env` and edit `MONGO_URI` and `JWT_SECRET`.
3. `npm run install:all`
4. Terminal 1: `npm run dev:server` (port 5000). Terminal 2: `npm run dev:client` (port 3000).
5. Log in as admin with `ADMIN_EMAIL` / `ADMIN_PASSWORD` from your `.env` (created on first start). Change the password for production.

## Deploy
- **Docker:** `docker compose up --build`, then open http://localhost:5000
- **Render / Railway / Heroku:** one web service. Build: `npm install --prefix server && npm install --prefix client && npm run build --prefix client`. Start: `node server/server.js`. Set `MONGO_URI`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`. `render.yaml` is included.
- The Express server serves the built React app, so no CORS setup is needed in production.

## API (all under /api, JWT in `Authorization: Bearer <token>`)
`POST /auth/register|login`, `GET /auth/me` · `/farms`, `/crops` (CRUD, `POST /crops/:id/logs`) · `GET /weather/:farmId` · `/resources` (admin writes) · `/orders` (`PATCH /:id/status` admin) · `/posts?type=forum|consult|pestAlert` + `/:id/replies` · `/admin/stats|users`.
Import into Postman and set a `token` variable to test.

## Notes
- Passwords are hashed with bcrypt; public registration always creates farmers; admin-only routes are enforced server-side.
- Languages: English, Hindi, Marathi. Add translations in `client/src/i18n.js` (untranslated text falls back to English).
