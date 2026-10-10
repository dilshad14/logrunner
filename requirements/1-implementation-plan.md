# Implementation Plan: AI Enabled Chat Application

## Overview
Develop an AI-enabled precious metal chat application featuring a Spring Boot backend (`api-app`) integrated with Spring AI and Google Gemini, and a modern React frontend (`ui-app`) with a **Premium Monochrome Theme**, formatted Markdown rendering, and custom keybinding (`Shift+Enter` to send, `Enter` for newline).

---

## Key Technical Decisions
- **Backend Stack (`api-app`)**:
  - Java 21, Spring Boot 4.x / 3.x
  - Spring AI / Google Gemini client integration for AI model access
  - Java Records for immutable request/response DTOs (`ChatRequest`, `ChatResponse`, `ChatMessageDto`)
  - Configurable system message in `application.properties` (`application.chat.system-message`)
  - Centralized RFC 7807 Problem Details error handling via `@RestControllerAdvice`
  - CORS configuration enabling cross-origin communication with `ui-app`
- **Frontend Stack (`ui-app`)**:
  - React (Vite-based build setup)
  - `react-markdown` + `remark-gfm` for rendering markdown responses (tables, lists, bold text, code blocks)
  - **Premium Monochrome Theme**: Pure white background (`#ffffff`), crisp black text (`#000000` / `#111827`), solid black button (`#000000`) with bold white text (`#ffffff`), and subtle dark borders
  - Keyboard interactions: `Enter` key inserts a new line; `Shift + Enter` submits the message to the backend
- **API Contract & Integration**:
  - Endpoint: `POST /api/v1/chat`
  - Request: `{"message": "string", "history": [{"role": "user|assistant", "content": "string"}]}`
  - Response: `{"reply": "string (markdown)", "status": "SUCCESS", "timestamp": "ISO-8601"}`

---

## Detailed Component Breakdown

### A. Backend Application Layer (`api-app/`)

#### 1. Configuration & System Message
- **File**: `api-app/src/main/resources/application.properties`
  - Configure `application.chat.system-message`:
    ```properties
    application.chat.system-message=You are an expert AI Precious Metals & Financial Investment Advisor. You provide accurate, detailed, and insightful advice on gold, silver, platinum, palladium, market trends, and portfolio hedging strategies. Format your responses with structured Markdown, including bold highlights, bullet points, numbered lists, tables, and code/calculation blocks where appropriate.
    spring.ai.gemini.api-key=${GEMINI_API_KEY:}
    ```
- **File**: `api-app/src/main/java/com/advisor/precious_metal/config/WebConfig.java` [NEW]
  - Configure CORS mapping for `http://localhost:5173` and `http://localhost:3000` on `/api/**`.
- **File**: `api-app/src/main/java/com/advisor/precious_metal/config/GeminiAiConfig.java` [NEW]
  - Configure Spring AI / Google Gemini chat client bean with system prompt and fallback handling.

#### 2. Data Transfer Objects (DTOs)
- **File**: `api-app/src/main/java/com/advisor/precious_metal/dto/ChatMessageDto.java` [NEW]
  - Java Record: `(String role, String content)`
- **File**: `api-app/src/main/java/com/advisor/precious_metal/dto/ChatRequest.java` [NEW]
  - Java Record: `(@NotBlank(message = "Message cannot be blank") String message, List<ChatMessageDto> history)`
- **File**: `api-app/src/main/java/com/advisor/precious_metal/dto/ChatResponse.java` [NEW]
  - Java Record: `(String reply, String status, LocalDateTime timestamp)`

#### 3. Service Layer
- **File**: `api-app/src/main/java/com/advisor/precious_metal/service/AiChatService.java` [NEW]
  - Business logic to assemble the system message and conversation history, query Google Gemini through Spring AI, and return structured Markdown responses.

#### 4. Controller & Exception Handling
- **File**: `api-app/src/main/java/com/advisor/precious_metal/controller/ChatController.java` [NEW]
  - REST endpoint `POST /api/v1/chat` receiving `@Valid @RequestBody ChatRequest request` and returning `ResponseEntity<ChatResponse>`.
- **File**: `api-app/src/main/java/com/advisor/precious_metal/exception/GlobalExceptionHandler.java` [NEW]
  - `@RestControllerAdvice` mapping validation errors and AI communication exceptions into standard RFC 7807 `ProblemDetail`.

#### 5. Backend Tests
- **File**: `api-app/src/test/java/com/advisor/precious_metal/service/AiChatServiceTest.java` [NEW]
  - Unit tests for AI service response processing and exception handling.
- **File**: `api-app/src/test/java/com/advisor/precious_metal/controller/ChatControllerTest.java` [NEW]
  - `@WebMvcTest(ChatController.class)` tests for endpoint status codes, JSON serialization, and validation errors.

---

### B. Frontend Application Layer (`ui-app/`)

#### 1. Project Initialization & Dependencies
- **Files**: `ui-app/package.json`, `ui-app/vite.config.js`, `ui-app/index.html` [NEW]
  - Setup React + Vite with `react-markdown`, `remark-gfm`, and `lucide-react`.

#### 2. Theme & Global Styles
- **Files**: `ui-app/src/index.css`, `ui-app/src/App.css` [NEW]
  - **Premium Monochrome Theme Styling**:
    - Page & container background: `#ffffff` / `#fafafa`
    - High-contrast text: `#000000` / `#111827`
    - Solid black button: `#000000` with white text `#ffffff` (`hover:bg-[#1f2937]`)
    - Subtle borders: `1px solid #e5e7eb` / `#000000`
    - Markdown typography styling (tables with crisp borders, code blocks, bold text).

#### 3. API Client & Services
- **File**: `ui-app/src/services/apiClient.js` [NEW]
  - Base fetch wrapper with error handling and environment-driven URL (`VITE_API_BASE_URL` with fallback `http://localhost:8080`).
- **File**: `ui-app/src/services/chatService.js` [NEW]
  - API call function `sendChatMessage(message, history)`.

#### 4. UI Components
- **File**: `ui-app/src/components/Header.jsx` [NEW]
  - Minimalist top bar with title "Precious Metal AI Advisor" and online indicator.
- **File**: `ui-app/src/components/ChatInteractionList.jsx` [NEW]
  - Top scrollable chat window displaying user and AI message history.
- **File**: `ui-app/src/components/ChatMessage.jsx` [NEW]
  - Message bubble component utilizing `react-markdown` to parse and render Markdown headings, bullet points, tables, and bold highlights.
- **File**: `ui-app/src/components/ChatInput.jsx` [NEW]
  - Multiline text input:
    - `Enter` inserts a new line in the textarea.
    - `Shift + Enter` sends the message to the backend.
    - "Send" button: Solid black button with white text that submits the message.
- **File**: `ui-app/src/App.jsx` [NEW]
  - Root container integrating header, chat list, input box, and error alerts.

#### 5. Frontend Tests
- **File**: `ui-app/src/components/__tests__/ChatInput.test.jsx` [NEW]
  - Verifies keybinding behavior (`Shift+Enter` triggers send, `Enter` inserts newline).

#### 5. Generate README file
- provide a readme file which contains short ready to use commands and critical instructions to run/deb the UI project.
- instructions to package the ui JS app into minified version for export.


---

## Verification Command Checklist
- **Backend Build & Unit Tests**:
  ```cmd
  cd api-app && gradlew.bat test
  ```
- **Frontend Dependencies Installation**:
  ```cmd
  cd ui-app && npm install
  ```
- **Frontend Production Build**:
  ```cmd
  cd ui-app && npm run build
  ```
- **Frontend Unit Tests**:
  ```cmd
  cd ui-app && npm test -- --watchAll=false
  ```

