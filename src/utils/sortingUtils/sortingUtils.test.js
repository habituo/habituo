import { compareByOrder } from "./sortingUtils";

// Mock helper: simula un Firestore Timestamp
const mockTimestamp = (date) => ({
    toDate: () => new Date(date),
});

describe("sortingUtils", () => {
    describe("compareByOrder", () => {
        const itemA = {
            name: "Alpha",
            createdAt: new Date("2023-01-01"),
        };
        const itemB = {
            name: "Beta",
            createdAt: new Date("2023-02-01"),
        };

        it("should sort by name ascending (name-asc)", () => {
            const result = compareByOrder(itemA, itemB, "name-asc");
            expect(result).toBeLessThan(0); // Alpha before Beta
        });

        it("should sort by name descending (name-desc)", () => {
            const result = compareByOrder(itemA, itemB, "name-desc");
            expect(result).toBeGreaterThan(0); // Beta before Alpha
        });

        it("should sort by newest creation first (new-creation)", () => {
            const result = compareByOrder(itemA, itemB, "new-creation");
            expect(result).toBeGreaterThan(0); // B newer than A
        });

        it("should sort by oldest creation first (old-creation)", () => {
            const result = compareByOrder(itemA, itemB, "old-creation");
            expect(result).toBeLessThan(0); // A older than B
        });

        it("should handle Firestore Timestamps correctly", () => {
            const a = { createdAt: mockTimestamp("2023-01-01") };
            const b = { createdAt: mockTimestamp("2023-02-01") };
            const result = compareByOrder(a, b, "new-creation");
            expect(result).toBeGreaterThan(0);
        });

        it("should handle missing createdAt values gracefully", () => {
            const a = { name: "A" };
            const b = { name: "B" };
            const result = compareByOrder(a, b, "new-creation");
            expect(result).toBe(0);
        });

        it("should handle invalid date formats without throwing", () => {
            const a = { createdAt: "not-a-date" };
            const b = { createdAt: new Date("2023-02-01") };
            expect(() => compareByOrder(a, b, "old-creation")).not.toThrow();
        });

        it("should return 0 for unknown orderBy values", () => {
            const result = compareByOrder(itemA, itemB, "unknown");
            expect(result).toBe(0);
        });

        it("should handle empty names safely", () => {
            const a = { name: "" };
            const b = { name: null };
            const result = compareByOrder(a, b, "name-asc");
            expect(typeof result).toBe("number");
        });

        it("should sort correctly when both dates are invalid", () => {
            const a = { createdAt: "invalid" };
            const b = { createdAt: "invalid" };
            const result = compareByOrder(a, b, "new-creation");
            expect(result).toBe(0);
        });

        it("should handle missing objects without crashing", () => {
            expect(compareByOrder({}, {}, "name-asc")).toBe(0);
        });

        it("should prioritize valid date B over invalid date A (new-creation)", () => {
            const invalidA = { createdAt: "invalid-date" };
            const validB = { createdAt: new Date("2024-01-01") };
            const result = compareByOrder(invalidA, validB, "new-creation");
            expect(result).toBeGreaterThan(0);
        });

        it("should prioritize valid date A over invalid date B (new-creation)", () => {
            const validA = { createdAt: new Date("2024-01-01") };
            const invalidB = { createdAt: "invalid-date" };
            const result = compareByOrder(validA, invalidB, "new-creation");
            expect(result).toBeLessThan(0);
        });

        it("should handle Mock Timestamp returning an invalid date (NaN)", () => {
            const mockInvalidTimestamp = {
                toDate: () => new Date('invalid-date-string'),
            };

            const itemA = { name: "A", createdAt: mockInvalidTimestamp };
            const itemB = { name: "B" };
            const result = compareByOrder(itemA, itemB, "new-creation");
            expect(result).toBe(0);
        });

        it("should handle a Timestamp where toDate returns a non-Date object (fallback)", () => {
            const mockNonDateTimestamp = {
                toDate: () => ({ some: 'object', getTime: () => 100 }),
            };
            const itemA = { createdAt: mockNonDateTimestamp };
            const itemB = { createdAt: new Date("2024-01-01") };
            const result = compareByOrder(itemA, itemB, "old-creation");
            expect(result).toBeGreaterThan(0);
        });

        it("should return 0 for same names regardless of casing (name-asc)", () => {
            const a = { name: "testName" };
            const b = { name: "Testname" };
            const result = compareByOrder(a, b, "name-asc");
            expect(result).toBe(0);
        });
    });
});
