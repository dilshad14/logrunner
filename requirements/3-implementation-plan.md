# Implementation Plan: Timezone Selection (SGT / UCT) & Backend Date-Time Alignment

## Overview
This implementation plan implements **Requirements 3** ([`requirements/3.md`](file:///d:/Study/AI/LogRunner/requirements/3.md)), restricting the UI Timezone dropdown to only two values: **SGT** (Singapore Time, UTC+8, set as default) and **UCT** / UTC (Coordinated Universal Time), and aligning the backend log search services ([`api-app`](file:///d:/Study/AI/LogRunner/api-app)) to correctly parse and convert date-time boundaries against Elasticsearch and AWS CloudWatch clusters based on the selected timezone.

---

## Key Technical Decisions
- **Frontend Stack (`ui-app`)**:
  - Restrict the Timezone `<select>` dropdown in [`ChatInput.jsx`](file:///d:/Study/AI/LogRunner/ui-app/src/components/ChatInput.jsx) to **SGT** and **UCT** only.
  - Set default state to **`SGT`**.
  - Pass the selected timezone (`SGT` or `UCT`) in the API request payload.
  - Update unit test assertions in [`ChatInput.test.jsx`](file:///d:/Study/AI/LogRunner/ui-app/src/components/__tests__/ChatInput.test.jsx) to verify `SGT` is default and only `SGT` and `UCT` options are available.
- **Backend Stack (`api-app`)**:
  - Create a dedicated timezone utility `DateTimeZoneUtil` in `ai.logrunner.util`:
    - Resolves `"SGT"` to `ZoneId.of("Asia/Singapore")` (UTC+8).
    - Resolves `"UCT"` or `"UTC"` to `ZoneOffset.UTC` (UTC+0).
    - Parses HTML datetime-local inputs (`yyyy-MM-dd'T'HH:mm` or `yyyy-MM-dd'T'HH:mm:ss`) and ISO-8601 strings into zoned timestamps.
  - **AWS CloudWatch Logs Integration**:
    - Converts input start/end date-times into exact epoch milliseconds using the resolved timezone, preventing invalid timezone shifts when querying CloudWatch log streams.
  - **Elasticsearch Integration**:
    - Formats start/end date-times with full ISO-8601 offset strings (e.g. `2026-10-11T14:30:00+08:00` for SGT or `2026-10-11T06:30:00Z` for UCT/UTC) to ensure Elasticsearch `@timestamp` range queries accurately filter records.
  - **Security Context & Tool Support**:
    - Extend [`ClusterContextHolder`](file:///d:/Study/AI/LogRunner/api-app/src/main/java/ai/logrunner/security/ClusterContextHolder.java) to store the active request's timezone.
    - Extend [`LogSearchTool`](file:///d:/Study/AI/LogRunner/api-app/src/main/java/ai/logrunner/tool/LogSearchTool.java) and [`LogSearchRouter`](file:///d:/Study/AI/LogRunner/api-app/src/main/java/ai/logrunner/service/log/LogSearchRouter.java) to accept an optional `timezone` parameter with fallback to the request context.
    - Ensure [`AiChatService`](file:///d:/Study/AI/LogRunner/api-app/src/main/java/ai/logrunner/service/AiChatService.java) clearly instructs the LLM on the active timezone offset for log correlation.

---

## Detailed Component Breakdown

### A. Backend Application Layer (`api-app/`)

#### 1. Utilities (`ai.logrunner.util`)
- **New Class**: `api-app/src/main/java/ai/logrunner/util/DateTimeZoneUtil.java`
  - `resolveZoneId(String timezoneStr)`: maps `"SGT"` -> `ZoneId.of("Asia/Singapore")`, `"UCT"` / `"UTC"` -> `ZoneOffset.UTC`.
  - `toEpochMilli(String dateTimeStr, String timezoneStr)`: parses date-time string in context of timezone and returns epoch millis for CloudWatch.
  - `toIsoOffsetString(String dateTimeStr, String timezoneStr)`: parses date-time string and formats with offset (e.g. `+08:00`) for Elasticsearch range filters.

#### 2. Security & Request Context
- **Modified Class**: [`ClusterContextHolder.java`](file:///d:/Study/AI/LogRunner/api-app/src/main/java/ai/logrunner/security/ClusterContextHolder.java)
  - Add `ThreadLocal<String> CURRENT_TIMEZONE` with `setTimezone(String tz)`, `getTimezone()`, and cleanup in `clear()`.

#### 3. Log Services Layer
- **Modified Service**: [`ElasticsearchLogService.java`](file:///d:/Study/AI/LogRunner/api-app/src/main/java/ai/logrunner/service/log/ElasticsearchLogService.java)
  - Accepts `timezone` parameter.
  - Normalizes `startTime` and `endTime` using `DateTimeZoneUtil.toIsoOffsetString(...)` before embedding in `@timestamp` range filter.
- **Modified Service**: [`CloudWatchLogService.java`](file:///d:/Study/AI/LogRunner/api-app/src/main/java/ai/logrunner/service/log/CloudWatchLogService.java)
  - Accepts `timezone` parameter.
  - Converts `startTime` and `endTime` using `DateTimeZoneUtil.toEpochMilli(...)` for `FilterLogEventsRequest.builder().startTime(...).endTime(...)`.
- **Modified Router**: [`LogSearchRouter.java`](file:///d:/Study/AI/LogRunner/api-app/src/main/java/ai/logrunner/service/log/LogSearchRouter.java)
  - Accepts `timezone` parameter (falling back to `ClusterContextHolder.getTimezone()`) and passes to log services.

#### 4. Spring AI Tool & Chat Service
- **Modified Tool**: [`LogSearchTool.java`](file:///d:/Study/AI/LogRunner/api-app/src/main/java/ai/logrunner/tool/LogSearchTool.java)
  - Add optional `timezone` field to `LogSearchTool.Request`.
  - Passes `timezone` to `LogSearchRouter.routeSearch(...)`.
- **Modified Service**: [`AiChatService.java`](file:///d:/Study/AI/LogRunner/api-app/src/main/java/ai/logrunner/service/AiChatService.java)
  - Sets `ClusterContextHolder.setTimezone(request.timezone())`.
  - Enriches system prompt and user search parameters with timezone details (e.g. `Timezone: SGT (UTC+8)`).

#### 5. Backend Tests
- **New Test**: `api-app/src/test/java/ai/logrunner/util/DateTimeZoneUtilTest.java`
  - Verifies SGT (+08:00) and UCT/UTC parsing and conversion.
- **Modified Test**: `api-app/src/test/java/ai/logrunner/tool/LogSearchToolTest.java`
  - Verifies tool handles timezone parameter and context lookup.
- **Modified Test**: `api-app/src/test/java/ai/logrunner/controller/ChatControllerTest.java`
  - Verifies controller handling payload with `"timezone": "SGT"`.

---

### B. Frontend Application Layer (`ui-app/`)

#### 1. UI Components
- **Modified Component**: [`ChatInput.jsx`](file:///d:/Study/AI/LogRunner/ui-app/src/components/ChatInput.jsx)
  - Change initial state: `const [timezone, setTimezone] = useState('SGT');`
  - Restrict dropdown options to:
    ```jsx
    <select
      className="param-select"
      value={timezone}
      onChange={(e) => setTimezone(e.target.value)}
      disabled={isLoading}
    >
      <option value="SGT">SGT</option>
      <option value="UCT">UCT</option>
    </select>
    ```

#### 2. Frontend Tests
- **Modified Test**: [`ChatInput.test.jsx`](file:///d:/Study/AI/LogRunner/ui-app/src/components/__tests__/ChatInput.test.jsx)
  - Update default timezone assertion to `SGT`.
  - Verify dropdown contains exactly `SGT` and `UCT` options and defaults to `SGT`.

---

## Verification Command Checklist
1. **Backend Build & Tests**:
   - `cd api-app && .\gradlew.bat test`
2. **Frontend Build & Unit Tests**:
   - `cd ui-app && npm test`
   - `cd ui-app && npm run build`
3. **Manual Validation**:
   - Verify Timezone dropdown in UI renders only `SGT` and `UCT`.
   - Verify `SGT` is selected by default on page load.
   - Verify submitting a query with a date/time range transmits `SGT` to backend and resolves timestamps with Singapore UTC+8 offset.
