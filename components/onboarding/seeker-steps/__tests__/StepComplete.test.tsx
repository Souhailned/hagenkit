/**
 * Tests for StepComplete Component
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { StepComplete } from "../StepComplete";

// Mock canvas-confetti
vi.mock("canvas-confetti", () => ({
  default: vi.fn(),
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("StepComplete", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders success message", () => {
    render(<StepComplete />);

    expect(
      screen.getByText("Je bent helemaal klaar!")
    ).toBeInTheDocument();
  });

  it("renders description text", () => {
    render(<StepComplete />);

    expect(
      screen.getByText(/Je profiel is compleet/i)
    ).toBeInTheDocument();
  });

  it("renders check icon", () => {
    render(<StepComplete />);

    // The component uses IconCheck from tabler
    const checkIcon = document.querySelector('[class*="icon-check"]') ||
      document.querySelector('svg');
    expect(checkIcon).toBeInTheDocument();
  });

  it("renders 'Wat nu?' section", () => {
    render(<StepComplete />);

    expect(screen.getByText("Wat nu?")).toBeInTheDocument();
  });

  it("renders three numbered steps", () => {
    render(<StepComplete />);

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("renders step descriptions", () => {
    render(<StepComplete />);

    expect(
      screen.getByText(/We matchen jouw criteria/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Je ontvangt notificaties/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Bekijk en reageer/i)
    ).toBeInTheDocument();
  });

  it("renders dashboard button with correct link", () => {
    render(<StepComplete />);

    const dashboardLink = screen.getByRole("link", { name: /Ga naar Dashboard/i });
    expect(dashboardLink).toHaveAttribute("href", "/dashboard");
  });

  it("renders settings link", () => {
    render(<StepComplete />);

    const settingsLink = screen.getByRole("link", { name: /pas je voorkeuren aan/i });
    expect(settingsLink).toHaveAttribute("href", "/dashboard/settings");
  });

  it("fires confetti on mount", async () => {
    const confetti = await import("canvas-confetti");

    render(<StepComplete />);

    // Fast-forward timers to trigger confetti
    vi.advanceTimersByTime(500);

    expect(confetti.default).toHaveBeenCalled();
  });

  it("stops confetti after duration", async () => {
    const confetti = await import("canvas-confetti");
    const confettiMock = confetti.default as unknown as ReturnType<typeof vi.fn>;

    render(<StepComplete />);

    // Fast-forward past the confetti duration (4 seconds)
    vi.advanceTimersByTime(5000);

    // Get call count and ensure interval was cleared
    const callCount = confettiMock.mock.calls.length;

    // Advance more time - should not increase call count
    vi.advanceTimersByTime(2000);

    // Call count should remain the same after duration ends
    expect(confettiMock.mock.calls.length).toBe(callCount);
  });

  it("cleans up confetti interval on unmount", () => {
    const { unmount } = render(<StepComplete />);

    // Unmount should clean up interval
    unmount();

    // This should not throw or cause issues
    vi.advanceTimersByTime(5000);
  });
});
