package ai.logrunner.tool;

import ai.logrunner.service.log.LogSearchRouter;
import com.fasterxml.jackson.annotation.JsonPropertyDescription;
import org.springframework.context.annotation.Description;
import org.springframework.stereotype.Component;

import java.util.function.Function;

/**
 * Spring AI Tool / Function allowing the LLM to search logs across designated clusters.
 * 
 * SECURITY COMPLIANCE:
 * The LLM only receives and passes clusterName, query, and time range.
 * Hostnames, API keys, and AWS credentials are NEVER exposed to the LLM model schema.
 */
@Component("searchSystemLogs")
@Description("Search system logs from selected Elasticsearch or AWS CloudWatch clusters by cluster name, query keyword or order ID, and time window.")
public class LogSearchTool implements Function<LogSearchTool.Request, LogSearchTool.Response> {

    private final LogSearchRouter router;

    public LogSearchTool(LogSearchRouter router) {
        this.router = router;
    }

    public record Request(
            @JsonPropertyDescription("The friendly name of the cluster to search (must match one of the selected cluster names)")
            String clusterName,
            @JsonPropertyDescription("Search keyword, error message, transaction reference, or order ID to filter logs")
            String query,
            @JsonPropertyDescription("Optional start time boundary in ISO-8601 or date format")
            String startTime,
            @JsonPropertyDescription("Optional end time boundary in ISO-8601 or date format")
            String endTime
    ) {}

    public record Response(String logData) {}

    @Override
    public Response apply(Request request) {
        if (request == null || request.clusterName() == null || request.clusterName().isBlank()) {
            return new Response("{\"status\": \"ERROR\", \"message\": \"clusterName parameter is required.\"}");
        }
        String result = router.routeSearch(
                request.clusterName(),
                request.query(),
                request.startTime(),
                request.endTime()
        );
        return new Response(result);
    }
}
