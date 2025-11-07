import React from 'react';

// Mocks for react-dom/client (createRoot and render)
const mockRender = jest.fn();
const mockRoot = {
    render: mockRender,
    unmount: jest.fn() // Add unmount for completeness, although it is not used
};
const mockCreateRoot = jest.fn(() => mockRoot);
jest.mock('react-dom/client', () => ({
    createRoot: mockCreateRoot,
}));

// Mock for reportWebVitals
const mockReportWebVitals = jest.fn();
jest.mock('./reportWebVitals', () => mockReportWebVitals);

// Mock for useTheme and ThemeProvider
const mockChakraTheme = { colors: { brand: 'blue.500' } };
// We mock useTheme so the Root component can get the theme
const mockUseTheme = jest.fn(() => ({
    chakraTheme: mockChakraTheme,
}));
const MockThemeProvider = ({ children }) => (
    <div data-testid="mock-theme-provider">{children}</div>
);
jest.mock('./context/ThemeContext/ThemeContext', () => ({
    ThemeProvider: MockThemeProvider,
    useTheme: mockUseTheme,
}));

// Mock for AuthUserProvider
const MockAuthUserProvider = ({ children }) => (
    <div data-testid="mock-auth-provider">{children}</div>
);
jest.mock('./context/AuthUserContext/AuthUserContext', () => ({
    AuthUserProvider: MockAuthUserProvider,
}));

// Mock for ChakraProvider (used within the Root component)
const MockChakraProvider = ({ children, theme }) => (
    <div data-testid="mock-chakra-provider" data-theme={JSON.stringify(theme)}>
        {children}
    </div>
);
jest.mock('@chakra-ui/react', () => ({
    ChakraProvider: MockChakraProvider,
}));

// Mock for the main component App
const MockApp = () => <div data-testid="mock-app" />;
jest.mock('./App', () => MockApp);

describe('index.js application entry point', () => {
    let rootElement;
    let getElementByIdSpy;

    beforeAll(() => {
        // 2.1. Configuration of the Mock DOM element
        // It is necessary for document.getElementById('root') to return something.
        rootElement = document.createElement('div');
        rootElement.id = 'root';
        document.body.appendChild(rootElement);

        // We spy on document.getElementById to ensure it is called correctly
        getElementByIdSpy = jest.spyOn(document, 'getElementById').mockImplementation((id) => {
            if (id === 'root') return rootElement;
            return null;
        });

        // 2.2. Import index.js file
        // This executes the mounting logic and side-effects
        require('./index');
    });

    afterAll(() => {
        // Restore mocks and clean up the DOM
        getElementByIdSpy.mockRestore();
        document.body.removeChild(rootElement);
        jest.resetModules(); // Resets the module cache so it does not interfere with other tests
    });

    it('should call document.getElementById with "root"', () => {
        expect(getElementByIdSpy).toHaveBeenCalledWith('root');
    });

    it('should initialize the root element using ReactDOM.createRoot', () => {
        expect(mockCreateRoot).toHaveBeenCalledTimes(1);
        expect(mockCreateRoot).toHaveBeenCalledWith(rootElement);
    });

    it('should call root.render with the correct wrapper structure', () => {
        expect(mockRender).toHaveBeenCalledTimes(1);

        // 1. Verify the top-level element (StrictMode)
        const renderCall = mockRender.mock.calls[0][0];
        expect(renderCall.type).toBe(React.StrictMode);

        // 2. Verify the child of StrictMode (ThemeProvider)
        const themeProviderElement = renderCall.props.children;
        expect(themeProviderElement.type).toBe(MockThemeProvider);

        // 3. Verify the child of ThemeProvider (Root component)
        const rootComponentElement = themeProviderElement.props.children;

        // Since 'Root' is a function, we execute it to cover its internal logic
        // and verify that it uses useTheme, ChakraProvider, and AuthUserProvider.
        const RootComponent = rootComponentElement.type;
        const rootOutput = RootComponent({});

        // 4. Verify the use of useTheme() and the passing of the theme to ChakraProvider
        expect(mockUseTheme).toHaveBeenCalledTimes(1);
        expect(rootOutput.type).toBe(MockChakraProvider);
        expect(rootOutput.props.theme).toEqual(mockChakraTheme);

        // 5. Verify the child of ChakraProvider (AuthUserProvider)
        const authProviderElement = rootOutput.props.children;
        expect(authProviderElement.type).toBe(MockAuthUserProvider);

        // 6. Verify the child of AuthUserProvider (App)
        const appElement = authProviderElement.props.children;
        expect(appElement.type).toBe(MockApp);
    });

    it('should call reportWebVitals once', () => {
        expect(mockReportWebVitals).toHaveBeenCalledTimes(1);
    });
});
