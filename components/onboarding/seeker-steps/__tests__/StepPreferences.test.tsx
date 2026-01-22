/**
 * Tests for StepPreferences Component
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StepPreferences } from "../StepPreferences";
import {
  DUTCH_CITIES,
  MUST_HAVE_FEATURES,
  type PreferencesData,
} from "../types";

describe("StepPreferences", () => {
  const defaultData: PreferencesData = {
    cities: [],
    features: [],
  };

  const mockOnUpdate = vi.fn();

  beforeEach(() => {
    mockOnUpdate.mockClear();
  });

  it("renders header and description", () => {
    render(<StepPreferences data={defaultData} onUpdate={mockOnUpdate} />);

    expect(screen.getByText("Waar en wat zoek je?")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Selecteer je voorkeurslocaties en de must-have kenmerken"
      )
    ).toBeInTheDocument();
  });

  it("renders all Dutch cities", () => {
    render(<StepPreferences data={defaultData} onUpdate={mockOnUpdate} />);

    DUTCH_CITIES.forEach((city) => {
      expect(screen.getByText(city.label)).toBeInTheDocument();
    });
  });

  it("renders popular cities section", () => {
    render(<StepPreferences data={defaultData} onUpdate={mockOnUpdate} />);

    expect(screen.getByText("Populaire steden")).toBeInTheDocument();
    expect(screen.getByText("Overige steden")).toBeInTheDocument();
  });

  it("renders all must-have features", () => {
    render(<StepPreferences data={defaultData} onUpdate={mockOnUpdate} />);

    MUST_HAVE_FEATURES.forEach((feature) => {
      expect(screen.getByText(feature.label)).toBeInTheDocument();
      expect(screen.getByText(feature.description)).toBeInTheDocument();
    });
  });

  it("toggles city selection on click", async () => {
    const user = userEvent.setup();
    render(<StepPreferences data={defaultData} onUpdate={mockOnUpdate} />);

    const amsterdamCheckbox = screen.getByLabelText("Amsterdam");
    await user.click(amsterdamCheckbox);

    expect(mockOnUpdate).toHaveBeenCalledWith({
      cities: ["amsterdam"],
      features: [],
    });
  });

  it("removes city from selection on second click", async () => {
    const user = userEvent.setup();
    const dataWithCity: PreferencesData = {
      cities: ["amsterdam"],
      features: [],
    };

    render(<StepPreferences data={dataWithCity} onUpdate={mockOnUpdate} />);

    const amsterdamCheckbox = screen.getByLabelText("Amsterdam");
    await user.click(amsterdamCheckbox);

    expect(mockOnUpdate).toHaveBeenCalledWith({
      cities: [],
      features: [],
    });
  });

  it("toggles feature selection on click", async () => {
    const user = userEvent.setup();
    render(<StepPreferences data={defaultData} onUpdate={mockOnUpdate} />);

    const terrasCheckbox = screen.getByLabelText("Terras");
    await user.click(terrasCheckbox);

    expect(mockOnUpdate).toHaveBeenCalledWith({
      cities: [],
      features: ["terras"],
    });
  });

  it("shows 'select all popular' button", () => {
    render(<StepPreferences data={defaultData} onUpdate={mockOnUpdate} />);

    expect(
      screen.getByText("Selecteer populaire steden")
    ).toBeInTheDocument();
  });

  it("selects all popular cities when button clicked", async () => {
    const user = userEvent.setup();
    render(<StepPreferences data={defaultData} onUpdate={mockOnUpdate} />);

    const selectAllButton = screen.getByText("Selecteer populaire steden");
    await user.click(selectAllButton);

    const popularCities = DUTCH_CITIES.filter((c) => c.popular).map(
      (c) => c.value
    );
    expect(mockOnUpdate).toHaveBeenCalledWith({
      cities: popularCities,
      features: [],
    });
  });

  it("shows deselect button when all popular cities are selected", () => {
    const popularCities = DUTCH_CITIES.filter((c) => c.popular).map(
      (c) => c.value
    );
    const dataWithAllPopular: PreferencesData = {
      cities: popularCities,
      features: [],
    };

    render(<StepPreferences data={dataWithAllPopular} onUpdate={mockOnUpdate} />);

    expect(
      screen.getByText("Deselecteer populaire steden")
    ).toBeInTheDocument();
  });

  it("displays selected cities count", () => {
    const dataWithCities: PreferencesData = {
      cities: ["amsterdam", "rotterdam", "utrecht"],
      features: [],
    };

    render(<StepPreferences data={dataWithCities} onUpdate={mockOnUpdate} />);

    expect(screen.getByText("3 locaties geselecteerd")).toBeInTheDocument();
  });

  it("displays singular when one city selected", () => {
    const dataWithOneCity: PreferencesData = {
      cities: ["amsterdam"],
      features: [],
    };

    render(<StepPreferences data={dataWithOneCity} onUpdate={mockOnUpdate} />);

    expect(screen.getByText("1 locatie geselecteerd")).toBeInTheDocument();
  });

  it("displays 'geen locaties' when no cities selected", () => {
    render(<StepPreferences data={defaultData} onUpdate={mockOnUpdate} />);

    expect(screen.getByText("Geen locaties geselecteerd")).toBeInTheDocument();
  });

  it("displays selected features count", () => {
    const dataWithFeatures: PreferencesData = {
      cities: [],
      features: ["terras", "keuken"],
    };

    render(<StepPreferences data={dataWithFeatures} onUpdate={mockOnUpdate} />);

    expect(screen.getByText("2 kenmerken geselecteerd")).toBeInTheDocument();
  });

  it("preserves existing selections when toggling new items", async () => {
    const user = userEvent.setup();
    const existingData: PreferencesData = {
      cities: ["amsterdam"],
      features: ["terras"],
    };

    render(<StepPreferences data={existingData} onUpdate={mockOnUpdate} />);

    const rotterdamCheckbox = screen.getByLabelText("Rotterdam");
    await user.click(rotterdamCheckbox);

    expect(mockOnUpdate).toHaveBeenCalledWith({
      cities: ["amsterdam", "rotterdam"],
      features: ["terras"],
    });
  });
});
