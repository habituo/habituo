import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { render, screen } from "@testing-library/react";
import PersonalizationGrid from "./PersonalizationGrid";

// Mock images
jest.mock(
  "../../../assets/images/illustrations/custom-panel.png",
  () => "customDashboard.png"
);
jest.mock("../../../assets/images/views.svg", () => "views.svg");
jest.mock("../../../assets/images/barchart.svg", () => "barchart.svg");
jest.mock("../../../assets/images/stats.svg", () => "stats.svg");
jest.mock("../../../assets/images/calendar.svg", () => "calendar.svg");
jest.mock("../../../assets/images/habits.svg", () => "habits.svg");
jest.mock("../../../assets/images/areas.svg", () => "areas.svg");
jest.mock("../../../assets/images/chrono.svg", () => "chrono.svg");

const theme = extendTheme({
  config: { initialColorMode: "light" },
});

// Wrap the component with ChakraProvider to avoid context errors
const renderWithChakra = (ui, options = {}) => {
  return render(<ChakraProvider theme={theme}>{ui}</ChakraProvider>, options);
};

describe("PersonalizationGrid", () => {
  test("renders without crashing", () => {
    renderWithChakra(<PersonalizationGrid />);
    // Check if the section heading is in the document
    expect(
      screen.getByRole("heading", { name: /personalización/i })
    ).toBeInTheDocument();
  });

  test("renders all card titles", () => {
    renderWithChakra(<PersonalizationGrid />);
    const titles = [
      /Tu estilo/i,
      /Vistas personalizadas/i,
      /Estadísticas/i,
      /Áreas y hábitos/i,
      /Temporizador/i,
    ];

    for (const title of titles) {
      const elements = screen.getAllByText(title);
      expect(elements[0]).toBeInTheDocument();
    }
  });

  test("renders images with correct alt texts", () => {
    renderWithChakra(<PersonalizationGrid />);
    const altTexts = [
      "Customizable Dashboard",
      "Custom Views",
      "Progress Bar Chart",
      "Statistics Panel",
      "Habits Calendar",
      "Habits Management",
      "Areas Management",
      "Timer",
    ];

    for (const alt of altTexts) {
      expect(screen.getByAltText(alt)).toBeInTheDocument();
    }
  });

  test("cards have correct background color in light mode", () => {
    renderWithChakra(<PersonalizationGrid />);

    const card = screen.getByTestId("card-custom-dashboard");
    expect(card).toHaveStyle(`background: gray.200`);
  });

  test("cards have correct background color in dark mode", () => {
    const darkTheme = extendTheme({ config: { initialColorMode: "dark" } });

    render(
      <ChakraProvider theme={darkTheme}>
        <PersonalizationGrid />
      </ChakraProvider>
    );

    const card = screen.getByTestId("card-custom-dashboard");
    expect(card).toHaveStyle(`background: gray.800`);
  });
});
