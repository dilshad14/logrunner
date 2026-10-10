package ai.logrunner.security;

import ai.logrunner.dto.ClusterConfigDto;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * ThreadLocal security context that stores cluster connection credentials and request timezone
 * during a request lifecycle.
 * In accordance with security requirements, cluster endpoints, API keys, and secrets are NEVER passed
 * to the LLM; instead, the tool dynamically injects them at execution time from this context using the clusterName.
 */
public final class ClusterContextHolder {

    private static final ThreadLocal<Map<String, ClusterConfigDto>> CONTEXT =
            ThreadLocal.withInitial(HashMap::new);

    private static final ThreadLocal<String> TIMEZONE_CONTEXT =
            ThreadLocal.withInitial(() -> "SGT");

    private ClusterContextHolder() {}

    public static void setClusters(List<ClusterConfigDto> clusters) {
        Map<String, ClusterConfigDto> map = new HashMap<>();
        if (clusters != null) {
            for (ClusterConfigDto cluster : clusters) {
                if (cluster.clusterName() != null) {
                    map.put(cluster.clusterName().trim().toLowerCase(), cluster);
                }
            }
        }
        CONTEXT.set(map);
    }

    public static ClusterConfigDto getCluster(String clusterName) {
        if (clusterName == null) {
            return null;
        }
        return CONTEXT.get().get(clusterName.trim().toLowerCase());
    }

    public static Set<String> getAvailableClusterNames() {
        return Collections.unmodifiableSet(CONTEXT.get().keySet());
    }

    public static void setTimezone(String timezone) {
        if (timezone != null && !timezone.isBlank()) {
            TIMEZONE_CONTEXT.set(timezone.trim());
        } else {
            TIMEZONE_CONTEXT.set("SGT");
        }
    }

    public static String getTimezone() {
        return TIMEZONE_CONTEXT.get();
    }

    public static void clear() {
        CONTEXT.remove();
        TIMEZONE_CONTEXT.remove();
    }
}

