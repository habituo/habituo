import { render, screen, cleanup } from "@testing-library/react";
import Footer from "./Footer";
import { useColorMode, useColorModeValue } from "@chakra-ui/react";

/**
 * Mock the logo images so Jest doesn't try to load actual SVG files.
 * We return a simple string representing the filename.
 */
jest.mock(
  "../../../assets/images/light_habituo-logo.svg",
  () => "light_habituo-logo.svg"
);
jest.mock(
  "../../../assets/images/dark_habituo-logo.svg",
  () => "dark_habituo-logo.svg"
);

/**
 * Mock Chakra UI hooks for testing
 * We preserve all other actual exports from Chakra UI
 */
jest.mock("@chakra-ui/react", () => {
  const actual = jest.requireActual("@chakra-ui/react");
  return {
    ...actual,
    useColorMode: jest.fn(),
    useColorModeValue: jest.fn(),
  };
});

/** Cleanup after each test to avoid test pollution */
afterEach(() => {
  cleanup();
  jest.resetAllMocks(); // reset all mocks to ensure isolated tests
});

/**
 * Helper function to mock light or dark mode for Chakra hooks
 * @param {string} mode - "light" or "dark"
 */
const mockMode = (mode) => {
  useColorMode.mockReturnValue({ colorMode: mode }); // set current color mode
  useColorModeValue.mockImplementation((light, dark) =>
    mode === "light" ? light : dark
  ); // return proper value for useColorModeValue
};

/** Test suite for Footer component */
describe("Footer component", () => {
  /** Test that the light logo renders when colorMode is "light" */
  test("renders light logo when colorMode is light", () => {
    mockMode("light"); // simulate light mode
    render(<Footer />);
    const logo = screen.getByAltText(/Logotipo de Habituo App/i);

    // Expect the light logo to be rendered
    expect(logo).toHaveAttribute("src", "dark_habituo-logo.svg");
  });

  /** Test that the dark logo renders when colorMode is "dark" */
  test("renders dark logo when colorMode is dark", () => {
    mockMode("dark"); // simulate dark mode
    render(<Footer />);
    const logo = screen.getByAltText(/Logotipo de Habituo App/i);

    // Expect the dark logo to be rendered
    expect(logo).toHaveAttribute("src", "dark_habituo-logo.svg");
  });

  /** Test that text colors in the footer respect the current colorMode */
  test("footer text colors respect colorMode", () => {
    // Light mode test
    mockMode("light");
    render(<Footer />);
    const lightText = screen.getAllByTestId("footer-copyright")[0];
    expect(lightText).toHaveStyle({ color: "gray.500" });

    cleanup(); // clean up before re-rendering in dark mode

    // Dark mode test
    mockMode("dark");
    render(<Footer />);
    const darkText = screen.getAllByTestId("footer-copyright")[0];
    expect(darkText).toHaveStyle({ color: "gray.200" });
  });
});
