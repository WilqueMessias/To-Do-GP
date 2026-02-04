# Task Manager UI (tm-ui)

Frontend Single Page Application (SPA) for the To Do GP system, built with React and Vite.

## Technical Specifications

- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4 (Utility-first)
- **State Management**: React Hooks with Optimistic Updates implementation
- **Interactions**: @dnd-kit (Physics-based Drag & Drop)
- **Persistence**: REST API synchronization with local reconciliation

## Development Environment

### Prerequisites
- Node.js 18+
- npm

### Installation
```bash
npm install
```

### Execution
```bash
npm run dev
```
Serves the application at `http://localhost:5173`.

## Production Deployment

The application is containerized within the root `docker-compose.yml`. In production, assets are served via an optimized Nginx alpine image.

---
Technical specification by Wilque Messias © 2026.
