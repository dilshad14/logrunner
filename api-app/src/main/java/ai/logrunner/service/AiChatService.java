package ai.logrunner.service;

import ai.logrunner.dto.ChatMessageDto;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.SystemMessage;
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

    public String getChatResponse(String userMessage, List<ChatMessageDto> history) {
        List<Message> messages = new ArrayList<>();
        messages.add(new SystemMessage(systemMessageText));
        
        if (history != null) {
            for (ChatMessageDto msg : history) {
                if ("user".equalsIgnoreCase(msg.role())) {
                    messages.add(new UserMessage(msg.content()));
                } else if ("assistant".equalsIgnoreCase(msg.role())) {
                    messages.add(new AssistantMessage(msg.content()));
                }
            }
        }
        messages.add(new UserMessage(userMessage));
        
        try {
            return chatClient.prompt(new Prompt(messages)).call().content();
        } catch (Exception e) {
            return "**Error**: Missing API Key or Connection Failed.\n\nPlease configure `GEMINI_API_KEY` in your environment.\n\n*Simulated response for UI testing purposes.*";
        }
    }
}
