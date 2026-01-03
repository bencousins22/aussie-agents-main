#!/bin/bash
set -e

echo "=================================================="
echo "Agent Zero with React UI - Full Setup"
echo "=================================================="
echo ""
echo "Configuration:"
echo "  Username: jamie"
echo "  Password: jamie"
echo "  SSH Port: 2222"
echo "  SSH Password: jamie"
echo "  Web UI: http://localhost:50001"
echo ""
echo "=================================================="
echo ""

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/../.." && pwd )"

echo "Step 1: Checking .env file..."
cd "$PROJECT_ROOT"

if [ ! -f .env ]; then
    echo "ERROR: .env file not found!"
    exit 1
fi

if ! grep -q "AUTH_LOGIN=jamie" .env || ! grep -q "AUTH_PASSWORD=jamie" .env; then
    echo "WARNING: Authentication not properly configured in .env"
    echo "Ensuring AUTH_LOGIN=jamie and AUTH_PASSWORD=jamie..."
    
    if ! grep -q "AUTH_LOGIN=" .env; then
        echo "AUTH_LOGIN=jamie" >> .env
    fi
    
    if ! grep -q "AUTH_PASSWORD=" .env; then
        echo "AUTH_PASSWORD=jamie" >> .env
    fi
fi

echo "✅ Authentication configured"
echo ""

echo "Step 2: Building React frontend..."
cd "$PROJECT_ROOT/webui-react"

if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies (this may take a few minutes)..."
    npm install
fi

echo "Building production bundle..."
npm run build -- --config vite.config.prod.ts

if [ ! -d "dist" ]; then
    echo "ERROR: React build failed - dist directory not created"
    exit 1
fi

echo "✅ React frontend built successfully"
echo ""

cd "$PROJECT_ROOT/docker/run"

echo "Step 3: Stopping any existing containers..."
if [ "$(docker ps -q -f name=agent-zero-react)" ]; then
    docker-compose -f docker-compose-react.yml down
    echo "✅ Stopped existing container"
fi
echo ""

echo "Step 4: Starting Agent Zero with React UI..."
docker-compose -f docker-compose-react.yml up -d

echo ""
echo "Step 5: Waiting for container to initialize..."
sleep 5

if [ "$(docker ps -q -f name=agent-zero-react)" ]; then
    echo "✅ Container is running"
else
    echo "❌ Container failed to start. Checking logs..."
    docker-compose -f docker-compose-react.yml logs
    exit 1
fi

echo ""
echo "=================================================="
echo "✅ Agent Zero with React UI is now running!"
echo "=================================================="
echo ""
echo "Access your application:"
echo "  🌐 Web UI: http://localhost:50001"
echo "  👤 Login: jamie"
echo "  🔑 Password: jamie"
echo ""
echo "SSH Access:"
echo "  ssh root@localhost -p 2222"
echo "  Password: jamie"
echo ""
echo "Useful commands:"
echo "  View logs:    docker logs -f agent-zero-react"
echo "  Stop:         cd $PROJECT_ROOT/docker/run && docker-compose -f docker-compose-react.yml down"
echo "  Restart:      cd $PROJECT_ROOT/docker/run && docker-compose -f docker-compose-react.yml restart"
echo "  Rebuild UI:   cd $PROJECT_ROOT/docker/run && ./rebuild-react.sh"
echo ""
echo "Checking container status..."
docker ps | grep agent-zero-react
echo ""
