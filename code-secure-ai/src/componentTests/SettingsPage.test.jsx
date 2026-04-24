import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import SettingsPage from "../components/Settings/SettingsPage";
import { useSettings } from "../context/SettingsContext";

// Mock the context and navigation
const mockedUsedNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockedUsedNavigate };
});

vi.mock("../context/SettingsContext", () => ({
  useSettings: vi.fn(),
}));

describe("SettingsPage Component", () => {
  const mockUpdateSetting = vi.fn();
  const mockResetSettings = vi.fn();
  const initialSettings = {
    baseUrl: "http://localhost:5000",
    defaultMethod: "GET",
    authToken: "initial-token",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSettings).mockReturnValue({
      settings: initialSettings,
      updateSetting: mockUpdateSetting,
      resetSettings: mockResetSettings,
    });
  });

  const renderSettings = () => {
    return render(
      <BrowserRouter>
        <SettingsPage />
      </BrowserRouter>,
    );
  };

  // 1. Initial Render
  it("renders with current settings from context", () => {
    renderSettings();
    expect(
      screen.getByDisplayValue("http://localhost:5000"),
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue("GET")).toBeInTheDocument();
    expect(screen.getByDisplayValue("initial-token")).toBeInTheDocument();
  });

  // 2. Draft State Logic
  it("updates local draft state when typing without affecting context", () => {
    renderSettings();
    const input = screen.getByPlaceholderText("http://localhost:5000");

    fireEvent.change(input, {
      target: { value: "https://api.production.com" },
    });

    expect(input.value).toBe("https://api.production.com");
    // Context should NOT be updated yet
    expect(mockUpdateSetting).not.toHaveBeenCalled();
  });

  // 3. Save Mechanism
  it("calls updateSetting for all draft changes when 'Commit Changes' is clicked", async () => {
    renderSettings();
    const input = screen.getByPlaceholderText("http://localhost:5000");
    fireEvent.change(input, { target: { value: "https://staging.api.com" } });

    const saveBtn = screen.getByText(/Commit Changes/i);
    fireEvent.click(saveBtn);

    expect(mockUpdateSetting).toHaveBeenCalledWith(
      "baseUrl",
      "https://staging.api.com",
    );
    expect(screen.getByText(/Changes Applied/i)).toBeInTheDocument();
  });

  // 4. Reset Logic
  it("calls resetSettings and clears draft when 'Reset Defaults' is confirmed", () => {
    window.confirm = vi.fn(() => true);
    renderSettings();

    const resetBtn = screen.getByText(/Reset Defaults/i);
    fireEvent.click(resetBtn);

    expect(mockResetSettings).toHaveBeenCalled();
    expect(
      screen.getByDisplayValue("http://localhost:5000"),
    ).toBeInTheDocument();
  });

  // 5. Token Visibility Toggle
  it("toggles authentication token visibility", () => {
    renderSettings();
    const tokenInput = screen.getByPlaceholderText(/Bearer eyJ/);

    expect(tokenInput).toHaveAttribute("type", "password");

    const toggleBtn = screen.getByRole("button", { name: "" }); // The eye icon button
    fireEvent.click(toggleBtn);

    expect(tokenInput).toHaveAttribute("type", "text");
  });

  // 6. Navigation - Dashboard
  it("navigates back to dashboard", () => {
    renderSettings();
    fireEvent.click(screen.getByText("Dashboard"));
    expect(mockedUsedNavigate).toHaveBeenCalledWith("/dashboard");
  });

  // 7. Navigation - Workbench
  it("navigates to workbench (home)", () => {
    renderSettings();
    fireEvent.click(screen.getByText(/Workbench/i));
    expect(mockedUsedNavigate).toHaveBeenCalledWith("/home");
  });

  // 8. Visual Feedback Timing
  it("removes 'Changes Applied' state after timeout", async () => {
    vi.useFakeTimers();
    renderSettings();

    fireEvent.click(screen.getByText(/Commit Changes/i));
    expect(screen.getByText(/Changes Applied/i)).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.queryByText(/Changes Applied/i)).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  // 9. Input Selection Logic
  it("changes the default method via select dropdown", () => {
    renderSettings();
    const select = screen.getByDisplayValue("GET");

    fireEvent.change(select, { target: { value: "POST" } });

    expect(select.value).toBe("POST");
  });

  // 10. Confirmation Cancelation
  it("does not reset if user cancels the confirmation dialog", () => {
    window.confirm = vi.fn(() => false);
    renderSettings();

    fireEvent.click(screen.getByText(/Reset Defaults/i));

    expect(mockResetSettings).not.toHaveBeenCalled();
  });
});
