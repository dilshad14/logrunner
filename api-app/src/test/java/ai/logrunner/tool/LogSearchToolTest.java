package ai.logrunner.tool;

import ai.logrunner.dto.ClusterConfigDto;
import ai.logrunner.dto.ElasticConfigDto;
import ai.logrunner.security.ClusterContextHolder;
import ai.logrunner.service.log.ElasticsearchLogService;
import ai.logrunner.service.log.LogSearchRouter;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LogSearchToolTest {

    @Mock
    private ElasticsearchLogService elasticsearchLogService;

    @Mock
    private ai.logrunner.service.log.CloudWatchLogService cloudWatchLogService;

    private LogSearchTool tool;

    @BeforeEach
    void setUp() {
        LogSearchRouter router = new LogSearchRouter(elasticsearchLogService, cloudWatchLogService);
        tool = new LogSearchTool(router);
    }

    @AfterEach
    void tearDown() {
        ClusterContextHolder.clear();
    }

    @Test
    void testApplyWithValidClusterInContext() {
        ClusterConfigDto cluster = new ClusterConfigDto(
                "prod-elk",
                "Elastic",
                new ElasticConfigDto("http://localhost:9200", "dummy-key", "app-logs-*"),
                null
        );
        ClusterContextHolder.setClusters(List.of(cluster));

        when(elasticsearchLogService.searchLogs(eq("prod-elk"), any(), eq("order-99"), any(), any()))
                .thenReturn("{\"status\": \"SUCCESS\", \"hits\": 5}");

        LogSearchTool.Response res = tool.apply(new LogSearchTool.Request(
                "prod-elk", "order-99", null, null
        ));

        assertNotNull(res);
        assertTrue(res.logData().contains("SUCCESS"));
    }

    @Test
    void testApplyWithUnknownClusterReturnsError() {
        ClusterContextHolder.clear();

        LogSearchTool.Response res = tool.apply(new LogSearchTool.Request(
                "unknown-cluster", "order-99", null, null
        ));

        assertNotNull(res);
        assertTrue(res.logData().contains("ERROR"));
        assertTrue(res.logData().contains("unknown-cluster"));
    }

    @Test
    void testApplyWithNullClusterName() {
        LogSearchTool.Response res = tool.apply(new LogSearchTool.Request(
                null, "order-99", null, null
        ));

        assertNotNull(res);
        assertTrue(res.logData().contains("ERROR"));
    }
}
