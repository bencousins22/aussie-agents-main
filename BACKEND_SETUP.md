# Backend Setup

The Aussie Agents frontend requires a backend server to be running for full functionality.

## Current Status
- ✅ Frontend is running and optimized
- ❌ Backend server is not running on port 50001

## Expected Backend Configuration
The frontend is configured to connect to a backend server at:
- **URL**: `http://localhost:50001`
- **API endpoints**: `/poll`, `/message`, `/health`, etc.

## Backend Requirements
The backend should provide the following endpoints:
- `POST /poll` - For polling messages and updates
- `POST /message` - For sending messages
- `GET /health` - Health check endpoint
- Various other endpoints for settings, files, projects, etc.

## Temporary Solution
While the backend is not running:
- The frontend will show "Backend Offline" status
- Console errors are reduced to prevent spam
- Polling uses exponential backoff (up to 10 seconds)
- UI remains responsive and functional

## Next Steps
1. Start the backend server on port 50080
2. Ensure all required API endpoints are implemented
3. Verify CORS configuration allows frontend connections
4. Test the integration

## Development Notes
- The vite proxy configuration in `vite.config.ts` forwards API calls to the backend
- Error handling has been improved to reduce console spam
- The connection status is clearly displayed in the UI
