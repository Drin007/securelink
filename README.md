# SafeWeb Scanner

A full-stack URL threat analysis tool. Paste any link and get an instant security report — SSL certificate details, domain age, IP geolocation, Google Safe Browsing, OpenPhish, and a composite safety score.

**Live →** [securelink-five.vercel.app](https://securelink-five.vercel.app)

---

## Features

- **Threat Analysis** — checks Google Safe Browsing, OpenPhish feed, suspicious TLDs, and keyword heuristics
- **SSL Inspection** — issuer, expiry, self-signed detection, days remaining
- **IP Geolocation** — country, region, ISP via ip-api
- **WHOIS Domain Age** — flags newly registered domains (< 30 days)
- **Safety Score** — weighted 0–100 composite score
- **Scan History** — every scan saved per user
- **Community Reports** — report suspicious URLs with reason and priority; high-priority reports link to cybercrime.gov.in
- **Dashboard** — overview of total, safe, and dangerous scans
- **JWT Auth** — signup, login, protected routes

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router v6 |
| Backend | Node.js, Express |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcryptjs |
| HTTP Client | Axios |
| SSL | Node.js `tls` module |
| Threat Feeds | Google Safe Browsing API v4, OpenPhish |
| WHOIS | whois-json |
| Deployment | Vercel (client), Render (server) |

---

## Project Structure

```
securelink/
├── client/                  # React frontend
│   └── src/
│       ├── pages/           # All page components + CSS
│       │   ├── Home.jsx
│       │   ├── Dashboard.jsx
│       │   ├── MyScans.jsx
│       │   ├── Reports.jsx
│       │   ├── Login.jsx
│       │   ├── Signup.jsx
│       │   ├── Navbar.jsx
│       │   ├── Footer.jsx
│       │   └── ProtectedRoute.jsx
│       └── utils/
│           ├── api.js       # Axios instance with auth interceptor
│           └── auth.js      # Token helpers
│
└── server/                  # Express backend
    ├── config/
    │   └── db.js            # MongoDB connection
    ├── controllers/
    │   └── authController.js
    ├── middleware/
    │   └── authMiddleware.js # JWT protect
    ├── models/
    │   ├── User.js
    │   ├── Scan.js
    │   └── Report.js
    ├── routes/
    │   ├── authRoutes.js
    │   ├── urlRoutes.js     # POST /api/check-url
    │   ├── scanRoutes.js    # GET /api/scan/history
    │   └── reportRoutes.js
    └── utils/
        ├── analyzeUrl.js    # Core analysis logic
        ├── sslInfo.js       # TLS certificate inspector
        ├── openPhishLoader.js
        ├── cachePersistence.js
        └── reportToCybercrime.js
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB URI (Atlas or local)
- Google Safe Browsing API key

### 1. Clone

```bash
git clone https://github.com/your-username/securelink.git
cd securelink
```

### 2. Server setup

```bash
cd server
npm install
```

Create `server/.env`:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_SAFE_BROWSING_KEY=your_gsb_api_key
PORT=3000
```

```bash
npm start
```

### 3. Client setup

```bash
cd client
npm install
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:3000
```

```bash
npm run dev
```

App runs at `http://localhost:5173`.

---

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/signup` | — | Register a new user |
| POST | `/api/auth/login` | — | Login, returns JWT |
| POST | `/api/check-url` | ✓ | Analyze a URL |
| GET | `/api/scan/history` | ✓ | Get user's scan history |
| POST | `/api/reports` | ✓ | Submit a report |
| GET | `/api/reports` | ✓ | Fetch all reports |

---

## Environment Variables

| Variable | Where | Description |
|----------|-------|-------------|
| `MONGODB_URI` | server | MongoDB connection string |
| `JWT_SECRET` | server | Secret for signing tokens |
| `GOOGLE_SAFE_BROWSING_KEY` | server | Google Safe Browsing API v4 key |
| `PORT` | server | Server port (default 3000) |
| `VITE_API_URL` | client | Backend base URL |

---

## Known Limitations

- SSL certificate details are unavailable for CDN-hosted sites (Google, YouTube, LinkedIn) — their infrastructure blocks raw TLS inspection from server IPs. The app correctly identifies SSL as valid in these cases.
- WHOIS lookups can be slow (~2–5s) for some domains and may occasionally be rate-limited.
- The scam URL cache (`scamCache.json`) is in-memory and resets on Render redeploys. For persistent caching, store it in MongoDB instead.

---

## License

MIT

---

*© 2026 Tushar Mehra. All rights reserved.*
