import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router";

import MenuItemReviewForm from "main/components/MenuItemReviews/MenuItemReviewForm";
import { menuItemReviewFixtures } from "fixtures/menuItemReviewFixtures";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("MenuItemReviewForm tests", () => {
  const queryClient = new QueryClient();

  const expectedHeaders = [
    "Item Id",
    "Reviewer Email",
    "Stars",
    "Date Reviewed (iso format)",
    "Comments",
  ];
  const testId = "MenuItemReviewForm";

  test("renders correctly with no initialContents", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <MenuItemReviewForm />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });
  });

  test("renders correctly when passing in initialContents", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <MenuItemReviewForm
            initialContents={menuItemReviewFixtures.oneReview}
          />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expect(await screen.findByTestId(`${testId}-id`)).toBeInTheDocument();
    expect(screen.getByText(`Id`)).toBeInTheDocument();

    const review = menuItemReviewFixtures.oneReview;
    expect(screen.getByTestId(`${testId}-id`)).toHaveValue(String(review.id));
    expect(screen.getByLabelText("Item Id")).toHaveValue(String(review.itemId));
    expect(screen.getByLabelText("Reviewer Email")).toHaveValue(
      review.reviewerEmail,
    );
    expect(screen.getByLabelText("Stars")).toHaveValue(String(review.stars));
    expect(screen.getByLabelText("Comments")).toHaveValue(review.comments);
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <MenuItemReviewForm />
        </Router>
      </QueryClientProvider>,
    );
    expect(await screen.findByTestId(`${testId}-cancel`)).toBeInTheDocument();
    const cancelButton = screen.getByTestId(`${testId}-cancel`);

    fireEvent.click(cancelButton);

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });

  test("that the correct validations are performed", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <MenuItemReviewForm />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();
    const submitButton = screen.getByText(/Create/);
    fireEvent.click(submitButton);

    await screen.findByText(/Item Id is required/);
    expect(screen.getByText(/Reviewer Email is required/)).toBeInTheDocument();
    expect(screen.getByText(/Stars is required/)).toBeInTheDocument();
    expect(screen.getByText(/Date Reviewed is required/)).toBeInTheDocument();
    expect(screen.getByText(/Comments is required/)).toBeInTheDocument();

    const itemIdInput = screen.getByTestId(`${testId}-itemId`);

    // pattern rule: non-digits
    fireEvent.change(itemIdInput, { target: { value: "abc" } });
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText(/Item Id must be a number/)).toBeInTheDocument();
    });

    // max rule: digits, but too large
    fireEvent.change(itemIdInput, { target: { value: "1000000000" } });
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText(/Max value 999999999/)).toBeInTheDocument();
    });

    // reviewer email pattern
    fireEvent.change(screen.getByLabelText("Reviewer Email"), {
      target: { value: "not-an-email" },
    });
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(
        screen.getByText(/Reviewer Email must be a valid email address/),
      ).toBeInTheDocument();
    });

    // stars pattern
    const starsInput = screen.getByLabelText("Stars");
    fireEvent.change(starsInput, { target: { value: "abc" } });
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText(/Stars must be a number/)).toBeInTheDocument();
    });

    // stars max
    fireEvent.change(starsInput, { target: { value: "6" } });
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(
        screen.getByText(/Stars must be between 0 and 5/),
      ).toBeInTheDocument();
    });

    // comments max length
    fireEvent.change(screen.getByLabelText("Comments"), {
      target: { value: "a".repeat(256) },
    });
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText(/Max length 255 characters/)).toBeInTheDocument();
    });
  });
});
