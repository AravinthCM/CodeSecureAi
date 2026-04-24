import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import DashboardPage from "../components/Dashboard/DashboardPage";

// Mock useNavigate
const mockedUsedNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockedUsedNavigate,
  };
});

const mockStats = {
  totalApis: 5,
  totalCases: 20,
  totalPassed: 15,
  totalFailed: 3,
  totalPending: 2,
  overallPassRate: 75,
  perApi: [
    {
      _id: "api_1",
      apiName: "Auth Login",
      method: "POST",
      passed: 5,
      failed: 0,
      pending: 0,
      total: 5,
      passRate: 100,
      lastRun: new Date().toISOString(),
    },
  ],
};

describe("DashboardPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock global fetch
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockStats),
      }),
    );

    // Mock localStorage for auth
    vi.spyOn(Storage.prototype, "getItem").mockReturnValue("fake-token");
  });

  const renderDashboard = () => {
    return render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>,
    );
  };

  // 1. Loading State
  it("shows loading spinner initially", () => {
    renderDashboard();
    expect(screen.getByText(/Loading command center/i)).toBeInTheDocument();
  });

  // 2. Metric Rendering
  it("renders metric tiles with correct values after loading", async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText("5")).toBeInTheDocument(); // Total APIs
      expect(screen.getByText("75%")).toBeInTheDocument(); // Pass Rate
      expect(screen.getByText(/15 passed · 3 failed/i)).toBeInTheDocument();
    });
  });

  // 3. API Table Rendering
  it("renders the list of APIs in the table", async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText("Auth Login")).toBeInTheDocument();
      expect(screen.getByText("POST")).toBeInTheDocument();
      expect(screen.getByText("100%")).toBeInTheDocument();
    });
  });

  // 4. Empty State
  it("displays empty state message when no APIs exist", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ ...mockStats, perApi: [] }),
      }),
    );

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText(/No APIs yet/i)).toBeInTheDocument();
    });
  });

  // 5. Navigation - Workbench
  it("navigates to home when Workbench button is clicked", async () => {
    renderDashboard();
    await waitFor(() => screen.getByText("Workbench"));

    fireEvent.click(screen.getByText("Workbench"));
    expect(mockedUsedNavigate).toHaveBeenCalledWith("/home");
  });

  // 6. Navigation - History
  it("navigates to history when History button is clicked", async () => {
    renderDashboard();
    await waitFor(() => screen.getByText("History"));

    fireEvent.click(screen.getByText("History"));
    expect(mockedUsedNavigate).toHaveBeenCalledWith("/history");
  });

  // 7. Sparkline Safety (Mental Check)
  it("renders SVG sparklines for metrics", async () => {
    const { container } = renderDashboard();
    await waitFor(() => {
      const svgs = container.querySelectorAll("svg");
      // Header has Zap, tiles have Sparklines + Icons
      expect(svgs.length).toBeGreaterThan(4);
    });
  });

  // 8. PassRateBar Calculation
  it("displays correct passed count in the pass rate bar area", async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText("5P")).toBeInTheDocument();
    });
  });

  // 9. Method Color Application
  it("applies the correct CSS class for the POST method badge", async () => {
    renderDashboard();
    await waitFor(() => {
      const badge = screen.getByText("POST");
      expect(badge).toHaveClass("text-emerald-400");
    });
  });

  // 10. Fetch Error Handling (Silent)
  it("logs error but stops loading if fetch fails", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    global.fetch = vi.fn(() => Promise.reject("API Down"));

    renderDashboard();

    await waitFor(() => {
      expect(
        screen.queryByText(/Loading command center/i),
      ).not.toBeInTheDocument();
    });
    consoleSpy.mockRestore();
  });
});
