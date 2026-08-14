# YABBOK Fellowship Platform - Cloud Production Deployment Guide

This guide provides step-by-step instructions to deploy the YABBOK Fellowship Platform to Vercel and MongoDB Atlas.

---

## 1. Database Setup (MongoDB Atlas)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free or dedicated cluster.
2. In **Database Access**, create a database user with read/write access.
3. In **Network Access**, add `0.0.0.0/0` (Allow Access from Anywhere) or Vercel's IP ranges.
4. Copy your MongoDB Atlas connection string (e.g. `mongodb+srv://user:pass@cluster.mongodb.net/yabbok?retryWrites=true&w=majority`).

---

## 2. Deploy to Vercel (Recommended)
1. Push your repository to GitHub / GitLab / Bitbucket.
2. Log in to [Vercel](https://vercel.com) and click **Add New Project**.
3. Import your `Yabbok2` repository and set the Root Directory to `frontend`.
4. Under **Environment Variables**, add:
   - `MONGODB_URI`: Your MongoDB Atlas URI.
   - `NEXTAUTH_SECRET`: A 32-character secret key.
   - `NEXTAUTH_URL`: Your Vercel production URL (e.g. `https://yabbok.vercel.app` or custom domain `https://yabbok.org`).
5. Click **Deploy**.

---

## 3. Post-Deployment Database Seeding
After your site is deployed to Vercel:
1. Open PowerShell or a terminal.
2. Run the seeding endpoint to populate churches, admin user, and initial content:
   ```bash
   curl -X POST https://your-app-domain.com/api/seed
   ```
3. Log in with the pre-seeded admin account:
   - **Email:** `admin@yabbok.org`
   - **Password:** `Admin123!`
