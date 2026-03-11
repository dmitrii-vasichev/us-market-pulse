// T3: PageTransition component test

import { render, screen } from "@testing-library/react";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

import PageTransition from "../../src/components/PageTransition";

describe("PageTransition", () => {
  it("renders children", () => {
    render(
      <PageTransition>
        <div>Test content</div>
      </PageTransition>
    );
    expect(screen.getByText("Test content")).toBeTruthy();
  });

  it("applies page-transition-enter class", () => {
    const { container } = render(
      <PageTransition>
        <div>Content</div>
      </PageTransition>
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain("page-transition-enter");
  });
});
