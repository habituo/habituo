import { extendTheme } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";

const fonts = {
    heading: "Inter, sans-serif",
    body: "Inter, sans-serif",
    Outfit: "Outfit, sans-serif",
    "Bricolage Grotesque": "Bricolage Grotesque, sans-serif",
    Geist: "Geist, sans-serif",
};

const defaultRadii = {
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

const customTheme = (focusColor, fontFamily, borderRadiusKey) => {
    const finalFocusColor = focusColor || "orange";
    const finalFontFamily = fontFamily || "Outfit";
    const finalBorderRadiusKey = borderRadiusKey || "lg";
    const selectedBorderRadius = defaultRadii[finalBorderRadiusKey] || defaultRadii.base;

    return extendTheme({
        colors: {
            brand: {
                500: `${finalFocusColor}.500`,
            },
        },
        fonts: {
            heading: fonts[finalFontFamily] || fonts.heading,
            body: fonts[finalFontFamily] || fonts.body,
        },
        radii: {
            ...defaultRadii,
            base: selectedBorderRadius,
        },
        components: {
            Button: {
                baseStyle: (props) => ({
                    borderRadius: selectedBorderRadius,
                }),
            },
        },
        styles: {
            global: (props) => ({
                body: {
                    fontFamily: fonts[finalFontFamily] || fonts.body,
                    bg: mode("white", "gray.900")(props),
                    color: mode("gray.800", "whiteAlpha.900")(props),
                },
                "::-webkit-scrollbar": {
                    width: "8px",
                },
                "::-webkit-scrollbar-track": {
                    bg: mode("gray.100", "gray.700")(props),
                    borderRadius: "4px",
                },
                "::-webkit-scrollbar-thumb": {
                    bg: mode(`${finalFocusColor}.400`, `${finalFocusColor}.200`)(props),
                    borderRadius: "4px",
                    border: `2px solid ${mode("gray.100", "gray.700")(props)}`,
                },
                "::-webkit-scrollbar-thumb:hover": {
                    bg: mode(`${finalFocusColor}.600`, `${finalFocusColor}.400`)(props),
                },
            }),
        },
    });
};

export default customTheme;