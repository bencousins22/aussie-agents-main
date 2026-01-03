# Docker compose configuration for Agent Zero with React UI
# Frontend: http://localhost:50001
# API: http://localhost:50080

This setup uses the React-based frontend from `webui-react` instead of the default webui.

## Quick Start

### Build and run with docker-compose:
```bash
docker-compose -f docker-compose.react.yml up --build
```

### Or run in detached mode:
```bash
docker-compose -f docker-compose.react.yml up -d --build
```

### Stop the container:
```bash
docker-compose -f docker-compose.react.yml down
```

## Accessing the Application

- **Frontend (React UI)**: http://localhost:50001
- **API Backend**: http://localhost:50080
- **SSH Access**: localhost:2222

## Ports

- `50001`: React frontend (mapped to container port 80)
- `50080`: API backend
- `2222`: SSH access (mapped to container port 22)
- `9000-9009`: Additional services

## Volumes

The following directories are mounted for persistence:
- `./memory` - Agent memory storage
- `./knowledge` - Knowledge base
- `./logs` - Application logs
- `./tmp` - Temporary files
- `./usr` - User data and projects

## Development

### Rebuild after code changes:
```bash
docker-compose -f docker-compose.react.yml up --build
```

### Force rebuild with cache busting:
```bash
CACHE_DATE=$(date +%s) docker-compose -f docker-compose.react.yml build --no-cache
docker-compose -f docker-compose.react.yml up
```

### View logs:
```bash
docker-compose -f docker-compose.react.yml logs -f
```

### Execute commands in running container:
```bash
docker-compose -f docker-compose.react.yml exec agent-zero-react bash
```

## Building the React Frontend Separately

If you want to test the React build locally before Docker:
```bash
cd webui-react
npm install
npm run build
```

The built files will be in `webui-react/dist/`

## Troubleshooting

### Container won't start
Check logs: `docker-compose -f docker-compose.react.yml logs`

### Port already in use
Change the port mapping in docker-compose.react.yml:
```yaml
ports:
  - "YOUR_PORT:80"  # Change YOUR_PORT to an available port
```

### Frontend not updating
Rebuild with no cache:
```bash
docker-compose -f docker-compose.react.yml build --no-cache
```
