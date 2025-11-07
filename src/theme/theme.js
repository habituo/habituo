import { extendTheme } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";

/**
 * @type {Object.<string, string>} Defines available font stacks.
 */
const FONT_FAMILIES = {
    // Standard system/default fonts
    Inter: "Inter, sans-serif",

    // Custom/Themed fonts
    Outfit: "Outfit, sans-serif",
    "Bricolage Grotesque": "Bricolage Grotesque, sans-serif",
    Geist: "Geist, sans-serif",

    // Alias for heading and body fallback
    heading: "Inter, sans-serif",
    body: "Inter, sans-serif",
};

/**
 * @type {Object.<string, string>} Defines the default radius scale for Chakra UI.
 */
const DEFAULT_RADII = {
    none: "0",
    sm: "0.125rem",
    base: "0.25rem",
    md: "0.375rem",
    lg: "0.5rem",
    xl: "0.75rem",
    "2xl": "1rem",
    "3xl": "1.5rem",
    full: "9999px",
};

// Default Values
const DEFAULT_FOCUS_COLOR = "orange";
const DEFAULT_FONT_KEY = "Outfit";
const DEFAULT_RADIUS_KEY = "lg";
const FALLBACK_RADIUS_VALUE = DEFAULT_RADII.base;

/**
 * Creates a customizable Chakra UI theme.
 * @param {string} [focusColor] - Base color (e.g., "blue", "teal"). Defaults to "orange".
 * @param {keyof typeof FONT_FAMILIES} [fontFamily] - Key of the font stack to use. Defaults to "Outfit".
 * @param {keyof typeof DEFAULT_RADII} [borderRadiusKey] - Key for the global border radius. Defaults to "lg".
 * @returns {object} The extended Chakra UI theme object.
 */
const customTheme = (focusColor, fontFamily, borderRadiusKey) => {
    // Use nullish coalescing (??) for clearer fallback assignment
    const finalFocusColor = focusColor ?? DEFAULT_FOCUS_COLOR;
    const finalFontKey = fontFamily ?? DEFAULT_FONT_KEY;
    const finalBorderRadiusKey = borderRadiusKey ?? DEFAULT_RADIUS_KEY;

    // Determine the border radius value, falling back to base if the key is invalid
    const selectedBorderRadius = DEFAULT_RADII[finalBorderRadiusKey] ?? FALLBACK_RADIUS_VALUE;

    // Determine the font stack value, falling back to Inter if the key is unknown
    const selectedFontStack = FONT_FAMILIES[finalFontKey] ?? FONT_FAMILIES.Inter;

    return extendTheme({
        // 1. Colors
        colors: {
            brand: {
                // Allows using 'brand.500' which maps to the chosen color/shade (e.g., 'orange.500')
                500: `${finalFocusColor}.500`,
            },
        },
        // 2. Fonts
        fonts: {
            // Apply the chosen font stack to both headings and body
            heading: selectedFontStack,
            body: selectedFontStack,
        },
        // 3. Radii
        radii: {
            ...DEFAULT_RADII,
            // Override the default 'base' radius with the selected radius for consistency
            base: selectedBorderRadius,
        },
        // 4. Components
        components: {
            // Apply the selected radius globally to all buttons
            Button: {
                // Use a standard object structure for simpler baseStyle without 'props' dependency
                baseStyle: {
                    borderRadius: selectedBorderRadius,
                },
            },
        },
        // 5. Global Styles
        styles: {
            // Use (props) => ({...}) structure to enable color mode dependency
            global: (props) => ({
                body: {
                    fontFamily: selectedFontStack, // Use the selected font
                    bg: mode("white", "gray.900")(props),
                    color: mode("gray.800", "whiteAlpha.900")(props),
                },
                // Custom scrollbar styling
                "::-webkit-scrollbar": {
                    width: "8px",
                },
                "::-webkit-scrollbar-track": {
                    bg: mode("gray.100", "gray.700")(props),
                    borderRadius: "4px",
                },
                "::-webkit-scrollbar-thumb": {
                    // Use focus color for the scrollbar thumb
                    bg: mode(`${finalFocusColor}.400`, `${finalFocusColor}.200`)(props),
                    borderRadius: "4px",
                    border: `2px solid ${mode("gray.100", "gray.700")(props)}`,
                },
                "::-webkit-scrollbar-thumb:hover": {
                    // Darken on hover
                    bg: mode(`${finalFocusColor}.600`, `${finalFocusColor}.400`)(props),
                },
            }),
        },
    });
};

export default customTheme;