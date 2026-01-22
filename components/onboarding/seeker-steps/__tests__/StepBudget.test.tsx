/**
 * Tests for StepBudget Component
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StepBudget } from "../StepBudget";
import { BUDGET_CONFIG, formatEuro, type BudgetData } from "../types";

describe("StepBudget", () => {
  const defaultData: BudgetData = {
    minBudget: null,
    maxBudget: null,
  };

  const mockOnUpdate = vi.fn();

  beforeEach(() => {
    mockOnUpdate.mockClear();
  });

  it("renders header and description", () => {
    render(<StepBudget data={defaultData} onUpdate={mockOnUpdate} />);

    expect(screen.getByText("Wat is je budget?")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Geef je minimale en maximale investering aan voor de overname"
      )
    ).toBeInTheDocument();
  });

  it("renders min and max budget inputs", () => {
    render(<StepBudget data={defaultData} onUpdate={mockOnUpdate} />);

    expect(screen.getByLabelText("Minimum budget")).toBeInTheDocument();
    expect(screen.getByLabelText("Maximum budget")).toBeInTheDocument();
  });

  it("renders budget range display", () => {
    render(<StepBudget data={defaultData} onUpdate={mockOnUpdate} />);

    expect(screen.getByText("Jouw budgetrange")).toBeInTheDocument();
  });

  it("shows 'Selecteer je budgetrange' when no values are set", () => {
    render(<StepBudget data={defaultData} onUpdate={mockOnUpdate} />);

    expect(screen.getByText("Selecteer je budgetrange")).toBeInTheDocument();
  });

  it("shows formatted budget range when values are set", () => {
    const dataWithBudget: BudgetData = {
      minBudget: 50000,
      maxBudget: 150000,
    };

    render(<StepBudget data={dataWithBudget} onUpdate={mockOnUpdate} />);

    // Check that formatted values appear
    expect(
      screen.getByText(`${formatEuro(50000)} - ${formatEuro(150000)}`)
    ).toBeInTheDocument();
  });

  it("renders budget tips section", () => {
    render(<StepBudget data={defaultData} onUpdate={mockOnUpdate} />);

    expect(screen.getByText("Budgetadvies")).toBeInTheDocument();
    expect(screen.getByText(/Klein café/i)).toBeInTheDocument();
  });

  it("renders slider with correct min/max", () => {
    render(<StepBudget data={defaultData} onUpdate={mockOnUpdate} />);

    // Check slider labels
    expect(screen.getByText(formatEuro(BUDGET_CONFIG.MIN))).toBeInTheDocument();
    expect(screen.getByText(formatEuro(BUDGET_CONFIG.MAX))).toBeInTheDocument();
  });

  it("updates min budget on input blur", async () => {
    const user = userEvent.setup();
    render(<StepBudget data={defaultData} onUpdate={mockOnUpdate} />);

    const minInput = screen.getByLabelText("Minimum budget");
    await user.clear(minInput);
    await user.type(minInput, "75000");
    fireEvent.blur(minInput);

    expect(mockOnUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ minBudget: 75000 })
    );
  });

  it("updates max budget on input blur", async () => {
    const user = userEvent.setup();
    render(<StepBudget data={defaultData} onUpdate={mockOnUpdate} />);

    const maxInput = screen.getByLabelText("Maximum budget");
    await user.clear(maxInput);
    await user.type(maxInput, "200000");
    fireEvent.blur(maxInput);

    expect(mockOnUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ maxBudget: 200000 })
    );
  });

  it("clamps min budget to not exceed max budget", async () => {
    const user = userEvent.setup();
    const dataWithMax: BudgetData = {
      minBudget: null,
      maxBudget: 100000,
    };

    render(<StepBudget data={dataWithMax} onUpdate={mockOnUpdate} />);

    const minInput = screen.getByLabelText("Minimum budget");
    await user.clear(minInput);
    await user.type(minInput, "150000");
    fireEvent.blur(minInput);

    // Should clamp to max budget
    expect(mockOnUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ minBudget: 100000 })
    );
  });

  it("shows euro prefix in inputs", () => {
    render(<StepBudget data={defaultData} onUpdate={mockOnUpdate} />);

    // There should be two € symbols (one for each input)
    const euroSymbols = screen.getAllByText("€");
    expect(euroSymbols).toHaveLength(2);
  });
});

describe("formatEuro utility", () => {
  it("formats number as Dutch euro currency", () => {
    expect(formatEuro(50000)).toContain("50.000");
    expect(formatEuro(100)).toContain("100");
  });

  it("returns empty string for null", () => {
    expect(formatEuro(null)).toBe("");
  });
});
