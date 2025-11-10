import { getGoalDisplay } from "./getGoalDisplay";

describe("getGoalDisplay", () => {
    // Tests for WHEN a todayRecord IS PRESENT
    describe("When todayRecord is present", () => {
        // Test suite to cover all fallback logic for amount and goal
        it.each([
            // Scenario 1: Basic record, uses todayRecord.amount and todayRecord.dailyGoal
            [
                "uses amount and dailyGoal from record (unit: times)",
                { unit: 'times', amount: 5, dailyGoal: 10 },
                { goals: { value: 99 } }, // Ignored habit value
                "5 / 10 veces"
            ],
            // Scenario 2: 'amount' is missing, falls back to 'times', uses record's dailyGoal
            [
                "uses times fallback for amount (unit: minutes)",
                { unit: 'minutes', times: 3, amount: undefined, dailyGoal: 60 },
                { goals: { value: 99 } }, // Ignored habit value
                "3 / 60 minutos"
            ],
            // Scenario 3: 'amount' and 'times' missing, defaults to 0. Uses record's dailyGoal
            [
                "uses 0 fallback for amount (unit: times)",
                { unit: 'times', dailyGoal: 15, amount: undefined, times: undefined },
                { goals: { value: 99 } }, // Ignored habit value
                "0 / 15 veces"
            ],
            // Scenario 4: dailyGoal missing, falls back to habit.goals.value
            [
                "uses habit goal value for dailyGoal (unit: minutes)",
                { unit: 'minutes', amount: 10, dailyGoal: undefined },
                { goals: { value: 40 } }, // Used as fallback
                "10 / 40 minutos"
            ],
            // Scenario 5: All fallbacks activated (amount=0, dailyGoal=habit.goals.value)
            [
                "uses 0 and habit goal value for both fallbacks (unit: times)",
                { unit: 'times', amount: undefined, times: undefined, dailyGoal: undefined },
                { goals: { value: 50 } }, // Used as fallback
                "0 / 50 veces"
            ],
        ])("should correctly format and fall back when it %s", (name, todayRecord, habit, expected) => {
            const result = getGoalDisplay(todayRecord, habit);
            // FIX: Changed 'expected(result).toBe(expected)' to 'expect(result).toBe(expected)'
            expect(result).toBe(expected);
        });
    });


    // Tests for WHEN a todayRecord IS ABSENT
    describe("When todayRecord is absent (using default habit goals)", () => {

        // Mock the habit.goals object to simulate the final output string logic
        it.each([
            // Scenario 6: Daily goal, times unit
            [
                "daily goal with times unit",
                { unit: 'times', period: 'day', value: 2 },
                "Meta diaria: 2 veces"
            ],
            // Scenario 7: Weekly goal, minutes unit
            [
                "weekly goal with minutes unit",
                { unit: 'minutes', period: 'week', value: 120 },
                "Meta semanal: 120 minutos"
            ],
            // Scenario 8: Monthly goal, times unit
            [
                "monthly goal with times unit",
                { unit: 'times', period: 'month', value: 10 },
                "Meta mensual: 10 veces"
            ],
            // Scenario 9: Default/catch-all period (should be 'mensual')
            [
                "unknown period defaults to mensual",
                { unit: 'minutes', period: 'year', value: 5 },
                "Meta mensual: 5 minutos"
            ],
        ])("should format goal string for %s", (name, goals, expected) => {
            const habit = { goals };

            // NOTE: This logic assumes the structural bug in getGoalDisplay has been fixed 
            // by moving the 'todayRecordUnit' definition inside the 'if (todayRecord)' block.

            // The 'expectedResult' calculation should match the structure of the last return in the JS function
            const goalPeriod = goals.period === "week" ? "semanal" : "mensual";
            const goalUnit = `${goals.unit === "times" ? "veces" : "minutos"}`;
            const expectedResult = `Meta ${goals.period === "day" ? "diaria" : goalPeriod}: ${goals.value} ${goalUnit}`;

            const result = getGoalDisplay(null, habit);

            // FIX: Changed 'expected(result).toBe(expectedResult)' to 'expect(result).toBe(expectedResult)'
            expect(result).toBe(expectedResult);
        });
    });
});
