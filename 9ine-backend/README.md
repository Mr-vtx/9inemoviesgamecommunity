# 9ine Tournament Backend

Express + MongoDB API for the 9ine Community Blood Strike Tournament registration site.

---

## Project Structure

```
9ine-backend/
├── public/
│   └── index.html          ← Frontend (served by Express)
├── models/
│   └── Player.js           ← MongoDB schema
├── routes/
│   └── tournament.js       ← API routes
├── server.js               ← Entry point
├── .env                    ← Environment variables (never commit this)
├── .gitignore
├── vercel.json             ← Vercel deploy config
└── package.json
```

---

## Local Development

### 1. Install dependencies
```bash
npm install
```

### 2. Make sure MongoDB is running locally
```bash
# macOS
brew services start mongodb-community

# Ubuntu/Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

### 3. Configure .env
```env
MONGODB_URI=mongodb://localhost:27017/9inecomm
PORT=5000
COMMUNITY_CODES=9INE2025,BLOODSTRIKE,9INEGANG
MAX_PLAYERS=16
TOURNAMENT_DATE=2025-08-02T19:00:00Z
ALLOWED_ORIGIN=http://localhost:5000
```

### 4. Start the server
```bash
# Development (auto-restart on changes)
npm run dev

# Production
npm start
```

### 5. Open in browser
```
http://localhost:5000
```

---

## API Endpoints

| Method | Endpoint        | Description                        |
|--------|-----------------|------------------------------------|
| GET    | /health         | Server + DB health check           |
| GET    | /api/config     | Tournament config (date, max slots)|
| GET    | /api/players    | All registered players (public)    |
| POST   | /api/register   | Register a new player              |

### POST /api/register — Request Body
```json
{
  "name": "YourNickname",
  "gameId": "123456789",
  "whatsapp": "+2348000000000",
  "country": "Nigeria",
  "level": "Intermediate",
  "code": "9INE2025"
}
```

### POST /api/register — Response
```json
{
  "success": true,
  "message": "You're registered! Check WhatsApp for room details.",
  "player": {
    "name": "YourNickname",
    "country": "Nigeria",
    "level": "Intermediate",
    "registeredAt": "2025-07-20T18:00:00.000Z"
  }
}
```

---

## Rotating the Community Code

In your `.env` file, update `COMMUNITY_CODES` weekly:
```env
COMMUNITY_CODES=NEWCODE2025,BACKUP99
```
Post the new code in the WhatsApp group. Old codes instantly stop working.

---

## Deploy to Vercel (Production)

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOUR_USERNAME/9ine-backend.git
git push -u origin main
```

### Step 2 — Connect to Vercel
1. Go to https://vercel.com
2. Click "Add New Project"
3. Import your GitHub repo
4. Vercel auto-detects `vercel.json`

### Step 3 — Add Environment Variables in Vercel
In Vercel dashboard → Project Settings → Environment Variables, add:

| Key               | Value                                              |
|-------------------|----------------------------------------------------|
| MONGODB_URI       | mongodb+srv://user:pass@cluster.mongodb.net/9inecomm |
| COMMUNITY_CODES   | 9INE2025,BLOODSTRIKE                               |
| MAX_PLAYERS       | 16                                                 |
| TOURNAMENT_DATE   | 2025-08-02T19:00:00Z                               |
| ALLOWED_ORIGIN    | https://your-vercel-app.vercel.app                 |

> ⚠️ For production, use **MongoDB Atlas** (free tier) not localhost.
> Get your Atlas URI from: https://cloud.mongodb.com

### Step 4 — Deploy
Vercel auto-deploys on every `git push`. Done.

---

## Switching to MongoDB Atlas (Production)

1. Create free account at https://cloud.mongodb.com
2. Create a free M0 cluster
3. Get your connection string — looks like:
   `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/9inecomm`
4. Replace `MONGODB_URI` in your `.env` and Vercel env vars
5. That's it — all data persists permanently in the cloud
