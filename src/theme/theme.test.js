import customTheme from "./theme";
import { extendTheme } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";

jest.mock("@chakra-ui/react", () => ({
    extendTheme: jest.fn((theme) => theme),
}));

jest.mock("@chakra-ui/theme-tools", () => ({
    mode: jest.fn((light, dark) => (props) => light),
}));

describe("customTheme", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Happy Path and Default Tests
    it("should use default values when no arguments are provided", () => {
        const theme = customTheme();
        expect(theme.colors.brand[500]).toBe("orange.500");
        expect(theme.fonts.heading).toBe("Outfit, sans-serif");
        expect(theme.styles.global({}).body.fontFamily).toBe("Outfit, sans-serif");
        expect(theme.radii.base).toBe("0.5rem");
        expect(theme.components.Button.baseStyle.borderRadius).toBe("0.5rem");
        expect(extendTheme).toHaveBeenCalledTimes(1);
    });

    it("should use all provided valid arguments", () => {
        const theme = customTheme("teal", "Geist", "2xl");

        // 1. Focus Color: 'teal'
        expect(theme.colors.brand[500]).toBe("teal.500");

        // 2. Font Family: 'Geist'
        expect(theme.fonts.heading).toBe("Geist, sans-serif");

        // 3. Border Radius: '2xl' (1rem)
        expect(theme.radii.base).toBe("1rem");
        expect(theme.components.Button.baseStyle.borderRadius).toBe("1rem");
    });

    // Null/Undefined Fallback Tests (Coalescing Logic)
    it("should use default values when arguments are explicitly null or undefined", () => {
        const theme = customTheme(null, undefined, null);
        expect(theme.colors.brand[500]).toBe("orange.500");
        expect(theme.fonts.heading).toBe("Outfit, sans-serif");
        expect(theme.radii.base).toBe("0.5rem");
    });

    // Invalid Fallback Tests (Error Handling Logic)
    it("should fall back to 'Inter' font if the provided font key is invalid", () => {
        const theme = customTheme("blue", "InvalidFontKey", "lg");
        expect(theme.fonts.heading).toBe("Inter, sans-serif");
        expect(theme.fonts.body).toBe("Inter, sans-serif");
    });

    it("should fall back to 'base' radius (0.25rem) if the provided radius key is invalid", () => {
        const theme = customTheme("blue", "Outfit", "InvalidRadiusKey");
        expect(theme.radii.base).toBe("0.25rem");
        expect(theme.components.Button.baseStyle.borderRadius).toBe("0.25rem");
    });

    // Global Styles (mode) Coverage
    it("should correctly set up global styles and call mode() for color mode support", () => {
        const props = { colorMode: "light" }; // Mock props
        const focusColor = "red";

        const theme = customTheme(focusColor, "Outfit", "lg");

        theme.styles.global(props);

        expect(mode).toHaveBeenCalledWith("white", "gray.900");
        expect(mode).toHaveBeenCalledWith("gray.800", "whiteAlpha.900");
        expect(mode).toHaveBeenCalledWith("gray.100", "gray.700");
        expect(mode).toHaveBeenCalledWith(`${focusColor}.400`, `${focusColor}.200`);
        expect(mode).toHaveBeenCalledWith(`${focusColor}.600`, `${focusColor}.400`);

        const bodyStyles = theme.styles.global(props).body;
        expect(bodyStyles.bg).toBe("white");
        expect(bodyStyles.color).toBe("gray.800");

        const scrollThumbStyles = theme.styles.global(props)["::-webkit-scrollbar-thumb"];
        expect(scrollThumbStyles.bg).toBe("red.400");
    });
});