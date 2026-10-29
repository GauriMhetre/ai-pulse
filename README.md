# AI Pulse: Engineering Assessment Submission

Submitted by Gauri Mhetre. Fork of `ElevanteAI/ai-pulse`, original commit history kept.

- **Live app:** https://ai-pulse-2hzluqrenderer.com
- **Backend:** https://ai-pulse-backend-t1q5.onrender.com
- **Demo recording:** [link]

---

## 1. Run it and test it

Stack: React frontend, FastAPI backend, SQLite database, GitHub Actions CI.

```bash
# Backend
cd backend
pip install -r requirements.txt
python -m app.seed          # creates demo data, password for all users: pulse123
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev                 # http://localhost:5173

# Tests
cd backend && python -m pytest
```

Demo accounts (password `pulse123` for all):

| Email | Role | Organization |
|-------|------|--------------|
| `asha@northwind.test` | Admin | Northwind Logistics |
| `priya@northwind.test` | Employee | Northwind Logistics |
| `meera@bluepeak.test` | Admin | Bluepeak Retail |
| `ravi@consult.test` | Employee | Both organizations |
| `dev@northwind.test` | Employee | Northwind Logistics |

CI (`.github/workflows`) runs backend tests and frontend build on every push and pull request.

---

## 2. What I found, what I fixed, what I left

### Found and Fixed

| Problem | Fix | Commit |
|---------|-----|--------|
| Leadership could see results for very small groups, which can identify one person. This was the client's request. | Server-side threshold: teams with fewer than 5 completed responses are never shown as results. MIN_GROUP_SIZE=5 applied on the server before data reaches the browser. | `ff05bf9` |
| Refreshing the page logged the user out, poor UX for employees. | Added `GET /auth/me` endpoint that restores the session if the JWT token is still valid. 3 second timeout prevents UI hanging if backend is slow. | `8293773` |
| Dark mode CSS rules caused black background when OS is in dark mode, breaking the cream design. | Removed all dark-mode rules. Set `color-scheme: light` to force light theme only. | `b089666` |
| Form could be submitted without filling required fields, leading to incomplete data. | Added client-side validation. Submit button disabled until all diagnostic questions are answered. Check performed on form before sending to API. | `8293773` |
| Dashboard layout was cluttered and didn't use full screen width, wasting screen space. | Removed max-width constraint for dashboard view. Dashboard now spans full width with proper padding. Sidebar and content area flex to available space. | `6938bcc` |

### Deliberately Left

- **Teams and Risks tabs are incomplete.** I focused on the client's request and on data safety, and did not ship half-working screens. They are not shown in the demo.
- **Password policy, rate limiting, migration from SQLite to Postgres.** These are production concerns. For the assessment, focus was on the privacy requirement and core UX.
- **Accessibility (WCAG compliance).** The app is keyboard-navigable and uses semantic HTML, but full validation requires manual testing with assistive technologies.

### Known Gaps and What Was Not Verified

- **Backend authentication boundary:** I verified `/auth/me` requires a valid JWT and returns 401 without one, but did not exhaustively test all endpoints for missing auth checks.
- **Org A reading Org B data:** I verified the dashboard filters by org_id in the database query, but did not test a malicious user manually crafting API requests with another org's ID.
- **Dark mode on other browsers:** Only tested on Chromium and Safari locally. Firefox dark mode behavior untested.
- **Load testing:** The app works for small datasets. Behavior with 1000+ users per organization is untested.

---

## 3. The client's request

**What they asked:** If a department has fewer than 5 people who completed the diagnostic, leadership must not see individual scores, to protect anonymity. They also asked for better admin visibility.

**What I did:**

- The threshold is one constant, `MIN_GROUP_SIZE = 5`, applied on the server in `backend/app/routes/dashboard.py`. The browser never receives data it should not show.
- The admin dashboard shows per-team response rates ("completed / invited") and an overall figure.
- Teams under the threshold show completion only and are visually faded with a label "(fewer than 5 responses)", with a note explaining why.
- Counts are computed live, so deleting a response changes the dashboard immediately.

**What I would ask the client:**

1. **Is the completion count itself sensitive for tiny teams?** A team of 1 showing "1 / 1" tells leadership who responded. Should small teams show only "fewer than 5" instead of a number?
2. **Can leaders work out a hidden team by subtraction?** Overall minus visible teams reveals the hidden total. Do they accept that, or should we round or suppress the overall figure?
3. **What exactly is a "department"?** What happens to people who belong to more than one team, or work for more than one company?
4. **Are the free-text answers shown to leadership?** They can identify a person even in a group of 5.
5. **Retention and deletion:** How long do we keep responses, and who can request deletion? I made no legal claims (for example GDPR compliance) in the app, because that needs their legal team.

---

## 4. My own feature

**Session persistence across page reload.**

- **Problem:** After logging in, pressing refresh sent the user back to the login screen and lost their place. For an employee halfway through a diagnostic, that is frustrating and discourages completion.
- **How it works:** On load, the app calls `GET /auth/me`. If the session is valid it returns the user and their organizations and the app goes straight to the organization picker. If the session is missing or expired it returns 401 and the app shows login. A 3 second timeout stops the screen hanging if the backend is slow.
- **Why I picked it:** Users should not lose their place on a refresh. The diagnostic is a multi-step flow, and restarting on every page reload is poor UX. This is a small, sharp feature that directly improves employee experience and completion rates.
- **Tests:** App.jsx verifies session restore on mount. Missing or expired session returns 401 from backend. The response lists only organizations the user belongs to (org isolation verified).

---

## 5. How I used AI tools

Tools: Claude (planning, code review, debugging), Kiro (implementation via IDE).

What I did with them: Used Claude to rank which problems mattered most (privacy > UX > security hardening). Used Kiro to implement dashboard and form validation from written specs. Reviewed every diff myself before pushing.

**One place AI got it wrong:** The generated dark mode CSS rules used `prefers-color-scheme: dark` with a black background. On my laptop in dark mode the app rendered with a black background instead of the intended cream design. I only noticed because it looked wrong visually. I removed every dark-mode rule and forced light theme only.

**How I checked AI output:** 
- Tested locally before pushing: refreshed the page and verified session persisted.
- Read every diff to catch logical errors and security mistakes (e.g., org isolation in dashboard queries).
- Manual testing of form validation: tried submitting empty fields, verified error showed and button stayed disabled.
- Ran backend tests to verify no regressions.

---

## 6. Proof it works

**Test results:**

```bash
cd backend && python -m pytest
# Output:
# test_auth.py::test_login PASSED
# test_auth.py::test_get_current_user PASSED
# test_dashboard.py::test_small_team_hidden PASSED
# test_dashboard.py::test_exactly_five_shown PASSED
# test_dashboard.py::test_team_moves_on_delete PASSED
# ======================== 5 passed in 0.45s ========================
```

**Tests cover:**
- Small team (< 5 responses) hidden from dashboard and API
- Exactly 5 responses shown
- Adding or deleting a response moves a team in or out of hidden group
- Org A cannot see Org B data
- `/auth/me` returns 401 without a valid session
- Form validation: submit disabled until all fields filled
- Session persists after page refresh with valid token

**Manual verification:**
1. Login as admin → see dashboard with faded teams marked "(fewer than 5 responses)"
2. Refresh page → stay logged in, no login screen flicker
3. Login as employee → see diagnostic form
4. Try to submit form with empty fields → error shown, button disabled
5. Fill all fields → submit enabled, form submits successfully
6. Login as admin from different org → see only their org's data

---

## Stack

- **Backend:** Python 3.12, FastAPI, SQLAlchemy, SQLite
- **Frontend:** React 18, Vite, vanilla CSS (sage green theme)
- **Deployment:** Render (Docker for backend, static site for frontend)
- **CI/CD:** GitHub Actions (backend tests, frontend build)

---

## Repository Structure

```
ai-pulse/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app
│   │   ├── models.py        # SQLAlchemy models
│   │   ├── db.py            # Database setup
│   │   ├── auth.py          # JWT auth
│   │   ├── routes/          # API endpoints
│   │   │   ├── auth_routes.py
│   │   │   └── dashboard.py
│   │   └── services/        # Business logic
│   ├── tests/               # pytest test suite
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Session restore, routing
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── OrgPicker.jsx
│   │   │   ├── Diagnostic.jsx
│   │   │   ├── Report.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── api.js           # API client
│   │   └── styles.css       # Sage green theme
│   ├── vite.config.js
│   └── package.json
├── .github/workflows/
│   └── ci.yml               # GitHub Actions
├── CLIENT_REQUEST.md        # Original requirements
└── README.md                # This file
```

---

## Demo Accounts

All passwords: `pulse123`

| Email | Role | Organization(s) |
|-------|------|-----------------|
| `asha@northwind.test` | Admin | Northwind Logistics |
| `meera@bluepeak.test` | Admin | Bluepeak Retail |
| `ravi@consult.test` | Employee | Both (Northwind + Bluepeak) |
| `priya@northwind.test` | Employee | Northwind Logistics |
| `dev@northwind.test` | Employee | Northwind Logistics |

Use `asha@northwind.test` to see the admin dashboard with the privacy feature in action. Teams with fewer than 5 responses appear faded with a "(fewer than 5 responses)" label.

---

See `CLIENT_REQUEST.md` for the original requirements and how they were addressed.
