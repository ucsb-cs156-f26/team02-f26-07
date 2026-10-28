import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import UCSBDiningCommonsMenuItemIndexPage from "main/pages/UCSBDiningCommonsMenuItem/UCSBDiningCommonsMenuItemIndexPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import mockConsole from "tests/testutils/mockConsole";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { ucsbDiningCommonsMenuItemFixtures } from "fixtures/ucsbDiningCommonsMenuItemFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    toast: vi.fn((message) => mockToast(message)),
  };
});

describe("UCSBDiningCommonsMenuItemIndexPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  const testId = "UCSBDiningCommonsMenuItemTable";

  const setupCurrentUser = (user) => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock.onGet("/api/currentUser").reply(200, user);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  };

  const renderPage = () =>
    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <UCSBDiningCommonsMenuItemIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("shows Create button for admin user", async () => {
    setupCurrentUser(apiCurrentUserFixtures.adminUser);
    axiosMock.onGet("/api/ucsbdiningcommonsmenuitems/all").reply(200, []);

    renderPage();

    const createButton = await screen.findByText(
      "Create UCSB Dining Commons Menu Item",
    );
    expect(createButton).toHaveAttribute(
      "href",
      "/diningcommonsmenuitem/create",
    );
    expect(createButton).toHaveAttribute("style", "float: right;");
  });

  test("renders menu items for regular user without admin actions", async () => {
    setupCurrentUser(apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/ucsbdiningcommonsmenuitems/all")
      .reply(200, ucsbDiningCommonsMenuItemFixtures.threeDiningCommonsMenuItem);

    renderPage();

    expect(
      await screen.findByTestId(`${testId}-cell-row-0-col-id`),
    ).toHaveTextContent("1");
    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-name`),
    ).toHaveTextContent("pizza");
    expect(
      screen.queryByText("Create UCSB Dining Commons Menu Item"),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Edit")).not.toBeInTheDocument();
    expect(screen.queryByText("Delete")).not.toBeInTheDocument();
  });

  test("handles unavailable menu-item endpoint", async () => {
    setupCurrentUser(apiCurrentUserFixtures.userOnly);
    axiosMock.onGet("/api/ucsbdiningcommonsmenuitems/all").timeout();
    const restoreConsole = mockConsole();

    renderPage();

    await waitFor(() => {
      expect(
        console.error.mock.calls.some((call) =>
          call[0].includes(
            "Error communicating with backend via GET on /api/ucsbdiningcommonsmenuitems/all",
          ),
        ),
      ).toBe(true);
    });
    restoreConsole();
    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-id`),
    ).not.toBeInTheDocument();
  });

  test("deletes a menu item using its API endpoint", async () => {
    setupCurrentUser(apiCurrentUserFixtures.adminUser);
    axiosMock
      .onGet("/api/ucsbdiningcommonsmenuitems/all")
      .reply(200, ucsbDiningCommonsMenuItemFixtures.threeDiningCommonsMenuItem);
    axiosMock
      .onDelete("/api/ucsbdiningcommonsmenuitems")
      .reply(200, "Menu item deleted");

    renderPage();

    const deleteButton = await screen.findByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );
    fireEvent.click(deleteButton);

    await waitFor(() => expect(axiosMock.history.delete).toHaveLength(1));
    expect(axiosMock.history.delete[0].url).toBe(
      "/api/ucsbdiningcommonsmenuitems",
    );
    expect(axiosMock.history.delete[0].params).toEqual({ id: 1 });
    await waitFor(() =>
      expect(mockToast).toHaveBeenCalledWith("Menu item deleted"),
    );
  });
});
