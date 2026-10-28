# AI Pulse - Assessment Submission

AI Pulse helps a company understand how well its people use AI at work, team by team.

## What Was Found, Fixed, and Delivered

### Top 5 Issues Fixed

1. **Privacy Violation: Small Groups Identifiable on Dashboard**
   - **Issue:** Departments with <5 completed responses were showing individual scores, breaking anonymity
   - **Fix:** Implemented privacy threshold (MIN_GROUP_SIZE=5) to hide teams with insufficient responses
   - **Impact:** Client requirement met - GDPR anonymity compliance
   - **Files:** `backend/app/routes/dashboard.py`, `backend/app/models.py`

2. **No User Data Deletion Capability**
   - **Issue:** No way for employees to exercise right-to-be-forgotten; data persists indefinitely
   - **Fix:** Implemented DELETE /user/data endpoint for complete data removal (responses, memberships, account)
   - **Impact:** GDPR compliance + client requirement met
   - **Files:** `backend/app/routes/delete.py`, `backend/app/audit.py`

3. **Session Not Persisting Across Page Reloads**
   - **Issue:** Users logged out on every page refresh, poor UX
   - **Fix:** Added session restoration with GET /auth/me endpoint and localStorage token validation
   - **Impact:** Seamless user experience, users stay logged in
   - **Files:** `frontend/src/App.jsx`, `backend/app/routes/auth_routes.py`

4. **Missing Security Hardening for Enterprise**
   - **Issue:** No audit trails, no CSRF protection, no security headers
   - **Fix:** Implemented audit logging, CSRF tokens with secure cookies, security headers (CSP, HSTS, X-Frame-Options)
   - **Impact:** Enterprise-grade security, compliance-ready
   - **Files:** `backend/app/audit.py`, `backend/app/csrf.py`, `backend/app/config.py`

5. **Frontend Build Failing in Production**
   - **Issue:** Missing API_URL export caused Vite build failure: "API_URL is not exported by src/api.js"
   - **Fix:** Exported API_URL constant and fixed build configuration
   - **Impact:** Production deployment now possible
   - **Files:** `frontend/src/api.js`, `backend/Dockerfile`

### Other Issues Fixed

- Dockerfile module import error (uvicorn couldn't find main module)
- API CORS configuration for frontend/backend communication
- Render deployment path configuration (publish directory mismatch)
- Loading states missing on form submissions
- .gitignore incomplete (environment files, build artifacts exposed)

## How Client Requirements Were Handled

### Client Request 1: Privacy Controls
**Requirement:** "No small groups on the dashboard. If a department has fewer than 5 people who completed the diagnostic, leadership must not see that department's scores."

**Solution Implemented:**
- Added MIN_GROUP_SIZE=5 threshold in dashboard logic
- Teams with <5 responses grouped as "hidden_team_count" in response
- Responses still calculated for the hidden teams (admin doesn't see them)
- Dashboard shows: response_rates (visible), hidden_team_count (opaque count)
- Meets anonymity requirement: individual identification prevented

**Status:** ✅ Complete

### Client Request 2: Right to Delete
**Requirement:** "Any employee must be able to delete all their answers and their report themselves, and it must disappear from every dashboard immediately."

**Solution Implemented:**
- DELETE /user/data endpoint (secured with JWT auth)
- Cascading delete: responses → memberships → user account
- Immediate effect: dashboard recalculates without that user's data
- Audit logging for all deletions (compliance trail)

**Status:** ✅ Complete

### Questions for Client (if continuing)
- Should deleted user data retention policy be retained for compliance? (e.g., 90-day recovery window)
- Do you want audit logs retained separately from user deletion?
- Should admins see notifications of user deletions?

## Custom Feature: Session Restore with Improved UX

**Problem:** Users must login every time they visit, even if their session is valid. This breaks the app's usability.

**Why Picked:** 
- Small, sharp feature (not big generic optimization)
- Directly improves employee experience
- Builds on existing auth system
- Enables production deployment

**What It Does:**
1. On app load, check localStorage for existing token
2. Call GET /auth/me to validate token with backend
3. If valid, skip login screen and restore session
4. If invalid or expired, show login form
5. Show "Restoring session..." while validating

**Implementation:**
- Backend: GET /auth/me endpoint returns current user + organizations
- Frontend: useEffect hook in App.jsx checks token on mount
- Loading state prevents UI flashing
- Token automatically sent in Authorization header

**Files:**
- `frontend/src/App.jsx` (session restoration logic)
- `backend/app/routes/auth_routes.py` (GET /auth/me endpoint)
- `frontend/src/api.js` (API_URL export for production)

**Why It Matters:**
- Employees take assessments once and can view reports anytime
- Admins can check dashboards without repeated login
- Reduces friction, increases feature adoption

## How AI Tools Were Used

### What Worked Well
1. **Code generation:** Quickly scaffolded audit logging, CSRF protection, security headers
2. **Bug diagnosis:** Identified module import errors and build configuration issues
3. **Test writing:** Generated comprehensive test cases for new endpoints
4. **Documentation:** Created deployment guides and API documentation

### Where AI Got It Wrong
1. **Render deployment:** Generated incorrect Dockerfile paths initially (tried `backend/requirements.txt` instead of relative path)
2. **CORS configuration:** First suggested `allow_origins=["*"]` without accounting for security headers
3. **Build commands:** Suggested separate build/publish directories before understanding monorepo structure
4. **Environment variables:** Didn't initially recognize FRONTEND_URL needed for backend CORS config

**How Fixed:** Read actual error logs, tested locally first, iterated with corrections

## Testing

### Tests Implemented
```bash
cd backend
python -m pytest
```

Test coverage includes:
- Authentication (login, token generation, current user)
- Dashboard (privacy thresholds, response rates)
- User data deletion (cascading deletes, audit logs)
- CSRF protection (token validation)

### Manual Testing
- Session restoration: reload page, verify no re-login needed
- Privacy controls: create <5 responses, verify team hidden
- Data deletion: delete user, verify dashboard updates immediately
- CORS: frontend calls backend, verify responses received

## Stack & Deployment

- **Backend:** Python 3.12, FastAPI, SQLAlchemy (SQLite locally, PostgreSQL ready)
- **Frontend:** React 18, Vite, modern JavaScript
- **Deployment:** Render (Docker support) or local

### Local Development
```bash
# Backend
cd backend
pip install -r requirements.txt
python -m app.seed
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

### Production Deployment
Set environment variables:
- `SECRET_KEY` (backend)
- `FRONTEND_URL` (backend, for CORS)
- `VITE_API_URL` (frontend, API endpoint)
- `AI_MODE=mock` (or live with LLM credentials)

## Demo Accounts

All passwords: `pulse123`

- `asha@northwind.test` - Admin
- `priya@northwind.test` - Employee (Support)
- `dev@northwind.test` - Employee (Engineering)

## What Was Deliberately Left

1. **Persistent database for production** - Left as SQLite to keep setup simple; production should use PostgreSQL (configuration ready)
2. **Live LLM integration** - Kept mock mode by default; live mode available with OpenAI API key
3. **Advanced dashboarding** - Current dashboard is functional; production might need real-time charts, exports
4. **Multi-language support** - Focused on core functionality first
5. **Mobile responsive design** - Works on mobile but not optimized; would require CSS refactor

## Repository Structure

```
ai-pulse/
├── backend/
│   ├── app/
│   │   ├── audit.py          # Audit logging
│   │   ├── csrf.py           # CSRF protection
│   │   ├── routes/           # API endpoints
│   │   └── services/         # Business logic
│   ├── tests/                # Test suite
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # Session restore logic
│   │   ├── pages/            # Components
│   │   └── api.js            # API client
│   └── package.json
├── README.md                 # This file
└── .gitignore               # Comprehensive patterns
```

## Client Request Documentation

See `CLIENT_REQUEST.md` for original requirements and how they were addressed.
