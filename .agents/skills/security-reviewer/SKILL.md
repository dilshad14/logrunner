---
name: security-reviewer
description: >-
  Scans Java Spring Boot backend code (api-app) and React UI frontend code (ui-app) for security vulnerabilities
  against OWASP Top 10 guidelines and full-stack security best practices, generating a detailed security audit report.
---

# Full-Stack Security Reviewer Skill (api-app & ui-app)

Use this skill to audit newly generated or existing Java Spring Boot code in `api-app/` and React UI code in `ui-app/` for security vulnerabilities, compliance with OWASP Top 10 standards, and web security best practices.

## Audit Workflow

### 1. Scope Identification
1. **Backend (`api-app/`)**: Scan Java source files under `api-app/src/main/java/` and configuration files (`application.yml`, `application.properties`, `build.gradle.kts`).
2. **Frontend (`ui-app/`)**: Scan React source files under `ui-app/src/` (`.js`, `.jsx`, `.ts`, `.tsx`) and dependency manifests (`package.json`).

---

### 2. OWASP Top 10 Analysis Matrix for Full-Stack (`api-app` & `ui-app`)

#### A01: Broken Access Control
- **Backend (`api-app`)**: Check endpoint authorization (`SecurityFilterChain`, `@PreAuthorize`), verify IDOR prevention (`repository.findByUserAndId(...)`), and HTTP 401/403 responses.
- **Frontend (`ui-app`)**: Verify client-side route guards and ensure UI elements hide/disable unauthorized actions based on verified backend roles.

#### A02: Cryptographic Failures & Secret Leakage
- Scan for hardcoded API keys, JWT secrets, database passwords, or credentials in `api-app` source code or `ui-app` frontend bundles.
- Ensure frontend environment variables do NOT leak private server secrets (e.g. only public config like `VITE_API_BASE_URL` in frontend).
- Verify secure password hashing (`BCryptPasswordEncoder`) and TLS/HTTPS enforcement.

#### A03: Injection (SQL / JPQL / SpEL / Command / XSS)
- **Backend Injection (`api-app`)**:
  - Verify JPQL/SQL `@Query` methods use named parameters (`:param`). Reject dynamic SQL string concatenation.
  - Guard against SpEL injection (`SpelExpressionParser`) and OS command execution (`ProcessBuilder`).
- **Frontend Cross-Site Scripting (XSS) (`ui-app`)**:
  - Flag any use of `dangerouslySetInnerHTML`, `eval()`, `document.write()`, or unescaped user input rendering.
  - Ensure user input inserted into the DOM is properly sanitized or handled via React's default JSX escaping mechanism.

#### A04: Insecure Design & Client Data Validation
- Check missing backend DTO input validation (`jakarta.validation` and `@Valid`).
- Verify sensitive fields (passwords, tokens, PII) are omitted from API response DTOs and frontend state/logs.

#### A05: Security Misconfiguration & CORS
- **CORS Configuration**: Verify CORS settings in `api-app` restrict origin to specific frontend domains (`http://localhost:5173`, etc.) instead of wildcards (`*`) when credentials are allowed.
- **CSRF & Cookies**: Check session / token security (`HttpOnly`, `SameSite=Strict`, `Secure` flags for auth cookies).
- **Actuator & Stack Traces**: Ensure `/actuator/*` sensitive endpoints and backend stack traces are hidden in production profiles.

#### A06: Vulnerable and Outdated Components
- Review `build.gradle.kts` in `api-app/` and `package.json` in `ui-app/` for known vulnerable dependencies.
- Recommend running `npm audit` inside `ui-app/`.

#### A07: Identification and Authentication Failures
- Verify JWT validation (signature verification, `exp` expiration, `iss` issuer checks).
- Check secure storage of auth tokens in frontend (avoid exposing sensitive tokens in unencrypted `localStorage` if cookies can be used).

#### A08: Software and Data Integrity Failures
- Scan for insecure Java object deserialization (`ObjectInputStream.readObject()`) or dynamic `eval` calls in React.

#### A09: Security Logging and Monitoring Failures
- Verify sensitive data (passwords, tokens) are never logged in backend `log.info()` or frontend `console.log()`.
- Sanitize input parameters to prevent Log Injection (`\r\n`).

#### A10: Server-Side Request Forgery (SSRF)
- Inspect HTTP client requests (`RestClient`, `RestTemplate`, `WebClient`) in `api-app` for unvalidated destination URIs.

---

### 3. Security Audit Report Generation

After scanning, produce a **Security Review Report** in the following structure:

```markdown
# Full-Stack Security Review & OWASP Audit Report

## Audit Summary
- **Backend Files Scanned (`api-app/`)**: `[List of files]`
- **Frontend Files Scanned (`ui-app/`)**: `[List of files]`
- **Overall Status**: [PASSED / ACTION REQUIRED / CRITICAL VULNERABILITIES FOUND]
- **Vulnerability Count**: [X Critical, Y High, Z Medium, W Low]

## Vulnerability Details & Remediation

### 1. [Severity: CRITICAL/HIGH/MEDIUM/LOW] - [Vulnerability Name]
- **OWASP Category**: [e.g., A03:2021 Injection - Cross-Site Scripting (XSS)]
- **App**: `[api-app / ui-app]`
- **File**: `[FilePath:LineNumber]`
- **Vulnerable Code Snippet**:
  ```javascript / java
  // Problematic code snippet
  ```
- **Risk Analysis**: [Description of security threat and potential exploit]
- **Remediation Code Fix**:
  ```javascript / java
  // Fixed secure code snippet
  ```

## Best Practice Recommendations
1. [Recommendation 1]
2. [Recommendation 2]
```
