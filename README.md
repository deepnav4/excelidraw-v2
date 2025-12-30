# 🎨 ExceliDraw - Collaborative Drawing Application

A full-stack collaborative drawing application built with Next.js, TypeScript, and Canvas API.

## 🚀 Features

### V1 - Standalone Drawing
- Canvas-based drawing with HTML5 Canvas API
- Multiple shape tools (Rectangle, Ellipse, Diamond, Line, Arrow, Free-draw)
- Customizable styling (stroke, fill, width)
- LocalStorage persistence
- No authentication required

### V2 - Collaborative Rooms (Coming Soon)
- Real-time collaboration via WebSocket
- User authentication
- Room management
- Live cursor tracking

### V3 - Event Streaming (Coming Soon)
- Kafka event streaming
- Event sourcing
- Advanced history and replay

## 📦 Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, WebSocket
- **Database**: PostgreSQL, Prisma ORM
- **Message Queue**: Apache Kafka
- **Caching**: Redis
- **Monorepo**: pnpm + Turborepo

## 🛠️ Setup

### Prerequisites
- Node.js >= 18
- pnpm >= 9
- Docker & Docker Compose

### Installation

```bash
# Install dependencies
pnpm install

# Start Docker services (for V2+)
docker-compose up -d

# Run V1 (Frontend only)
pnpm web:dev

# Run V2 (Frontend + Backends)
pnpm dev
```

## 📁 Project Structure

```
excelidraw/
├── apps/
│   ├── web/              # Next.js Frontend
│   ├── http-backend/     # REST API Server
│   ├── ws-backend/       # WebSocket Server
│   └── kafka-consumer/   # Kafka Consumer
├── packages/
│   ├── database/         # Prisma Database
│   ├── common/           # Shared Types
│   └── typescript-config/
└── docker-compose.yml
```

## 📝 License

MIT
