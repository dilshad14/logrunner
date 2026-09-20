# React UI Development Guidelines

These guidelines apply to all React web application development work in the `ui-app` directory.

## 1. Project & Architecture Conventions

- **Directory Layout (`ui-app/src`)**:
  - `components/`: Reusable UI components (buttons, inputs, modals, chat elements).
  - `pages/` or `views/`: Page-level components representing application routes or main views.
  - `services/` or `api/`: API client services for communicating with the `api-app` backend endpoints.
  - `hooks/`: Custom React hooks for encapsulating stateful logic and data fetching.
  - `context/` or `store/`: Application-level global state management (React Context or state library).
  - `types/` or `models/`: TypeScript interface/type definitions or JavaScript model schemas matching backend DTOs.

- **Premium Monochrome UI Theme**:
  - **Background**: Pure white (`#ffffff`) background for pages, cards, and containers.
  - **Text**: Crisp high-contrast black text (`#000000` / `#111827`).
  - **Buttons**: Solid black buttons (`#000000`) with bold white text (`#ffffff`).
  - **Borders & Styling**: Clean 1px dark borders, subtle box shadows, ample whitespace, and elegant typography for a high-end luxury UI look.

- **Component Design & Immutability**:
  - Use functional components with standard React hooks (`useState`, `useEffect`, `useContext`, `useCallback`, `useMemo`).
  - Keep components modular and single-responsibility. Separate presentation components from data-fetching logic.
  - Do not mutate state objects or arrays directly; use state updater functions with immutable patterns.

## 2. Backend Integration & API Client

- **API Base URL Configuration**:
  - Configure backend API base URL via environment variables (e.g. `VITE_API_BASE_URL` or `REACT_APP_API_BASE_URL`).
  - Default fallback for local development: `http://localhost:8080`.

- **API Client & Error Handling**:
  - Centralize HTTP requests in service modules under `src/services/` or `src/api/`.
  - Handle Spring Boot backend error responses structured according to RFC 7807 Problem Details (extracting `title`, `detail`, `status`, and field error arrays).
  - Include appropriate HTTP headers (`Content-Type: application/json`, `Authorization` headers when authenticated).

## 3. Testing & Build Verification

- **Verification Commands**:
  - Run linting and type checking: `npm run lint` (or `npm run type-check` if applicable).
  - Run test suite: `npm test` or `npm run test -- --watchAll=false`.
  - Build production bundle: `npm run build`.
- **Verification Rule**:
  - Always verify that the project builds cleanly (`npm run build`) and tests pass before marking frontend tasks complete.
