import {
    formatRegisteredDate,
    formatCreationDate,
    getIsoStringDate,
} from "./formatters";

// Mock a date object to ensure consistent testing, especially for 'es-ES' locale
const fixedDate = new Date("2024-03-15T10:00:00Z");

// Mock a Firebase Timestamp object structure
const mockTimestamp = {
    toDate: jest.fn(() => fixedDate),
};

describe("Date Formatting Utilities", () => {
    // Clear the mock call history before each test to ensure test isolation.
    // This prevents call counts from accumulating across different test cases.
    beforeEach(() => {
        mockTimestamp.toDate.mockClear();
    });

    // formatRegisteredDate Tests
    describe("formatRegisteredDate", () => {
        const expectedFormattedDate = "15 de Marzo de 2024";

        it("should correctly format a standard Date object and capitalize the month", () => {
            // Expected output: "15 de marzo de 2024" -> "15 de Marzo de 2024"
            const result = formatRegisteredDate(fixedDate);
            expect(result).toBe(expectedFormattedDate);
        });

        it("should correctly format a Firebase Timestamp object", () => {
            const result = formatRegisteredDate(mockTimestamp);
            expect(mockTimestamp.toDate).toHaveBeenCalled();
            expect(result).toBe(expectedFormattedDate);
        });

        it("should return default string for null input", () => {
            expect(formatRegisteredDate(null)).toBe("Sin fecha de creación");
        });

        it("should return default string for undefined input", () => {
            expect(formatRegisteredDate(undefined)).toBe("Sin fecha de creación");
        });

        it("should return default string for invalid Date object (NaN time)", () => {
            const invalidDate = new Date("invalid date string");
            expect(formatRegisteredDate(invalidDate)).toBe("Sin fecha de creación");
        });

        it("should return default string for a non-date object without toDate function", () => {
            expect(formatRegisteredDate({})).toBe("Sin fecha de creación");
        });
    });

    // formatCreationDate Tests
    describe("formatCreationDate", () => {
        const expectedFormattedDate = "15 de Marzo de 2024";

        it("should correctly format a standard Date object and capitalize the month", () => {
            const result = formatCreationDate(fixedDate);
            expect(result).toBe(expectedFormattedDate);
        });

        it("should correctly format a Firebase Timestamp object", () => {
            const result = formatCreationDate(mockTimestamp);
            expect(mockTimestamp.toDate).toHaveBeenCalled();
            expect(result).toBe(expectedFormattedDate);
        });

        it("should return default string for null input", () => {
            expect(formatCreationDate(null)).toBe("Sin fecha de creación");
        });

        it("should return default string for undefined input", () => {
            expect(formatCreationDate(undefined)).toBe("Sin fecha de creación");
        });

        it("should return default string for invalid Date object (NaN time)", () => {
            const invalidDate = new Date("invalid date string");
            expect(formatCreationDate(invalidDate)).toBe("Sin fecha de creación");
        });
    });

    // getIsoStringDate Tests
    describe("getIsoStringDate", () => {
        const expectedIsoString = "2024-03-15T10:00:00.000Z";

        it("should convert a standard Date object to ISO string", () => {
            const result = getIsoStringDate(fixedDate);
            expect(result).toBe(expectedIsoString);
        });

        it("should convert a Firebase Timestamp object to ISO string", () => {
            const result = getIsoStringDate(mockTimestamp);
            expect(mockTimestamp.toDate).toHaveBeenCalledTimes(1);
            expect(result).toBe(expectedIsoString);
        });

        it("should return undefined for null input", () => {
            expect(getIsoStringDate(null)).toBeUndefined();
        });

        it("should return undefined for undefined input", () => {
            expect(getIsoStringDate(undefined)).toBeUndefined();
        });

        it("should return undefined for invalid Date object (NaN time)", () => {
            const invalidDate = new Date("invalid date string");
            expect(getIsoStringDate(invalidDate)).toBeUndefined();
        });

        it("should return undefined for a non-date object without toDate function", () => {
            expect(getIsoStringDate({})).toBeUndefined();
        });
    });
});