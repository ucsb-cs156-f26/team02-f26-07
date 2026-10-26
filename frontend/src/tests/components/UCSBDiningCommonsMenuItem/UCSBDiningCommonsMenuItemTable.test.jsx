import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { ucsbDiningCommonsMenuItemFixtures } from "fixtures/ucsbDiningCommonsMenuItemFixtures";
import UCSBDiningCommonsMenuItemTable from "main/components/UCSBDiningCommonsMenuItem/UCSBDiningCommonsMenuItemTable";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import { currentUserFixtures } from "fixtures/currentUserFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("UCSBDiningCommonsMenuItemTable tests", () => {
  const queryClient = new QueryClient();
  const expectedHeaders = ["id", "Dining Commons Code", "Name", "Station"];
  const expectedFields = ["id", "diningCommonsCode", "name", "station"];
  const testId = "UCSBDiningCommonsMenuItemTable";

  const renderTable = (currentUser, items = []) =>
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBDiningCommonsMenuItemTable
            ucsbDiningCommonsMenuItems={items}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

  test("renders empty table correctly", () => {
    renderTable(currentUserFixtures.adminUser);

    expectedHeaders.forEach((headerText) => {
      expect(screen.getByText(headerText)).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      expect(
        screen.queryByTestId(`${testId}-cell-row-0-col-${field}`),
      ).not.toBeInTheDocument();
    });
  });

  test("renders menu item data and admin actions", () => {
    renderTable(
      currentUserFixtures.adminUser,
      ucsbDiningCommonsMenuItemFixtures.threeDiningCommonsMenuItem,
    );

    expectedFields.forEach((field) => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-${field}`),
      ).toBeInTheDocument();
    });
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-diningCommonsCode`),
    ).toHaveTextContent("carillo");
    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-name`),
    ).toHaveTextContent("pizza");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-Edit-button`),
    ).toHaveClass("btn-primary");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-Delete-button`),
    ).toHaveClass("btn-danger");
  });

  test("hides admin actions for ordinary users", () => {
    renderTable(
      currentUserFixtures.userOnly,
      ucsbDiningCommonsMenuItemFixtures.threeDiningCommonsMenuItem,
    );

    expectedHeaders.forEach((headerText) => {
      expect(screen.getByText(headerText)).toBeInTheDocument();
    });
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-name`),
    ).toHaveTextContent("burger");
    expect(screen.queryByText("Delete")).not.toBeInTheDocument();
    expect(screen.queryByText("Edit")).not.toBeInTheDocument();
  });

  test("Edit button navigates to the edit page", async () => {
    renderTable(
      currentUserFixtures.adminUser,
      ucsbDiningCommonsMenuItemFixtures.threeDiningCommonsMenuItem,
    );

    fireEvent.click(screen.getByTestId(`${testId}-cell-row-0-col-Edit-button`));

    await waitFor(() =>
      expect(mockedNavigate).toHaveBeenCalledWith(
        "/ucsbdiningcommonsmenuitems/edit/1",
      ),
    );
  });

  test("Delete button calls delete endpoint with the selected item id", async () => {
    const axiosMock = new AxiosMockAdapter(axios);
    axiosMock
      .onDelete("/api/ucsbdiningcommonsmenuitems")
      .reply(200, { message: "Menu item deleted" });

    renderTable(
      currentUserFixtures.adminUser,
      ucsbDiningCommonsMenuItemFixtures.threeDiningCommonsMenuItem,
    );

    fireEvent.click(
      screen.getByTestId(`${testId}-cell-row-0-col-Delete-button`),
    );

    await waitFor(() => expect(axiosMock.history.delete.length).toBe(1));
    expect(axiosMock.history.delete[0].params).toEqual({ id: 1 });
    axiosMock.restore();
  });
});
