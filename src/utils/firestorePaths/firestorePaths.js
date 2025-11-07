/**
 * Firestore Path Utilities
 *
 * Centralized helpers to build Firestore document and collection paths.
 * This improves maintainability and avoids hardcoded strings throughout the app.
 */

/**
 * Ensures that all required IDs are provided before building the path.
 * Helps catch potential runtime errors early.
 */
const validateId = (id, name) => {
    if (!id) throw new Error(`Missing ${name} in Firestore path`);
};

/**
 * Returns the user document path.
 * Example: users/{userId}
 */
export const getUserDocRef = (userId) => {
    validateId(userId, "userId");
    return `users/${userId}`;
};

/**
 * Returns the user's areas collection path.
 * Example: users/{userId}/areas
 */
export const getAreasCollectionRef = (userId) =>
    `${getUserDocRef(userId)}/areas`;

/**
 * Returns the specific area document path.
 * Example: users/{userId}/areas/{areaId}
 */
export const getAreaDocRef = (userId, areaId) => {
    validateId(areaId, "areaId");
    return `${getAreasCollectionRef(userId)}/${areaId}`;
};

/**
 * Returns the habits collection path for an area.
 * Example: users/{userId}/areas/{areaId}/habits
 */
export const getHabitsCollectionRef = (userId, areaId) =>
    `${getAreaDocRef(userId, areaId)}/habits`;

/**
 * Returns the specific habit document path.
 * Example: users/{userId}/areas/{areaId}/habits/{habitId}
 */
export const getHabitDocRef = (userId, areaId, habitId) => {
    validateId(habitId, "habitId");
    return `${getHabitsCollectionRef(userId, areaId)}/${habitId}`;
};

/**
 * Returns the collection of records for a given habit.
 * Example: users/{userId}/areas/{areaId}/habits/{habitId}/records
 */
export const getHabitRecordsCollectionRef = (userId, areaId, habitId) =>
    `${getHabitDocRef(userId, areaId, habitId)}/records`;

/**
 * Returns a specific record document path (e.g. by date).
 * Example: users/{userId}/areas/{areaId}/habits/{habitId}/records/{recordDate}
 */
export const getHabitRecordDocRef = (
    userId,
    areaId,
    habitId,
    recordDate
) => {
    validateId(recordDate, "recordDate");
    return `${getHabitRecordsCollectionRef(userId, areaId, habitId)}/${recordDate}`;
};

/**
 * Returns the user's tasks collection path.
 * Example: users/{userId}/tasks
 */
export const getTasksCollectionRef = (userId) =>
    `${getUserDocRef(userId)}/tasks`;

/**
 * Returns the specific task document path.
 * Example: users/{userId}/tasks/{taskId}
 */
export const getTaskDocRef = (userId, taskId) => {
    validateId(taskId, "taskId");
    return `${getTasksCollectionRef(userId)}/${taskId}`;
};
