// T2: useCountUp hook tests

// Mock requestAnimationFrame
const rafCallbacks: FrameRequestCallback[] = [];
let rafId = 0;

const mockRaf = (cb: FrameRequestCallback): number => {
  rafCallbacks.push(cb);
  return ++rafId;
};

const mockCaf = (id: number) => {
  rafId = id; // simplified
};

global.requestAnimationFrame = mockRaf;
global.cancelAnimationFrame = mockCaf;

// Mock matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

import { easeOutCubicTest } from "../src/hooks/useCountUp";

describe("easeOutCubic", () => {
  it("returns 0 at t=0", () => {
    expect(easeOutCubicTest(0)).toBe(0);
  });

  it("returns 1 at t=1", () => {
    expect(easeOutCubicTest(1)).toBe(1);
  });

  it("returns value between 0 and 1 for mid-point", () => {
    const v = easeOutCubicTest(0.5);
    expect(v).toBeGreaterThan(0);
    expect(v).toBeLessThan(1);
  });

  it("eases out — second half has less change than first half", () => {
    const first = easeOutCubicTest(0.5) - easeOutCubicTest(0);
    const second = easeOutCubicTest(1) - easeOutCubicTest(0.5);
    expect(first).toBeGreaterThan(second);
  });
});
