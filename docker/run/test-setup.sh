#!/bin/bash

echo "Testing Agent Zero React Setup..."
echo ""

check_docker() {
    if [ "$(docker ps -q -f name=agent-zero-react)" ]; then
        echo "✅ Container is running"
        return 0
    else
        echo "❌ Container is NOT running"
        return 1
    fi
}

check_web_ui() {
    echo -n "Testing Web UI (http://localhost:50001)... "
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:50001 | grep -q "200\|302"; then
        echo "✅ Web UI is responding"
        return 0
    else
        echo "❌ Web UI is not responding"
        return 1
    fi
}

check_api() {
    echo -n "Testing API health endpoint... "
    if curl -s http://localhost:50001/health | grep -q "ok\|healthy\|true"; then
        echo "✅ API is healthy"
        return 0
    else
        echo "⚠️  API health check returned unexpected response"
        return 1
    fi
}

check_ssh() {
    echo -n "Testing SSH (port 2222)... "
    if nc -z localhost 2222 2>/dev/null; then
        echo "✅ SSH port is open"
        return 0
    else
        echo "❌ SSH port is not accessible"
        return 1
    fi
}

echo "1. Container Status:"
check_docker
echo ""

echo "2. Web UI:"
check_web_ui
echo ""

echo "3. API Health:"
check_api
echo ""

echo "4. SSH Access:"
check_ssh
echo ""

echo "5. Container Logs (last 20 lines):"
echo "-----------------------------------"
docker logs --tail 20 agent-zero-react 2>&1
echo ""

echo "Authentication Info:"
echo "  Username: jamie"
echo "  Password: jamie"
echo ""

echo "Access URLs:"
echo "  Web UI: http://localhost:50001"
echo "  SSH:    ssh root@localhost -p 2222"
echo ""
