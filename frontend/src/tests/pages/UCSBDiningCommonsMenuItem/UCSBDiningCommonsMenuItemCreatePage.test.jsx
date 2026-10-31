import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UCSBDiningCommonsMenuItemCreatePage from "main/pages/UCSBDiningCommonsMenuItem/UCSBDiningCommonsMenuItemCreatePage";
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
    toast: vi.fn((message) => mockToast(message)),
  };
});

const mockNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    Navigate: vi.fn((props) => {
      mockNavigate(props);
      return null;
    }),
  };
});

describe("UCSBDiningCommonsMenuItemCreatePage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

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

  const queryClient = new QueryClient();

  beforeEach(() => {
    vi.clearAllMocks();
    setupUserOnly();
  });

  test("renders the menu item form", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBDiningCommonsMenuItemCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByTestId(
        "UCSBDiningCommonsMenuItemForm-diningCommonsCode",
      ),
    ).toBeInTheDocument();
  });

  test("submits menu item fields, notifies, and redirects", async () => {
    const menuItem = {
      id: 17,
      diningCommonsCode: "carillo",
      name: "burger",
      station: "grill",
    };
    axiosMock
      .onPost("/api/ucsbdiningcommonsmenuitems/post")
      .reply(202, menuItem);

    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <UCSBDiningCommonsMenuItemCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const codeField = await screen.findByTestId(
      "UCSBDiningCommonsMenuItemForm-diningCommonsCode",
    );
    const nameField = screen.getByTestId("UCSBDiningCommonsMenuItemForm-name");
    const stationField = screen.getByTestId(
      "UCSBDiningCommonsMenuItemForm-station",
    );

    fireEvent.change(codeField, { target: { value: "carillo" } });
    fireEvent.change(nameField, { target: { value: "burger" } });
    fireEvent.change(stationField, { target: { value: "grill" } });
    fireEvent.click(screen.getByTestId("UCSBDiningCommonsMenuItemForm-submit"));

    await waitFor(() => expect(axiosMock.history.post).toHaveLength(1));
    expect(axiosMock.history.post[0].url).toBe(
      "/api/ucsbdiningcommonsmenuitems/post",
    );
    expect(axiosMock.history.post[0].params).toEqual({
      diningCommonsCode: "carillo",
      name: "burger",
      station: "grill",
    });
    expect(mockToast).toHaveBeenCalledWith(
      "New UCSB Dining Commons Menu Item created - id: 17 name: burger",
    );
    expect(mockNavigate).toHaveBeenCalledWith({ to: "/diningcommonsmenuitem" });
  });
});
