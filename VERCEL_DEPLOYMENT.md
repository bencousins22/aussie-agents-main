# Deploying React Frontend to Vercel

## Quick Configuration

When setting up your project in Vercel, use these exact settings:

### Project Settings
- **Framework Preset**: `Vite`
- **Root Directory**: `./` (leave as root)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

## Environment Variables

### For Testing with Local Backend (Using Tunnel)
1. Start your Docker backend:
   ```bash
   cd /Users/jamie/CascadeProjects/agent-zero/docker/run
   docker-compose -f docker-compose-react.yml up -d
   ```

2. Create a tunnel to expose your local backend:
   ```bash
   # Option A: Using Serveo (no installation needed)
   ssh -R 80:localhost:50001 serveo.net
   # This will give you a URL like: https://abc123.serveo.net
   
   # Option B: Using Ngrok (requires installation)
   ngrok http 50001
   # This will give you a URL like: https://abc-123-456.ngrok-free.app
   ```

3. In Vercel dashboard, add environment variable:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://your-tunnel-url.serveo.net` (replace with your actual tunnel URL)

### For Production Backend
If your backend is deployed separately:
- **Key**: `VITE_API_URL`
- **Value**: `https://your-backend-domain.com`

## Step-by-Step Deployment

### 1. Push to GitHub
Your code is already pushed! ✅
Repository: `https://github.com/bencousins22/aussie-agents-main`

### 2. Connect to Vercel
1. Go to https://vercel.com/new
2. Select "Import Git Repository"
3. Choose: `bencousins22/aussie-agents-main`
4. Click "Import"

### 3. Configure Build Settings
```
Framework Preset:     Vite
Root Directory:       ./
Build Command:        npm run build
Output Directory:     dist
Install Command:      npm install
```

### 4. Add Environment Variables
In the "Environment Variables" section:

**Option A - Local Backend with Tunnel:**
```
VITE_API_URL = https://your-serveo-url.serveo.net
```

**Option B - Demo/Static (no backend):**
```
VITE_API_URL = https://demo-api.example.com
```

### 5. Deploy
Click "Deploy" and wait for build to complete (2-3 minutes)

## After Deployment

Your frontend will be available at:
`https://aussie-agents-main.vercel.app` (or similar)

### Testing the Deployment

1. **Frontend Only** (should work immediately):
   - UI loads ✅
   - Login page displays ✅
   
2. **With Backend Connection** (requires tunnel or deployed backend):
   - Login works ✅
   - Chat functions ✅
   - API calls succeed ✅

## Authentication Setup

Your login credentials:
- **Username**: `jamie`
- **Password**: `jamie`

These are configured in your backend `.env` file.

## Architecture Options

### Option 1: Split Deployment (Recommended for Production)
```
Vercel (Frontend)  →  Railway/Render (Backend)
     ↓                        ↓
  React UI              Docker Container
                      (Agent Zero Backend)
```

### Option 2: Local Backend with Tunnel (Good for Testing)
```
Vercel (Frontend)  →  Tunnel  →  Your Computer
     ↓                  ↓              ↓
  React UI          Serveo/        Docker
                    Ngrok       (port 50001)
```

### Option 3: Full Stack on One Platform
Deploy everything to Railway, Render, or Fly.io

## Common Issues

### Issue: "Failed to fetch" errors
**Solution**: Make sure your `VITE_API_URL` is set correctly and the backend is accessible

### Issue: CORS errors
**Solution**: Your backend needs to allow requests from your Vercel domain. Add to your Docker environment:
```yaml
environment:
  - CORS_ORIGINS=https://your-app.vercel.app
```

### Issue: Build fails on Vercel
**Solution**: Check that all dependencies are in `package.json`, not just `devDependencies`

## Next Steps

1. ✅ Code pushed to GitHub
2. ⏳ Deploy to Vercel (follow steps above)
3. ⏳ Set up backend tunnel or deploy backend
4. ⏳ Configure VITE_API_URL
5. ⏳ Test login and functionality

## Local Development

To run the React app locally:
```bash
cd /Users/jamie/CascadeProjects/agent-zero/webui-react
npm install
npm run dev
```

This will start dev server on http://localhost:5173 with proxy to localhost:50080

## Production Build Test Locally

To test the production build locally:
```bash
cd /Users/jamie/CascadeProjects/agent-zero/webui-react
npm run build
npm run preview
```

This mimics Vercel's production environment.
