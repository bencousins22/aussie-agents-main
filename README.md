# Aussie Agents - React Frontend for Agent Zero

A modern React + TypeScript frontend for Agent Zero Docker backend, built with Vite for optimal performance.

## Features

- ⚡️ **Fast Development** with Vite HMR
- 🎨 **Modern UI** with Tailwind CSS v4
- 📱 **PWA Support** for mobile devices
- 🔄 **Real-time Updates** via polling
- 🎯 **TypeScript** for type safety
- 🧩 **Modular Architecture** with clean separation of concerns

## Prerequisites

- Node.js 18+ (or compatible runtime)
- Agent Zero Docker backend running on port 50001

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and set your Agent Zero backend URL:

```env
# For local Docker backend
VITE_API_URL=http://localhost:50001

# For remote/ngrok backend
# VITE_API_URL=https://your-ngrok-url.ngrok-free.app

# Optional: API Key if your backend requires authentication
VITE_API_KEY=your-api-key-here
```

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Agent Zero Docker Backend Setup


This frontend connects to the Agent Zero Docker backend. Make sure it's running before starting the frontend.

### Start Agent Zero Backend

```bash
# Navigate to your Agent Zero Docker directory
cd /path/to/agent-zero/docker/run

# Start the backend
docker-compose up -d

# Verify it's running
curl http://localhost:50001/health
```

### CORS Configuration

Agent Zero Docker backend should have CORS enabled. Ensure your backend configuration includes:

```yaml
environment:
  - CORS_ORIGINS=http://localhost:5173,https://your-production-domain.com
```

## Project Structure

```
src/
├── components/       # React components
│   ├── auth/        # Authentication components
│   ├── chat/        # Chat interface components
│   ├── features/    # Feature-specific components
│   ├── layout/      # Layout components
│   ├── modals/      # Modal dialogs
│   ├── ui/          # Reusable UI components
│   └── visuals/     # Visual effects
├── hooks/           # Custom React hooks
│   ├── useAgentZero.ts    # Main Agent Zero integration hook
│   └── ...
├── lib/             # Core libraries
│   ├── api.ts              # API client with error handling
│   ├── agentZeroApi.ts     # Agent Zero API methods
│   ├── schemas.ts          # Zod validation schemas
│   └── types.ts            # TypeScript types
└── styles/          # Global styles
```

## Building for Production


```bash
npm run build
```

Build output will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Deployment Options

### Option 1: Vercel (Recommended)

1. Push your code to GitHub
2. Import repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `VITE_API_URL`: Your Agent Zero backend URL
   - `VITE_API_KEY`: Your API key (if required)
4. Deploy

### Option 2: Static Hosting (Netlify, Cloudflare Pages, etc.)

1. Build the project: `npm run build`
2. Deploy the `dist/` directory
3. Configure environment variables in your hosting provider
4. Ensure backend URL is accessible from your deployment

### Option 3: Docker

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## API Integration

The frontend communicates with Agent Zero backend through:

- **Polling**: Real-time updates with exponential backoff
- **WebSocket**: (Future enhancement)
- **REST API**: Standard HTTP requests for actions

