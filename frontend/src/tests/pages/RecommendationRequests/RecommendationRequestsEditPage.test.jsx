import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import RecommendationRequestsEditPage from "main/pages/RecommendationRequests/RecommendationRequestsEditPage";

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
    toast: vi.fn((x) => mockToast(x)),
  };
});

const mockNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    useParams: vi.fn(() => ({
      id: 17,
    })),
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

let axiosMock;
describe("RecommendationRequestsEditPage tests", () => {
  describe("when the backend doesn't return data", () => {
    beforeEach(() => {
      axiosMock = new AxiosMockAdapter(axios);
      axiosMock.reset();
      axiosMock.resetHistory();
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock
        .onGet("/api/recommendationrequests", { params: { id: 17 } })
        .timeout();
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    const queryClient = new QueryClient();
    test("renders header but form is not present", async () => {
      const restoreConsole = mockConsole();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <RecommendationRequestsEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );
      await screen.findByText("Edit Recommendation Requests");
      expect(
        screen.queryByTestId("RecommendationRequestForm-requesterEmail"),
      ).not.toBeInTheDocument();
      restoreConsole();
    });
  });

  describe("tests where backend is working normally", () => {
    beforeEach(() => {
      axiosMock = new AxiosMockAdapter(axios);
      axiosMock.reset();
      axiosMock.resetHistory();
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock
        .onGet("/api/recommendationrequests", { params: { id: 17 } })
        .reply(200, {
          id: 17,
          requesterEmail: "student1@ucsb.edu",
          professorEmail: "professor1@ucsb.edu",
          explanation: "BS/MS program",
          dateRequested: "2026-09-30T09:00:00",
          dateNeeded: "2026-10-31T23:59:00",
          done: true,
        });
      axiosMock.onPut("/api/recommendationrequests").reply(200, {
        id: 17,
        requesterEmail: "student2@ucsb.edu",
        professorEmail: "professor2@ucsb.edu",
        explanation: "PhD program",
        dateRequested: "2027-09-30T09:00:00",
        dateNeeded: "2027-10-31T23:59:00",
        done: false,
      });
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    const queryClient = new QueryClient();

    test("Is populated with the data provided, and changes when data is changed", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <RecommendationRequestsEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("RecommendationRequestForm-id");

      const idField = screen.getByTestId("RecommendationRequestForm-id");
      const requesterEmailField = screen.getByTestId(
        "RecommendationRequestForm-requesterEmail",
      );
      const professorEmailField = screen.getByTestId(
        "RecommendationRequestForm-professorEmail",
      );
      const explanationField = screen.getByTestId(
        "RecommendationRequestForm-explanation",
      );
      const dateRequestedField = screen.getByTestId(
        "RecommendationRequestForm-dateRequested",
      );
      const dateNeededField = screen.getByTestId(
        "RecommendationRequestForm-dateNeeded",
      );
      const doneField = screen.getByTestId("RecommendationRequestForm-done");
      const submitButton = screen.getByTestId(
        "RecommendationRequestForm-submit",
      );

      expect(idField).toBeInTheDocument();
      expect(idField).toHaveValue("17");
      expect(requesterEmailField).toBeInTheDocument();
      expect(requesterEmailField).toHaveValue("student1@ucsb.edu");
      expect(professorEmailField).toBeInTheDocument();
      expect(professorEmailField).toHaveValue("professor1@ucsb.edu");
      expect(explanationField).toBeInTheDocument();
      expect(explanationField).toHaveValue("BS/MS program");
      expect(dateRequestedField).toBeInTheDocument();
      expect(dateRequestedField).toHaveValue("2026-09-30T09:00");
      expect(dateNeededField).toBeInTheDocument();
      expect(dateNeededField).toHaveValue("2026-10-31T23:59");
      expect(doneField).toBeInTheDocument();
      expect(doneField).toBeChecked(true);

      expect(submitButton).toHaveTextContent("Update");

      fireEvent.change(requesterEmailField, {
        target: { value: "student2@ucsb.edu" },
      });
      fireEvent.change(professorEmailField, {
        target: { value: "professor2@ucsb.edu" },
      });
      fireEvent.change(explanationField, {
        target: { value: "PhD program" },
      });
      fireEvent.change(dateRequestedField, {
        target: { value: "2027-09-30T09:00:00" },
      });
      fireEvent.change(dateNeededField, {
        target: { value: "2027-10-31T23:59:00" },
      });
      fireEvent.click(doneField); // Simulate clicking to change true -> false
      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toHaveBeenCalledWith(
        "Recommendation Request Updated - id: 17 requesterEmail: student2@ucsb.edu professorEmail: professor2@ucsb.edu",
      );

      expect(mockNavigate).toHaveBeenCalledWith({
        to: "/recommendationrequests",
      });

      expect(axiosMock.history.put.length).toBe(1); // times called
      expect(axiosMock.history.put[0].params).toEqual({ id: 17 });
      expect(axiosMock.history.put[0].data).toBe(
        JSON.stringify({
          requesterEmail: "student2@ucsb.edu",
          professorEmail: "professor2@ucsb.edu",
          explanation: "PhD program",
          dateRequested: "2027-09-30T09:00",
          dateNeeded: "2027-10-31T23:59",
          done: false,
        }),
      ); // posted object
      expect(mockNavigate).toHaveBeenCalledWith({
        to: "/recommendationrequests",
      });
    });
  });
});
