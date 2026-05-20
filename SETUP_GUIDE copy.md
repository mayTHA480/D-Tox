# Detoxism — Setup Guide 🎮

## Project Structure
```
detoxism/
├── frontend/     ← React + Vite + Tailwind
├── backend/      ← Node + Express + Socket.io
└── package.json  ← root scripts
```

---

## Step 1 — Install dependencies

```bash
cd detoxism
npm run install:all
```

---

## Step 2 — Set up Firebase (Google Login)

1. Go to https://console.firebase.google.com
2. Click **Add project** → name it "detoxism" → Create
3. Click **Authentication** in left sidebar → **Get Started**
4. Enable **Google** as a sign-in provider → Save

### Get Frontend Config:
5. Go to **Project Settings** (gear icon) → **General**
6. Scroll to **Your apps** → click **</>** (web app) → Register app
7. Copy the firebaseConfig values into `frontend/.env.local`:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### Get Backend Service Account (Admin SDK):
8. Go to **Project Settings** → **Service accounts**
9. Click **Generate new private key** → download the JSON file
10. Open the JSON and copy these values into `backend/.env`:

```
FIREBASE_PROJECT_ID=     ← "project_id" in JSON
FIREBASE_CLIENT_EMAIL=   ← "client_email" in JSON
FIREBASE_PRIVATE_KEY=    ← "private_key" in JSON (keep the quotes)
```

---

## Step 3 — Set up PostgreSQL on Render (free)

1. Go to https://render.com → Sign up (free)
2. Click **New** → **PostgreSQL**
3. Name: `detoxism-db` → Region: Singapore → Free plan → **Create**
4. Wait ~1 min, then copy the **Internal Database URL**
5. Paste it into `backend/.env` as `DATABASE_URL`

### Initialize the database tables:
```bash
npm run init:db
```

---

## Step 4 — Run locally

Open two terminals:

```bash
# Terminal 1 — Backend
cd detoxism/backend
npm run dev

# Terminal 2 — Frontend
cd detoxism/frontend
npm run dev
```

Visit: http://localhost:5173

---

## Step 5 — Deploy to Render (free hosting)

### Deploy Backend:
1. Push your project to GitHub
2. On Render → **New** → **Web Service**
3. Connect your GitHub repo
4. Settings:
   - Root directory: `backend`
   - Build command: `npm install`
   - Start command: `node index.js`
5. Add all your `.env` variables under **Environment**
6. Click **Deploy** → wait ~3 min
7. Copy the URL (e.g. `https://detoxism-backend.onrender.com`)

### Deploy Frontend:
1. On Render → **New** → **Static Site**
2. Connect same GitHub repo
3. Settings:
   - Root directory: `frontend`
   - Build command: `npm install && npm run build`
   - Publish directory: `dist`
4. Add environment variables (all `VITE_*` ones + set `VITE_BACKEND_URL` to your backend URL)
5. Deploy!

Your game will be live at `https://detoxism-frontend.onrender.com` 🎉

---

## Step 6 — Add your domain to Firebase

After deploying, add your Render URLs to Firebase:
1. Firebase Console → Authentication → Settings → **Authorized domains**
2. Add both your frontend Render URL

---

## HP Rules (already coded)
- 1 player vs AI → **20 HP**
- 2 players → **20 HP** each
- 3-4 players → **10 HP** each

## Game ends when:
- Any player reaches **0 HP**
- The **deck runs out** → highest HP wins
