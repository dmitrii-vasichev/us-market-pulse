import { render, screen } from "@testing-library/react";
import KeyTakeaways from "@/components/KeyTakeaways";

const sampleTakeaways = [
  "GDP growth is slowing to 1.4%.",
  "Inflation remains sticky at 2.7%.",
];

describe("KeyTakeaways", () => {
  it("renders takeaway items", () => {
    render(<KeyTakeaways takeaways={sampleTakeaways} />);
    expect(screen.getByText("GDP growth is slowing to 1.4%.")).toBeInTheDocument();
    expect(screen.getByText("Inflation remains sticky at 2.7%.")).toBeInTheDocument();
  });

  it("renders default title", () => {
    render(<KeyTakeaways takeaways={sampleTakeaways} />);
    expect(screen.getByText("Key Takeaways")).toBeInTheDocument();
  });

  it("renders custom title", () => {
    render(<KeyTakeaways takeaways={sampleTakeaways} title="Highlights" />);
    expect(screen.getByText("Highlights")).toBeInTheDocument();
  });

  it("does not render footer section when footer prop is absent", () => {
    const { container } = render(<KeyTakeaways takeaways={sampleTakeaways} />);
    // The footer wrapper div with mt-4 should not exist
    const footerDiv = container.querySelector(".mt-4.flex.justify-end");
    expect(footerDiv).toBeNull();
  });

  it("renders footer when footer prop is provided", () => {
    render(
      <KeyTakeaways
        takeaways={sampleTakeaways}
        footer={<a href="/labor">See Labor</a>}
      />
    );
    expect(screen.getByText("See Labor")).toBeInTheDocument();
  });
});
