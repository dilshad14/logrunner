# Java Spring Boot Development Guidelines

These guidelines apply to all Java Spring Boot development work in the `api-app` directory.

## 1. Project & Architecture Conventions

- **Directory Context**:
  - The Spring Boot REST API application resides under `api-app/`.
  - All Gradle commands (`gradlew.bat` / `./gradlew`) and source files (`src/main/java`, `src/test/java`) should be executed and located within `api-app/`.

- **Layered Architecture (`api-app/src/main/java/...`)**:
  - `controller`: REST API Endpoints, request validation, HTTP response mapping (`@RestController`, `@RequestMapping`).
  - `service`: Core business logic, transaction management (`@Service`, `@Transactional`).
  - `repository`: Data access interfaces using Spring Data JPA (`@Repository`).
  - `entity`: JPA persistent domain objects (`@Entity`, `@Table`).
  - `dto`: Data Transfer Objects for API request/response contracts. Use **Java Records** for immutable DTOs.
  - `config`: Spring configuration classes (`@Configuration`, `@Bean`, CORS configuration).
  - `exception`: Custom domain exceptions and `@RestControllerAdvice` global exception handling.

- **Immutability & Java 21 Features**:
  - Prefer Java `record` types for all DTOs, API payloads, and query projection objects.
  - Use constructor injection (`@RequiredArgsConstructor` or explicit `final` field constructors) instead of `@Autowired` field injection.
  - Leverage pattern matching, text blocks, and sealed interfaces where applicable.

- **Entity & JPA Best Practices**:
  - Keep JPA entities decoupled from API contracts. Never expose JPA Entities directly in REST responses; map to DTOs.
  - Define explicit sequence / identity generators for `@Id` fields.
  - Guard against N+1 queries using JPQL `@EntityGraph` or join fetch queries when fetching entity relations.

## 2. API Design, CORS & Integration Contracts

- **RESTful Endpoints**:
  - Use proper HTTP verbs (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`).
  - Return appropriate HTTP status codes (`200 OK`, `201 Created`, `204 No Content`, `400 Bad Request`, `404 Not Found`, `409 Conflict`, `500 Internal Server Error`).
  - Use standard RFC 7807 **Problem Details** format for error responses via `@RestControllerAdvice`.

- **CORS & UI Integration (`ui-app`)**:
  - Configure CORS mappings (`WebMvcConfigurer` or Spring Security `CorsConfigurationSource`) to allow requests from the React frontend running in `ui-app` (e.g. `http://localhost:5173`, `http://localhost:3000`).
  - Allow necessary HTTP methods (`GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`) and headers (`Content-Type`, `Authorization`).

- **Input Validation**:
  - Annotate API request payloads with `jakarta.validation` annotations (`@NotNull`, `@NotBlank`, `@Size`, `@Min`, `@Max`, `@Email`).
  - Annotate controller arguments with `@Valid`.

## 3. Testing & Build Verification

- **Testing Strategy**:
  - Unit tests for Services using JUnit 5 (`@ExtendWith(MockitoExtension.class)`).
  - Web slice tests for Controllers using `@WebMvcTest`.
  - Data access tests using `@DataJpaTest`.
- **Build Verification**:
  - Always run `cd api-app && gradlew.bat test` (or `./gradlew test` on Linux/macOS) to verify that all backend code compiles cleanly and unit tests pass before completing tasks.
