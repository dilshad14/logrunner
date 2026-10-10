package ai.logrunner.service;

import ai.logrunner.dto.ChatMessageDto;
import ai.logrunner.dto.ChatRequest;
import ai.logrunner.dto.ClusterConfigDto;
import ai.logrunner.security.ClusterContextHolder;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class AiChatService {
    private final ChatClient chatClient;
    private final String systemMessageText;

    public AiChatService(ChatClient chatClient,
                         @Value("${application.chat.system-message}") String systemMessageText) {
        this.chatClient = chatClient;
        this.systemMessageText = systemMessageText;
    }

    public String getChatResponse(ChatRequest request) {
        if (request == null) {
            return "No request provided.";
        }

        try {
            // SECURITY: Store credentials in request-scoped security context.
            // Credentials are NEVER included in the prompt or exposed to LLM.
            ClusterContextHolder.setClusters(request.selectedClusters());

            StringBuilder promptBuilder = new StringBuilder(systemMessageText);

            if (request.selectedClusters() != null && !request.selectedClusters().isEmpty()) {
                promptBuilder.append("\n\n### Available Log Clusters for Querying:\n");
                promptBuilder.append("The user has authorized the following log clusters for this session:\n");
                for (ClusterConfigDto cluster : request.selectedClusters()) {
                    promptBuilder.append("- Cluster Name: \"")
                            .append(cluster.clusterName())
                            .append("\" (Type: ").append(cluster.type()).append(")\n");
                }
                promptBuilder.append("\nYou can use the `searchSystemLogs` tool to search logs in these clusters using their exact Cluster Name. ");
                promptBuilder.append("Correlate logs across all available clusters to determine error root causes, request timelines, and order statuses.");
            }

            List<Message> messages = new ArrayList<>();
            messages.add(new SystemMessage(promptBuilder.toString()));

            if (request.history() != null) {
                for (ChatMessageDto msg : request.history()) {
                    if ("user".equalsIgnoreCase(msg.role())) {
                        messages.add(new UserMessage(msg.content()));
                    } else if ("assistant".equalsIgnoreCase(msg.role())) {
                        messages.add(new AssistantMessage(msg.content()));
                    }
                }
            }

            // Build user message with search scope metadata if provided
            StringBuilder userContent = new StringBuilder();
            List<String> scopeItems = new ArrayList<>();
            if (request.orderDetail() != null && !request.orderDetail().isBlank()) {
                scopeItems.add("Order/Txn Ref: " + request.orderDetail().trim());
            }
            if (request.startDate() != null && !request.startDate().isBlank()) {
                scopeItems.add("Start Date: " + request.startDate().trim());
            }
            if (request.endDate() != null && !request.endDate().isBlank()) {
                scopeItems.add("End Date: " + request.endDate().trim());
            }
            if (request.timezone() != null && !request.timezone().isBlank()) {
                scopeItems.add("Timezone: " + request.timezone().trim());
            }

            if (!scopeItems.isEmpty()) {
                userContent.append("[Search Parameters: ").append(String.join(" | ", scopeItems)).append("]\n");
            }

            String mainMsg = request.message() != null ? request.message() : "";
            userContent.append(mainMsg);

            messages.add(new UserMessage(userContent.toString()));

            boolean hasClusters = request.selectedClusters() != null && !request.selectedClusters().isEmpty();

            if (hasClusters) {
                return chatClient.prompt(new Prompt(messages))
                        .functions("searchSystemLogs")
                        .call()
                        .content();
            } else {
                return chatClient.prompt(new Prompt(messages))
                        .call()
                        .content();
            }

        } catch (Exception e) {
            return "**Error**: API Call or Model Execution Failed.\n\n"
                    + "Detail: " + (e.getMessage() != null ? e.getMessage() : e.toString())
                    + "\n\n*Please ensure GEMINI_API_KEY is configured in your environment.*";
        } finally {
            // Ensure thread context is cleaned up
            ClusterContextHolder.clear();
        }
    }

    public String getChatResponse(String userMessage, List<ChatMessageDto> history) {
        return getChatResponse(new ChatRequest(userMessage, history, null, null, null, null, null));
    }
}
