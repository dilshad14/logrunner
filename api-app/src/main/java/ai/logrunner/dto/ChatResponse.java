package ai.logrunner.dto;

import java.time.LocalDateTime;

public record ChatResponse(
    String reply,
    String status,
    LocalDateTime timestamp
) {}
