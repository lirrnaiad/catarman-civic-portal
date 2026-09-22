# Catarman Civic Portal

Mobile-first, offline-resilient civic portal for Catarman — hazard reporting, evacuation-center capacity, and a citizen-facing events calendar. Built for the [department] LGU hackathon, 8 AM–4 PM.

## Team & Tracks
| Track | Owner | Branch |
| --- | --- | --- |
| Reporter (citizen report form) | De Guia | `feature/reporter` |
| Admin Dashboard + Offline | Inovero | `feature/admin-dashboard` |
| Evacuation/Disaster Module | Fabia | `feature/evacuation` |
| Events Calendar | Ordonia | `feature/events` |

Each track owner has their own task file with stories, acceptance criteria, and a full timeline — check the file with your name on it.

## Setup

```bash
git clone https://github.com/lirrnaiad/catarman-civic-portal.git
cd catarman-civic-portal

# Frontend
cd frontend
npm install
cp .env.example .env.local   # fill in NEXT_PUBLIC_API_URL

# Backend
cd ../backend
# import schema.sql into your local MySQL, fill in .env from .env.example
```

## Repo structure
```
/frontend    → Next.js (PWA, deployed on Vercel)
/backend     → PHP + MySQL (REST API)
schema.sql   → reports, evacuation_centers, events tables
.env.example → copy to .env, fill in your own values, never commit .env
```

## Data contract
- `reports`: category, geotag (lat/lng), photo, status, timestamp
- `evacuation_centers`: name, barangay, capacity, current_occupancy
- `events`: title, agency, date/time, location, description

If you're changing a field name or adding one, say so in the group chat before you push — everyone else's code depends on this shape matching.

---

## Git workflow — read this if you're not comfortable with git yet

**`main` is protected.** You cannot push directly to it — GitHub will reject it. All work goes through a Pull Request (PR). This is intentional, not a bug.

### One-time setup
```bash
git clone https://github.com/lirrnaiad/catarman-civic-portal.git
cd catarman-civic-portal
git checkout -b feature/<your-track>
```
Use the branch name from the table above that matches your track.

### While you work (every 30–45 min)
```bash
git add .
git commit -m "short description of what you just did"
git push -u origin feature/<your-track>
```
After the first push, you can drop `-u` and just run `git push`.

Commit often, even if the feature isn't finished. A messy commit is recoverable. Two hours of uncommitted work is not.

### Before you start a new work session
```bash
git checkout main
git pull
git checkout feature/<your-track>
git merge main
```
This pulls in whatever everyone else has merged since you last checked, so you're not working against stale code.

### When your work is ready to merge (around 11:00 and 1:00)
1. Go to the repo on GitHub
2. Switch to your branch
3. Click the green **"Compare & pull request"** button
4. Make sure the base is `main` and your branch is compare
5. Open the PR — don't merge your own PR, ask Fabia or whoever's reviewing to merge it

### If something breaks
- Run `git status` first — it tells you exactly what state you're in
- If `git push` is rejected: someone else pushed first, run the "before you start a new session" steps above, then push again
- If you see a merge conflict: don't panic and don't force anything — post it in the group chat with a screenshot, get help resolving it live rather than guessing
- When in doubt, ask before you run a command you don't understand — especially anything with `--force` in it