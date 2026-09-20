---
name: react-ui-development
description: >-
  Master guide for React UI web application development in the ui-app directory, covering component design,
  monochrome premium theme UI styling, state management, API service layer integration with api-app (Spring Boot backend), testing, and build verification.
---

# React UI Development Skill

Use this skill whenever you are designing, implementing, refactoring, or testing the React UI application located under `ui-app/`.

## Core Architectural Blueprint

### 1. Directory Hierarchy (`ui-app/src`)
Organize React code cleanly into distinct functional directories:

```text
ui-app/
├── public/              # Static assets (favicon, index.html)
├── src/
│   ├── assets/          # Images, SVGs, global styles
│   ├── components/      # Reusable UI components (buttons, input fields, modals, chat widgets)
│   ├── pages/           # Views / route-level page components
│   ├── services/        # API client modules for communicating with api-app REST endpoints
│   ├── hooks/           # Custom React hooks
│   ├── context/         # React Context / global state providers
│   ├── types/           # TypeScript definitions or API request/response interface schemas
│   ├── App.jsx / .tsx   # Main application component
│   └── main.jsx / .tsx  # React root entry point
├── package.json         # NPM scripts and dependencies
└── vite.config.js       # Vite or Webpack build configuration
```

---

## Technical Standards & Code Guidelines

### 1. Premium Monochrome Theme & UI Styling
All UI components, enhancements, and design layouts must strictly adhere to the following **Premium Monochrome Theme**:

- **Color Scheme**:
  - **Background**: Pure white (`#ffffff`) or light subtle off-white (`#fafafa` / `#f9fafb`) for page and container backgrounds.
  - **Primary Text**: Deep black / near-black (`#000000` / `#111827`) for maximum contrast, legibility, and modern look.
  - **Secondary Text**: Muted dark charcoal / slate (`#4b5563` / `#6b7280`) for metadata, timestamps, and subtitles.
  - **Buttons & Primary CTAs**: Solid black buttons (`#000000` or `#111827`) with crisp white text (`#ffffff`).
    - *Hover / Focus States*: Subtle dark shade shift (`#1f2937`), soft dark shadow (`rgba(0, 0, 0, 0.15)`), or clean invert border effect.
  - **Borders & Dividers**: Crisp, thin dark borders (`1px solid #000000` or `#e5e7eb` / `#d1d5db`).
- **UI Design & Premium Look**:
  - Clean, minimalist aesthetic with ample whitespace, sharp typography (e.g., Inter, system-ui, `-apple-system`), and subtle rounded corners (`border-radius: 6px` or `8px`).
  - Cards, chat bubbles, and modals should use clean white containers with high-contrast black text, subtle dark borders, and refined box shadows.

### 2. Component & State Patterns
- **Functional Components & Hooks**:
  - Use standard hooks (`useState`, `useEffect`, `useCallback`, `useMemo`, `useContext`).
  - Keep components modular and focused on rendering logic. Move side effects and data fetching into custom hooks or service functions.
  - Implement immutable state updates:
    ```javascript
    // Good: Immutable state update
    setMessages(prev => [...prev, newMessage]);
    ```

### 3. Backend Integration (`api-app` REST APIs)
- **API Service Layer**:
  - Centralize HTTP API calls under `src/services/` (e.g. `src/services/apiClient.js` or `src/services/chatService.js`).
  - Read base URL from environment variables (`import.meta.env.VITE_API_BASE_URL` or `process.env.REACT_APP_API_BASE_URL`), with fallback to `http://localhost:8080`.
- **RFC 7807 Error Response Parsing**:
  - Parse error responses returned from Spring Boot `@RestControllerAdvice` (e.g. `status`, `title`, `detail`, `errors`).
- **Axios / Fetch Standard Pattern**:
  ```javascript
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

  export async function fetchChatResponse(payload) {
    const response = await fetch(`${API_BASE_URL}/api/v1/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || 'API Request Failed');
    }

    return await response.json();
  }
  ```

---

## Build Commands & Verification

Always execute build and test verification inside the `ui-app/` directory:

- **Install Dependencies**:
  ```cmd
  cd ui-app && npm install
  ```
- **Run Unit / Component Tests**:
  ```cmd
  cd ui-app && npm test -- --watchAll=false
  ```
- **Build Production Bundle**:
  ```cmd
  cd ui-app && npm run build
  ```
