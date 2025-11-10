/**
 * Formats the habit's goal display string based on the current record or default goals.
 * @param {object | null} todayRecord - The record for today (can be null).
 * @param {object} habit - The habit object containing goals.
 * @returns {string} The formatted goal display string.
 */
export const getGoalDisplay = (todayRecord, habit) => {

    if (todayRecord) {
        const todayRecordUnit = todayRecord.unit === "times" ? "veces" : "minutos";
        const amount = todayRecord.amount ?? todayRecord.times ?? 0;
        const dailyGoal = todayRecord.dailyGoal ?? habit.goals.value;
        const unitText = todayRecordUnit;
        return `${amount} / ${dailyGoal} ${unitText}`;
    }

    const goalsPeriod = habit.goals.period === "week" ? "semanal" : "mensual";
    const periodText = habit.goals.period === "day" ? "diaria" : goalsPeriod;
    const unitText = habit.goals.unit === "times" ? "veces" : "minutos";

    return `Meta ${periodText}: ${habit.goals.value} ${unitText}`;
};