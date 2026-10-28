import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router";

import UCSBOrganizationForm from "main/components/UCSBOrganization/UCSBOrganizationForm";
import { ucsbOrganizationFixtures } from "fixtures/ucsbOrganizationFixtures";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("UCSBOrganizationForm tests", () => {
  const queryClient = new QueryClient();

  const expectedHeaders = ["Org Code", "Short Name", "Full Name", "Inactive"];
  const testId = "UCSBOrganizationForm";

  const renderForm = (props = {}) =>
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <UCSBOrganizationForm {...props} />
        </Router>
      </QueryClientProvider>,
    );

  test("renders correctly with no initialContents", async () => {
    renderForm();

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expect(screen.getByTestId(`${testId}-orgCode`)).not.toBeDisabled();
  });

  test("renders correctly when passing in initialContents", async () => {
    renderForm({ initialContents: ucsbOrganizationFixtures.oneOrganization });

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    const orgCodeField = screen.getByTestId(`${testId}-orgCode`);
    expect(orgCodeField).toHaveValue("ZPR");
    expect(orgCodeField).toBeDisabled();
    expect(screen.getByTestId(`${testId}-orgTranslationShort`)).toHaveValue(
      "ZETA PHI RHO",
    );
    expect(screen.getByTestId(`${testId}-orgTranslation`)).toHaveValue(
      "ZETA PHI RHO",
    );
    expect(screen.getByTestId(`${testId}-inactive`)).not.toBeChecked();
  });

  test("uses the buttonLabel prop", async () => {
    renderForm({ buttonLabel: "Update" });
    expect(await screen.findByText("Update")).toBeInTheDocument();
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    renderForm();
    expect(await screen.findByTestId(`${testId}-cancel`)).toBeInTheDocument();
    const cancelButton = screen.getByTestId(`${testId}-cancel`);

    fireEvent.click(cancelButton);

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });

  test("that the correct validations are performed", async () => {
    renderForm();

    expect(await screen.findByText(/Create/)).toBeInTheDocument();
    const submitButton = screen.getByText(/Create/);
    fireEvent.click(submitButton);

    await screen.findByText(/Org Code is required/);
    expect(screen.getByText(/Short Name is required/)).toBeInTheDocument();
    expect(screen.getByText(/Full Name is required/)).toBeInTheDocument();

    expect(screen.getByTestId(`${testId}-orgCode`)).toHaveClass("is-invalid");
    expect(screen.getByTestId(`${testId}-orgTranslationShort`)).toHaveClass(
      "is-invalid",
    );
    expect(screen.getByTestId(`${testId}-orgTranslation`)).toHaveClass(
      "is-invalid",
    );
  });

  test("calls submitAction with the right data when the form is valid", async () => {
    const mockSubmitAction = vi.fn();
    renderForm({ submitAction: mockSubmitAction });

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    fireEvent.change(screen.getByTestId(`${testId}-orgCode`), {
      target: { value: "ZPR" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-orgTranslationShort`), {
      target: { value: "ZETA PHI RHO" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-orgTranslation`), {
      target: { value: "ZETA PHI RHO SORORITY" },
    });
    fireEvent.click(screen.getByTestId(`${testId}-inactive`));
    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    await waitFor(() => expect(mockSubmitAction).toHaveBeenCalled());

    expect(mockSubmitAction.mock.calls[0][0]).toEqual({
      orgCode: "ZPR",
      orgTranslationShort: "ZETA PHI RHO",
      orgTranslation: "ZETA PHI RHO SORORITY",
      inactive: true,
    });

    expect(screen.queryByText(/is required/)).not.toBeInTheDocument();
    expect(screen.getByTestId(`${testId}-orgCode`)).not.toHaveClass(
      "is-invalid",
    );
  });
});
