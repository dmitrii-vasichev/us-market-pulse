import { render, screen } from "@testing-library/react";
import KeyTakeaways from "@/components/KeyTakeaways";

describe("KeyTakeaways", () => {
  const takeaways = [
    "Growth is slowing — Q4's 1.4% is the lowest since Q1.",
    "Inflation remains sticky at 2.7%.",
    "Labor market at 4.4% unemployment.",
  ];

  it("renders without errors", () => {
    render(<KeyTakeaways takeaways={takeaways} />);
    expect(screen.getByText("Key Takeaways")).toBeTruthy();
  });

  it("displays default title", () => {
    render(<KeyTakeaways takeaways={takeaways} />);
    expect(screen.getByText("Key Takeaways")).toBeTruthy();
  });

  it("displays custom title", () => {
    render(<KeyTakeaways title="Market Highlights" takeaways={takeaways} />);
    expect(screen.getByText("Market Highlights")).toBeTruthy();
  });

  it("renders correct number of takeaways", () => {
    render(<KeyTakeaways takeaways={takeaways} />);
    expect(screen.getByText(takeaways[0])).toBeTruthy();
    expect(screen.getByText(takeaways[1])).toBeTruthy();
    expect(screen.getByText(takeaways[2])).toBeTruthy();
  });

  it("renders numbered items with teal numbers", () => {
    const { container } = render(<KeyTakeaways takeaways={takeaways} />);
    const numbers = container.querySelectorAll("span.text-\\[\\#2DD4A8\\]");
    expect(numbers.length).toBe(takeaways.length);
  });
});
