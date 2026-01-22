/**
 * Tests for StepBusinessType Component
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StepBusinessType } from "../StepBusinessType";
import { BUSINESS_TYPES, type BusinessTypeData } from "../types";

describe("StepBusinessType", () => {
  const defaultData: BusinessTypeData = {
    businessType: null,
    conceptDescription: "",
  };

  const mockOnUpdate = vi.fn();

  beforeEach(() => {
    mockOnUpdate.mockClear();
  });

  it("renders all business type options", () => {
    render(<StepBusinessType data={defaultData} onUpdate={mockOnUpdate} />);

    BUSINESS_TYPES.forEach((type) => {
      expect(screen.getByText(type.label)).toBeInTheDocument();
    });
  });

  it("renders header and description", () => {
    render(<StepBusinessType data={defaultData} onUpdate={mockOnUpdate} />);

    expect(
      screen.getByText("Wat voor horecazaak zoek je?")
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Selecteer het type bedrijf dat het beste bij jouw plannen past"
      )
    ).toBeInTheDocument();
  });

  it("calls onUpdate when a business type is selected", async () => {
    const user = userEvent.setup();
    render(<StepBusinessType data={defaultData} onUpdate={mockOnUpdate} />);

    const restaurantLabel = screen.getByText("Restaurant").closest("label");
    await user.click(restaurantLabel!);

    expect(mockOnUpdate).toHaveBeenCalledWith({
      businessType: "restaurant",
      conceptDescription: "",
    });
  });

  it("shows selected state for current business type", () => {
    const dataWithSelection: BusinessTypeData = {
      businessType: "cafe",
      conceptDescription: "",
    };

    render(
      <StepBusinessType data={dataWithSelection} onUpdate={mockOnUpdate} />
    );

    // The radio button for café should be checked
    const cafeRadio = screen.getByLabelText("Café");
    expect(cafeRadio).toBeChecked();
  });

  it("renders concept description textarea", () => {
    render(<StepBusinessType data={defaultData} onUpdate={mockOnUpdate} />);

    expect(screen.getByLabelText(/Beschrijf je concept/i)).toBeInTheDocument();
  });

  it("shows required indicator when 'other' is selected", () => {
    const dataWithOther: BusinessTypeData = {
      businessType: "other",
      conceptDescription: "",
    };

    render(<StepBusinessType data={dataWithOther} onUpdate={mockOnUpdate} />);

    // Check for the required asterisk
    const label = screen.getByText(/Beschrijf je concept/i);
    expect(label.parentElement?.textContent).toContain("*");
  });

  it("updates concept description on input", async () => {
    const user = userEvent.setup();
    render(<StepBusinessType data={defaultData} onUpdate={mockOnUpdate} />);

    const textarea = screen.getByLabelText(/Beschrijf je concept/i);
    await user.type(textarea, "Mijn unieke restaurant concept");

    // Check that onUpdate was called with the new description
    expect(mockOnUpdate).toHaveBeenCalled();
    const lastCall = mockOnUpdate.mock.calls[mockOnUpdate.mock.calls.length - 1];
    expect(lastCall[0].conceptDescription).toContain("Mijn unieke restaurant");
  });

  it("preserves business type when updating description", async () => {
    const user = userEvent.setup();
    const dataWithSelection: BusinessTypeData = {
      businessType: "restaurant",
      conceptDescription: "",
    };

    render(
      <StepBusinessType data={dataWithSelection} onUpdate={mockOnUpdate} />
    );

    const textarea = screen.getByLabelText(/Beschrijf je concept/i);
    await user.type(textarea, "Test");

    const lastCall = mockOnUpdate.mock.calls[mockOnUpdate.mock.calls.length - 1];
    expect(lastCall[0].businessType).toBe("restaurant");
  });
});
