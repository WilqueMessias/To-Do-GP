# Task Manager UI (tm-ui)

Frontend Single Page Application (SPA) for the To Do GP system, built with React and Vite.

## Technical Specifications

- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4 (Utility-first)
- **State Management**: React Hooks with Optimistic Updates implementation
- **Interactions**: @dnd-kit (Physics-based Drag & Drop)
- **Persistence**: REST API synchronization with local reconciliation

## Development Environment

### Prerequisites
- Node.js 18+
- npm

### Environment Variables (Optional)

- `VITE_API_BASE_URL` (default: `http://localhost:8080`)
	- Example: copy `.env.example` to `.env` and update as needed.

### Installation
```bash
npm install
```

### Execution
```bash
npm run dev
```
Serves the application at `http://localhost:5173`.

### Lint
```bash
npm run lint
```

### Build and Preview
```bash
npm run build
npm run preview
```
Preview serves the production build at `http://localhost:4173`.

## Production Deployment

The application is containerized within the root `docker-compose.yml`. In production, assets are served via an optimized Nginx alpine image.

---
Technical specification by Wilque Messias © 2026.
