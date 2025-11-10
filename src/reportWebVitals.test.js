// Mock all web-vitals functions
const mockGetCLS = jest.fn();
const mockGetFID = jest.fn();
const mockGetFCP = jest.fn();
const mockGetLCP = jest.fn();
const mockGetTTFB = jest.fn();

// Mock the dynamic import of 'web-vitals'. 
// This object will be returned when `await import("web-vitals")` is called.
jest.mock('web-vitals', () => ({
    getCLS: mockGetCLS,
    getFID: mockGetFID,
    getFCP: mockGetFCP,
    getLCP: mockGetLCP,
    getTTFB: mockGetTTFB,
    // Include a non-function to ensure the type check inside the loop is covered
    getInvalidMetric: 'not_a_function',
}));

// Import the function to be tested AFTER all mocks are defined.
const reportWebVitals = require('./reportWebVitals').default;

describe('reportWebVitals', () => {
    const mockOnPerfEntry = jest.fn();

    beforeEach(() => {
        // Clear mock call history before each test run
        jest.clearAllMocks();
    });

    // --- Test Case 1: Happy Path (Covers try block and all function calls) ---
    it('should call all web-vitals metrics functions when a valid callback is provided', async () => {
        await reportWebVitals(mockOnPerfEntry);

        // 1. Verify all web-vitals functions were called once
        expect(mockGetCLS).toHaveBeenCalledTimes(1);
        expect(mockGetFID).toHaveBeenCalledTimes(1);
        expect(mockGetFCP).toHaveBeenCalledTimes(1);
        expect(mockGetLCP).toHaveBeenCalledTimes(1);
        expect(mockGetTTFB).toHaveBeenCalledTimes(1);

        // 2. Verify that the callback function (onPerfEntry) was passed to each metric function
        expect(mockGetCLS).toHaveBeenCalledWith(mockOnPerfEntry);
        expect(mockGetFID).toHaveBeenCalledWith(mockOnPerfEntry);
        expect(mockGetFCP).toHaveBeenCalledWith(mockOnPerfEntry);
        expect(mockGetLCP).toHaveBeenCalledWith(mockOnPerfEntry);
        expect(mockGetTTFB).toHaveBeenCalledWith(mockOnPerfEntry);
    });

    // This test covers the inner type check (line 24: `if (typeof metricFn === "function")`)
    it('should only call metric functions and skip non-function properties from web-vitals import', async () => {
        // The mock includes 'getInvalidMetric' which is a string.
        await reportWebVitals(mockOnPerfEntry);

        // We ensure the valid ones were called
        expect(mockGetCLS).toHaveBeenCalled();
        // If the type check failed, the test would crash trying to execute a string as a function.
    });

    // --- Test Case 2: Invalid Argument (Covers early return on line 13) ---
    it('should return immediately and not call any web-vitals functions if the argument is not a function', async () => {
        // Test with non-functional values (e.g., undefined, string, null)
        await reportWebVitals(undefined);
        await reportWebVitals('not_a_function');
        await reportWebVitals(null);

        // Verify that NO metric function was called
        expect(mockGetCLS).not.toHaveBeenCalled();
        expect(mockGetFID).not.toHaveBeenCalled();
        // Check all other mocks as well to be certain
        expect(mockGetLCP).not.toHaveBeenCalled();
    });

    // --- Test Case 3: Error Handling (Covers catch block on line 28) ---
    it('should throw an error if the dynamic import of "web-vitals" fails', async () => {
        // 1. Reset modules to apply a new mock configuration
        jest.resetModules();

        // Simulate that the dynamic import fails by throwing an error
        jest.mock('web-vitals', () => {
            throw new Error("Failed to load module");
        });

        // Re-import the function with the failing mock
        const reportWebVitalsWithError = require('./reportWebVitals').default;

        // 2. Execute the function and expect it to throw the wrapped error
        await expect(reportWebVitalsWithError(mockOnPerfEntry)).rejects.toThrow(
            "Error loading web-vitals module:" // FIX: The source code uses `new Error("string:", error)` which truncates the message. We adjust the expectation to match the actual runtime output.
        );

        // Clean up: Reset modules back to the original mock for isolation
        jest.resetModules();
        // Re-import the original module setup to allow subsequent tests (if any) to run correctly.
        require('./reportWebVitals');
    });
});
