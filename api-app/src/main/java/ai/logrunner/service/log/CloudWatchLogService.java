package ai.logrunner.service.log;

import ai.logrunner.dto.CloudWatchConfigDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.cloudwatchlogs.CloudWatchLogsClient;
import software.amazon.awssdk.services.cloudwatchlogs.model.FilterLogEventsRequest;
import software.amazon.awssdk.services.cloudwatchlogs.model.FilterLogEventsResponse;
import software.amazon.awssdk.services.cloudwatchlogs.model.FilteredLogEvent;

import java.time.Instant;
import java.util.List;

/**
 * Service to execute log search queries against AWS CloudWatch Log Groups.
 */
@Service
public class CloudWatchLogService {

    private static final Logger log = LoggerFactory.getLogger(CloudWatchLogService.class);

    public String searchLogs(String clusterName, CloudWatchConfigDto config, String query, String startTime, String endTime) {
        if (config == null || config.logGroupName() == null || config.logGroupName().isBlank()) {
            return String.format("{\"cluster\": \"%s\", \"status\": \"ERROR\", \"message\": \"Missing CloudWatch Log Group name.\"}", clusterName);
        }

        String regionStr = (config.region() != null && !config.region().isBlank())
                ? config.region().trim()
                : "us-east-1";

        try {
            Region region = Region.of(regionStr);
            CloudWatchLogsClient client;

            if (config.accessKeyId() != null && !config.accessKeyId().isBlank()
                    && config.secretAccessKey() != null && !config.secretAccessKey().isBlank()) {
                AwsBasicCredentials creds = AwsBasicCredentials.create(config.accessKeyId().trim(), config.secretAccessKey().trim());
                client = CloudWatchLogsClient.builder()
                        .region(region)
                        .credentialsProvider(StaticCredentialsProvider.create(creds))
                        .build();
            } else {
                client = CloudWatchLogsClient.builder()
                        .region(region)
                        .build();
            }

            try (client) {
                FilterLogEventsRequest.Builder reqBuilder = FilterLogEventsRequest.builder()
                        .logGroupName(config.logGroupName().trim())
                        .limit(25);

                if (query != null && !query.isBlank()) {
                    reqBuilder.filterPattern(query.trim());
                }

                if (startTime != null && !startTime.isBlank()) {
                    try {
                        reqBuilder.startTime(Instant.parse(startTime).toEpochMilli());
                    } catch (Exception ignored) {
                        // If not ISO-8601, try parsing or leave unbound
                    }
                }

                if (endTime != null && !endTime.isBlank()) {
                    try {
                        reqBuilder.endTime(Instant.parse(endTime).toEpochMilli());
                    } catch (Exception ignored) {
                        // If not ISO-8601, try parsing or leave unbound
                    }
                }

                FilterLogEventsResponse response = client.filterLogEvents(reqBuilder.build());
                List<FilteredLogEvent> events = response.events();

                StringBuilder sb = new StringBuilder();
                sb.append("{\"cluster\": \"").append(clusterName).append("\", ");
                sb.append("\"status\": \"SUCCESS\", ");
                sb.append("\"source\": \"AWS CloudWatch\", ");
                sb.append("\"logGroup\": \"").append(config.logGroupName().trim()).append("\", ");
                sb.append("\"eventCount\": ").append(events.size()).append(", ");
                sb.append("\"events\": [");

                for (int i = 0; i < events.size(); i++) {
                    FilteredLogEvent ev = events.get(i);
                    if (i > 0) sb.append(", ");
                    sb.append("{");
                    sb.append("\"timestamp\": ").append(ev.timestamp()).append(", ");
                    sb.append("\"message\": \"").append(escapeString(ev.message())).append("\"");
                    sb.append("}");
                }
                sb.append("]}");
                return sb.toString();
            }
        } catch (Exception e) {
            log.error("CloudWatch query failed for cluster: {}", clusterName, e);
            return String.format("{\"cluster\": \"%s\", \"status\": \"FAILED\", \"source\": \"AWS CloudWatch\", \"error\": \"%s\"}",
                    clusterName, escapeString(e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    private String escapeString(String input) {
        if (input == null) return "";
        return input.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "");
    }
}
