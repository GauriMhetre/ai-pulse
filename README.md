# AI Pulse

AI Pulse helps a company understand how well its people use AI at work, team by team.

- **Employees** sign in, pick their organization, and take a short diagnostic. Questions adapt to their job role and seniority. One open-ended answer is scored by an LLM.
- **Each employee** gets a personal report: maturity level, risks, and next steps for their role.
- **Company admins** see a dashboard of AI maturity by department and the top risks across the company.
- Some users (consultants, group-company HR) belong to **more than one organization** and choose one after login.

## Features

✅ **Session Persistence** - Users don't need to login every time  
✅ **Security Hardening** - Audit logging, CSRF protection, security headers  
✅ **GDPR Compliance** - Right-to-be-forgotten with DELETE /user/data endpoint  
✅ **Privacy Controls** - Teams with <5 responses hidden to protect anonymity  
✅ **Loading States** - Clear UX feedback during async operations  
✅ **Mock AI Mode** - Demo with canned responses, no API key needed  

## Stack

- **Backend:** Python 3.12, FastAPI, SQLAlchemy (SQLite by default)
- **Frontend:** React 18, Vite, modern JavaScript
- **AI:** OpenAI-compatible chat completions or mock mode
- **Deployment:** Render (backend + frontend), Docker support

## Run Locally

### Backend

```bash
cd backend
pip install -r requirements.txt
python -m app.seed          # creates demo data, password: pulse123
uvicorn app.main:app --reload
```

The backend runs on `http://localhost:8000`

### Frontend

```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173
```

The frontend will automatically proxy API calls to localhost:8000

### Tests

```bash
cd backend
python -m pytest
```

## Demo Accounts

Password for all accounts: `pulse123`

| Email | Organization(s) | Role |
|---|---|---|
| asha@northwind.test | Northwind Logistics | Admin |
| meera@bluepeak.test | Bluepeak Retail | Admin |
| ravi@consult.test | Both | Employee at Northwind, admin at Bluepeak |
| priya@northwind.test | Northwind Logistics | Employee (Support) |
| dev@northwind.test | Northwind Logistics | Employee (Engineering, lead) |

## Deployment

### Option 1: Render (Recommended)

#### Backend Deployment

1. Create a new Web Service on [Render](https://dashboard.render.com)
2. Connect your GitHub repository
3. Configure:
   - **Build Command:** (auto-detected from Dockerfile)
   - **Start Command:** (auto-detected from Dockerfile)
4. Set environment variables:
   ```
   SECRET_KEY=your-random-secret-key-here
   AI_MODE=mock
   ```
5. Deploy - you'll get a URL like `https://ai-pulse-backend-xxxxx.render.com`

#### Frontend Deployment

1. Create a new Static Site on Render
2. Connect your GitHub repository  
3. Configure:
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install; npm run build`
   - **Publish Directory:** `dist`
4. Set environment variable:
   ```
   VITE_API_URL=https://ai-pulse-backend-xxxxx.render.com
   ```
5. Deploy - automatic updates on every push to main

### Option 2: Docker

Build and run locally:

```bash
docker build -t ai-pulse-backend ./backend
docker run -p 8000:8000 \
  -e SECRET_KEY=your-secret \
  -e AI_MODE=mock \
  ai-pulse-backend
```

## Configuration

### Environment Variables

**Backend (.env or Render settings):**
- `SECRET_KEY` - Random string for JWT token signing (required)
- `DATABASE_URL` - PostgreSQL connection string (optional, defaults to SQLite)
- `AI_MODE` - `mock` (default) or `live`
- `LLM_API_URL` - OpenAI API endpoint (required if `AI_MODE=live`)
- `LLM_API_KEY` - OpenAI API key (required if `AI_MODE=live`)
- `LLM_MODEL` - Model name like `gpt-4` (required if `AI_MODE=live`)
- `TOKEN_HOURS` - JWT token expiration in hours (default: 12)
- `ENABLE_AUDIT_LOGGING` - Enable audit logs (`true`/`false`, default: `true`)

**Frontend (.env.local or Render settings):**
- `VITE_API_URL` - Backend API URL (required for production)

### AI Mode

#### Mock Mode (Default)
Returns canned responses from `backend/data/mock_ai_responses.json`. Perfect for demos and testing.

```bash
AI_MODE=mock
```

#### Live Mode
Calls OpenAI-compatible API for real AI scoring.

```bash
AI_MODE=live
LLM_API_URL=https://api.openai.com/v1
LLM_API_KEY=sk-...
LLM_MODEL=gpt-4-turbo
```

## Security Features

✅ **Audit Logging** - All authentication and data access events logged  
✅ **CSRF Protection** - Token-based CSRF prevention on state-changing operations  
✅ **Security Headers** - X-Frame-Options, X-Content-Type-Options, CSP, HSTS  
✅ **JWT Authentication** - Secure token-based session management  
✅ **Input Validation** - Pydantic models for all API inputs  
✅ **GDPR Compliance** - DELETE /user/data endpoint for data deletion  
✅ **Privacy Controls** - Groups with <5 responses anonymized on dashboard  

## API Endpoints

### Authentication
- `POST /auth/login` - Login with email/password
- `GET /auth/me` - Get current user info (session restore)
- `POST /auth/select-org` - Switch to different organization

### Diagnostic
- `GET /diagnostic/questions` - Get assessment questions
- `POST /diagnostic/submit` - Submit answers

### Reports
- `GET /reports/me` - Get personal maturity report

### Dashboard
- `GET /dashboard?org_id=1` - Get organization dashboard (admin only)

### Data Management
- `DELETE /user/data` - Delete all user data (GDPR)

## Project Structure

```
ai-pulse/
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI app setup
│   │   ├── models.py         # SQLAlchemy ORM models
│   │   ├── auth.py           # JWT authentication
│   │   ├── audit.py          # Audit logging
│   │   ├── csrf.py           # CSRF protection
│   │   ├── config.py         # Configuration
│   │   ├── routes/           # API endpoints
│   │   │   ├── auth_routes.py
│   │   │   ├── dashboard.py
│   │   │   ├── diagnostic.py
│   │   │   ├── reports.py
│   │   │   └── delete.py
│   │   ├── services/         # Business logic
│   │   │   ├── llm.py        # AI integration
│   │   │   ├── scoring.py    # Response scoring
│   │   │   └── questions.py  # Question management
│   │   └── data/             # Mock data
│   ├── requirements.txt
│   ├── Dockerfile
│   └── tests/
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # Main app (session restore)
│   │   ├── api.js            # API client
│   │   ├── main.jsx
│   │   ├── styles.css
│   │   └── pages/            # Page components
│   │       ├── Login.jsx
│   │       ├── OrgPicker.jsx
│   │       ├── Diagnostic.jsx
│   │       ├── Dashboard.jsx
│   │       └── Report.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
├── README.md
└── .gitignore
```

## Recent Changes (PR Reviews)

### PR #1: Core Improvements & Bug Fixes
- Privacy threshold enforcement (hide teams <5 responses)
- Response rate calculations
- Dashboard improvements

### PR #2: Client Requirements
- Enhanced dashboard scoring and visualization
- Performance optimizations
- Additional security hardening

### PR #3: Enterprise Security
- Audit logging system
- CSRF token protection
- Security headers middleware
- User data deletion (GDPR)

### PR #4: Frontend UX
- Session restoration on page load
- Loading states on all pages
- Expanded .gitignore
- GET /auth/me endpoint

## Troubleshooting

### Frontend can't reach backend
**Error:** `Failed to load resource: 404`
- Check `VITE_API_URL` environment variable is set correctly
- Verify backend is running and accessible at that URL
- Check browser console for exact error

### Deployment fails
- Check Render build logs for specific errors
- Verify environment variables are set
- Ensure all required files are committed to Git

### Demo data not loading
```bash
cd backend
python -m app.seed
```

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and commit: `git commit -m "feat: description"`
3. Push: `git push origin feature/your-feature`
4. Create a Pull Request

## Support

For issues or questions, check the GitHub issues or review the deployment logs on Render/Vercel.

## License

This project is provided as-is for the Northwind Logistics assessment.
