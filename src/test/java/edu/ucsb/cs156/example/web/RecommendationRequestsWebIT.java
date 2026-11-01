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
public class RecommendationRequestsWebIT extends WebTestCase {
  @Test
  public void admin_user_can_create_edit_delete_recommendation_request() throws Exception {
    setupUser(true);

    page.getByText("Recommendation Requests").click();

    page.getByText("Create Recommendation Request").click();
    assertThat(page.getByText("Create New Recommendation Request")).isVisible();
    page.getByLabel("Requester Email").fill("req1@ucsb.edu");
    page.getByLabel("Professor Email").fill("prof1@ucsb.edu");
    page.getByLabel("Explanation").fill("BS/MS");
    page.getByLabel("Date Requested (iso format)").pressSequentially("01-03-002022-09:15-1");
    page.getByLabel("Date Needed (iso format)").pressSequentially("02-03-002022-11:59-2");
    page.getByLabel("Done").click();
    page.getByTestId("RecommendationRequestForm-submit").click();

    assertThat(page.getByTestId("RecommendationRequestTable-cell-row-0-col-explanation"))
        .hasText("BS/MS");

    page.getByTestId("RecommendationRequestTable-cell-row-0-col-Edit-button").click();
    assertThat(page.getByText("Edit Recommendation Request")).isVisible();
    page.getByLabel("Explanation").fill("PhD");
    page.getByTestId("RecommendationRequestForm-submit").click();

    assertThat(page.getByTestId("RecommendationRequestTable-cell-row-0-col-explanation"))
        .hasText("PhD");

    page.getByTestId("RecommendationRequestTable-cell-row-0-col-Delete-button").click();

    assertThat(page.getByTestId("RecommendationRequestTable-cell-row-0-col-requesterEmail"))
        .not()
        .isVisible();
  }

  public void isodatePlaywriter(String label, String isodate) {
    page.getByLabel("Date Requested (iso format)").click();
  }

  @Test
  public void regular_user_cannot_create_recommendation_request() throws Exception {
    setupUser(false);

    page.getByText("Recommendation Requests").click();

    assertThat(page.getByText("Create Recommendation Request")).not().isVisible();
  }

  @Test
  public void admin_user_can_create_recommendation_request() throws Exception {
    setupUser(true);

    page.getByText("Recommendation Requests").click();

    assertThat(page.getByText("Create Recommendation Request")).isVisible();
  }
}
