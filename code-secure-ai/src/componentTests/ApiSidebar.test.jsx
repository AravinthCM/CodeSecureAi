import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ApiSidebar from "../components/ApiPage/ApiSidebar";

const mockApiData = [
  { _id: "1", apiName: "Login User", method: "POST" },
  { _id: "2", apiName: "Get Users", method: "GET" },
];

describe("ApiSidebar Component", () => {
  // Define mock props
  const defaultProps = {
    apiData: mockApiData,
    selected: null,
    search: "",
    setSearch: vi.fn(),
    showAddForm: false,
    setShowAddForm: vi.fn(),
    newApiName: "",
    setNewApiName: vi.fn(),
    newMethod: "GET",
    setNewMethod: vi.fn(),
    createApi: vi.fn(),
    setSelected: vi.fn(),
    setMethod: vi.fn(),
    onDeleteApi: vi.fn(),
    onScanClick: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 1. Render Check
  it("renders the component with brand name", () => {
    render(<ApiSidebar {...defaultProps} />);
    expect(screen.getByText("ApiWorkbench")).toBeInTheDocument();
  });

  // 2. List Rendering
  it("renders the correct number of API endpoints", () => {
    render(<ApiSidebar {...defaultProps} />);
    expect(screen.getByText(/Endpoints · 2/i)).toBeInTheDocument();
    expect(screen.getByText("Login User")).toBeInTheDocument();
  });

  // 3. Search Interaction
  it("calls setSearch when typing in the search box", () => {
    render(<ApiSidebar {...defaultProps} />);
    const input = screen.getByPlaceholderText(/Search APIs.../i);
    fireEvent.change(input, { target: { value: "login" } });
    expect(defaultProps.setSearch).toHaveBeenCalledWith("login");
  });

  // 4. Selection Interaction
  it("calls setSelected and setMethod when an API is clicked", () => {
    render(<ApiSidebar {...defaultProps} />);
    const apiItem = screen.getByText("Login User");
    fireEvent.click(apiItem);
    expect(defaultProps.setSelected).toHaveBeenCalledWith(mockApiData[0]);
    expect(defaultProps.setMethod).toHaveBeenCalledWith("POST");
  });

  // 5. Active State Styling
  it("applies selected styles when an API is active", () => {
    render(<ApiSidebar {...defaultProps} selected={mockApiData[0]} />);
    const container = screen.getByText("Login User").closest(".relative");
    expect(container).toHaveClass("bg-zinc-800");
  });

  // 6. Form Visibility
  it("calls setShowAddForm when New API button is clicked", () => {
    render(<ApiSidebar {...defaultProps} />);
    const btn = screen.getByText(/New API/i);
    fireEvent.click(btn);
    expect(defaultProps.setShowAddForm).toHaveBeenCalled();
  });

  // 7. Form Input Logic
  it("calls setNewApiName and setNewMethod when form fields change", () => {
    render(<ApiSidebar {...defaultProps} showAddForm={true} />);

    const nameInput = screen.getByPlaceholderText(/API name.../i);
    fireEvent.change(nameInput, { target: { value: "Logout" } });
    expect(defaultProps.setNewApiName).toHaveBeenCalledWith("Logout");

    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "DELETE" } });
    expect(defaultProps.setNewMethod).toHaveBeenCalledWith("DELETE");
  });

  // 8. Create API Submission
  it("calls createApi when the submit button in form is clicked", () => {
    render(<ApiSidebar {...defaultProps} showAddForm={true} />);
    const createBtn = screen.getByText("Create API");
    fireEvent.click(createBtn);
    expect(defaultProps.createApi).toHaveBeenCalled();
  });

  // 9. Delete Execution
  it("calls onDeleteApi when the delete button is confirmed", () => {
    render(<ApiSidebar {...defaultProps} />);
    // Open menu
    const menuBtn = screen.getAllByRole("button")[2];
    fireEvent.click(menuBtn);

    // Click delete
    const deleteBtn = screen.getByText(/Delete API/i);
    fireEvent.click(deleteBtn);

    expect(defaultProps.onDeleteApi).toHaveBeenCalledWith("1");
  });

  // 10. Github Scan Execution
  it("calls onScanClick when the github icon is clicked", () => {
    render(<ApiSidebar {...defaultProps} />);
    const scanBtn = screen.getByTitle(/Scan GitHub repo/i);
    fireEvent.click(scanBtn);
    expect(defaultProps.onScanClick).toHaveBeenCalled();
  });

  // 11. Empty State Check
  it("shows 'No APIs found' when filtered list is empty", () => {
    render(<ApiSidebar {...defaultProps} apiData={[]} />);
    expect(screen.getByText(/No APIs found/i)).toBeInTheDocument();
  });
});
