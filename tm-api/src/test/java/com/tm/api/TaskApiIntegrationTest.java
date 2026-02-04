package com.tm.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tm.api.dto.TaskDTO;
import com.tm.api.model.Priority;
import com.tm.api.model.TaskStatus;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@SpringBootTest
@AutoConfigureMockMvc
class TaskApiIntegrationTest {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private ObjectMapper objectMapper;

        @Test
        void shouldCreateAndRetrieveTask() throws Exception {
                TaskDTO task = TaskDTO.builder()
                                .title("Integration Task")
                                .description("Test description")
                                .status(TaskStatus.TODO)
                                .priority(Priority.HIGH)
                                .dueDate(LocalDateTime.now().plusDays(2))
                                .build();

                // 1. Create Task
                mockMvc.perform(post("/tasks")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(task)))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.title").value("Integration Task"));

                // 2. Retrieve all and check
                mockMvc.perform(get("/tasks"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.content[?(@.title == 'Integration Task')]").exists());
        }
}
