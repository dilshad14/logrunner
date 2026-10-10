# Implementation Plan: ELK & AWS CloudWatch Data Sources and Spring AI Tool Integration

## Overview
This implementation plan addresses **Requirements 2** ([`requirements/2.md`](file:///d:/Study/AI/LogRunner/requirements/2.md)), enabling LogRunner to connect to on-prem and cloud-based logging clusters (Elasticsearch and AWS CloudWatch). 
It introduces a Settings modal with Import/Export capabilities, a Data Sources selection panel on the main search interface, Spring AI tool-calling for log searching, and a runtime security context isolation mechanism ensuring sensitive credentials (API keys, hostnames, secrets) are never leaked to the LLM.

---

## Key Technical Decisions
- **Backend Stack (`api-app`)**:
  - **Java 21 / Spring Boot 3.3.6** with Spring AI (`1.0.0-M6`).
  - **Elasticsearch Java Client** (`co.elastic.clients:elasticsearch-java:8.15.3` and `jakarta.json:jakarta.json-api:2.1.3`) for high-performance Elasticsearch log querying.
  - **AWS SDK v2 CloudWatch Logs** (`software.amazon.awssdk:cloudwatchlogs:2.28.25`) for AWS CloudWatch log insights and queries.
  - **Spring AI Tool Calling**: `@Tool` / `FunctionCallback` registered with `ChatClient`.
  - **Security Isolation (`ClusterSecurityContext`)**:
    - The LLM's Tool parameter schema exposes only `clusterName`, `query`, `startTime`, and `endTime`.
    - Hostnames, API keys, and AWS secrets are passed from `ui-app` in the HTTP request payload and stored in a request-scoped / ThreadLocal `ClusterContextHolder`.
    - The Tool retrieves connection credentials from context at runtime using `clusterName`, preventing credential exposure in LLM system prompts or token context.
- **Frontend Stack (`ui-app`)**:
  - **React 18** with `lucide-react` icons.
  - **Settings Modal Component**: Settings gear icon beside "Log Correlation Engine Active" in Header.
  - **Data Source Types**: Dynamic form fields for `"Elastic"` (Server URL, API Key, Index Pattern) and `"Cloudwatch"` (Region, Log Group Name, Access Key, Secret Key).
  - **Export & Import**: Full settings backup to `logrunner.setting.json` and restore from file, along with browser `localStorage` persistence.
  - **Data Sources Selection Bar**: Multi-select cluster checkboxes displayed above query parameters in the main search interface.

---

## Detailed Component Breakdown

### A. Backend Application Layer (`api-app/`)

#### 1. Build Dependencies (`build.gradle.kts`)
- Add Elasticsearch Java Client: `co.elastic.clients:elasticsearch-java:8.15.3`
- Add JSON-P API: `jakarta.json:jakarta.json-api:2.1.3`
- Add AWS SDK v2 CloudWatch Logs: `software.amazon.awssdk:cloudwatchlogs:2.28.25`

#### 2. Data Transfer Objects (DTOs)
- **New Records (`ai.logrunner.dto`)**:
  - `ClusterConfigDto.java`: Encapsulates `clusterName`, `type` (`"Elastic"` | `"Cloudwatch"`), `elasticConfig` (`serverUrl`, `apiKey`, `indexName`), `cloudwatchConfig` (`region`, `logGroupName`, `accessKeyId`, `secretAccessKey`).
  - `ElasticConfigDto.java`: Record for Elasticsearch connection details.
  - `CloudWatchConfigDto.java`: Record for AWS CloudWatch connection details.
- **Modified Records (`ai.logrunner.dto`)**:
  - `ChatRequest.java`: Extended to include `List<ClusterConfigDto> selectedClusters`, `orderDetail`, `startDate`, `endDate`, and `timezone`.

#### 3. Security Isolation Context
- **New Class (`ai.logrunner.security.ClusterContextHolder.java`)**:
  - ThreadLocal storage `ThreadLocal<Map<String, ClusterConfigDto>>` holding active request cluster credentials.
  - Helper methods: `setClusters(List<ClusterConfigDto>)`, `getCluster(String clusterName)`, `clear()`.

#### 4. Log Access Service Layer
- **New Service (`ai.logrunner.service.log.ElasticsearchLogService.java`)**:
  - Connects to Elasticsearch using `ElasticsearchClient` with API key header authentication.
  - Queries target indices using `match_phrase` or `query_string` and time ranges (`@timestamp` range filter).
  - Returns structured log hit summaries.
- **New Service (`ai.logrunner.service.log.CloudWatchLogService.java`)**:
  - Connects to AWS CloudWatch Logs using `CloudWatchLogsClient` with provided credentials and region.
  - Executes `StartQuery` / `GetQueryResults` or `FilterLogEvents` on specified log groups.
  - Returns structured log events.
- **New Service (`ai.logrunner.service.log.LogSearchRouter.java`)**:
  - Dispatches queries to Elasticsearch or CloudWatch based on cluster type from `ClusterContextHolder`.

#### 5. Spring AI Tool Integration
- **New Tool (`ai.logrunner.tool.LogSearchTool.java`)**:
  - Registered as Spring AI Function / `@Tool`.
  - Input Schema visible to LLM:
    - `clusterName` (String): Target cluster to search (must match one of selected cluster names).
    - `query` (String): Search query, error keyword, or order/transaction reference.
    - `startTime` (String, optional): Start timestamp.
    - `endTime` (String, optional): End timestamp.
  - Execution logic:
    - Retrieves cluster configuration from `ClusterContextHolder` via `clusterName`.
    - Invokes `LogSearchRouter`.
    - Returns JSON log search results (truncated/formatted for LLM context).

#### 6. Service & Controller Layer
- **Modified Service (`ai.logrunner.service.AiChatService.java`)**:
  - Accepts `ChatRequest` containing selected cluster metadata.
  - Populates `ClusterContextHolder`.
  - Augments system prompt with list of available cluster names (without credentials) and instructions on using the `searchSystemLogs` tool.
  - Configures `ChatClient` with `LogSearchTool`.
  - Clears `ClusterContextHolder` in `finally` block.
- **Modified Controller (`ai.logrunner.controller.ChatController.java`)**:
  - Passes request DTO with cluster information to `AiChatService`.

#### 7. Backend Tests
- `api-app/src/test/java/ai/logrunner/service/LogSearchToolTest.java`: Verifies tool execution with context holder resolution and security isolation.
- `api-app/src/test/java/ai/logrunner/service/ElasticsearchLogServiceTest.java`: Unit tests for Elasticsearch query construction.
- `api-app/src/test/java/ai/logrunner/service/CloudWatchLogServiceTest.java`: Unit tests for CloudWatch query execution.
- `api-app/src/test/java/ai/logrunner/controller/ChatControllerTest.java`: Updates controller tests for new request payload structure.

---

### B. Frontend Application Layer (`ui-app/`)

#### 1. State Management & Storage
- **New Storage Utility (`ui-app/src/services/settingsStorage.js`)**:
  - Handles loading and saving cluster configurations in browser `localStorage`.
  - `exportSettings(clusters)`: Exports configurations to `logrunner.setting.json` file download.
  - `importSettings(file)`: Parses and validates uploaded `logrunner.setting.json`.

#### 2. UI Components & Modals
- **New Component (`ui-app/src/components/SettingsModal.jsx`)**:
  - Modal overlay opened via Settings icon in Header.
  - "Data Sources" tab with:
    - List of configured clusters.
    - Fields per cluster:
      - Data Source Type dropdown (`Elastic`, `Cloudwatch`).
      - Cluster Name (friendly name).
      - Elastic fields: API Key (password input), Elasticsearch Server (URL input), Index Name.
      - CloudWatch fields: Region (e.g. `us-east-1`), Log Group Name, Access Key ID, Secret Access Key.
    - `+ Add Cluster` button to append new entries.
    - Delete button per cluster.
    - Top right action buttons: **Export** (downloads `logrunner.setting.json`) and **Import** (file picker upload).
- **Modified Component (`ui-app/src/components/Header.jsx`)**:
  - Added Settings gear icon button next to "Log Correlation Engine Active" status badge.
  - Clicking opens `SettingsModal`.
- **Modified Component (`ui-app/src/components/ChatInput.jsx`)**:
  - Added **"Data Sources"** section at top of inputs.
  - Displays checkboxes for all configured clusters.
  - Maintains state for selected cluster names.
  - If no clusters configured, displays a prompt and link to open Settings.
  - Packages selected cluster configurations into payload sent to `onSendMessage`.
- **Modified Main Component (`ui-app/src/App.jsx`)**:
  - Holds `clusters` state initialized from `localStorage`.
  - Coordinates opening/closing of `SettingsModal`.
  - Passes selected cluster details in `sendChatMessage` payload to backend.
- **Modified API Client (`ui-app/src/services/chatService.js`)**:
  - Sends `selectedClusters`, `orderDetail`, `startDate`, `endDate`, `timezone` in `POST /api/v1/chat`.

#### 3. Frontend Tests
- `ui-app/src/components/__tests__/SettingsModal.test.jsx`: Tests cluster form inputs, add/remove, export/import trigger.
- `ui-app/src/components/__tests__/ChatInput.test.jsx`: Tests cluster checkbox rendering and payload inclusion.

---

## Verification Command Checklist
1. **Backend Build & Tests**:
   - `cd api-app && .\gradlew.bat test`
2. **Frontend Build & Unit Tests**:
   - `cd ui-app && npm test`
   - `cd ui-app && npm run build`
3. **End-to-End Workflow Verification**:
   - Verify Settings modal opens from header gear icon.
   - Verify adding, exporting, and importing `logrunner.setting.json`.
   - Verify clusters appear as selectable checkboxes in Search interface.
   - Verify backend receives selected cluster configurations, executes tool via LLM without leaking credentials, and returns log correlation response.
