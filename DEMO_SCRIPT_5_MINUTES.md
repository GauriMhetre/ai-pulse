# AI Pulse Demo Script (5 Minutes)

## Overview Statement (30 seconds)
"AI Pulse helps organizations understand how well their employees use AI at work, team by team. This assessment tool allows employees to self-assess their AI literacy, and leadership gets a private dashboard showing team-level insights while protecting individual privacy."

---

## Part 1: Log In & Show Different Roles (1 minute)

### What to Say:
"The app has multiple roles - let me show you an admin view and an employee view."

### Demo Steps:
1. **Login Screen** - Show the clean login form
   - Email: `asha@northwind.test`
   - Password: `pulse123`
   - Point out: "Simple, clean interface with sage green theme"

2. **Organization Picker** - Show organization selection
   - Show: "I have access to Northwind Logistics as admin"
   - Click: Select Northwind Logistics

### Code to Show (if asked):
```javascript
// Session restoration with timeout
const timeoutPromise = new Promise((_, reject) =>
  setTimeout(() => reject(new Error("timeout")), 3000)
);
const user = await Promise.race([fetchPromise, timeoutPromise]);
```

---

## Part 2: Admin Dashboard (2 minutes)

### What to Say:
"Here's what admins see - a response rate dashboard that shows team-level engagement without exposing individual scores."

### Dashboard Features to Point Out:

1. **Header** (top of page)
   - Organization name: "Northwind Logistics"
   - "Switch workspace" link - shows multi-org support
   - Point out: "Users can switch between organizations they have access to"

2. **Overall Stats** (first section)
   - "2 / 10 completed" = response rate
   - Point out: "Shows how many people have finished the assessment"

3. **Response Rates by Team** (main section)
   - Show progress bars for each team
   - Point out: 
     - Green progress bars = completion percentage
     - Teams with fewer than 5 responses are shown slightly faded
     - Label: "(fewer than 5 responses)" 
     - Why faded? "Privacy protection - we don't want leaders to identify individuals"

4. **Small Teams Privacy Feature**
   - Point out the faded teams
   - Say: "These teams have fewer than 5 responses, so they're shown for transparency but aren't highlighted - prevents individual identification"

### Key Code Sections to Explain (if asked):

**Form Validation - Prevents incomplete submissions:**
```javascript
// Validate all questions are answered
const allAnswered = questions.every(q => 
  answers[q.id] && answers[q.id].trim() !== ""
);
// Submit button disabled if incomplete
<button disabled={!allAnswered}>Submit</button>
```

**Session Persistence - Users stay logged in after refresh:**
```javascript
useEffect(() => {
  const token = localStorage.getItem("token");
  if (token) {
    // Verify token is still valid
    fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
}, []);
```

---

## Part 3: Switch to Employee View (1.5 minutes)

### What to Say:
"Let me show you the employee experience. Employees see a diagnostic form, not the dashboard."

### Demo Steps:
1. **Click "Switch workspace"** - Go back to login
2. **Login as employee** - Use `priya@northwind.test` / `pulse123`
3. **Show Diagnostic Form**
   - Say: "Employees answer 5 questions about their AI usage"
   - Point out: "The form won't let you submit if you skip questions"
   - Try submitting with empty fields - show error: "Please answer all questions"

### Form Questions to Mention:
- Tool usage frequency
- Customer data handling practices
- AI tool outputs review
- Real task examples
- Customer communication practices

### What to Show:
- Progress through diagnostic
- Required field validation (disabled submit button until filled)
- Final submission

---

## Part 4: Dashboard Tour (1 minute)

### Return to Admin View: Click "Switch workspace", login as `asha@northwind.test` again

### Point Out These Privacy & Security Features:

1. **Small Group Protection**
   - Faded teams = <5 responses
   - Individual scores never shown to leaders
   - Say: "This satisfies the GDPR anonymity requirement"

2. **Response Rate Visibility**
   - All teams show completion %, even small ones
   - Transparency + Privacy balanced
   - Say: "Leaders see engagement without seeing individual data"

3. **Sage Green/Cream Theme**
   - Progress bars: sage green (#6b8e7e)
   - Cards: cream (#fefdfb)
   - Background: soft sage (#f5f9f7)
   - Say: "Designed for clarity - not overwhelming, easy to scan"

4. **Full-Width Dashboard**
   - Uses entire screen, no wasted space
   - Say: "Optimized for typical workplace laptop/desktop screens"

---

## Part 5: Code Quality Highlights (30 seconds)

### If Asked About Code:

**What we built:**
- React frontend with clean component architecture
- FastAPI backend with SQLAlchemy ORM
- Pre-seeded SQLite database with demo data
- Session management with token validation

**Key Features Implemented:**
1. ✅ Form validation prevents incomplete submissions
2. ✅ Session persistence - users stay logged in on page refresh
3. ✅ Privacy controls - small groups cannot be identified
4. ✅ Multi-organization support
5. ✅ Responsive, full-width dashboard design
6. ✅ Clean theme with sage green/cream colors

---

## Ending Statement (30 seconds)

"AI Pulse gives organizations the data they need to understand AI adoption at the team level, while protecting individual privacy. Employees can see their own results, leaders get team insights, and the entire experience is validated against GDPR anonymity requirements."

---

## Demo Credentials (Reference)

| Email | Role | Organization | Password |
|-------|------|--------------|----------|
| `asha@northwind.test` | Admin | Northwind Logistics | pulse123 |
| `priya@northwind.test` | Employee | Northwind Logistics | pulse123 |
| `meera@bluepeak.test` | Admin | Bluepeak Retail | pulse123 |
| `ravi@consult.test` | Employee (Multi-org) | Both | pulse123 |
| `dev@northwind.test` | Employee | Northwind Logistics | pulse123 |

---

## Live URL
**Frontend:** https://ai-pulse-2hzluqrenderer.com  
**Backend:** https://ai-pulse-backend-t1q5.onrender.com

---

## Technical Stack
- Frontend: React 18, Vite, vanilla CSS (sage green theme)
- Backend: Python 3.12, FastAPI, SQLAlchemy
- Database: SQLite (pre-seeded with demo data)
- Deployment: Render (Docker)
