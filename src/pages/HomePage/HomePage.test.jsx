import { render, screen } from "@testing-library/react";
import HomePage from "./HomePage";
import "@testing-library/jest-dom";

// Mocks for lazy-loaded components
jest.mock("../../components/layout/FeatureSection/FeatureSection", () => (props) => (
  <div>{props.title}</div>
));
jest.mock("../../components/layout/CompleteWeek/CompleteWeek", () => () => (
  <div>CompleteWeek Component</div>
));
jest.mock("../../components/layout/FAQSection/FAQSection", () => () => (
  <div>FAQSection Component</div>
));

// Mocks for exported components
jest.mock("../../exports", () => ({
  Navbar: () => <div>Navbar</div>,
  Footer: () => <div>Footer</div>,
  CookiesBanner: () => <div>CookiesBanner</div>,
  HeroSection: () => <div>HeroSection</div>,
  PersonalizationGrid: () => <div>PersonalizationGrid</div>,
}));

describe("HomePage component", () => {
  test("renders basic static sections", async () => {
    render(<HomePage />);

    // Test static, non-lazy components first
    expect(screen.getByText("Navbar")).toBeInTheDocument();
    expect(screen.getByText("HeroSection")).toBeInTheDocument();
    expect(screen.getByText("PersonalizationGrid")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();
    expect(screen.getByText("CookiesBanner")).toBeInTheDocument();
  });

  test("renders lazy-loaded components", async () => {
    render(<HomePage />);

    // Wait for each lazy-loaded component individually
    const feature1 = await screen.findByText("El mejor tracker de hábitos para alcanzar tus metas");
    expect(feature1).toBeInTheDocument();

    const completeWeek = await screen.findByText("CompleteWeek Component");
    expect(completeWeek).toBeInTheDocument();

    const feature2 = await screen.findByText("Un dashboard a tu estilo");
    expect(feature2).toBeInTheDocument();

    const faq = await screen.findByText("FAQSection Component");
    expect(faq).toBeInTheDocument();
  });
});