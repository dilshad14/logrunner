package ai.logrunner.service.log;

import ai.logrunner.dto.ClusterConfigDto;
import ai.logrunner.security.ClusterContextHolder;
import org.springframework.stereotype.Service;

/**
 * Routes log search queries to the appropriate engine (Elasticsearch or AWS CloudWatch)
 * based on the cluster configuration retrieved at runtime from the security context.
 */
@Service
public class LogSearchRouter {

    private final ElasticsearchLogService elasticsearchLogService;
    private final CloudWatchLogService cloudWatchLogService;

    public LogSearchRouter(ElasticsearchLogService elasticsearchLogService,
                           CloudWatchLogService cloudWatchLogService) {
        this.elasticsearchLogService = elasticsearchLogService;
        this.cloudWatchLogService = cloudWatchLogService;
    }

    public String routeSearch(String clusterName, String query, String startTime, String endTime) {
        ClusterConfigDto cluster = ClusterContextHolder.getCluster(clusterName);

        if (cluster == null) {
            return String.format(
                    "{\"status\": \"ERROR\", \"message\": \"Cluster '%s' is not configured or not selected for this request. Available clusters: %s\"}",
                    clusterName, ClusterContextHolder.getAvailableClusterNames());
        }

        String type = cluster.type() != null ? cluster.type().trim() : "";

        if ("elastic".equalsIgnoreCase(type)) {
            return elasticsearchLogService.searchLogs(cluster.clusterName(), cluster.elasticConfig(), query, startTime, endTime);
        } else if ("cloudwatch".equalsIgnoreCase(type)) {
            return cloudWatchLogService.searchLogs(cluster.clusterName(), cluster.cloudwatchConfig(), query, startTime, endTime);
        } else {
            return String.format("{\"status\": \"ERROR\", \"message\": \"Unsupported cluster type: '%s' for cluster: '%s'\"}", type, clusterName);
        }
    }
}
