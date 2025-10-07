# Vercel Deployment Guide for Solara

## ⚠️ IMPORTANT: Set Environment Variables in Vercel

Before redeploying, you need to add your API keys to Vercel:

### Step 1: Go to Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Select your **Solara** project
3. Click on **Settings** tab
4. Click on **Environment Variables** in the left sidebar

### Step 2: Add Environment Variables

Add these two environment variables:

#### Variable 1: REPLICATE_API_TOKEN

- **Name:** `REPLICATE_API_TOKEN`
- **Value:** Your Replicate API token (starts with `r8_...`)
- **Environment:** Select all (Production, Preview, Development)

#### Variable 2: GEMINI_API_KEY

- **Name:** `GEMINI_API_KEY`
- **Value:** Your Gemini API key
- **Environment:** Select all (Production, Preview, Development)

### Step 3: Redeploy

After adding the environment variables, redeploy your project:

```bash
vercel --prod
```

Or trigger a new deployment by pushing to GitHub:

```bash
git commit --allow-empty -m "Trigger Vercel rebuild"
git push origin master
```

## What Was Fixed?

### 🔧 File System Issue

- **Problem:** Vercel serverless functions have a read-only filesystem
- **Solution:** Changed file upload directory from `./uploads` to `/tmp` (only writable directory in Vercel)

### 📝 Server Configuration

- Added `vercel.json` for proper routing
- Modified `server.js` to:
  - Use `/tmp` directory when running on Vercel
  - Use `./uploads` when running locally
  - Export the Express app as a module for serverless
  - Only start HTTP server in local development

### 🔐 Environment Variables

- Environment variables must be set in Vercel Dashboard
- Never commit `.env` file to repository

## Testing Locally

Your app still works locally:

```bash
npm start
```

## Your Deployment URL

Once redeployed: https://solara-j4xwlc0i6-sharaf-makahlehs-projects.vercel.app

---

**Note:** If you see any errors after redeployment, check the Vercel deployment logs for details.
