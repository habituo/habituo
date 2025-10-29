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
    const days = [
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
      "Domingo",
    ];
    days.forEach((day) => {
      expect(screen.getByText(day)).toBeInTheDocument();
    });
  });

  /**
   * Test 3: Verify special styling for highlighted days
   *
   * Ensures that the days "Martes" (Tuesday) and "Domingo" (Sunday)
   * have the orange background as defined in the component.
   */
  test("Martes and Domingo have orange background", () => {
    render(<CompleteWeek isLight={true} />);
    const martes = screen.getByText("Martes");
    const domingo = screen.getByText("Domingo");

    expect(martes).toHaveStyle("background: var(--chakra-colors-orange-500)");
    expect(domingo).toHaveStyle("background: var(--chakra-colors-orange-500)");
  });

  /**
   * Test 4: Verify question about remaining days
   *
   * Checks that the text prompting the user about remaining days
   * to complete habits is displayed correctly, including the highlighted span.
   */
  test("renders question about remaining days", () => {
    render(<CompleteWeek isLight={true} />);
    expect(
      screen.getByText(/¿Cuantos días te quedan para/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/completar los hábitos/i)).toBeInTheDocument();
  });
});
