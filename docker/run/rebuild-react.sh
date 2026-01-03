#!/bin/bash
set -e

echo "Quick rebuild: React frontend only"
echo ""

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/../.." && pwd )"

cd "$PROJECT_ROOT/webui-react"
echo "Building React app..."
npm run build -- --config vite.config.prod.ts

echo ""
echo "Restarting container..."
cd "$PROJECT_ROOT/docker/run"
docker-compose -f docker-compose-react.yml restart

echo ""
echo "Done! React frontend rebuilt and container restarted."
echo "Access at: http://localhost:50001"
