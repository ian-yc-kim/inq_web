# inquiry-web (inq_web)

## Project Overview

inquiry-web (inq_web) is a React + Vite + TypeScript frontend prototype for an AI Customer Inquiry Board. The app's vision is to provide a public inquiry submission form for customers and a JWT-protected staff dashboard with a Kanban-style board, real-time updates, and inquiry reply workflows. This README clearly separates current implementation from planned features.

## Current implementation (what exists now)

- Staff Login page (src/pages/Login.tsx) with a simple email/password form.
- Protected placeholder Inquiry Board page that renders a header (src/pages/Board.tsx).
- Client-side routing with react-router-dom and protected routes via src/components/PrivateRoute.tsx.
- Mock authentication enabled by default for local development (see Authentication section).
- Basic unit tests for AuthContext, Login, and App.

## Planned features (not yet implemented)

- Public customer inquiry submission form
- Full Kanban board UI with drag-and-drop status management
- WebSocket-powered real-time updates
- Detailed inquiry view and reply functionality

## Getting started

Prerequisites:
- Node.js (>=16) and npm

Quick start:

1. Install dependencies

   npm install

2. Run development server

   npm run dev

3. Build for production

   npm run build

4. Preview production build locally

   npm run preview

## Configuration / environment variables

The project reads runtime configuration from environment variables (see .env.example). Key variables:

- VITE_BASE_PATH - base path for deployment (leave '/' or set a subpath)
- VITE_API_URL - backend API base URL (used when mock auth is disabled)

Copy .env.example to .env and adjust values as needed for your environment.

## Authentication (current mock implementation)

For local development the app uses a mock authentication implementation by default.

- File: src/services/authService.ts
- Constant: USE_MOCK_AUTH = true

Behavior when mock auth is enabled:
- Any email/password combination is accepted.
- login(...) resolves with a mock response: { token: 'mock-jwt', user: { email } } after a short delay.
- The AuthContext persists session data in localStorage using the keys:
  - auth_token (string)
  - auth_user (JSON string of user object)

Switching to a real backend:
1. Set USE_MOCK_AUTH = false in src/services/authService.ts (or wire an env toggle if desired).
2. Ensure VITE_API_URL is set in your .env to the backend base URL.
3. The frontend will POST to {VITE_API_URL}/auth/login for authentication.

## Routing and protected routes

- /login - staff login page (src/pages/Login.tsx)
- /board - protected staff Inquiry Board (src/pages/Board.tsx)
- All other routes redirect to /board

The route protection is implemented with src/components/PrivateRoute.tsx which uses the AuthContext to guard access and redirects unauthenticated users to /login.

## Testing

This project uses Vitest and Testing Library for unit tests.

Common test scripts:

- npm run test        # run vitest in watch mode
- npm run test:run    # run tests once (CI-friendly)
- npm run test:coverage # run tests with coverage

Key test files:
- src/App.test.tsx
- src/context/AuthContext.test.tsx
- src/pages/Login.test.tsx

Notes on tests:
- Tests mock network and auth service calls where appropriate.
- Test setup (vitest + jsdom) is configured in vite.config.ts and src/test/setup.ts.

## Development notes and conventions

- Functional components only; hooks are used for component state.
- All API calls live in src/services/ and env variables are referenced via import.meta.env.VITE_*.
- Types are declared in src/types/.
- Tests follow Arrange-Act-Assert and mock external dependencies.

## Contributing

- Follow existing project structure under src/
- Keep components small and focused
- Run lint and tests before submitting changes:

  npm run lint && npm run test:run && npm run build

## License

This repository does not include a license file. Add one if you intend to open source the project.
