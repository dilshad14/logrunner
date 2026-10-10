package ai.logrunner.dto;

public record ElasticConfigDto(
    String serverUrl,
    String apiKey,
    String indexName
) {}
