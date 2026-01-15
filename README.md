# inquiry-web (inq_web)

## Project Overview

inquiry-web (inq_web) is a React + Vite + TypeScript frontend prototype for an AI Customer Inquiry Board. The app's vision is to provide a public inquiry submission form for customers and a JWT-protected staff dashboard with a Kanban-style board, real-time updates, and inquiry reply workflows. This README clearly separates current implementation from planned features.

## App key features

- Public Inquiry Form (customer-facing submission)
- Staff dashboard / Kanban board for managing inquiries
- Real-time updates via WebSocket
- Public route for submissions: /inquiry (no authentication required)

## Inquiry Board

The Inquiry Board is the staff-facing dashboard used to manage customer inquiries. It provides a Kanban-style interface where inquiries are organized into columns by status. Key features:

- Drag & Drop: Staff can drag inquiry cards between status columns to change their state.
- Real-time updates: The board receives server-sent events via WebSocket so multiple staff members see updates live.
- Card details & reply workflows: Each inquiry card links to details and reply functionality (partial/planned depending on deployment).

Implementation notes:
- The Kanban UI components are implemented under src/components/Kanban/ (InquiryCard, KanbanColumn).
- Drag-and-drop is implemented using dnd-kit in src/pages/admin/Board.tsx.
- WebSocket integration for real-time updates is provided by src/services/socketService.ts.

## Current implementation (what exists now)

- Public Inquiry Form available at src/pages/public/InquiryForm.tsx and routed at /inquiry for customer submissions.
- Staff Login page (src/pages/Login.tsx) with a simple email/password form.
- Protected Inquiry Board page with Kanban components (src/pages/admin/Board.tsx).
- Staff Management UI for managing staff users at src/pages/admin/StaffManagement.tsx routed at /admin/staff (protected).
- Kanban board UI with drag-and-drop support implemented via dnd-kit.
- WebSocket-powered real-time updates via src/services/socketService.ts.
- Client-side routing with react-router-dom and protected routes via src/components/PrivateRoute.tsx.
- Mock authentication enabled by default for local development (see Authentication section).
- Basic unit tests for AuthContext, Login, Board, and Kanban components.

## Planned features (not yet implemented)

- Detailed inquiry view and full reply workflow (backend integration and UI polishing)

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
- VITE_WS_URL - WebSocket URL for realtime events used by the Inquiry Board

VITE_WS_URL is required for real-time updates on the Inquiry Board. Use the ws:// scheme for insecure local dev or wss:// for secure deployments. Example values:

- ws://localhost:4000
- wss://host.example/ws

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

Also ensure VITE_WS_URL is set to enable real-time board updates (see Configuration section).

## Routing and protected routes

- /login - staff login page (src/pages/Login.tsx)
- /board - protected staff Inquiry Board (src/pages/admin/Board.tsx)
- /admin/staff - protected Staff Management UI (src/pages/admin/StaffManagement.tsx)
- /inquiry - public inquiry submission form (src/pages/public/InquiryForm.tsx) - no authentication required
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
- src/pages/admin/Board.test.tsx
- src/components/Kanban/InquiryCard.test.tsx

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
