export const getUserDocRef = (userId) => `users/${userId}`;
export const getAreasCollectionRef = (userId) => `${getUserDocRef(userId)}/areas`;
export const getAreaDocRef = (userId, areaId) => `${getAreasCollectionRef(userId)}/${areaId}`;
export const getHabitsCollectionRef = (userId, areaId) => `${getAreaDocRef(userId, areaId)}/habits`;
export const getHabitDocRef = (userId, areaId, habitId) => `${getHabitsCollectionRef(userId, areaId)}/${habitId}`;
export const getHabitRecordsCollectionRef = (userId, areaId, habitId) => `${getHabitDocRef(userId, areaId, habitId)}/records`;
export const getHabitRecordDocRef = (userId, areaId, habitId, recordDate) => `${getHabitRecordsCollectionRef(userId, areaId, habitId)}/${recordDate}`;
export const getTasksCollectionRef = (userId) => `${getUserDocRef(userId)}/tasks`;
export const getTaskDocRef = (userId, taskId) => `${getTasksCollectionRef(userId)}/${taskId}`;