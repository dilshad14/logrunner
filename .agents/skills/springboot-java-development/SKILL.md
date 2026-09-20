---
name: springboot-java-development
description: >-
  Master guide for Java Spring Boot development (Java 17/21+, Spring Boot 3.x/4.x) in the api-app directory, covering enterprise architecture,
  layered package design, Spring Data JPA best practices, RESTful API conventions, CORS setup for ui-app frontend, testing strategies, and Gradle/Maven workflows.
---

# Spring Boot Java Development Skill

Use this skill whenever you are designing, implementing, refactoring, or testing the Java Spring Boot API application located in `api-app/`.

## Core Architectural Blueprint

### 1. Layered Package Hierarchy (`api-app/src/main/java`)
Organize Spring Boot code cleanly into distinct functional packages under your root package (e.g. `com.advisor`):

```text
api-app/
├── src/main/java/com/advisor/
│   ├── config/              # Spring configuration (@Configuration, @Bean, Security, CORS)
│   ├── controller/          # REST controllers (@RestController, @RequestMapping)
│   ├── dto/                 # Request/Response data contracts (Java Records)
│   ├── entity/              # JPA Domain Entities (@Entity, @Table)
│   ├── exception/           # Custom domain exceptions & @RestControllerAdvice
│   ├── repository/          # Spring Data JPA repositories (@Repository)
│   └── service/             # Business logic & transactional boundaries (@Service, @Transactional)
├── build.gradle.kts         # Gradle build definition
└── gradlew / gradlew.bat    # Gradle wrapper scripts
```

---

## Technical Standards & Code Guidelines

### 1. Modern Java 21 Features
- **Java Records**: Use `record` for all DTOs and API payloads.
  ```java
  public record CreateMetalPriceRequest(
      @NotBlank(message = "Metal type is required") String metalType,
      @NotNull(message = "Price is required") @Positive BigDecimal price,
      @NotBlank(message = "Currency is required") String currency
  ) {}
  ```
- **Constructor Injection**: Inject dependencies via constructor (using explicit constructors or Lombok `@RequiredArgsConstructor`):
  ```java
  @Service
  @RequiredArgsConstructor
  public class MetalPriceService {
      private final MetalPriceRepository repository;
      ...
  }
  ```

### 2. Spring Data JPA Rules
- **Entities**: Keep entities isolated from public REST contracts.
  ```java
  @Entity
  @Table(name = "metal_prices")
  @Getter
  @Setter
  @NoArgsConstructor
  @AllArgsConstructor
  public class MetalPrice {
      @Id
      @GeneratedValue(strategy = GenerationType.IDENTITY)
      private Long id;

      @Column(nullable = false)
      private String metalType;

      @Column(nullable = false)
      private BigDecimal price;

      @Column(nullable = false)
      private LocalDateTime timestamp;
  }
  ```
- **Repositories**: Extend `JpaRepository<T, ID>` and write explicit JPQL queries with named parameters to avoid N+1 query problems.
  ```java
  @Repository
  public interface MetalPriceRepository extends JpaRepository<MetalPrice, Long> {
      @Query("SELECT m FROM MetalPrice m WHERE m.metalType = :metalType ORDER BY m.timestamp DESC")
      List<MetalPrice> findLatestByMetalType(@Param("metalType") String metalType);
  }
  ```

### 3. REST API, Problem Details & CORS Integration
- Use `@RestController`, `@RequestMapping("/api/v1/...")`, and proper HTTP verbs.
- Handle exceptions centrally with `@RestControllerAdvice`:
  ```java
  @RestControllerAdvice
  public class GlobalExceptionHandler {
      @ExceptionHandler(ResourceNotFoundException.class)
      public ProblemDetail handleNotFound(ResourceNotFoundException ex) {
          return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
      }
  }
  ```
- **CORS Configuration for `ui-app` Integration**:
  ```java
  @Configuration
  public class WebConfig implements WebMvcConfigurer {
      @Override
      public void addCorsMappings(CorsRegistry registry) {
          registry.addMapping("/api/**")
                  .allowedOrigins("http://localhost:5173", "http://localhost:3000")
                  .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                  .allowedHeaders("*");
      }
  }
  ```

### 4. Testing Framework Guidelines
- **Service Unit Tests**:
  ```java
  @ExtendWith(MockitoExtension.class)
  class MetalPriceServiceTest {
      @Mock
      private MetalPriceRepository repository;

      @InjectMocks
      private MetalPriceService service;
  }
  ```
- **Controller Web Slice Tests**:
  ```java
  @WebMvcTest(MetalPriceController.class)
  class MetalPriceControllerTest {
      @Autowired
      private MockMvc mockMvc;

      @MockitoBean
      private MetalPriceService service;
  }
  ```

---

## Build Commands & Verification

Always execute build verification inside the `api-app/` directory to ensure compilation and tests pass cleanly:

- **Windows**:
  ```cmd
  cd api-app && gradlew.bat clean test
  ```
- **Linux / macOS**:
  ```bash
  cd api-app && ./gradlew clean test
  ```
