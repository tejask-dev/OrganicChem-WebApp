# 🚀 Deployment Guide - MoleculeAI

This guide covers deploying your Organic Chemistry Structure ↔ Name Conversion app to production.

All hosting root directories are relative to the Git checkout: use `frontend` or `backend`. The repository does not contain an `organic-chem-app/` wrapper folder. Shell examples assume Bash/zsh.

## 📋 Pre-Deployment Checklist

- [ ] Code is pushed to GitHub
- [ ] All tests pass locally
- [ ] Environment variables are configured
- [ ] CORS settings are updated for production

---

## 🎯 Recommended: Vercel (Frontend) + Render (Backend)

**Best for:** Free tier, easy setup, automatic deployments

### Step 1: Deploy Backend to Render

1. **Go to [render.com](https://render.com)** and sign up/login
2. **Click "New +" → "Web Service"**
3. **Connect your GitHub repository**
4. **Configure the service:**
   - **Name:** `moleculeai-backend`
   - **Region:** Choose closest to your users
   - **Branch:** `main` (or your main branch)
   - **Root Directory:** `backend`
   - **Runtime:** `Python 3`
   - **Build Command:** 
     ```bash
     pip install -r requirements.txt
     ```
   - **Start Command:**
     ```bash
     uvicorn app.main:app --host 0.0.0.0 --port $PORT
     ```
   - **Environment Variables:**
     ```
     CORS_ORIGINS=https://your-frontend-url.vercel.app
     PORT=10000
     ```

5. **Click "Create Web Service"**
6. **Wait for deployment** (first build takes ~5-10 minutes due to RDKit)
7. **Copy your backend URL** (e.g., `https://moleculeai-backend.onrender.com`)

### Step 2: Deploy Frontend to Vercel

1. **Go to [vercel.com](https://vercel.com)** and sign up/login
2. **Click "Add New..." → "Project"**
3. **Import your GitHub repository**
4. **Configure the project:**
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Environment Variables:**
     ```
     VITE_API_URL=https://your-backend-url.onrender.com/api
     ```
     (Replace with your actual Render backend URL before building. Changes require a new frontend build/deployment.)

5. **Click "Deploy"**
6. **Wait for deployment** (~2-3 minutes)
7. **Copy your frontend URL** (e.g., `https://moleculeai.vercel.app`)

### Step 3: Update CORS in Backend

1. Go back to Render dashboard
2. Edit your backend service
3. Update environment variable:
   ```
   CORS_ORIGINS=https://your-frontend-url.vercel.app
   ```
4. Save and redeploy

---

## 🚂 Alternative: Railway (Full Stack)

**Best for:** Simpler setup, one platform for everything

### Step 1: Deploy to Railway

1. **Go to [railway.app](https://railway.app)** and sign up/login
2. **Click "New Project" → "Deploy from GitHub repo"**
3. **Select your repository**

### Step 2: Add Backend Service

1. **Click "+ New" → "GitHub Repo"** (or add service)
2. **Configure:**
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Environment Variables:**
     ```
     CORS_ORIGINS=https://your-frontend-domain
     ```

3. **Generate Domain** (click "Settings" → "Generate Domain")
4. **Copy backend URL**

### Step 3: Add Frontend Service

1. **Click "+ New" → "GitHub Repo"** again
2. **Configure:**
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npx serve -s dist -l $PORT`
   - **Environment Variables:**
     ```
     VITE_API_URL=https://your-backend-domain/api
     ```

3. **Generate Domain** for frontend
4. **Update backend CORS** with frontend URL

Use the backend service's public URL for `VITE_API_URL`, and set it before the frontend build. Use the frontend service's public origin for `CORS_ORIGINS`. The start commands read the hosting platform's `PORT` variable.

---

## 🐳 Alternative: Docker + Fly.io

**Best for:** Full control, Docker-native deployment

### Step 1: Install Fly CLI

```bash
# Windows (PowerShell)
iwr https://fly.io/install.ps1 -useb | iex

# Mac/Linux
curl -L https://fly.io/install.sh | sh
```

### Step 2: Deploy Backend

Start from the repository root (`OrganicChem-WebApp/`).

```bash
cd backend
fly launch
# Follow prompts, select region
# Set CORS_ORIGINS environment variable
fly secrets set CORS_ORIGINS=https://your-frontend-url.fly.dev
fly deploy
```

### Step 3: Deploy Frontend

Return to the repository root before running this block. The existing Nginx configuration proxies `/api/` to a Docker service named `backend`; separate Fly apps need that proxy target changed to the deployed backend before launch. Configure the Vite API URL at build time as shown below.

```bash
cd frontend
# Replace the URL with the deployed backend's public URL.
cat > .env.production.local <<'EOF'
VITE_API_URL=https://your-backend-url.fly.dev/api
EOF
fly launch
# Follow prompts
fly deploy
```

The frontend Dockerfile copies this local environment file into the build stage. Vite embeds its value in the generated JavaScript; setting a runtime Fly secret does not update it. Rebuild the frontend after any API URL change. `VITE_*` values are public browser configuration, so never put secrets in them.

---

## 🔧 Environment Variables Reference

### Frontend (`frontend/.env.local` or Vercel/Railway build settings)
```env
VITE_API_URL=https://your-backend-url.com/api
```

### Backend (process environment or Render/Railway service settings)
```env
CORS_ORIGINS=https://your-frontend-url.com
PORT=8000
```

The backend does not automatically read a `.env` file. Export `CORS_ORIGINS` in the shell or set it in the host's service environment. Its value is a comma-separated list of frontend origins without paths or trailing slashes. `PORT` is passed by the start command (`--port $PORT`), not read by the application itself.

---

## 📝 Post-Deployment Steps

1. **Test the deployment:**
   - Visit your frontend URL
   - Try searching for "Caffeine" or "Aspirin"
   - Verify 3D view works
   - Check console for errors

2. **Update CORS if needed:**
   - If you see CORS errors, update `CORS_ORIGINS` in backend

3. **Set up custom domains (optional):**
   - Vercel: Settings → Domains
   - Render: Settings → Custom Domains
   - Railway: Settings → Domains

4. **Monitor logs:**
   - Vercel: Deployments → View Function Logs
   - Render: Logs tab
   - Railway: Deployments → View Logs

---

## 🐛 Troubleshooting

### Backend won't start
- **Issue:** RDKit installation fails
- **Fix:** Use Python 3.9+ and ensure all system dependencies are installed

### CORS errors
- **Issue:** Frontend can't connect to backend
- **Fix:** Update `CORS_ORIGINS` in backend to match your frontend URL exactly

### 3D view not working
- **Issue:** NGL Viewer fails to load
- **Fix:** Check browser console, ensure NGL is loaded from CDN

### Build fails
- **Issue:** TypeScript errors or missing dependencies
- **Fix:** Run `npm install` locally first, commit `package-lock.json`

---

## 💰 Cost Estimates

- **Vercel (Frontend):** Free tier (100GB bandwidth/month)
- **Render (Backend):** Free tier (spins down after 15min inactivity)
- **Railway:** $5/month for always-on service
- **Fly.io:** Free tier (3 shared VMs)

---

## 🎉 You're Done!

Your app should now be live! Share the frontend URL with users.

**Need help?** Check the platform-specific documentation:
- [Vercel Docs](https://vercel.com/docs)
- [Render Docs](https://render.com/docs)
- [Railway Docs](https://docs.railway.app)
- [Fly.io Docs](https://fly.io/docs)
