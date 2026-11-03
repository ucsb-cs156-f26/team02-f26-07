package edu.ucsb.cs156.example.integration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.ucsb.cs156.example.entities.Articles;
import edu.ucsb.cs156.example.repositories.ArticlesRepository;
import edu.ucsb.cs156.example.testconfig.TestConfig;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("integration")
@Import(TestConfig.class)
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
public class ArticleIT {

  @Autowired ArticlesRepository articleRepository;
  @Autowired MockMvc mockMvc;
  @Autowired ObjectMapper mapper;

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void admin_can_create_article_in_database() throws Exception {

    long countBefore = articleRepository.count();

    MvcResult response =
        mockMvc
            .perform(
                post("/api/Articles/post")
                    .param("title", "Test Article")
                    .param("url", "https://example.com/article")
                    .param("explanation", "JPA04 integration test")
                    .param("email", "test@example.com")
                    .param("dateAdded", "2026-11-02T12:00:00")
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    Articles created =
        mapper.readValue(response.getResponse().getContentAsString(), Articles.class);

    Articles saved = articleRepository.findById(created.getId()).orElseThrow();

    assertEquals(countBefore + 1, articleRepository.count());
    assertEquals("Test Article", saved.getTitle());
    assertEquals("https://example.com/article", saved.getUrl());
    assertEquals("JPA04 integration test", saved.getExplanation());
    assertEquals("test@example.com", saved.getEmail());
  }
}
