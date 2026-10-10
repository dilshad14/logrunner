package ai.logrunner.dto;

import jakarta.validation.constraints.NotBlank;

public record ClusterConfigDto(
    @NotBlank String clusterName,
    @NotBlank String type, // "Elastic" or "Cloudwatch"
    ElasticConfigDto elasticConfig,
    CloudWatchConfigDto cloudwatchConfig
) {}
