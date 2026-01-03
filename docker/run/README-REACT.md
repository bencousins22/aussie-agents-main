# Agent Zero with React Frontend on Port 50001

This setup allows you to run Agent Zero with the modern React frontend (webui-react) instead of the traditional webui, served on port 50001.

## Quick Start

### Option 1: One Command Setup (Recommended)
```bash
cd /Users/jamie/CascadeProjects/agent-zero/docker/run
./build-and-run-react.sh
```

This script will:
1. Build the React frontend from webui-react/
2. Stop any existing container
3. Start Agent Zero with the React UI on port 50001

### Option 2: Manual Steps
```bash
# 1. Build React frontend
cd /Users/jamie/CascadeProjects/agent-zero/webui-react
npm install
npm run build -- --config vite.config.prod.ts

# 2. Start Docker container
cd /Users/jamie/CascadeProjects/agent-zero/docker/run
docker-compose -f docker-compose-react.yml up -d
```

## Accessing Your Application

- **Frontend (React UI)**: http://localhost:50001
- **API Backend**: http://localhost:50001 (same server)
- **Container Logs**: `docker logs -f agent-zero-react`

## Development Workflow

### Quick Rebuild After React Changes
When you make changes to the React code and want to see them:

```bash
cd /Users/jamie/CascadeProjects/agent-zero/docker/run
./rebuild-react.sh
```

This quickly rebuilds just the React frontend and restarts the container (much faster than a full rebuild).

### Stop the Container
```bash
cd /Users/jamie/CascadeProjects/agent-zero/docker/run
docker-compose -f docker-compose-react.yml down
```

### View Logs
```bash
docker logs -f agent-zero-react
```

### Restart Container
```bash
cd /Users/jamie/CascadeProjects/agent-zero/docker/run
docker-compose -f docker-compose-react.yml restart
```

## How It Works

The setup uses your existing `agent0ai/agent-zero:latest` Docker image with a key modification:

1. **Volume Mount**: The React build output (`webui-react/dist`) is mounted to `/a0/webui` inside the container
2. **Flask Serving**: The Flask backend (run_ui.py) serves these React files as static content
3. **Port Mapping**: Container port 80 is mapped to host port 50001

### Docker Compose Configuration
Location: `/Users/jamie/CascadeProjects/agent-zero/docker/run/docker-compose-react.yml`

```yaml
services:
  agent-zero-react:
    container_name: agent-zero-react
    image: agent0ai/agent-zero:latest
    volumes:
      - ../../:/a0                      # Project root
      - ../../webui-react/dist:/a0/webui  # React build replaces webui
    ports:
      - "50001:80"                      # Expose on port 50001
```

## Troubleshooting

### Port 50001 Already in Use
Check what's using the port:
```bash
lsof -i :50001
```

Kill the process or change the port in docker-compose-react.yml:
```yaml
ports:
  - "YOUR_PORT:80"  # Change YOUR_PORT to an available port
```

### React Build Fails
Make sure you have the dependencies installed:
```bash
cd /Users/jamie/CascadeProjects/agent-zero/webui-react
rm -rf node_modules package-lock.json
npm install
npm run build -- --config vite.config.prod.ts
```

### Container Won't Start
Check the logs:
```bash
docker logs agent-zero-react
```

Common issues:
- **Missing dist folder**: Run the build script first
- **Port conflict**: Change the port mapping in docker-compose-react.yml
- **Volume permissions**: Ensure Docker has permission to access your project directory

### React App Shows But API Calls Fail
This usually means the backend isn't running properly. Check:
```bash
# Check if container is running
docker ps | grep agent-zero-react

# Check backend logs
docker logs agent-zero-react | grep -i error

# Check if Flask is running inside container
docker exec agent-zero-react ps aux | grep python
```

### Changes to React Code Not Appearing
1. Make sure you rebuilt: `./rebuild-react.sh`
2. Clear browser cache (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows/Linux)
3. Check that dist folder was updated:
   ```bash
   ls -la /Users/jamie/CascadeProjects/agent-zero/webui-react/dist/
   ```

## File Structure

```
agent-zero/
├── docker/
│   └── run/
│       ├── docker-compose-react.yml      # React configuration
│       ├── build-and-run-react.sh        # Full build script
│       ├── rebuild-react.sh              # Quick rebuild script
│       └── README-REACT.md               # This file
├── webui-react/
│   ├── src/                              # React source code
│   ├── dist/                             # Built files (mounted to container)
│   ├── vite.config.ts                    # Dev config
│   └── vite.config.prod.ts               # Production config
└── webui/                                # Original webui (not used with React)
```

## Configuration Files

### Production Build Config
Location: `webui-react/vite.config.prod.ts`

This config is optimized for production builds served by Flask:
- No dev server proxying
- Minified output
- Asset optimization
- Base path set to `/`

### Development Config
Location: `webui-react/vite.config.ts`

Use this when running React dev server locally (not in Docker):
```bash
cd webui-react
npm run dev
```

## Comparing to Standard Setup

### Standard webui (docker-compose.yml)
- Uses original JavaScript webui
- Runs on port 50080
- Older UI design

### React webui-react (docker-compose-react.yml)
- Uses modern React frontend
- Runs on port 50001
- Modern component-based UI
- TypeScript support
- Better developer experience

## Advanced Usage

### Using Your Existing Images
This setup works with your existing Docker images:
- `agent0ai/agent-zero:latest` (configured)
- `agent0ai/agent-zero:dbf3a10c42f3` (with-flask-cors)
- `agent-zero-with-files:latest`

To use a different image, edit docker-compose-react.yml:
```yaml
image: agent0ai/agent-zero:dbf3a10c42f3  # or your preferred image
```

### Environment Variables
Add environment variables in docker-compose-react.yml:
```yaml
environment:
  - BRANCH=local
  - YOUR_API_KEY=xxx
  - CUSTOM_SETTING=value
```

### Additional Volume Mounts
Add more volumes as needed:
```yaml
volumes:
  - ../../:/a0
  - ../../webui-react/dist:/a0/webui
  - ./my-data:/a0/custom-data  # Add custom mounts
```

## Next Steps

1. **First Time**: Run `./build-and-run-react.sh`
2. **After React Changes**: Run `./rebuild-react.sh`
3. **View Your App**: http://localhost:50001

## Support

For issues:
1. Check the logs: `docker logs agent-zero-react`
2. Verify React build: `ls -la webui-react/dist/`
