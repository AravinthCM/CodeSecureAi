import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
} from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import HistoryPage from "../components/History/HistoryPage";

const mockedUsedNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockedUsedNavigate };
});

const mockApis = [
  { _id: "api_1", apiName: "Login Flow", method: "POST" },
  { _id: "api_2", apiName: "Get Profile", method: "GET" },
];

const mockHistory = [
  {
    _id: "run_1",
    apiName: "Login Flow",
    runType: "all",
    runAt: "2026-04-23T10:00:00.000Z",
    passed: 2,
    failed: 1,
    pending: 0,
    totalCases: 3,
    results: [
      { title: "Valid Credentials", passed: true, statusCode: 200 },
      { title: "Invalid Password", passed: true, statusCode: 401 },
      { title: "Missing Email", passed: false, statusCode: 400 },
    ],
  },
];

describe("HistoryPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn((url) => {
      if (url.includes("/api/apis")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockApis),
        });
      }
      if (url.includes("/api/run-history/")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockHistory),
        });
      }
      return Promise.reject("Unknown endpoint");
    });
    vi.spyOn(Storage.prototype, "getItem").mockReturnValue("fake-token");
  });

  const renderHistory = async () => {
    let result;
    await act(async () => {
      result = render(
        <BrowserRouter>
          <HistoryPage />
        </BrowserRouter>,
      );
    });
    return result;
  };

  // FIX: Expanding the run card
  it("expands the run card to show individual test results on click", async () => {
    await renderHistory();

    // 1. Wait for the specific text that confirms history has loaded
    const fullRunBadge = await screen.findByText("Full run");

    // 2. Wrap the click event in act if it triggers complex state changes
    await act(async () => {
      fireEvent.click(fullRunBadge);
    });

    // 3. Assert the expanded content is visible
    expect(screen.getByText("Valid Credentials")).toBeInTheDocument();
    expect(screen.getByText("401")).toBeInTheDocument();
  });

  // FIX: Navigation act warning
  it("navigates to dashboard when button is clicked", async () => {
    await renderHistory();
    const dashBtn = screen.getByText(/Dashboard/i);

    await act(async () => {
      fireEvent.click(dashBtn);
    });

    expect(mockedUsedNavigate).toHaveBeenCalledWith("/dashboard");
  });

  // FIX: API switching act warning
  it("updates history list when a different API is selected", async () => {
    await renderHistory();
    await screen.findByText("Get Profile");

    await act(async () => {
      fireEvent.click(screen.getByText("Get Profile"));
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("api_2"),
      expect.any(Object),
    );
  });

  // Keep other tests as they were, but ensure they use findBy (which handles act/wait internally)
  it("renders the list of APIs in the sidebar", async () => {
    await renderHistory();
    const loginFlowElements = await screen.findAllByText("Login Flow");
    const getProfileElements = await screen.findAllByText("Get Profile");
    expect(loginFlowElements.length).toBeGreaterThanOrEqual(1);
    expect(getProfileElements.length).toBeGreaterThanOrEqual(1);
  });
});
