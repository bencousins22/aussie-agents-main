#!/bin/bash
set -e

echo "=================================================="
echo "Building React Frontend with Node via NVM"
echo "=================================================="
echo ""

# Source nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Use default node version
nvm use default

echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo ""

cd /Users/jamie/CascadeProjects/agent-zero/webui-react

echo "Installing dependencies..."
npm install

echo ""
echo "Building production bundle..."
npm run build -- --config vite.config.prod.ts

echo ""
echo "✅ React build complete!"
echo "Build output location: /Users/jamie/CascadeProjects/agent-zero/webui-react/dist/"
echo ""
ls -lh dist/ | head -20
