---
name: generate-implementation-plan
description: >-
  Analyzes a Markdown (.md) requirement file and the current workspace codebase (api-app for Spring Boot backend and ui-app for React UI frontend),
  then prepares a detailed Markdown implementation plan file for developer review.
---

# Generate Implementation Plan Skill

Use this skill when you are given a Markdown (`.md`) requirement specification file and need to analyze the existing workspace applications (`api-app` backend and `ui-app` frontend) to produce a structured, developer-ready implementation plan.

## Workflow & Steps

### 1. Requirements Analysis
1. Read and parse the provided requirement `.md` file carefully.
2. Extract functional requirements, domain model entities, REST API endpoints, business logic rules, React UI views/components, and non-functional requirements (e.g., security, performance, CORS boundaries).
3. Identify external service dependencies, security constraints, and data validation rules.

### 2. Existing Project Context Inspection
1. **Backend (`api-app/`)**:
   - Inspect `build.gradle.kts` / `build.gradle` or `pom.xml` to determine Java/Spring Boot versions, database drivers, and dependencies.
   - Inspect package structure (`api-app/src/main/java/com/...`) for `@Entity`, `@Repository`, `@Service`, `@RestController`, DTOs, and CORS setup.
   - Inspect backend test setup (`JUnit 5`, `Mockito`, `@WebMvcTest`, `@DataJpaTest`).
2. **Frontend (`ui-app/`)**:
   - Inspect `package.json` to determine React version, HTTP client libraries (Fetch/Axios), UI framework/styling, and build tools (Vite/CRA).
   - Inspect directory structure (`ui-app/src/`) for `components`, `pages`, `services` (API client), `hooks`, and state management.
   - Inspect frontend test setup (`Jest`, `Vitest`, `React Testing Library`).

### 3. Gap & Impact Analysis
1. Compare requirement expectations against current project capabilities in both applications.
2. Determine:
   - **New / Modified Backend Files (`api-app/`)**: Entities, repositories, services, REST controllers, DTO records, CORS configuration, and unit/integration tests.
   - **New / Modified Frontend Files (`ui-app/`)**: React components, pages/views, API client service functions, hooks, state context, types, and component tests.
   - **Integration Contracts**: REST API endpoint URIs, HTTP methods, JSON request payload schemas, and response DTO definitions.

### 4. Implementation Plan Drafting
Create an implementation plan document named `implementation-plan-<feature-file-name>.md` using the following required format, create the file in same directory as the requirement file for brevity and context.

```markdown
# Implementation Plan: [Feature Name]

## Overview
Brief summary of the feature, business intent, and technical approach spanning `api-app` (Spring Boot API) and `ui-app` (React UI).
## name the file and place in same directory of requirement file : <requirement file name> + "-" + <implementation-plan>.md

## Key Technical Decisions
- **Backend Stack (`api-app`)**: Java version, Spring Boot, Spring Data JPA, Java Records for DTOs, RFC 7807 Problem Details error handling.
- **Frontend Stack (`ui-app`)**: React components, custom hooks, API service layer, state management.
- **API Contract & Integration**: RESTful endpoints, payload structures, CORS configuration (`ui-app` <-> `api-app`).
- **Validation**: `jakarta.validation` on backend DTOs and client-side form validation.

## Detailed Component Breakdown

### A. Backend Application Layer (`api-app/`)

#### 1. Database & Domain Entity Layer
- **New/Modified Entities**: `api-app/src/main/java/.../entity/[EntityName.java]`

#### 2. Repository Layer
- **New/Modified Repositories**: `api-app/src/main/java/.../repository/[RepositoryName.java]`

#### 3. Data Transfer Objects (DTOs)
- **New Records**: `api-app/src/main/java/.../dto/[RequestDto.java]`, `[ResponseDto.java]`

#### 4. Service & Controller Layer
- **Services**: `api-app/src/main/java/.../service/[ServiceName.java]`
- **Controllers & CORS**: `api-app/src/main/java/.../controller/[ControllerName.java]`

#### 5. Backend Tests
- `api-app/src/test/java/.../service/[ServiceNameTest.java]`
- `api-app/src/test/java/.../controller/[ControllerNameTest.java]`

---

### B. Frontend Application Layer (`ui-app/`)

#### 1. API Service & Models
- **API Client**: `ui-app/src/services/[apiService.js]`
- **Types / Schemas**: `ui-app/src/types/[models.ts]`

#### 2. UI Components & Pages
- **Components**: `ui-app/src/components/[ComponentName.jsx]`
- **Pages**: `ui-app/src/pages/[PageName.jsx]`

#### 3. Hooks & Global State
- **Hooks**: `ui-app/src/hooks/[useCustomHook.js]`
- **Context**: `ui-app/src/context/[StateContext.jsx]`

#### 4. Frontend Tests
- `ui-app/src/components/[ComponentName.test.jsx]`

---

## Verification Command Checklist
- Backend verification: `cd api-app && gradlew.bat test` (or `./gradlew test`)
- Frontend build verification: `cd ui-app && npm run build`
- Frontend unit test run: `cd ui-app && npm test -- --watchAll=false`
```

### 5. Review & Handoff
Present the generated `implementation-plan-<feature-name>.md` file to the developer for review and approval before executing any code changes.
