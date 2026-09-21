# ⚡ Quick Deployment Guide

The repository root contains `frontend/` and `backend/` directly. Use these paths in hosting settings; there is no `organic-chem-app/` parent folder.

## 🎯 Fastest Option: Vercel + Render (Recommended)

### Backend (Render) - 5 minutes

1. Go to https://render.com → Sign up
2. Click **"New +"** → **"Web Service"**
3. Connect GitHub → Select your repo
4. Settings:
   - **Name:** `moleculeai-backend`
   - **Root Directory:** `backend`
   - **Build:** `pip install -r requirements.txt`
   - **Start:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Click **"Create Web Service"**
6. Wait ~10 minutes (RDKit takes time)
7. **Copy the URL** (e.g., `https://moleculeai-backend.onrender.com`)

### Frontend (Vercel) - 3 minutes

1. Go to https://vercel.com → Sign up
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repo
4. Settings:
   - **Root Directory:** `frontend`
   - **Framework:** Vite (auto-detected)
   - **Build:** `npm run build`
   - **Output Directory:** `dist`
   - **Environment Variable:**
     - Key: `VITE_API_URL`
     - Value: `https://your-backend-url.onrender.com/api` (replace with your backend's public URL before building)
5. Click **"Deploy"**
6. Wait ~2 minutes
7. **Copy the frontend URL**

### Update CORS

1. Go back to Render dashboard
2. Edit your backend service
3. Add Environment Variable:
   - Key: `CORS_ORIGINS`
   - Value: `https://your-frontend-url.vercel.app`
4. Save → Auto-redeploys

**Done! 🎉** Your app is live!

---

## 🚂 Alternative: Railway (All-in-One)

1. Go to https://railway.app → Sign up
2. **New Project** → **Deploy from GitHub**
3. Add **Backend Service:**
   - Root: `backend`
   - Build: `pip install -r requirements.txt`
   - Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add **Frontend Service:**
   - Root: `frontend`
   - Build: `npm install && npm run build`
   - Start: `npx serve -s dist -l $PORT`
   - Build environment: `VITE_API_URL=https://your-backend-domain/api` (use the backend service's URL)
5. Generate domains for both
6. Update backend CORS with frontend URL

**Done! 🎉**

---

## 📝 Environment Variables

### Frontend
```
VITE_API_URL=https://your-backend-url.com/api
```

Set this in the hosting platform's build environment, or in `frontend/.env.local` for local development. Vite embeds it during the build, so rebuild and redeploy after changing it. Keep the `/api` suffix and omit the trailing slash.

### Backend
```
CORS_ORIGINS=https://your-frontend-url.com
PORT=8000
```

Set these in the host's service environment. The backend does not automatically load a `.env` file; local shell sessions must export `CORS_ORIGINS` before starting Uvicorn. Origins must have no path or trailing slash. The deployment command passes the host's `PORT` with `--port $PORT`.

---

## ✅ Test Your Deployment

1. Visit your frontend URL
2. Search for "Caffeine"
3. Check if structure loads
4. Try 3D view
5. Check browser console for errors

---

## 🆘 Need Help?

- **CORS errors?** → Update `CORS_ORIGINS` in backend
- **Backend won't start?** → Check Render/Railway logs
- **3D not working?** → Check browser console

See `DEPLOY.md` for detailed troubleshooting.
