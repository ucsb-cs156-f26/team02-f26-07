import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import UCSBDiningCommonsMenuItemEditPage from "main/pages/UCSBDiningCommonsMenuItem/UCSBDiningCommonsMenuItemEditPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import mockConsole from "tests/testutils/mockConsole";

const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    toast: vi.fn((message) => mockToast(message)),
  };
});

const mockNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    useParams: vi.fn(() => ({ id: 17 })),
    Navigate: vi.fn((props) => {
      mockNavigate(props);
      return null;
    }),
  };
});

describe("UCSBDiningCommonsMenuItemEditPage tests", () => {
  let axiosMock;

  const setupUserOnly = () => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  };

  beforeEach(() => {
    axiosMock = new AxiosMockAdapter(axios);
    vi.clearAllMocks();
    setupUserOnly();
  });

  afterEach(() => {
    axiosMock.restore();
  });

  const renderPage = () =>
    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <UCSBDiningCommonsMenuItemEditPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

  test("renders header when backend has no menu-item response", async () => {
    axiosMock
      .onGet("/api/ucsbdiningcommonsmenuitems", { params: { id: 17 } })
      .timeout();
    const restoreConsole = mockConsole();

    renderPage();

    expect(
      await screen.findByText("Edit UCSB Dining Commons Menu Item"),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("UCSBDiningCommonsMenuItemForm-name"),
    ).not.toBeInTheDocument();
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining(
        "Error communicating with backend via GET on /api/ucsbdiningcommonsmenuitems",
      ),
      expect.anything(),
    );
    restoreConsole();
  });

  test("loads and displays the menu item values", async () => {
    axiosMock
      .onGet("/api/ucsbdiningcommonsmenuitems", { params: { id: 17 } })
      .reply(200, {
        id: 17,
        diningCommonsCode: "carillo",
        name: "burger",
        station: "grill",
      });

    renderPage();

    const idField = await screen.findByTestId(
      "UCSBDiningCommonsMenuItemForm-id",
    );
    expect(idField).toHaveValue("17");
    expect(
      screen.getByTestId("UCSBDiningCommonsMenuItemForm-diningCommonsCode"),
    ).toHaveValue("carillo");
    expect(
      screen.getByTestId("UCSBDiningCommonsMenuItemForm-name"),
    ).toHaveValue("burger");
    expect(
      screen.getByTestId("UCSBDiningCommonsMenuItemForm-station"),
    ).toHaveValue("grill");
    expect(
      screen.getByTestId("UCSBDiningCommonsMenuItemForm-submit"),
    ).toHaveTextContent("Update");
  });

  test("updates menu item using the correct PUT endpoint and request body", async () => {
    axiosMock
      .onGet("/api/ucsbdiningcommonsmenuitems", { params: { id: 17 } })
      .reply(200, {
        id: 17,
        diningCommonsCode: "carillo",
        name: "burger",
        station: "grill",
      });
    axiosMock.onPut("/api/ucsbdiningcommonsmenuitems").reply(200, {
      id: 17,
      diningCommonsCode: "portola",
      name: "pizza",
      station: "pizzeria",
    });

    renderPage();

    const codeField = await screen.findByTestId(
      "UCSBDiningCommonsMenuItemForm-diningCommonsCode",
    );
    const nameField = screen.getByTestId("UCSBDiningCommonsMenuItemForm-name");
    const stationField = screen.getByTestId(
      "UCSBDiningCommonsMenuItemForm-station",
    );

    fireEvent.change(codeField, { target: { value: "portola" } });
    fireEvent.change(nameField, { target: { value: "pizza" } });
    fireEvent.change(stationField, { target: { value: "pizzeria" } });
    fireEvent.click(screen.getByTestId("UCSBDiningCommonsMenuItemForm-submit"));

    await waitFor(() => expect(axiosMock.history.put).toHaveLength(1));
    expect(axiosMock.history.put[0].url).toBe(
      "/api/ucsbdiningcommonsmenuitems",
    );
    expect(axiosMock.history.put[0].params).toEqual({ id: 17 });
    expect(axiosMock.history.put[0].data).toBe(
      JSON.stringify({
        diningCommonsCode: "portola",
        name: "pizza",
        station: "pizzeria",
      }),
    );
    expect(mockToast).toHaveBeenCalledWith(
      "UCSB Dining Commons Menu Item updated - id: 17 name: pizza",
    );
    expect(mockNavigate).toHaveBeenCalledWith({ to: "/diningcommonsmenuitem" });
  });
});
