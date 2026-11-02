import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router";

import ArticlesForm from "main/components/Articles/ArticlesForm";
import { articlesFixtures } from "fixtures/articlesFixtures";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("ArticlesForm tests", () => {
  const queryClient = new QueryClient();

  const expectedHeaders = [
    "URL",
    "Explanation",
    "Email",
    "Title",
    "Date Added",
  ];
  const testId = "ArticlesForm";

  test("renders correctly", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <ArticlesForm />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expect(screen.queryByTestId(`${testId}-id`)).not.toBeInTheDocument();
  });

  test("renders correctly when passing in initialContents", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <ArticlesForm
            initialContents={articlesFixtures.oneArticle}
            buttonLabel="Update"
          />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Update/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expect(await screen.findByTestId(`${testId}-id`)).toBeInTheDocument();
    expect(screen.getByText("Id")).toBeInTheDocument();
    expect(screen.getByTestId(`${testId}-id`)).toHaveValue("1");
    expect(screen.getByTestId(`${testId}-id`)).toHaveAttribute("readonly");

    expect(screen.getByTestId(`${testId}-url`)).toHaveValue(
      articlesFixtures.oneArticle.url,
    );
    expect(screen.getByTestId(`${testId}-title`)).toHaveValue(
      articlesFixtures.oneArticle.title,
    );
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <ArticlesForm />
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
          <ArticlesForm />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();
    const submitButton = screen.getByText(/Create/);
    fireEvent.click(submitButton);

    await screen.findByText(/URL is required/);
    expect(screen.getByText(/Please add an explanation/)).toBeInTheDocument();
    expect(screen.getByText(/Enter an email address/)).toBeInTheDocument();
    expect(screen.getByText(/Article needs a title/)).toBeInTheDocument();
    expect(screen.getByText(/Select a date and time/)).toBeInTheDocument();
  });

  test("checks invalid URL, email, and blank text", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <ArticlesForm />
        </Router>
      </QueryClientProvider>,
    );

    fireEvent.change(screen.getByTestId(`${testId}-url`), {
      target: { value: "invalid-url" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-email`), {
      target: { value: "not-an-email" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-title`), {
      target: { value: "   " },
    });
    fireEvent.change(screen.getByTestId(`${testId}-explanation`), {
      target: { value: "   " },
    });

    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    await screen.findByText(/Please enter a valid URL/);
    expect(screen.getByText(/Invalid email format/)).toBeInTheDocument();
    expect(screen.getByText(/Title cannot be empty/)).toBeInTheDocument();
    expect(screen.getByText(/Explanation cannot be blank/)).toBeInTheDocument();
  });

  test("submits valid article data", async () => {
    const mockSubmitAction = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <ArticlesForm submitAction={mockSubmitAction} />
        </Router>
      </QueryClientProvider>,
    );

    fireEvent.change(screen.getByTestId(`${testId}-url`), {
      target: { value: "https://google.com/article1" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-explanation`), {
      target: { value: "introduction to software practices" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-email`), {
      target: { value: "student@ucsb.edu" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-title`), {
      target: { value: "Software Basics" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-dateAdded`), {
      target: { value: "2026-10-24T10:30" },
    });

    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    await waitFor(() => expect(mockSubmitAction).toHaveBeenCalledTimes(1));
  });
});
