package ai.logrunner.controller;

import ai.logrunner.dto.ChatRequest;
import ai.logrunner.service.AiChatService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ChatController.class)
class ChatControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AiChatService aiChatService;

    @Test
    void testChatEndpointWithClusters() throws Exception {
        when(aiChatService.getChatResponse(any(ChatRequest.class))).thenReturn("Order correlation response");

        String payload = """
            {
              "message": "Find root cause for order error",
              "orderDetail": "ORD-12345",
              "startDate": "2026-10-10T00:00:00",
              "endDate": "2026-10-10T23:59:59",
              "timezone": "UTC",
              "selectedClusters": [
                {
                  "clusterName": "prod-elk",
                  "type": "Elastic",
                  "elasticConfig": {
                    "serverUrl": "https://es.example.com",
                    "apiKey": "sec-api-key",
                    "indexName": "app-logs-*"
                  }
                }
              ]
            }
            """;

        mockMvc.perform(post("/api/v1/chat")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload)
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.reply").value("Order correlation response"))
        .andExpect(jsonPath("$.status").value("SUCCESS"));
    }
}
