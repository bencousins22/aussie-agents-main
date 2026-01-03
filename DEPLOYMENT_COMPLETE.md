# 🚀 Agent Zero Full Deployment - Complete Setup

## ✅ Deployment Status: LIVE

### 🌐 Frontend (Vercel)
**Production URL**: https://webui-react.vercel.app
**Alternate URL**: https://webui-react-o9sbo185t-biometglobal-4609s-projects.vercel.app

### 🔧 Backend (Docker + ngrok)
**ngrok Public URL**: https://8ff34e626486.ngrok-free.app
**Local Docker**: http://localhost:50001
**SSH Access**: `ssh root@localhost -p 2222`

### 🔑 Login Credentials
- **Username**: jamie
- **Password**: jamie
- **SSH Password**: jamie

---

## 📊 Current Configuration

### Frontend (Vercel)
- Framework: Vite + React 19.2.3
- Build Command: `vite build`
- Output Directory: `dist`
- Environment Variable: `VITE_API_URL=https://8ff34e626486.ngrok-free.app`

### Backend (Docker)
- Container: `agent-zero-react`
- Image: `agent0ai/agent-zero:latest`
- Ports:
  - 50001 → 80 (Web UI)
  - 2222 → 22 (SSH)
- Status: ✅ Running

### Tunnel (ngrok)
- Auth Token: Configured ✅
- Protocol: HTTPS
- Local Port: 50001
- Public URL: https://8ff34e626486.ngrok-free.app

---

## 🔗 Architecture

```
┌─────────────────────────────────────────┐
│  User Browser                           │
│  https://webui-react.vercel.app         │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  Vercel (React Frontend)                │
│  - Serves static React build            │
│  - VITE_API_URL env variable            │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  ngrok Tunnel                           │
│  https://8ff34e626486.ngrok-free.app    │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  Your Mac (localhost:50001)             │
│  ┌───────────────────────────────────┐  │
│  │ Docker Container                  │  │
│  │ agent0ai/agent-zero:latest        │  │
│  │                                   │  │
│  │ Flask Backend + Agent Zero        │  │
│  │ Port 80 → 50001                   │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

---

## 🛠️ Management Commands

### Check Status
```bash
# Check Docker container
docker ps | grep agent-zero-react

# Check ngrok tunnel
curl -s http://localhost:4040/api/tunnels | python3 -m json.tool

# View Docker logs
docker logs -f agent-zero-react
```

### Start/Stop Backend
```bash
cd /Users/jamie/CascadeProjects/agent-zero/docker/run

# Start
docker-compose -f docker-compose-react.yml up -d

# Stop
docker-compose -f docker-compose-react.yml down

# Restart
docker-compose -f docker-compose-react.yml restart
```

### Restart ngrok Tunnel
```bash
# Kill existing ngrok
killall ngrok

# Start new tunnel
ngrok http 50001 --log=stdout > /tmp/ngrok.log 2>&1 &

# Get new URL
sleep 3
curl -s http://localhost:4040/api/tunnels | python3 -c "import sys, json; print(json.load(sys.stdin)['tunnels'][0]['public_url'])"

# Update Vercel with new URL (if ngrok URL changes)
cd /Users/jamie/CascadeProjects/agent-zero/webui-react
vercel env rm VITE_API_URL production --token [YOUR_VERCEL_TOKEN] --yes
vercel env add VITE_API_URL production --token [YOUR_VERCEL_TOKEN] <<< "NEW_NGROK_URL"
vercel --prod --token [YOUR_VERCEL_TOKEN]
```

### Deploy Frontend Changes
```bash
cd /Users/jamie/CascadeProjects/agent-zero/webui-react

# Make your changes, then:
git add .
git commit -m "Your changes"
git push

# Deploy to Vercel
vercel --prod --token [YOUR_VERCEL_TOKEN]
```

---

## 📁 Important Files

### Configuration
- `/Users/jamie/CascadeProjects/agent-zero/.env` - Backend environment variables
- `/Users/jamie/CascadeProjects/agent-zero/docker/run/docker-compose-react.yml` - Docker config
- `/Users/jamie/CascadeProjects/agent-zero/webui-react/vercel.json` - Vercel config
- `~/Library/Application Support/ngrok/ngrok.yml` - ngrok config

### Scripts
- `/Users/jamie/CascadeProjects/agent-zero/docker/run/build-and-run-react.sh` - Full setup script
- `/Users/jamie/CascadeProjects/agent-zero/docker/run/rebuild-react.sh` - Quick rebuild
- `/Users/jamie/CascadeProjects/agent-zero/docker/run/test-setup.sh` - Test everything

---

## 🔧 Tokens & Keys

### GitHub
- Repository: `https://github.com/bencousins22/aussie-agents-main`
- Token: `[REDACTED - Use GitHub CLI or personal access token]`

### ngrok
- Auth Token: `[REDACTED - Configure via ngrok config add-authtoken]`
- Dashboard: https://dashboard.ngrok.com

### Vercel
- Token: `[REDACTED - Use vercel login or environment variable]`
- Dashboard: https://vercel.com/dashboard
- Project: webui-react

---

## 🐛 Troubleshooting

### Frontend shows "Failed to fetch"
1. Check if ngrok is running: `curl http://localhost:4040/status`
2. Check if Docker is running: `docker ps | grep agent-zero-react`
3. Verify Vercel env var: Should be set to ngrok URL
4. Check ngrok URL is accessible: `curl https://8ff34e626486.ngrok-free.app/health`

### ngrok URL changed
ngrok free tier gives you a new URL each restart. If URL changes:
1. Get new URL: `curl -s http://localhost:4040/api/tunnels`
2. Update Vercel (see commands above)
3. Redeploy frontend

### Login not working
1. Check .env file has: `AUTH_LOGIN=jamie` and `AUTH_PASSWORD=jamie`
2. Restart Docker: `docker-compose -f docker-compose-react.yml restart`
3. Check logs: `docker logs agent-zero-react | grep -i auth`

### Can't SSH into container
```bash
ssh root@localhost -p 2222
# Password: jamie

# If permission denied, check container is running
docker ps | grep agent-zero-react
```

---

## 🎯 Next Steps

1. ✅ Frontend deployed to Vercel
2. ✅ Backend running in Docker
3. ✅ ngrok tunnel exposing backend
4. ✅ Everything connected and working

### To Use Your App:
1. Go to: https://webui-react.vercel.app
2. Login with: jamie / jamie
3. Start chatting with Agent Zero!

### To Keep It Running:
- Keep Docker container running
- Keep ngrok tunnel running
- ngrok free tier URL expires after 2 hours - restart tunnel as needed

### To Make It Permanent:
Consider deploying backend to a cloud service:
- Railway
- Render
- Fly.io
- DigitalOcean

This eliminates the need for ngrok and keeps everything online 24/7.

---

## 📞 Quick Access

- **Live App**: https://webui-react.vercel.app
- **GitHub**: https://github.com/bencousins22/aussie-agents-main
- **Vercel Dashboard**: https://vercel.com/biometglobal-4609s-projects/webui-react
- **ngrok Dashboard**: https://dashboard.ngrok.com

---

**Last Updated**: January 3, 2026  
**Status**: ✅ Fully Operational
