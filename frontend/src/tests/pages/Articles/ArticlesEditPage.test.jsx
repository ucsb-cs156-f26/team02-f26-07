import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import ArticlesEditPage from "main/pages/Articles/ArticlesEditPage";

import { articlesFixtures } from "fixtures/articlesFixtures";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import mockConsole from "tests/testutils/mockConsole";

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

const mockRedirect = vi.fn();
const mockGoBack = vi.fn();

vi.mock("react-router", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    useParams: vi.fn(() => ({ id: "1" })),
    useNavigate: () => mockGoBack,
    Navigate: vi.fn((props) => {
      mockRedirect(props);
      return null;
    }),
  };
});

describe("ArticlesEditPage tests", () => {
  let axiosMock;

  const testId = "ArticlesForm";

  const renderPage = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ArticlesEditPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

  beforeEach(() => {
    axiosMock = new AxiosMockAdapter(axios);

    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.adminUser);

    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);

    mockToast.mockClear();
    mockRedirect.mockClear();
    mockGoBack.mockClear();
  });

  afterEach(() => {
    axiosMock.restore();
  });

  test("loads the article and populates the form", async () => {
    axiosMock
      .onGet("/api/Articles", { params: { id: "1" } })
      .reply(200, articlesFixtures.oneArticle);

    renderPage();

    expect(
      screen.getByRole("heading", { name: "Edit Article" }),
    ).toBeInTheDocument();

    const idField = await screen.findByTestId(`${testId}-id`);

    expect(idField).toHaveValue("1");
    expect(idField).toHaveAttribute("readonly");

    expect(screen.getByTestId(`${testId}-url`)).toHaveValue(
      articlesFixtures.oneArticle.url,
    );

    expect(screen.getByTestId(`${testId}-explanation`)).toHaveValue(
      articlesFixtures.oneArticle.explanation,
    );

    expect(screen.getByTestId(`${testId}-email`)).toHaveValue(
      articlesFixtures.oneArticle.email,
    );

    expect(screen.getByTestId(`${testId}-title`)).toHaveValue(
      articlesFixtures.oneArticle.title,
    );

    expect(screen.getByTestId(`${testId}-dateAdded`)).toHaveValue(
      "2026-10-24T10:30",
    );

    expect(screen.getByTestId(`${testId}-submit`)).toHaveTextContent("Update");

    expect(axiosMock.history.get).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          url: "/api/Articles",
          params: { id: "1" },
        }),
      ]),
    );
  });

  test("submits valid changes using PUT and redirects", async () => {
    axiosMock
      .onGet("/api/Articles", { params: { id: "1" } })
      .reply(200, articlesFixtures.oneArticle);

    axiosMock.onPut("/api/Articles").reply(200, {
      id: 1,
      url: "https://example.com/updated",
      explanation: "Updated explanation",
      email: "updated@ucsb.edu",
      title: "Updated Software Basics",
      dateAdded: "2026-10-25T11:45",
    });

    renderPage();

    await screen.findByTestId(`${testId}-id`);

    fireEvent.change(screen.getByTestId(`${testId}-url`), {
      target: { value: "https://example.com/updated" },
    });

    fireEvent.change(screen.getByTestId(`${testId}-explanation`), {
      target: { value: "Updated explanation" },
    });

    fireEvent.change(screen.getByTestId(`${testId}-email`), {
      target: { value: "updated@ucsb.edu" },
    });

    fireEvent.change(screen.getByTestId(`${testId}-title`), {
      target: { value: "Updated Software Basics" },
    });

    fireEvent.change(screen.getByTestId(`${testId}-dateAdded`), {
      target: { value: "2026-10-25T11:45" },
    });

    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    await waitFor(() => {
      expect(axiosMock.history.put.length).toBe(1);
    });

    expect(axiosMock.history.put[0].url).toBe("/api/Articles");
    expect(String(axiosMock.history.put[0].params.id)).toBe("1");

    expect(JSON.parse(axiosMock.history.put[0].data)).toEqual({
      url: "https://example.com/updated",
      explanation: "Updated explanation",
      email: "updated@ucsb.edu",
      title: "Updated Software Basics",
      dateAdded: "2026-10-25T11:45",
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        "Article Updated - id: 1 title: Updated Software Basics",
      );
    });

    expect(mockRedirect).toHaveBeenCalledWith(
      expect.objectContaining({ to: "/articles" }),
    );
  });

  test("invalid changes show errors and do not submit", async () => {
    axiosMock
      .onGet("/api/Articles", { params: { id: "1" } })
      .reply(200, articlesFixtures.oneArticle);

    renderPage();

    await screen.findByTestId(`${testId}-id`);

    fireEvent.change(screen.getByTestId(`${testId}-url`), {
      target: { value: "invalid-url" },
    });

    fireEvent.change(screen.getByTestId(`${testId}-email`), {
      target: { value: "invalid-email" },
    });

    fireEvent.change(screen.getByTestId(`${testId}-title`), {
      target: { value: "   " },
    });

    fireEvent.change(screen.getByTestId(`${testId}-explanation`), {
      target: { value: "   " },
    });

    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    expect(
      await screen.findByText("Please enter a valid URL."),
    ).toBeInTheDocument();

    expect(screen.getByText("Invalid email format.")).toBeInTheDocument();
    expect(screen.getByText("Title cannot be empty.")).toBeInTheDocument();
    expect(
      screen.getByText("Explanation cannot be blank."),
    ).toBeInTheDocument();

    expect(axiosMock.history.put.length).toBe(0);
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  test("Cancel navigates back without saving", async () => {
    axiosMock
      .onGet("/api/Articles", { params: { id: "1" } })
      .reply(200, articlesFixtures.oneArticle);

    renderPage();

    await screen.findByTestId(`${testId}-id`);

    fireEvent.change(screen.getByTestId(`${testId}-title`), {
      target: { value: "Unsaved article title" },
    });

    fireEvent.click(screen.getByTestId(`${testId}-cancel`));

    expect(mockGoBack).toHaveBeenCalledWith(-1);
    expect(axiosMock.history.put.length).toBe(0);
  });

  test("does not render the form when the backend fails", async () => {
    axiosMock.onGet("/api/Articles", { params: { id: "1" } }).timeout();

    const restoreConsole = mockConsole();

    try {
      renderPage();

      expect(
        screen.getByRole("heading", { name: "Edit Article" }),
      ).toBeInTheDocument();

      await waitFor(() => {
        expect(console.error).toHaveBeenCalled();
      });

      expect(screen.queryByTestId(`${testId}-id`)).not.toBeInTheDocument();
    } finally {
      restoreConsole();
    }
  });
});
