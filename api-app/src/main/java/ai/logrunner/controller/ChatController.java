package ai.logrunner.controller;

import ai.logrunner.dto.ChatRequest;
import ai.logrunner.dto.ChatResponse;
import ai.logrunner.service.AiChatService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/chat")
public class ChatController {
    private final AiChatService aiChatService;
    public ChatController(AiChatService aiChatService) {
        this.aiChatService = aiChatService;
    }
    @PostMapping
    public ResponseEntity<ChatResponse> chat(@Valid @RequestBody ChatRequest request) {
        String reply = aiChatService.getChatResponse(request.message(), request.history());
        return ResponseEntity.ok(new ChatResponse(reply, "SUCCESS", LocalDateTime.now()));
    }
}
