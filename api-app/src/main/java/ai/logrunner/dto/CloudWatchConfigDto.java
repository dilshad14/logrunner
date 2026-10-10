package ai.logrunner.dto;

public record CloudWatchConfigDto(
    String region,
    String logGroupName,
    String accessKeyId,
    String secretAccessKey
) {}
