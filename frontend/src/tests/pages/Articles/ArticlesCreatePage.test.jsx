import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import ArticlesCreatePage from "main/pages/Articles/ArticlesCreatePage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

const mockToast = vi.fn();

vi.mock("react-toastify", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    toast: vi.fn((x) => mockToast(x)),
  };
});

const mockNavigate = vi.fn();

vi.mock("react-router", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

describe("ArticlesCreatePage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    axiosMock.reset();
    axiosMock.resetHistory();
    mockToast.mockClear();
    mockNavigate.mockClear();

    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);

    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  test("renders without crashing", async () => {
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ArticlesCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("ArticlesForm-url")).toBeInTheDocument();
    });

    expect(screen.getByText("Create New Article")).toBeInTheDocument();
    expect(screen.getByTestId("ArticlesForm-submit")).toBeInTheDocument();
  });

  test("when you fill in the form and hit submit, it makes a request to the backend", async () => {
    const queryClient = new QueryClient();

    const article = {
      id: 17,
      url: "https://example.com/article",
      explanation: "An interesting article",
      email: "student@ucsb.edu",
      title: "Example Article",
      dateAdded: "2026-10-27T10:30",
    };

    axiosMock.onPost("/api/Articles/post").reply(201, article);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ArticlesCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("ArticlesForm-url")).toBeInTheDocument();
    });

    const urlField = screen.getByTestId("ArticlesForm-url");
    const explanationField = screen.getByTestId("ArticlesForm-explanation");
    const emailField = screen.getByTestId("ArticlesForm-email");
    const titleField = screen.getByTestId("ArticlesForm-title");
    const dateAddedField = screen.getByTestId("ArticlesForm-dateAdded");
    const submitButton = screen.getByTestId("ArticlesForm-submit");

    fireEvent.change(urlField, {
      target: { value: article.url },
    });
    fireEvent.change(explanationField, {
      target: { value: article.explanation },
    });
    fireEvent.change(emailField, {
      target: { value: article.email },
    });
    fireEvent.change(titleField, {
      target: { value: article.title },
    });
    fireEvent.change(dateAddedField, {
      target: { value: article.dateAdded },
    });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(axiosMock.history.post.length).toBe(1);
    });

    expect(axiosMock.history.post[0].params).toEqual({
      url: article.url,
      explanation: article.explanation,
      email: article.email,
      title: article.title,
      dateAdded: article.dateAdded,
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        "New Article Created - id: 17 title: Example Article",
      );
    });

    expect(mockNavigate).toHaveBeenCalledWith({
      to: "/articles",
    });
  });

  test("invalid form submission shows errors and does not call the backend", async () => {
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ArticlesCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("ArticlesForm-url")).toBeInTheDocument();
    });

    const submitButton = screen.getByTestId("ArticlesForm-submit");

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("URL is required.")).toBeInTheDocument();
    });

    expect(screen.getByText("Please add an explanation.")).toBeInTheDocument();
    expect(screen.getByText("Enter an email address.")).toBeInTheDocument();
    expect(screen.getByText("Article needs a title.")).toBeInTheDocument();
    expect(screen.getByText("Select a date and time.")).toBeInTheDocument();

    expect(axiosMock.history.post.length).toBe(0);
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockToast).not.toHaveBeenCalled();

    expect(screen.getByText("Create New Article")).toBeInTheDocument();
  });

  test("invalid URL and email formats prevent submission", async () => {
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ArticlesCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("ArticlesForm-url")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByTestId("ArticlesForm-url"), {
      target: { value: "invalid-url" },
    });
    fireEvent.change(screen.getByTestId("ArticlesForm-email"), {
      target: { value: "invalid-email" },
    });
    fireEvent.change(screen.getByTestId("ArticlesForm-explanation"), {
      target: { value: "Example1 explanation" },
    });
    fireEvent.change(screen.getByTestId("ArticlesForm-title"), {
      target: { value: "Example1 title" },
    });
    fireEvent.change(screen.getByTestId("ArticlesForm-dateAdded"), {
      target: { value: "2026-10-27T02:30" },
    });

    fireEvent.click(screen.getByTestId("ArticlesForm-submit"));

    await waitFor(() => {
      expect(screen.getByText("Please enter a valid URL.")).toBeInTheDocument();
    });

    expect(screen.getByText("Invalid email format.")).toBeInTheDocument();

    expect(axiosMock.history.post.length).toBe(0);
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
