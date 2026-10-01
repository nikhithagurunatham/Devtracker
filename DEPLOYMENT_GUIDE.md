# 🚀 DevTrack AI — Vercel Production Deployment Guide

Deploying DevTrack AI to Vercel takes about **2 minutes**. Follow these simple steps:

---

## 🌟 Method 1: Deploy with GitHub & Vercel (Recommended)

### Step 1: Create a GitHub Repository & Push Code
Your local Git repository is already initialized and all files are committed. Run the following in your terminal:

```bash
# 1. Create a new repository on GitHub named "devtrack-ai" (keep it Public or Private)

# 2. Link your local repo to GitHub (replace with your GitHub username):
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/devtrack-ai.git
git branch -M main
git push -u origin main
```

---

### Step 2: Import Project into Vercel
1. Open [https://vercel.com/new](https://vercel.com/new).
2. Sign in with GitHub.
3. Click **"Import"** next to your `devtrack-ai` repository.
4. Vercel will automatically detect **Next.js**.

---

### Step 3: Add Free Cloud PostgreSQL Database
DevTrack AI requires PostgreSQL for user accounts, roadmaps, and progress tracking:

**Choice A — Vercel Postgres (Fastest):**
- In your Vercel project dashboard, go to the **Storage** tab.
- Click **Create Database** ➔ **Postgres**.
- Vercel automatically injects `DATABASE_URL` into your environment variables!

**Choice B — Neon or Supabase (Free Tier):**
- Create a free database at [neon.tech](https://neon.tech) or [supabase.com](https://supabase.com).
- Copy the Connection String (starts with `postgresql://...`).
- Add it in Vercel under **Settings ➔ Environment Variables** as `DATABASE_URL`.

---

### Step 4: Configure Production Environment Variables
In the Vercel deployment screen under **Environment Variables**, add the following 3 variables:

| Variable | Value | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://...` | Connection string to your cloud PostgreSQL database |
| `NEXTAUTH_SECRET` | `4b7e8f1c9d2a3e5b6f0a1c2d3e4f5a6b` | Any random 32+ character secret string |
| `NEXTAUTH_URL` | `https://your-project-name.vercel.app` | Your assigned Vercel URL (or update after first deploy) |
| `GEMINI_API_KEY` | *(Optional)* | Your Google Gemini API key for AI mentor chat & parsing |

---

### Step 5: Deploy!
- Click **"Deploy"**.
- Vercel will run `prisma generate` and build the application.
- Once finished, you will receive your live URL: **`https://devtrack-ai.vercel.app`** 🎉!

---

## ⚡ Method 2: Deploy Directly via Terminal CLI

If you prefer to deploy straight from PowerShell without opening GitHub:

1. **Log in to Vercel:**
   ```bash
   npx vercel login
   ```
   *(A browser window will open to authorize your account)*

2. **Deploy to Production:**
   ```bash
   npx vercel --prod
   ```

3. Follow the CLI prompts:
   - *Set up and deploy?* ➔ `Y`
   - *Which scope?* ➔ Select your account
   - *Link to existing project?* ➔ `N`
   - *What's your project's name?* ➔ `devtrack-ai`
   - *In which directory is your code located?* ➔ `./`

4. When deployment completes, open your project dashboard on [vercel.com](https://vercel.com) to add your `DATABASE_URL` and `NEXTAUTH_SECRET`.
