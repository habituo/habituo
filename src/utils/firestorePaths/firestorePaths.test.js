import {
    getUserDocRef,
    getAreasCollectionRef,
    getAreaDocRef,
    getHabitsCollectionRef,
    getHabitDocRef,
    getHabitRecordsCollectionRef,
    getHabitRecordDocRef,
    getTasksCollectionRef,
    getTaskDocRef,
} from "./firestorePaths";

describe("Firestore Paths Utilities", () => {
    const userId = "user123";
    const areaId = "area456";
    const habitId = "habit789";
    const recordDate = "2025-11-02";
    const taskId = "task111";

    // --- USER ---
    test("getUserDocRef returns correct path", () => {
        expect(getUserDocRef(userId)).toBe(`users/${userId}`);
    });

    test("getUserDocRef throws if userId is missing", () => {
        expect(() => getUserDocRef()).toThrow("Missing userId in Firestore path");
    });

    // --- AREAS ---
    test("getAreasCollectionRef returns correct path", () => {
        expect(getAreasCollectionRef(userId)).toBe(`users/${userId}/areas`);
    });

    test("getAreaDocRef returns correct path", () => {
        expect(getAreaDocRef(userId, areaId)).toBe(`users/${userId}/areas/${areaId}`);
    });

    test("getAreaDocRef throws if areaId is missing", () => {
        expect(() => getAreaDocRef(userId)).toThrow("Missing areaId in Firestore path");
    });

    // --- HABITS ---
    test("getHabitsCollectionRef returns correct path", () => {
        expect(getHabitsCollectionRef(userId, areaId)).toBe(
            `users/${userId}/areas/${areaId}/habits`
        );
    });

    test("getHabitDocRef returns correct path", () => {
        expect(getHabitDocRef(userId, areaId, habitId)).toBe(
            `users/${userId}/areas/${areaId}/habits/${habitId}`
        );
    });

    test("getHabitDocRef throws if habitId is missing", () => {
        expect(() => getHabitDocRef(userId, areaId)).toThrow(
            "Missing habitId in Firestore path"
        );
    });

    // --- RECORDS ---
    test("getHabitRecordsCollectionRef returns correct path", () => {
        expect(getHabitRecordsCollectionRef(userId, areaId, habitId)).toBe(
            `users/${userId}/areas/${areaId}/habits/${habitId}/records`
        );
    });

    test("getHabitRecordDocRef returns correct path", () => {
        expect(getHabitRecordDocRef(userId, areaId, habitId, recordDate)).toBe(
            `users/${userId}/areas/${areaId}/habits/${habitId}/records/${recordDate}`
        );
    });

    test("getHabitRecordDocRef throws if recordDate is missing", () => {
        expect(() => getHabitRecordDocRef(userId, areaId, habitId)).toThrow(
            "Missing recordDate in Firestore path"
        );
    });

    // --- TASKS ---
    test("getTasksCollectionRef returns correct path", () => {
        expect(getTasksCollectionRef(userId)).toBe(`users/${userId}/tasks`);
    });

    test("getTaskDocRef returns correct path", () => {
        expect(getTaskDocRef(userId, taskId)).toBe(`users/${userId}/tasks/${taskId}`);
    });

    test("getTaskDocRef throws if taskId is missing", () => {
        expect(() => getTaskDocRef(userId)).toThrow("Missing taskId in Firestore path");
    });
});
