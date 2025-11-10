import { render, screen } from "@testing-library/react";
import CompleteWeek from "./CompleteWeek";
import "@testing-library/jest-dom";

/**
 * Mock the FadeInWhenVisible animation wrapper
 *
 * We replace the animation component with a simple div to avoid
 * unnecessary complexity in the tests.
 */
jest.mock(
  "../../animations/FadeInWhenVisible/FadeInWhenVisible",
  () =>
    ({ children }) =>
      <div>{children}</div>
);

describe("CompleteWeek component", () => {
  const days = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
  ];

  /**
   * Test 1: Verify title and description rendering
   *
   * Ensures that the main heading ("Complete the Week") and the
   * description text are rendered correctly in the document.
   */
  test("renders title and description", () => {
    render(<CompleteWeek isLight={true} />);
    expect(
      screen.getByRole("heading", { name: /Completa la semana/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Consigue resultados completando las metas/i)
    ).toBeInTheDocument();
  });

  /**
   * Test 2: Verify all days of the week are rendered
   *
   * Checks that each day from Monday to Sunday is present in the DOM.
   */
  test("renders all days of the week", () => {
    render(<CompleteWeek isLight={true} />);
    days.forEach((day) => {
      expect(screen.getByText(day)).toBeInTheDocument();
    });
  });

  /**
   * Verify special styling for highlighted days
   *
   * Ensures that the days "Martes" (Tuesday) and "Domingo" (Sunday)
   * have the orange background as defined in the component.
   */
  test("Martes and Domingo have orange background when light theme", () => {
    render(<CompleteWeek isLight={true} />);
    expect(screen.getByText("Martes")).toHaveStyle(
      "background: var(--chakra-colors-orange-500)"
    );
    expect(screen.getByText("Domingo")).toHaveStyle(
      "background: var(--chakra-colors-orange-500)"
    );
  });

  /**
   * Verify styling for other days
   *
   * Checks that the text prompting the user about remaining days
   * to complete habits is displayed correctly, including the highlighted span.
   */
  test("other days have correct background for light theme", () => {
    render(<CompleteWeek isLight={true} />);
    ["Lunes", "Miércoles", "Jueves", "Viernes", "Sábado"].forEach((day) => {
      expect(screen.getByText(day)).toHaveStyle("background: gray.300");
    });
  });

  test("renders question about remaining days", () => {
    render(<CompleteWeek isLight={true} />);
    expect(
      screen.getByText(/¿Cuantos días te quedan para/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/completar los hábitos/i)).toBeInTheDocument();
  });

  // Dark theme tests
  test("renders dark theme colors correctly", () => {
    render(<CompleteWeek isLight={false} />);

    // Days background
    ["Lunes", "Miércoles", "Jueves", "Viernes", "Sábado"].forEach((day) => {
      expect(screen.getByText(day)).toHaveStyle("background: gray.700");
    });

    // Question color
    const questionText = screen.getByText(/¿Cuantos días te quedan para/i);
    expect(questionText).toHaveStyle("color: gray.300");

    const span = screen.getByText(/completar los hábitos/i);
    expect(span).toHaveStyle("color: white");
  });

  test("renders correctly with default props", () => {
    render(<CompleteWeek />);
    expect(
      screen.getByRole("heading", { name: /Completa la semana/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Consigue resultados completando las metas/i)
    ).toBeInTheDocument();
  });
});
