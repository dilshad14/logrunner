---
name: execute-implementation-plan
description: >-
  Executes an approved Markdown implementation plan spanning api-app (Java Spring Boot backend) and ui-app (React UI frontend),
  generating source code, API service layers, unit and integration tests, running build scripts, and ensuring clean execution.
---

# Execute Implementation Plan Skill

Use this skill to implement feature changes outlined in an approved implementation plan Markdown file (`implementation-plan-<feature>.md` or `implementation_plan.md`).

## Execution Workflow

### Step 1: Pre-Execution Verification
1. Read the target implementation plan file thoroughly.
2. Verify the project environment in both application folders:
   - Backend `api-app/`: Check for `gradlew.bat` / `gradlew` (or `mvnw.cmd` / `mvnw`).
   - Frontend `ui-app/`: Check for `package.json` and package manager (`npm` / `yarn` / `pnpm`).

---

### Step 2: Backend Implementation (`api-app/`)
1. **Domain Entity & Database Setup**:
   - Create or update JPA Entity classes under `api-app/src/main/java/.../entity/`.
   - Update database migrations or schema configuration.
2. **Repository Layer**:
   - Create Spring Data JPA Repositories under `api-app/src/main/java/.../repository/`.
3. **Data Transfer Objects (DTOs)**:
   - Create DTO Java `record` classes under `api-app/src/main/java/.../dto/`.
4. **Business Service Layer**:
   - Implement business logic services under `api-app/src/main/java/.../service/` with `@Service` and `@Transactional`.
5. **REST Controller & CORS Setup**:
   - Create REST Controller classes under `api-app/src/main/java/.../controller/`.
   - Apply CORS mapping under `@CrossOrigin` or global WebMvc config for `ui-app` integration.
   - Configure global exception handling (`@RestControllerAdvice`) using RFC 7807 Problem Details.
6. **Backend Test Suite Generation**:
   - Create Service Unit Tests (`@ExtendWith(MockitoExtension.class)`).
   - Create Controller Web Slice Tests (`@WebMvcTest`).
   - Create Repository Tests (`@DataJpaTest`).
6. **Constant Usage**:
   - Define and utilize constants for API endpoints, error messages, and configuration values.
---

### Step 3: Frontend Implementation (`ui-app/`)
1. **API Client & Services**:
   - Create or update API service functions in `ui-app/src/services/` to communicate with the corresponding `api-app` REST controllers.
   - Support environment-driven base URLs (`import.meta.env.VITE_API_BASE_URL` / `http://localhost:8080`).
2. **Type Definitions & Models**:
   - Define data interfaces in `ui-app/src/types/` matching backend DTO records.
3. **UI Components & Pages**:
   - Create or update UI components in `ui-app/src/components/` and page views in `ui-app/src/pages/`.
   - Handle loading states, API error responses, and user inputs.
4. **Hooks & Global State**:
   - Implement custom hooks in `ui-app/src/hooks/` and React Context providers in `ui-app/src/context/`.
5. **Frontend Test Suite Generation**:
   - Create component tests and service unit tests in `ui-app/src/`.

---

### Step 4: Build Verification & Automated Iteration
1. **Verify Backend Build (`api-app`)**:
   - Run: `cd api-app && gradlew.bat test` (or `./gradlew test`)
   - Ensure all backend tests pass with zero failures.
2. **Verify Frontend Build (`ui-app`)**:
   - Run: `cd ui-app && npm run build`
   - Run frontend tests if configured: `cd ui-app && npm test -- --watchAll=false`
3. **If compilation or build fails in either application**:
   - Do NOT mark the task complete.
   - Inspect stack traces and failure logs.
   - Fix code or test assertions and re-run build commands until both `api-app` and `ui-app` build cleanly.
4. Provide a summary of implemented components across backend and frontend, along with verification results.
