package edu.ucsb.cs156.example.web;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

import edu.ucsb.cs156.example.WebTestCase;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
@ActiveProfiles("integration")
@DirtiesContext(classMode = ClassMode.BEFORE_EACH_TEST_METHOD)
public class ArticleWebIT extends WebTestCase {

  @Test
  public void admin_user_can_create_article() throws Exception {

    setupUser(true);

    page.locator("a[href='/articles']").click();

    page.getByText("Create Article").click();
    assertThat(page.getByText("Create New Article")).isVisible();

    page.getByTestId("ArticlesForm-url").fill("https://example.com/article");

    page.getByTestId("ArticlesForm-explanation").fill("JPA04 end-to-end test");

    page.getByTestId("ArticlesForm-email").fill("test@example.com");

    page.getByTestId("ArticlesForm-title").fill("Test Article");

    page.getByTestId("ArticlesForm-dateAdded").fill("2026-11-02T12:00");

    page.getByTestId("ArticlesForm-submit").click();

    assertThat(page.getByTestId("ArticlesTable-cell-row-0-col-title")).hasText("Test Article");

    assertThat(page.getByTestId("ArticlesTable-cell-row-0-col-explanation"))
        .hasText("JPA04 end-to-end test");

    assertThat(page.getByTestId("ArticlesTable-cell-row-0-col-email")).hasText("test@example.com");
  }
}
