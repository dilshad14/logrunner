package ai.logrunner.service.log;

import ai.logrunner.dto.ElasticConfigDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

/**
 * Service to execute search queries against Elasticsearch clusters.
 */
@Service
public class ElasticsearchLogService {

    private static final Logger log = LoggerFactory.getLogger(ElasticsearchLogService.class);
    private final HttpClient httpClient;

    public ElasticsearchLogService() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(5))
                .build();
    }

    public String searchLogs(String clusterName, ElasticConfigDto config, String query, String startTime, String endTime) {
        if (config == null || config.serverUrl() == null || config.serverUrl().isBlank()) {
            return String.format("{\"cluster\": \"%s\", \"status\": \"ERROR\", \"message\": \"Missing Elasticsearch server URL configuration.\"}", clusterName);
        }

        String serverUrl = config.serverUrl().trim();
        if (serverUrl.endsWith("/")) {
            serverUrl = serverUrl.substring(0, serverUrl.length() - 1);
        }

        String indexName = (config.indexName() != null && !config.indexName().isBlank())
                ? config.indexName().trim()
                : "_all";

        String searchEndpoint = serverUrl + "/" + indexName + "/_search";

        String escapedQuery = (query != null && !query.isBlank())
                ? query.replace("\"", "\\\"")
                : "*";

        // Build Elasticsearch Query DSL
        StringBuilder jsonQuery = new StringBuilder();
        jsonQuery.append("{\n");
        jsonQuery.append("  \"size\": 25,\n");
        jsonQuery.append("  \"sort\": [{\"@timestamp\": {\"order\": \"desc\", \"unmapped_type\": \"date\"}}],\n");
        jsonQuery.append("  \"query\": {\n");
        jsonQuery.append("    \"bool\": {\n");
        jsonQuery.append("      \"must\": [\n");
        jsonQuery.append("        {\"query_string\": {\"query\": \"").append(escapedQuery).append("\"}}\n");
        jsonQuery.append("      ]");

        if ((startTime != null && !startTime.isBlank()) || (endTime != null && !endTime.isBlank())) {
            jsonQuery.append(",\n      \"filter\": [\n");
            jsonQuery.append("        {\"range\": {\"@timestamp\": {");
            boolean hasStart = false;
            if (startTime != null && !startTime.isBlank()) {
                jsonQuery.append("\"gte\": \"").append(startTime.trim()).append("\"");
                hasStart = true;
            }
            if (endTime != null && !endTime.isBlank()) {
                if (hasStart) jsonQuery.append(", ");
                jsonQuery.append("\"lte\": \"").append(endTime.trim()).append("\"");
            }
            jsonQuery.append("}}}\n      ]\n");
        } else {
            jsonQuery.append("\n");
        }
        jsonQuery.append("    }\n  }\n}");

        try {
            HttpRequest.Builder reqBuilder = HttpRequest.newBuilder()
                    .uri(URI.create(searchEndpoint))
                    .timeout(Duration.ofSeconds(10))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonQuery.toString()));

            if (config.apiKey() != null && !config.apiKey().isBlank()) {
                String key = config.apiKey().trim();
                if (!key.toLowerCase().startsWith("apikey ") && !key.toLowerCase().startsWith("bearer ")) {
                    reqBuilder.header("Authorization", "ApiKey " + key);
                } else {
                    reqBuilder.header("Authorization", key);
                }
            }

            HttpResponse<String> response = httpClient.send(reqBuilder.build(), HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                return String.format("{\"cluster\": \"%s\", \"status\": \"SUCCESS\", \"source\": \"Elasticsearch\", \"response\": %s}",
                        clusterName, response.body());
            } else {
                return String.format("{\"cluster\": \"%s\", \"status\": \"HTTP_%d\", \"source\": \"Elasticsearch\", \"error\": %s}",
                        clusterName, response.statusCode(), escapeJsonString(response.body()));
            }
        } catch (Exception e) {
            log.error("Elasticsearch query failed for cluster: {}", clusterName, e);
            return String.format("{\"cluster\": \"%s\", \"status\": \"FAILED\", \"source\": \"Elasticsearch\", \"error\": \"%s\"}",
                    clusterName, escapeJsonString(e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    private String escapeJsonString(String input) {
        if (input == null) return "";
        return "\"" + input.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "") + "\"";
    }
}
