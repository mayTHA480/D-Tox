# Detoxism Game — Setup Guide 🎮

## Project Structure
```
detoxism-game/
├── frontend/
│   ├── public/
│   │   ├── index.html          ← Login / Register page
│   │   ├── singleplayer.html   ← Solo vs AI page
│   │   └── multiplayer.html    ← Multiplayer page
│   ├── src/
│   │   ├── app.js              ← React entry
│   │   ├── firebase.js         ← Firebase client config
│   │   ├── socket.js           ← Socket.io client
│   │   ├── cardData.js         ← All 18 card definitions
│   │   ├── index.css           ← Global styles + Tailwind
│   │   ├── components/
│   │   │   ├── Login.js
│   │   │   ├── SinglePlayer.js
│   │   │   ├── Multiplayer.js
│   │   │   ├── Card.js
│   │   │   ├── ScoreBoard.js
│   │   │   ├── GameOverModal.js
│   │   │   └── Header.js
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useGame.js
│   │   │   └── useMultiplayer.js
│   │   └── images/             ← detox1.png ... detox18.png
│   └── package.json
└── backend/
    ├── index.js
    ├── src/
    │   ├── app.js
    │   ├── configs/
    │   │   ├── db.js
    │   │   ├── firebase.js
    │   │   ├── createSchema.js
    │   │   └── initTables.js
    │   ├── middleware/
    │   │   └── authMiddleware.js
    │   ├── models/
    │   │   ├── userModel.js
    │   │   └── gameModel.js
    │   ├── controllers/
    │   │   ├── authController.js
    │   │   └── gameController.js
    │   ├── routes/
    │   │   ├── authRoutes.js
    │   │   ├── gameRoutes.js
    │   │   └── userRoutes.js
    │   ├── services/
    │   │   ├── authService.js
    │   │   └── gameService.js
    │   └── socket/
    │       ├── gameSocket.js
    │       └── cardData.js
    └── package.json
```

---

## Step 1 — Install dependencies

```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

---

## Step 2 — Firebase setup (Google Login)

1. Go to https://console.firebase.google.com
2. Create project → name it "detoxism"
3. Authentication → Get Started → Enable **Google** + **Email/Password**
4. Project Settings → General → Add web app → copy config
5. Rename `frontend/.env.example` to `.env` and paste config values

### Backend (Admin SDK):
6. Project Settings → Service accounts → Generate new private key → download JSON
7. Rename `backend/.env.example` to `.env`
8. Copy `project_id`, `client_email`, `private_key` from JSON into `.env`

---

## Step 3 — PostgreSQL on Render (free)

1. https://render.com → New → PostgreSQL
2. Name: detoxism-db → Region: Singapore → Free → Create
3. Copy Internal Database URL → paste into `backend/.env` as `DATABASE_URL`
4. Run: `cd backend && npm run init:db`

---

## Step 4 — Run locally

```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm start
```

Visit http://localhost:3000

---

## Step 5 — Deploy to Render

### Backend (Web Service):
- Root: `backend`
- Build: `npm install`
- Start: `node index.js`
- Add all `.env` variables in Render's Environment tab

### Frontend (Static Site):
- Root: `frontend`
- Build: `npm install && npm run build`
- Publish: `build`
- Add all `REACT_APP_*` env vars
- Set `REACT_APP_BACKEND_URL` to your backend Render URL

### After deploying:
- Firebase Console → Authentication → Settings → Authorized domains
- Add your frontend Render URL

---

## HP Rules (coded in gameService.js)
| Players | Starting HP |
|---------|-------------|
| 1 vs AI | 20 each |
| 2 players | 20 each |
| 3 players | 10 each |
| 4 players | 10 each |
