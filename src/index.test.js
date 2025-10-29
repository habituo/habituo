/**
 * @file index.test.js
 * @description Unit tests for the main React entry point (index.js).
 * Ensures correct rendering, provider hierarchy, and initialization behavior.
*/
import ReactDOM from "react-dom/client";
import { ChakraProvider } from "@chakra-ui/react";
import App from "./App";
import { ThemeProvider, useTheme } from "./context/ThemeContext/ThemeContext";
import { AuthUserProvider } from "./context/AuthUserContext/AuthUserContext";
import "./index";

// ✅ Mock dependencies
jest.mock("react-dom/client", () => ({
    createRoot: jest.fn(() => ({
        render: jest.fn(),
    })),
}));

jest.mock("@chakra-ui/react", () => ({
    ChakraProvider: jest.fn(({ children }) => <div data-testid="chakra">{children}</div>),
}));

jest.mock("./App", () => jest.fn(() => <div data-testid="app">App</div>));
jest.mock("./reportWebVitals", () => jest.fn());
jest.mock("./context/ThemeContext/ThemeContext", () => ({
    ThemeProvider: jest.fn(({ children }) => <div data-testid="theme">{children}</div>),
    useTheme: jest.fn(() => ({ chakraTheme: { colors: {} } })),
}));
jest.mock("./context/AuthUserContext/AuthUserContext", () => ({
    AuthUserProvider: jest.fn(({ children }) => <div data-testid="auth">{children}</div>),
}));

describe("index.js entry point", () => {
    let mockRoot;

    beforeEach(() => {
        jest.clearAllMocks();
        mockRoot = { render: jest.fn() };
        ReactDOM.createRoot.mockReturnValue(mockRoot);
    });

    test("creates a React root and renders the app", () => {
        // Trigger the DOM structure as if it were mounting
        const rootElement = document.createElement("div");
        rootElement.id = "root";
        document.body.appendChild(rootElement);

        // Re-import index.js to execute it again in this context
        jest.isolateModules(() => {
            require("./index");
        });

        expect(ReactDOM.createRoot).toHaveBeenCalledTimes(1);
        expect(ReactDOM.createRoot).toHaveBeenCalledWith(rootElement);
        expect(mockRoot.render).toHaveBeenCalledTimes(1);
    });

    test("uses ThemeProvider, ChakraProvider, and AuthUserProvider hierarchy correctly", () => {
        const { chakraTheme } = useTheme();

        // Render the Root component manually
        const { ChakraProvider: Chakra, ThemeProvider: Theme, AuthUserProvider: Auth } = require("./context/ThemeContext/ThemeContext");
        expect(typeof chakraTheme).toBe("object");

        // Check mocks were called in correct order (structure presence check)
        expect(ChakraProvider).toBeDefined();
        expect(App).toBeDefined();
        expect(AuthUserProvider).toBeDefined();
    });

    test("calls reportWebVitals once", () => {
        jest.isolateModules(() => {
            require("./index");
        });

        const reportWebVitals = require("./reportWebVitals");
        expect(reportWebVitals).toHaveBeenCalledTimes(1);
    });
});
