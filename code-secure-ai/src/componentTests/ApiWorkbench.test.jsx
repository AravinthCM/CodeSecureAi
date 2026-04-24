import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ApiWorkbench from "../components/ApiPage/ApiWorkbench";
import { useSettings } from "../context/SettingsContext";

// Mock the context and utils
vi.mock("../context/SettingsContext", () => ({
  useSettings: vi.fn(),
}));

vi.mock("../utils/exportToPostman", () => ({
  exportToPostman: vi.fn(),
}));

const mockSelectedApi = {
  _id: "api_123",
  apiName: "Create Product",
  schemaCode: "const Product = new Schema({...})",
  controllerCode: "export const createProduct = ...",
};

const mockPayloads = [
  {
    _id: "test_1",
    payload: {
      title: "Success Case",
      type: "Positive",
      payload: { name: "Test" },
    },
    lastRun: { passed: true, statusCode: 201 },
    snapshot: null,
  },
];

describe("ApiWorkbench Component", () => {
  const defaultProps = {
    selected: mockSelectedApi,
    method: "POST",
    setMethod: vi.fn(),
    url: "http://localhost:5000/products",
    setUrl: vi.fn(),
    payloads: [],
    generateAiPayloads: vi.fn(),
    isGenerating: false,
    isRunning: false,
    runAllTestCases: vi.fn(),
    resetSnapshot: vi.fn(),
    deleteTestCase: vi.fn(),
    runSingleTestCase: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useSettings.mockReturnValue({
      settings: { baseUrl: "http://localhost:5000", authToken: "token" },
    });
    // Clear localStorage for clean state
    localStorage.clear();
  });

  // 1. Initial Empty State
  it("renders selection prompt when no API is selected", () => {
    render(<ApiWorkbench {...defaultProps} selected={null} />);
    expect(
      screen.getByText(/Select an API to start testing/i),
    ).toBeInTheDocument();
  });

  // 2. Data Loading & IDE Rendering
  it("renders the selected API details and code in textareas", () => {
    render(<ApiWorkbench {...defaultProps} />);
    expect(screen.getByText("Create Product")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/Paste your Mongoose Schema/i),
    ).toHaveValue(mockSelectedApi.schemaCode);
  });

  // 3. LocalStorage Persistence
  it("saves IDE content to localStorage on change", async () => {
    render(<ApiWorkbench {...defaultProps} />);
    const schemaArea = screen.getByPlaceholderText(
      /Paste your Mongoose Schema/i,
    );

    fireEvent.change(schemaArea, { target: { value: "Updated Schema" } });

    const savedData = JSON.parse(
      localStorage.getItem(`api_state_${mockSelectedApi._id}`),
    );
    expect(savedData.modelFile).toBe("Updated Schema");
  });

  // 4. Input Validation & Generation
  it("alerts user if trying to generate payloads with empty inputs", () => {
    window.alert = vi.fn();
    render(
      <ApiWorkbench
        {...defaultProps}
        selected={{ ...mockSelectedApi, schemaCode: "", controllerCode: "" }}
      />,
    );

    const genBtn = screen.getByText(/Generate AI Test Suite/i);
    fireEvent.click(genBtn);

    expect(window.alert).toHaveBeenCalledWith(
      expect.stringContaining("provide at least a Model"),
    );
  });

  // 5. Triggering AI Generation
  it("calls generateAiPayloads with combined editor content", () => {
    render(<ApiWorkbench {...defaultProps} />);
    const genBtn = screen.getByText(/Generate AI Test Suite/i);
    fireEvent.click(genBtn);

    expect(defaultProps.generateAiPayloads).toHaveBeenCalledWith(
      expect.stringContaining("### BACKEND MODEL:"),
    );
  });

  // 6. Loading State UI
  it("shows loader and disables button while generating", () => {
    render(<ApiWorkbench {...defaultProps} isGenerating={true} />);
    expect(screen.getByText(/Analyzing Logic.../i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Analyzing Logic/i }),
    ).toBeDisabled();
  });

  // 7. Test Inspector - Run All
  it("calls runAllTestCases when 'Run All' is clicked", () => {
    render(<ApiWorkbench {...defaultProps} payloads={mockPayloads} />);
    const runAllBtn = screen.getByText(/Run All/i);
    fireEvent.click(runAllBtn);
    expect(defaultProps.runAllTestCases).toHaveBeenCalled();
  });

  // 8. Test Case Card - Expansion
  it("expands test case card on click to show payload", () => {
    render(<ApiWorkbench {...defaultProps} payloads={mockPayloads} />);
    const cardHeader = screen.getByText("Success Case");
    fireEvent.click(cardHeader);

    expect(screen.getByText(/Payload/i)).toBeInTheDocument();
    expect(screen.getByText(/"name": "Test"/i)).toBeInTheDocument();
  });

  // 9. Status Code Visualization
  it("displays correct status code pill color for success", () => {
    render(<ApiWorkbench {...defaultProps} payloads={mockPayloads} />);
    const statusPill = screen.getByText("201");
    expect(statusPill).toHaveClass("text-emerald-400");
  });

  // 10. Individual Test Actions (Delete)
  it("calls deleteTestCase when delete button inside card is clicked", async () => {
    render(<ApiWorkbench {...defaultProps} payloads={mockPayloads} />);
    // Expand first
    fireEvent.click(screen.getByText("Success Case"));

    const deleteBtn = screen.getByRole("button", { name: /Delete/i });
    fireEvent.click(deleteBtn);

    expect(defaultProps.deleteTestCase).toHaveBeenCalledWith("test_1");
  });
});
