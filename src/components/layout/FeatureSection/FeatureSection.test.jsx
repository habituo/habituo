import { render, screen, within } from "@testing-library/react";
import FeatureSection from "./FeatureSection";
import { useColorMode } from "@chakra-ui/react";

// Mock Chakra UI's useColorMode hook so we can control light/dark mode in tests
jest.mock("@chakra-ui/react", () => {
  const actual = jest.requireActual("@chakra-ui/react");
  return {
    ...actual,
    useColorMode: jest.fn(),
  };
});

// Helper function to set the colorMode for each test
const mockUseColorMode = (mode) => {
  useColorMode.mockReturnValue({ colorMode: mode });
};

// Default props used across multiple tests
const defaultProps = {
  title: "Test Title",
  description: "Test description",
  imageSrc: "test-image.png",
  imageAlt: "Test Image",
};

describe("FeatureSection component", () => {
  // Test that the description text color is correct in light mode
  test("description text color is gray.600 in light mode", () => {
    mockUseColorMode("light"); // Set color mode to light
    render(
      <FeatureSection
        title="Test"
        description="Desc"
        imageSrc="img.png"
        imageAlt="Img"
      />
    );
    const desc = screen.getByTestId("feature-description");
    // Check that the color applied matches light mode
    expect(desc).toHaveStyle({ color: "gray.600" });
  });

  // Test that the description text color is correct in dark mode
  test("description text color is gray.400 in dark mode", () => {
    mockUseColorMode("dark"); // Set color mode to dark
    render(
      <FeatureSection
        title="Test"
        description="Desc"
        imageSrc="img.png"
        imageAlt="Img"
      />
    );
    const desc = screen.getByTestId("feature-description");
    // Check that the color applied matches dark mode
    expect(desc).toHaveStyle({ color: "gray.400" });
  });

  // Test that all main elements render correctly: heading, text, and image
  test("renders all elements", () => {
    mockUseColorMode("light");
    render(<FeatureSection {...defaultProps} />);
    // Heading should be rendered
    expect(
      screen.getByRole("heading", { name: /Test Title/i })
    ).toBeInTheDocument();
    // Description text should be rendered
    expect(screen.getByText(/Test description/i)).toBeInTheDocument();
    // Image should be rendered
    expect(screen.getByAltText(/Test Image/i)).toBeInTheDocument();
  });

  // Test that the layout reverses correctly when the reverse prop is true
  test("layout reverses when reverse prop is true", () => {
    mockUseColorMode("light");
    render(<FeatureSection {...defaultProps} reverse />);

    const container = screen.getByTestId("feature-container");
    // Get all images and headings inside the container
    const elements = within(container)
      .getAllByRole("img")
      .concat(within(container).getAllByRole("heading"));

    // First element should be the image, second should be the heading
    expect(elements[0].alt || elements[0].textContent).toBe("Test Image");
    expect(elements[1].textContent).toBe("Test Title");
  });

  // Test that the textAlign prop is applied correctly
  test("textAlign prop sets alignment correctly", () => {
    mockUseColorMode("light");
    render(<FeatureSection {...defaultProps} textAlign="right" />);
    const textBlock = screen.getByTestId("feature-text-block");
    // Check the data-text-align attribute is correctly set
    expect(textBlock.dataset.textAlign).toBe("right");
  });
});
