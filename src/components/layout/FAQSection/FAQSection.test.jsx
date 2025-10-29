import { screen } from "@testing-library/react";
import FAQSection from "./FAQSection";
import renderWithProviders from "../../../tests/utils/renderWithProviders";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";

/**
 * Sample FAQ items for testing purposes
 * faqItems1 and faqItems2 simulate real data arrays
 */
const faqItems1 = [
  { id: 1, question: "¿Qué es Habituo?", answer: "Un tracker de hábitos." },
];
const faqItems2 = [
  { id: 2, question: "¿Es gratuito?", answer: "Sí, versión básica gratuita." },
];

/**
 * Helper function to render a component with a specific Chakra UI color mode
 * @param {JSX.Element} ui - React component to render
 * @param {"light"|"dark"} colorMode - Color mode to use for testing
 * @returns Rendered component wrapped with ChakraProvider
 */
const renderWithColorMode = (ui, colorMode = "light") => {
  const theme = extendTheme({ config: { initialColorMode: colorMode } });
  return renderWithProviders(
    <ChakraProvider theme={theme}>{ui}</ChakraProvider>
  );
};

/**
 * Test suite for FAQSection component
 */
describe("FAQSection", () => {
  /**
   * Test that the component renders with correct colors in light mode
   */
  test("aplica colores correctamente en light mode", () => {
    renderWithColorMode(
      <FAQSection faqItems1={faqItems1} faqItems2={faqItems2} />,
      "light"
    );

    // Get the first accordion button by its question text
    const accordionButton = screen.getByRole("button", {
      name: /¿Qué es Habituo\?/i,
    });

    // Check that the button has the expected style for light mode
    expect(accordionButton).toHaveStyle({
      color: "ButtonText",
    });
  });

  /**
   * Test that the component renders with correct colors in dark mode
   */
  test("aplica colores correctamente en dark mode", () => {
    renderWithColorMode(
      <FAQSection faqItems1={faqItems1} faqItems2={faqItems2} />,
      "dark"
    );

    // Get the first accordion button by its question text
    const accordionButton = screen.getByRole("button", {
      name: /¿Qué es Habituo\?/i,
    });

    // Check that the button has the expected style for dark mode
    expect(accordionButton).toHaveStyle({
      color: "ButtonText",
    });
  });
});
