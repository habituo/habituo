import { render, screen } from "@testing-library/react";
import FadeInWhenVisible from "./FadeInWhenVisible";

jest.mock("react-intersection-observer", () => ({
    useInView: () => [jest.fn(), true],
}));

describe("FadeInWhenVisible", () => {
    test("renderiza los hijos correctamente", () => {
        render(
            <FadeInWhenVisible>
                <div>Contenido de prueba</div>
            </FadeInWhenVisible>
        );

        expect(screen.getByText("Contenido de prueba")).toBeInTheDocument();
    });

    test("acepta props adicionales", () => {
        render(
            <FadeInWhenVisible data-testid="motion-box">
                <span>Test props</span>
            </FadeInWhenVisible>
        );

        expect(screen.getByTestId("motion-box")).toBeInTheDocument();
        expect(screen.getByText("Test props")).toBeInTheDocument();
    });
});