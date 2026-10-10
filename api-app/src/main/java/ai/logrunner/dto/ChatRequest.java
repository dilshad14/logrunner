package ai.logrunner.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public record ChatRequest(
    @NotBlank String message,
    List<ChatMessageDto> history,
    String orderDetail,
    String startDate,
    String endDate,
    String timezone,
    List<ClusterConfigDto> selectedClusters
) {}
