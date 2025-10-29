import { render, screen } from "@testing-library/react";
import HeroSection from "./HeroSection";

// Mock FadeInWhenVisible to just render children for testing
jest.mock("../../animations/FadeInWhenVisible/FadeInWhenVisible", () => {
  const PropTypes = require("prop-types");

  const MockFadeIn = ({ children }) => <div>{children}</div>;

  MockFadeIn.propTypes = {
    children: PropTypes.node,
  };

  return MockFadeIn;
});

describe("HeroSection component", () => {
  /**
   * Test that the HeroSection renders the main heading correctly
   */
  test("renders the main heading with highlighted word", () => {
    render(<HeroSection />);
    const heading = screen.getByText(/Deja de soñar, empieza a/i);
    expect(heading).toBeInTheDocument();

    // Check that the highlighted part exists
    const highlighted = screen.getByText("construir");
    expect(highlighted).toBeInTheDocument();
  });

  /**
   * Test that the description text renders correctly
   */
  test("renders the description text with bold app name", () => {
    render(<HeroSection />);
    const description = screen.getByText(/Tu plataforma para hábitos/i);
    expect(description).toBeInTheDocument();

    const appName = screen.getByText("Habituo App");
    expect(appName).toBeInTheDocument();
  });

  /**
   * Test that the CTA button renders and has correct link
   */
  test("renders the CTA button linking to register", () => {
    render(<HeroSection />);
    const button = screen.getByRole("link", {
      name: /Probar Habituo gratis/i,
    });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("href", "/register");
  });

  /**
   * Test that the component renders inside the mocked FadeInWhenVisible
   */
  test("renders children inside FadeInWhenVisible", () => {
    render(<HeroSection />);
    // Main heading should be inside the FadeInWhenVisible mock
    const heading = screen.getByText(/Deja de soñar, empieza a/i);
    expect(heading).toBeInTheDocument();
  });
});
