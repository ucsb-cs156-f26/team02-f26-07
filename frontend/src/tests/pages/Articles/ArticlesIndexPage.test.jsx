import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import ArticlesIndexPage from "main/pages/Articles/ArticlesIndexPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";

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

describe("ArticlesIndexPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);
  const testId = "ArticlesTable";

  const setupUser = (user) => {
    axiosMock.reset();
    axiosMock.resetHistory();

    axiosMock.onGet("/api/currentUser").reply(200, user);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);

    mockToast.mockClear();
  };

  const renderPage = () => {
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ArticlesIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

  test("renders Create button for admin user", async () => {
    setupUser(apiCurrentUserFixtures.adminUser);
    axiosMock.onGet("/api/Articles/all").reply(200, []);

    renderPage();

    const button = await screen.findByText("Create Article");

    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("href", "/articles/create");
    expect(button).toHaveAttribute("style", "float: right;");
    expect(
      screen.getByRole("heading", { name: "Articles" }),
    ).toBeInTheDocument();
  });

  test("renders three articles correctly for regular user", async () => {
    setupUser(apiCurrentUserFixtures.userOnly);

    axiosMock
      .onGet("/api/Articles/all")
      .reply(200, articlesFixtures.threeArticles);

    renderPage();

    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-id`),
      ).toHaveTextContent("1");
    });

    expect(screen.getByTestId(`${testId}-cell-row-1-col-id`)).toHaveTextContent(
      "2",
    );

    expect(screen.getByTestId(`${testId}-cell-row-2-col-id`)).toHaveTextContent(
      "3",
    );

    expect(screen.getByText("Software Basics")).toBeInTheDocument();
    expect(screen.getByText("Git Basics")).toBeInTheDocument();
    expect(screen.getByText("Java Basics")).toBeInTheDocument();

    expect(screen.queryByText("Create Article")).not.toBeInTheDocument();

    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Edit-button`),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Delete-button`),
    ).not.toBeInTheDocument();
  });

  test("renders empty table when backend is unavailable", async () => {
    setupUser(apiCurrentUserFixtures.userOnly);
    axiosMock.onGet("/api/Articles/all").timeout();

    const restoreConsole = mockConsole();

    renderPage();

    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });

    expect(console.error.mock.calls[0][0]).toMatch(
      "Error communicating with backend via GET on /api/Articles/all",
    );

    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-id`),
    ).not.toBeInTheDocument();

    restoreConsole();
  });

  test("admin can delete an article and the table refreshes", async () => {
    setupUser(apiCurrentUserFixtures.adminUser);

    let articles = [...articlesFixtures.threeArticles];

    axiosMock.onGet("/api/Articles/all").reply(() => [200, articles]);

    axiosMock.onDelete("/api/Articles").reply((config) => {
      articles = articles.filter((article) => article.id !== config.params.id);

      return [200, "Articles with id 1 deleted"];
    });

    renderPage();

    await screen.findByText("Software Basics");

    const deleteButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-Edit-button`),
    ).toBeInTheDocument();

    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(axiosMock.history.delete.length).toBe(1);
    });

    expect(axiosMock.history.delete[0].url).toBe("/api/Articles");
    expect(axiosMock.history.delete[0].params).toEqual({ id: 1 });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith("Articles with id 1 deleted");
    });

    await waitFor(() => {
      expect(screen.queryByText("Software Basics")).not.toBeInTheDocument();
    });

    expect(screen.getByText("Git Basics")).toBeInTheDocument();
    expect(screen.getByText("Java Basics")).toBeInTheDocument();
  });
});
