import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ScanModal from "../components/Scan/ScanModal";
import { useSettings } from "../context/SettingsContext";

vi.mock("../context/SettingsContext", () => ({
  useSettings: vi.fn(),
}));

const mockOnScanComplete = vi.fn();
const mockOnClose = vi.fn();

const mockScanResponse = {
  count: 2,
  apis: [
    { apiName: "/api/users", method: "GET" },
    { apiName: "/api/login", method: "POST" },
  ],
};

describe("ScanModal Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSettings).mockReturnValue({
      settings: { authToken: "test-token" },
    });

    global.fetch = vi.fn();
  });

  // 1. Initial Render
  it("renders the modal with GitHub input field", () => {
    render(
      <ScanModal onClose={mockOnClose} onScanComplete={mockOnScanComplete} />,
    );
    expect(screen.getByPlaceholderText(/github.com/i)).toBeInTheDocument();
    expect(screen.getByText(/Scan Repository/i)).toBeInTheDocument();
  });

  // 2. Input Handling
  it("updates input value on change", () => {
    render(
      <ScanModal onClose={mockOnClose} onScanComplete={mockOnScanComplete} />,
    );
    const input = screen.getByPlaceholderText(/github.com/i);
    fireEvent.change(input, {
      target: { value: "https://github.com/user/repo" },
    });
    expect(input.value).toBe("https://github.com/user/repo");
  });

  // 3. Successful Scan
  it("calls API and displays results on success", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockScanResponse),
    });

    render(
      <ScanModal onClose={mockOnClose} onScanComplete={mockOnScanComplete} />,
    );

    const input = screen.getByPlaceholderText(/github.com/i);
    fireEvent.change(input, {
      target: { value: "https://github.com/user/repo" },
    });

    const scanBtn = screen.getByText(/Start Scan/i);
    fireEvent.click(scanBtn);

    await waitFor(() => {
      expect(screen.getByText(/Found 2 API routes/i)).toBeInTheDocument();
      expect(screen.getByText("/api/users")).toBeInTheDocument();
      expect(mockOnScanComplete).toHaveBeenCalledWith(mockScanResponse.apis);
    });
  });

  // 4. Loading State
  it("shows loading state while scanning", async () => {
    global.fetch.mockReturnValue(new Promise(() => {})); // Never resolves

    render(
      <ScanModal onClose={mockOnClose} onScanComplete={mockOnScanComplete} />,
    );
    const input = screen.getByPlaceholderText(/github.com/i);
    fireEvent.change(input, { target: { value: "repo" } });
    fireEvent.click(screen.getByText(/Start Scan/i));

    expect(screen.getByText(/Analyzing Source.../i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Analyzing Source/i }),
    ).toBeDisabled();
  });

  // 5. Error Handling
  it("displays error message when scan fails", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ message: "Invalid repository" }),
    });

    render(
      <ScanModal onClose={mockOnClose} onScanComplete={mockOnScanComplete} />,
    );
    const input = screen.getByPlaceholderText(/github.com/i);
    fireEvent.change(input, { target: { value: "bad-repo" } });
    fireEvent.click(screen.getByText(/Start Scan/i));

    await waitFor(() => {
      expect(screen.getByText(/Invalid repository/i)).toBeInTheDocument();
    });
  });

  // 6. Close Modal
  it("calls onClose when cancel button is clicked", () => {
    render(
      <ScanModal onClose={mockOnClose} onScanComplete={mockOnScanComplete} />,
    );
    fireEvent.click(screen.getByText(/Cancel/i));
    expect(mockOnClose).toHaveBeenCalled();
  });

  // 7. Network Error
  it("displays fallback error on network failure", async () => {
    global.fetch.mockRejectedValueOnce(new Error("Network fail"));

    render(
      <ScanModal onClose={mockOnClose} onScanComplete={mockOnScanComplete} />,
    );
    fireEvent.change(screen.getByPlaceholderText(/github.com/i), {
      target: { value: "repo" },
    });
    fireEvent.click(screen.getByText(/Start Scan/i));

    await waitFor(() => {
      expect(
        screen.getByText(/Network connectivity error/i),
      ).toBeInTheDocument();
    });
  });

  // 8. Result Interaction
  it("changes button text to 'Dismiss' after successful scan", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockScanResponse),
    });

    render(
      <ScanModal onClose={mockOnClose} onScanComplete={mockOnScanComplete} />,
    );
    fireEvent.change(screen.getByPlaceholderText(/github.com/i), {
      target: { value: "repo" },
    });
    fireEvent.click(screen.getByText(/Start Scan/i));

    await waitFor(() => {
      expect(screen.getByText("Dismiss")).toBeInTheDocument();
    });
  });

  // 9. Enter Key Trigger
  it("triggers scan when Enter key is pressed", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockScanResponse),
    });

    render(
      <ScanModal onClose={mockOnClose} onScanComplete={mockOnScanComplete} />,
    );
    const input = screen.getByPlaceholderText(/github.com/i);
    fireEvent.change(input, { target: { value: "repo" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  // 10. Empty Input Prevention
  it("does not trigger scan if input is empty", () => {
    render(
      <ScanModal onClose={mockOnClose} onScanComplete={mockOnScanComplete} />,
    );
    const scanBtn = screen.getByText(/Start Scan/i);
    fireEvent.click(scanBtn);

    expect(global.fetch).not.toHaveBeenCalled();
  });
});
