# FORGE — batttehran.com

> Your personal operating system. Stop drifting. Start building yourself.

A cinematic self-improvement platform for ambitious young men (16–25) who want to track growth, build discipline, and become who they're meant to be.

---

## Project Structure

```
forge-batttehran/
├── index.html          ← Landing page (batttehran.com)
├── dashboard.html      ← Full interactive dashboard
├── CNAME               ← Custom domain config
├── css/
│   ├── main.css        ← All shared styles
│   └── dashboard.css   ← Dashboard-specific styles
├── js/
│   ├── main.js         ← Landing page scripts
│   └── dashboard.js    ← Full dashboard app (6 pages)
└── .github/
    └── workflows/
        └── deploy.yml  ← Auto-deploy to GitHub Pages
```

---

## Deploy to batttehran.com — Step by Step

### Step 1: Push to GitHub

```bash
# If you haven't initialised git yet:
git init
git add .
git commit -m "🚀 Initial FORGE launch"

# Create a new repo on GitHub named: forge (or batttehran)
# Then:
git remote add origin https://github.com/YOUR_USERNAME/forge.git
git branch -M main
git push -u origin main
```

### Step 2: Enable GitHub Pages

1. Go to your repo on GitHub
2. Click **Settings** → **Pages** (left sidebar)
3. Under **Source**, select **GitHub Actions**
4. The workflow in `.github/workflows/deploy.yml` will auto-run
5. Your site will be live at `https://YOUR_USERNAME.github.io/forge`

### Step 3: Connect batttehran.com

#### At your domain registrar (GoDaddy / Namecheap / etc):

Add these DNS records:

| Type  | Host | Value                  |
|-------|------|------------------------|
| A     | @    | 185.199.108.153        |
| A     | @    | 185.199.109.153        |
| A     | @    | 185.199.110.153        |
| A     | @    | 185.199.111.153        |
| CNAME | www  | YOUR_USERNAME.github.io |

#### On GitHub:

1. Go to repo **Settings** → **Pages**
2. Under **Custom domain**, type: `batttehran.com`
3. Click **Save**
4. Check **Enforce HTTPS** (after DNS propagates — can take up to 48h)

The `CNAME` file in the repo root is already set to `batttehran.com` — GitHub reads this automatically.

---

## What's Built

### Pages
- **Landing page** (`/`) — Hero, manifesto, features, interest selector, waitlist form
- **Dashboard** (`/dashboard.html`) — Full 6-page app:
  - Command Center — Life score, quick stats, heatmap, life areas, AI insights
  - Daily Upgrade — Mission board with XP, category filter, live toggle
  - Life Map — 8 domains with clickable deep-dive detail panel
  - Analytics — Weekly charts, domain breakdown, time tracking
  - Smart Feed — Curated content by interest
  - Private Circle — Anonymous community posts + circles

### Features
- Dark cinematic UI (custom CSS design system)
- XP system with level progression
- Consistency heatmap (90 days)
- AI-style insights panel
- Interactive missions (click to complete, XP updates)
- Domain deep-dive with sparkline charts
- Waitlist email capture with localStorage
- Mobile responsive
- Sticky nav with blur effect
- Animated stat counters

---

## Next Steps to Build Out

1. **Backend** — Supabase (free) for real user auth + data storage
2. **Auth** — Supabase Auth or Clerk for sign-in
3. **Database** — Store missions, XP, streaks, domain scores per user
4. **AI Insights** — Connect Claude API for real pattern analysis
5. **Community** — Add real-time posts with Supabase Realtime
6. **Mobile App** — React Native with shared logic

---

## Tech Stack

| Layer      | Choice                        |
|------------|-------------------------------|
| Frontend   | Vanilla HTML/CSS/JS (no build step) |
| Hosting    | GitHub Pages (free)           |
| Domain     | batttehran.com (your domain)  |
| Auth (next)| Supabase Auth                 |
| DB (next)  | Supabase PostgreSQL           |
| AI (next)  | Anthropic Claude API          |

---

Built for modern students. Not for everyone.
**FORGE · batttehran.com**
