# Agent Zero - React UI with Authentication Setup

## Quick Start (One Command)

```bash
cd /Users/jamie/CascadeProjects/agent-zero/docker/run
./build-and-run-react.sh
```

## Login Credentials

**Web UI Login:**
- Username: `jamie`
- Password: `jamie`
- URL: http://localhost:50001

**SSH Access:**
- Command: `ssh root@localhost -p 2222`
- Password: `jamie`

## What This Setup Includes

✅ React frontend (webui-react) on port 50001
✅ Backend API integrated with frontend
✅ Authentication configured
✅ SSH access on port 2222
✅ All environment variables loaded from .env

## Testing Your Setup

After running the build script, test everything:

```bash
./test-setup.sh
```

This will check:
- Container is running
- Web UI is accessible
- API is responding
- SSH port is open
- Show recent logs

## Architecture

```
┌─────────────────────────────────────┐
│  Your Browser                        │
│  http://localhost:50001              │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│  Docker Container (agent-zero-react)│
│                                      │
│  ┌────────────────────────────────┐ │
│  │ React Frontend (Port 80)       │ │
│  │ - Served by Flask              │ │
│  │ - Built from webui-react/dist  │ │
│  └────────────────────────────────┘ │
│                                      │
│  ┌────────────────────────────────┐ │
│  │ Flask Backend API              │ │
│  │ - Authentication: jamie/jamie  │ │
│  │ - Endpoints: /poll, /message   │ │
│  └────────────────────────────────┘ │
│                                      │
│  ┌────────────────────────────────┐ │
│  │ SSH Server (Port 22)           │ │
│  │ - root login with password     │ │
│  └────────────────────────────────┘ │
└─────────────────────────────────────┘
         │                   │
    Port 50001          Port 2222
    (Web UI)            (SSH)
```

## Frontend-Backend Communication

The React frontend and Flask backend communicate seamlessly because:

1. **Same Origin**: Both are served from the same domain (localhost:50001)
2. **Session Cookies**: Flask manages authentication via session cookies
3. **No CORS Issues**: Since it's same-origin, no CORS configuration needed
4. **API Endpoints**: React makes requests to `/poll`, `/message`, `/health`, etc.

## Environment Variables

All credentials are loaded from `/Users/jamie/CascadeProjects/agent-zero/.env`:

```bash
ROOT_PASSWORD=jamie          # SSH password
AUTH_LOGIN=jamie            # Web UI username
AUTH_PASSWORD=jamie         # Web UI password
```

Plus all your API keys (Anthropic, OpenAI, etc.)

## Common Operations

### Start Everything
```bash
cd /Users/jamie/CascadeProjects/agent-zero/docker/run
./build-and-run-react.sh
```

### Stop Container
```bash
docker-compose -f docker-compose-react.yml down
```

### Restart Container
```bash
docker-compose -f docker-compose-react.yml restart
```

### View Logs
```bash
docker logs -f agent-zero-react
```

### Rebuild React Only (Fast)
```bash
./rebuild-react.sh
```

### SSH into Container
```bash
ssh root@localhost -p 2222
# Password: jamie
```

### Check Status
```bash
./test-setup.sh
```

## Troubleshooting

### Can't Login to Web UI

1. Check .env file has credentials:
```bash
grep -E "AUTH_LOGIN|AUTH_PASSWORD" /Users/jamie/CascadeProjects/agent-zero/.env
```

2. Check container logs for authentication errors:
```bash
docker logs agent-zero-react | grep -i auth
```

3. Clear browser cookies and try again

### Frontend Not Loading

1. Check React build exists:
```bash
ls -la /Users/jamie/CascadeProjects/agent-zero/webui-react/dist/
```

2. Rebuild if needed:
```bash
cd /Users/jamie/CascadeProjects/agent-zero/webui-react
npm run build -- --config vite.config.prod.ts
```

### API Calls Failing

1. Check backend is running:
```bash
docker exec agent-zero-react ps aux | grep python
```

2. Test API health:
```bash
curl http://localhost:50001/health
```

3. Check logs for errors:
```bash
docker logs agent-zero-react | grep -i error
```

### SSH Connection Refused

1. Check SSH port is exposed:
```bash
docker port agent-zero-react
```

2. Test port connectivity:
```bash
nc -zv localhost 2222
```

3. Check SSH is running in container:
```bash
docker exec agent-zero-react ps aux | grep sshd
```

## Development Workflow

### Making React Changes

1. Edit files in `webui-react/src/`
2. Rebuild and restart:
```bash
cd /Users/jamie/CascadeProjects/agent-zero/docker/run
./rebuild-react.sh
```
3. Refresh browser (Cmd+Shift+R to clear cache)

### Making Backend Changes

1. Edit Python files in project
2. Restart container:
```bash
docker-compose -f docker-compose-react.yml restart
```

### Updating Environment Variables

1. Edit `/Users/jamie/CascadeProjects/agent-zero/.env`
2. Restart container to apply changes:
```bash
docker-compose -f docker-compose-react.yml restart
```

## Files Reference

- **Docker Config**: `docker/run/docker-compose-react.yml`
- **Build Script**: `docker/run/build-and-run-react.sh`
- **Test Script**: `docker/run/test-setup.sh`
- **Rebuild Script**: `docker/run/rebuild-react.sh`
- **Environment**: `.env` (project root)
- **React Source**: `webui-react/src/`
- **React Build**: `webui-react/dist/`
- **Vite Config (Prod)**: `webui-react/vite.config.prod.ts`

## Next Steps

1. ✅ Run the setup: `./build-and-run-react.sh`
2. ✅ Test it works: `./test-setup.sh`
3. ✅ Open browser: http://localhost:50001
4. ✅ Login with jamie/jamie
5. ✅ Start using Agent Zero!
