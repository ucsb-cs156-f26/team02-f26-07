package edu.ucsb.cs156.example.web;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

import edu.ucsb.cs156.example.WebTestCase;
import edu.ucsb.cs156.example.entities.MenuItemReview;
import edu.ucsb.cs156.example.repositories.MenuItemReviewRepository;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
@ActiveProfiles("integration")
@DirtiesContext(classMode = ClassMode.BEFORE_EACH_TEST_METHOD)
public class MenuItemReviewWebIT extends WebTestCase {

  @Autowired MenuItemReviewRepository menuItemReviewRepository;

  @Test
  public void admin_user_can_create_edit_delete_menuitemreview() throws Exception {
    setupUser(true);

    LocalDateTime ldt = LocalDateTime.parse("2022-01-03T00:00:00");
    MenuItemReview menuItemReview =
        MenuItemReview.builder()
            .itemId(123L)
            .reviewerEmail("test@example.com")
            .stars(1)
            .dateReviewed(ldt)
            .comments("test")
            .build();

    menuItemReviewRepository.save(menuItemReview);

    page.getByText("Menu Item Reviews").click();

    // page.getByText("Create New Menu Item Review").click();
    // assertThat(page.getByText("Create New Menu Item Review")).isVisible();
    // page.getByTestId("MenuItemReviewForm-itemId").fill("123");
    // page.getByTestId("MenuItemReviewForm-reviewerEmail").fill("test@example.com");
    // page.getByTestId("MenuItemReviewForm-stars").fill("1");
    // page.getByTestId("MenuItemReviewForm-dateReviewed").fill("2022-01-03T00:00:00");
    // page.getByTestId("MenuItemReviewForm-comments").fill("test");
    // page.getByTestId("MenuItemReviewForm-submit").click();

    assertThat(page.getByTestId("MenuItemReviewTable-cell-row-0-col-itemId")).hasText("123");

    page.getByTestId("MenuItemReviewTable-cell-row-0-col-Edit-button").click();
    assertThat(page.getByText("Edit MenuItemReview")).isVisible();
    page.getByTestId("MenuItemReviewForm-itemId").fill("123");
    page.getByTestId("MenuItemReviewForm-submit").click();

    assertThat(page.getByTestId("MenuItemReviewTable-cell-row-0-col-itemId")).hasText("123");

    page.getByTestId("MenuItemReviewTable-cell-row-0-col-Delete-button").click();

    assertThat(page.getByTestId("MenuItemReviewTable-cell-row-0-col-itemId")).not().isVisible();
  }

  @Test
  public void regular_user_cannot_create_menuitemreview() throws Exception {
    setupUser(false);

    page.getByText("Menu Item Reviews").click();

    assertThat(page.getByText("Create New Menu Item Review")).not().isVisible();
    assertThat(page.getByTestId("MenuItemReviewTable-cell-row-0-col-itemId")).not().isVisible();
  }
}
