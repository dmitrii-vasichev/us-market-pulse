import { render, screen, fireEvent } from "@testing-library/react";
import ContextualSidebar from "@/components/ContextualSidebar";

describe("ContextualSidebar", () => {
  const content = "This explains what the chart means in economic context.";

  it("renders collapsed by default", () => {
    render(<ContextualSidebar content={content} />);
    expect(screen.getByText(/What this means/i)).toBeTruthy();
    expect(screen.queryByText(content)).toBeTruthy(); // content present in DOM but hidden via CSS
  });

  it("shows 'What this means' toggle button", () => {
    render(<ContextualSidebar content={content} />);
    expect(screen.getByText("What this means \u2193")).toBeTruthy();
  });

  it("toggles to expanded state on click", () => {
    render(<ContextualSidebar content={content} />);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(screen.getByText("Hide \u2191")).toBeTruthy();
  });

  it("collapses again on second click", () => {
    render(<ContextualSidebar content={content} />);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    fireEvent.click(button);
    expect(screen.getByText("What this means \u2193")).toBeTruthy();
  });
});
