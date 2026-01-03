# Mock Backend Setup

For development and testing without the full backend, you can create a simple mock server.

## Quick Mock Server (Node.js)

Create a simple mock server to test the frontend:

```bash
# Create mock-server.js
cat > mock-server.js << 'EOF'
const http = require('http');

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Mock endpoints
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', message: 'Mock backend running' }));
  } else if (req.url === '/poll' && req.method === 'POST') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      log: [],
      notifications: [],
      log_version: 0,
      notifications_version: 0
    }));
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

server.listen(50001, () => {
  console.log('Mock backend running on http://localhost:50001');
});
EOF

# Run the mock server
node mock-server.js
```

## Alternative: Python Mock Server

```python
# Create mock-server.py
from http.server import HTTPServer, BaseHTTPRequestHandler
import json

class MockHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    def do_POST(self):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        if self.path == '/poll':
            response = {
                'log': [],
                'notifications': [],
                'log_version': 0,
                'notifications_version': 0
            }
        else:
            response = {'error': 'Not found'}
        
        self.wfile.write(json.dumps(response).encode())

    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        if self.path == '/health':
            response = {'status': 'ok', 'message': 'Mock backend running'}
        else:
            response = {'error': 'Not found'}
        
        self.wfile.write(json.dumps(response).encode())

if __name__ == '__main__':
    server = HTTPServer(('localhost', 50001), MockHandler)
    print('Mock backend running on http://localhost:50001')
    server.serve_forever()
```

Run with: `python mock-server.py`

## Benefits
- Eliminates proxy errors
- Allows testing UI functionality
- Provides basic API responses
- Easy to set up for development
