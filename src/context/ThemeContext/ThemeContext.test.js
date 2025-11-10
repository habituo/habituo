import { render, screen, act } from "@testing-library/react";
import { ThemeProvider, useTheme } from "./ThemeContext";

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});

// Mock customTheme to return a predictable object
jest.mock("../../theme/theme", () => jest.fn((color, font, radius) => ({
  colors: { focus: color },
  fonts: { body: font },
  radii: { base: radius },
})));

// Mock localStorage
const localStorageMock = (() => {
  let store = {};

  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(global, "localStorage", {
  value: localStorageMock,
  writable: true,
});

// Dummy consumer component for testing context behavior
const ThemeConsumer = () => {
  const { themeOptions, updateTheme, chakraTheme } = useTheme();

  return (
    <div>
      <p data-testid="focusColor">{themeOptions.focusColor}</p>
      <p data-testid="fontFamily">{themeOptions.fontFamily}</p>
      <p data-testid="borderRadius">{themeOptions.borderRadius}</p>
      <p data-testid="chakraFocus">{chakraTheme.colors.focus}</p>
      <button
        data-testid="updateThemeButton"
        onClick={() => updateTheme({ focusColor: "blue" })}
      >
        Update Theme
      </button>
    </div>
  );
};

describe("ThemeProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  test("renders children correctly", () => {
    render(
      <ThemeProvider>
        <div data-testid="child">Hello</div>
      </ThemeProvider>
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  test("uses default theme values when localStorage is empty", () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId("focusColor").textContent).toBe("orange");
    expect(screen.getByTestId("fontFamily").textContent).toBe("Outfit");
    expect(screen.getByTestId("borderRadius").textContent).toBe("lg");
  });

  test("loads initial values from localStorage", () => {
    localStorageMock.getItem.mockImplementation((key) => {
      const data = {
        focusColor: "green",
        fontFamily: "Roboto",
        borderRadius: "md",
      };
      return data[key];
    });

    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId("focusColor").textContent).toBe("green");
    expect(screen.getByTestId("fontFamily").textContent).toBe("Roboto");
    expect(screen.getByTestId("borderRadius").textContent).toBe("md");
  });

  test("updates theme and persists new settings in localStorage", async () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    const button = screen.getByTestId("updateThemeButton");

    await act(async () => {
      button.click();
    });

    expect(localStorage.setItem).toHaveBeenCalledWith("focusColor", "blue");
    expect(screen.getByTestId("focusColor").textContent).toBe("blue");
    expect(screen.getByTestId("chakraFocus").textContent).toBe("blue");
  });

  test("chakraTheme updates when themeOptions change", async () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    const initialChakraFocus = screen.getByTestId("chakraFocus").textContent;
    const button = screen.getByTestId("updateThemeButton");

    await act(async () => {
      button.click();
    });

    const updatedChakraFocus = screen.getByTestId("chakraFocus").textContent;
    expect(initialChakraFocus).not.toBe(updatedChakraFocus);
    expect(updatedChakraFocus).toBe("blue");
  });
});
