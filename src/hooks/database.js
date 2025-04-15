import { db, auth } from "./firebase";
import { serverTimestamp, Timestamp, collection, addDoc, updateDoc, deleteDoc, doc, getDoc, onSnapshot, getDocs, setDoc, query, orderBy } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { Text } from "@chakra-ui/react";

/**
 * Helper function to get user ID or throw an error if not authenticated.
 */
export const getUserId = () => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");
    return user.uid;
};

export const getAreas = (callback) => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
        console.error("User not authenticated");
        return () => { };
    }

    try {
        const areasRef = collection(db, "users", userId, "areas");
        return onSnapshot(areasRef, (snapshot) => {
            const areasList = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            callback(areasList);
        });
    } catch (error) {
        console.error("Error setting up areas listener: ", error);
        return () => { };
    }
};

/**
 * Retrieves all areas and their habits for the authenticated user in real-time.
 * @param {Function} callback - Function to handle the retrieved data.
 * @returns {Function} Firestore unsubscribe function.
 */
export const getAllHabitsByArea = (callback) => {
    const userId = getUserId();
    const areasRef = collection(db, `users/${userId}/areas`);

    return onSnapshot(areasRef, async (areasSnapshot) => {
        const areasData = await Promise.all(
            areasSnapshot.docs.map(async (areaDoc) => {
                const area = { id: areaDoc.id, ...areaDoc.data() };
                const habitsRef = collection(db, `users/${userId}/areas/${area.id}/habits`);
                const habitsSnapshot = await getDocs(habitsRef);
                const habits = habitsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
                return { ...area, habits };
            })
        );

        callback(areasData);
    });
};

/**
  * Retrieves all habits for a specific area of the authenticated user in real-time.
  * @param {string} areaId - The ID of the area whose habits to retrieve.
  * @param {Function} callback - Function to handle the retrieved habits data.
  * @returns {Function} Firestore unsubscribe function.
  */
export const getHabitsByArea = (areaId, callback) => {
    const userId = getUserId();
    const habitsRef = collection(db, `users/${userId}/areas/${areaId}/habits`);

    return onSnapshot(habitsRef, (habitsSnapshot) => {
        const habitsData = habitsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        callback(habitsData);
    });
};

export const getAreasWithHabitCounts = async () => {
    const user = auth.currentUser;
    if (!user) { return [] };

    const userId = user.uid;
    const areasRef = collection(db, `users/${userId}/areas`);
    const areasSnapshot = await getDocs(areasRef);

    const areasList = areasSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        registeredAt: doc.data().registeredAt ? doc.data().registeredAt.toDate() : null,
    }));

    const updatedAreas = await Promise.all(
        areasList.map(async (area) => {
            const habitsRef = collection(db, `users/${userId}/areas/${area.id}/habits`);
            const habitsSnapshot = await getDocs(habitsRef);
            const habitCount = habitsSnapshot.size;

            return {
                ...area,
                icon: area.icon || "LuFolder",
                habitCount,
            };
        })
    );

    return updatedAreas;
};

export const deleteAreaById = async (areaId) => {
    const user = auth.currentUser;
    if (!user) {
        throw new Error("User not authenticated");
    }

    try {
        await deleteDoc(doc(db, `users/${user.uid}/areas/${areaId}`));
    } catch (error) {
        console.error("Error deleting area:", error);
        throw error; // Re-lanza el error para que AllAreas.jsx lo maneje
    }
};

export const updateAreaById = async (areaId, areaData) => {
    const user = auth.currentUser;
    if (!user) {
        throw new Error("User not authenticated");
    }
    try {
        const areaDoc = doc(db, `users/${user.uid}/areas/${areaId}`);
        await updateDoc(areaDoc, areaData);
    } catch (error) {
        throw new Error("Error updating area:", error);
    }
};

export const fetchUserDataFromFirestore = async (userId) => {
    if (!userId) return null;
    try {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);
        return userSnap.exists() ? userSnap.data() : null;
    } catch (error) {
        console.error("Error al obtener los datos del usuario:", error);
        return null;
    }
};

export const updateUserData = async (userId, data, toast) => {
    if (!userId) throw new Error("User ID cannot be empty.");
    try {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, data);
    } catch (error) {
        toast({
            title: <Text fontWeight="600">Error al actualizar el usuario</Text>,
            description: error,
            status: "error",
            position: "bottom",
        });
        throw error;
    }
};

/**
 * Adds a new document to a specified collection.
 */
const addDocument = async (path, data) => await addDoc(collection(db, path), data);

/**
 * Updates an existing document.
 */
const updateDocument = async (path, id, data) => await updateDoc(doc(db, path, id), data);

/**
 * Deletes an existing document.
 */
const deleteDocument = async (path, id) => await deleteDoc(doc(db, path, id));

/**
 * CRUD Operations for Areas.
 */
export const addArea = (areaData) => addDocument(`users/${getUserId()}/areas`, areaData);
export const updateArea = (id, areaData) => updateDocument(`users/${getUserId()}/areas`, id, areaData);
export const deleteArea = (id) => deleteDocument(`users/${getUserId()}/areas`, id);

/**
 * CRUD Operations for Habits.
 */
export const addHabit = (areaId, habitData) => addDocument(`users/${getUserId()}/areas/${areaId}/habits`, habitData);
export const updateHabit = (areaId, id, habitData) => updateDocument(`users/${getUserId()}/areas/${areaId}/habits`, id, habitData);
export const deleteHabit = (areaId, id) => deleteDocument(`users/${getUserId()}/areas/${areaId}/habits`, id);

/**
  * Records that a habit was skipped for the current day.
  * @param {string} areaId - The ID of the area the habit belongs to.
  * @param {string} habitId - The ID of the habit.
  * @param {Function} toast - The toast function from Chakra UI to display messages.
  */
export const skipHabit = async (areaId, habitId, toast, habitName) => {
    try {
        const userId = getUserId();
        const now = new Date();
        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;

        const recordsRef = collection(
            db,
            `users/${userId}/areas/${areaId}/habits/${habitId}/records`
        );
        const recordDoc = doc(recordsRef, dateString);
        const recordSnap = await getDoc(recordDoc);

        const recordData = {
            status: "skipped",
            timestamp: serverTimestamp(),
            date: dateString,
            times: 0,
        };

        if (recordSnap.exists()) {
            await updateDoc(recordDoc, recordData);
            toast({
                title: <Text fontWeight="600">Hábito actualizado a saltado</Text>,
                description: `Se ha marcado el hábito "${habitName}" como saltado para hoy.`,
                status: "warning",
                position: "bottom"
            });
        } else {
            await setDoc(recordDoc, recordData);
            toast({
                title: <Text fontWeight="600">Hábito saltado</Text>,
                description: `Se ha marcado el hábito "${habitName}" como saltado para hoy.`,
                status: "warning",
                position: "bottom"
            });
        }
    } catch (error) {
        toast({
            title: <Text fontWeight="600">Error al saltar</Text>,
            description: "Ha ocurrido un problema. Prueba más tarde.",
            status: "error",
            position: "bottom"
        });
    }
};

/**
 * Records that a habit was completed for the current day.
 * @param {string} areaId - The ID of the area the habit belongs to.
 * @param {string} habitId - The ID of the habit.
 * @param {object} habit - The habit object containing type and repeat information.
 * @param {Function} toast - The toast function from Chakra UI to display messages.
 * @param {Function} getWeekNumber - (Optional) Function to get the week number.
 */
export const completeHabit = async (areaId, habitId, habit, toast, getWeekNumber) => {

    try {
        const userId = getUserId();
        const now = new Date();
        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;

        const recordsRef = collection(
            db,
            `users/${userId}/areas/${areaId}/habits/${habitId}/records`
        );
        const recordDoc = doc(recordsRef, dateString);
        const recordSnap = await getDoc(recordDoc);

        if (habit?.repeat?.type === "day" && habit?.daysOfWeek) {
            const dayOfWeekSpain = new Date().getDay();
            if (!habit.daysOfWeek.includes(dayOfWeekSpain)) {
                toast({
                    title: <Text fontWeight="600">Hábito no programado</Text>,
                    description: `El hábito "${habit.name}" no está programado para hoy.`,
                    status: "warning",
                    position: "bottom"
                });
                return;
            }
        }

        const recordData = {
            status: "completed",
            date: dateString,
            timestamp: now,
            times: 1,
        };

        if (habit?.type === "weekly" && getWeekNumber) {
            recordData.week = getWeekNumber(new Date());
        } else if (habit?.type === "monthly") {
            const date = new Date((now).seconds * 1000);
            recordData.month = date.getMonth() + 1;
            recordData.year = date.getFullYear();
        }

        if (recordSnap.exists()) {
            await updateDoc(recordDoc, {
                status: "completed",
                date: dateString,
                timestamp: now,
                times: (recordSnap.data()?.times || 0) + 1,
            });
            toast({
                title: <Text fontWeight="600">¡Hábito actualizado!</Text>,
                description: `Se ha actualizado la completación del hábito "${habit.name}" para hoy.`,
                status: "success",
                position: "bottom"
            });
        } else {
            await setDoc(recordDoc, recordData);
            toast({
                title: <Text fontWeight="600">¡Hábito completado!</Text>,
                description: `Se ha completado el hábito "${habit.name}" por hoy correctamente.`,
                status: "success",
                position: "bottom"
            });
        }

    } catch (error) {
        console.error("Error completing/updating habit:", error);
        toast({
            title: <Text fontWeight="600">Error al completar/actualizar</Text>,
            description: "Ha ocurrido un problema. Prueba más tarde.",
            status: "error",
            position: "bottom"
        });
    }
};

/**
  * Calculates the week number of the year for a given date.
  * @param {Date | string | number} date - The date for which to get the week number.
  * @returns {number} The week number of the year (an integer between 1 and 53).
  */
export const getWeekNumber = (date) => {
    // Copy the date object to avoid modifying the original
    const d = new Date(
        Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
    // Get day of year
    const dayOfYear = Math.floor(
        (d - new Date(d.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24
    );
    // Get first day of year (Sunday)
    const firstDayOfYear = new Date(d.getFullYear(), 0, 1);
    // Calculate the difference in days and add 1 (for the first week)
    const diffDays =
        Math.round((d - firstDayOfYear) / (1000 * 60 * 60 * 24)) + 1;
    // Calculate week number
    const weekNumber = Math.ceil(diffDays / 7);
    return weekNumber;
};

/**
* Checks if a habit has failed for the current day and records it if no record exists.
* @param {string} areaId - The ID of the area the habit belongs to.
* @param {string} habitId - The ID of the habit to check.
* @param {Function} toast - The toast function from Chakra UI to display error messages.
* @param {string} habitName - The name of the habit (for potential error messages).
*/
export const checkFailedHabit = async (areaId, habitId, toast, habitName) => {
    try {
        const userId = getUserId();
        const now = new Date();
        const dateString = now.toISOString().split("T")[0]; // Use YYYY-MM-DD for consistency

        const recordsRef = collection(
            db,
            `users/${userId}/areas/${areaId}/habits/${habitId}/records`
        );
        const recordDoc = doc(recordsRef, dateString);
        const recordSnap = await getDoc(recordDoc);

        if (!recordSnap.exists()) {
            // If no record for today, create one as "failed"
            await setDoc(recordDoc, {
                status: "failed",
                timestamp: now,
                date: dateString,
            });
        }
    } catch (error) {
        console.error(`Error checking failed habit ${habitName} (${habitId}):`, error);
        toast({
            title: <Text fontWeight="600">Error al registrar el proceso</Text>,
            description: `Ha ocurrido un problema al verificar el hábito "${habitName}". Prueba más tarde.`,
            status: "error",
            position: "bottom"
        });
    }
};

/**
 * Finds the name of an area based on its ID from a given array of area objects.
 * @function getAreaNameById
 * @param {string} areaId - The ID of the area to search for.
 * @param {Array<object>} areas - An array of area objects. Each object is expected to have at least an `id` and a `name` property.
 * @returns {string | undefined} The name of the area if found, otherwise `undefined`.
 */
export const getAreaNameById = (areaId, areas) => {
    if (areaId && Array.isArray(areas)) {
        const foundArea = areas.find(area => area.id === areaId);
        return foundArea ? foundArea.name : undefined;
    } else {
        console.warn("getAreaNameById: Invalid input. areaId must be a string and areas must be an array.");
        return undefined;
    }
};

/**
 * Fetches all records for a specific habit for the currently authenticated user.
 *
 * @async
 * @param {string} areaId - The ID of the area the habit belongs to.
 * @param {string} habitId - The ID of the habit.
 * @returns {Promise<Array<firebase.firestore.QueryDocumentSnapshot>>} - A promise that resolves to an array of Firestore document snapshots containing the habit records, ordered by timestamp. Returns an empty array if there's no user or an error.
 */
export const getHabitRecords = async (areaId, habitId) => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
        console.error("User not authenticated.");
        return [];
    }

    if (!areaId || !habitId) {
        console.error("Area ID or Habit ID is missing.");
        return [];
    }

    try {
        const recordsRef = collection(
            db,
            `users/${userId}/areas/${areaId}/habits/${habitId}/records`
        );
        const q = query(recordsRef, orderBy("timestamp"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs;
    } catch (error) {
        console.error("Error fetching habit records:", error);
        return [];
    }
};

/**
 * Sets up a real-time listener for the records of a specific habit for the currently authenticated user.
 *
 * @param {string} areaId - The ID of the area the habit belongs to.
 * @param {string} habitId - The ID of the habit.
 * @param {function} onSnapshotCallback - A callback function that receives the Firestore snapshot whenever the habit records change.
 * @param {function} onErrorCallback - An optional callback function that receives any error that occurs during the listener setup.
 * @returns {function|null} - The unsubscribe function for the listener, or null if there's no user or an error setting up the listener.
 */
export const getHabitRecordsListener = (
    areaId,
    habitId,
    onSnapshotCallback,
    onErrorCallback
) => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
        console.error("User not authenticated.");
        if (onErrorCallback) {
            onErrorCallback(new Error("User not authenticated."));
        }
        return null;
    }

    if (!areaId || !habitId) {
        console.error("Area ID or Habit ID is missing.");
        if (onErrorCallback) {
            onErrorCallback(new Error("Area ID or Habit ID is missing."));
        }
        return null;
    }

    try {
        const recordsRef = collection(
            db,
            `users/${userId}/areas/${areaId}/habits/${habitId}/records`
        );
        const q = query(recordsRef, orderBy("timestamp"));
        return onSnapshot(q, onSnapshotCallback, onErrorCallback);
    } catch (error) {
        console.error("Error setting up habit records listener:", error);
        if (onErrorCallback) {
            onErrorCallback(error);
        }
        return null;
    }
};

/**
 * @async
 * @function getHabitRecordsGroupedByDay
 * @description Fetches all records for a specific habit and groups them by day.
 * @param {string} userId - The ID of the current user.
 * @param {string} areaId - The ID of the area the habit belongs to.
 * @param {string} habitId - The ID of the habit.
 * @returns {Promise<Array<object>>} - A promise that resolves to an array of records grouped by day,
 * each object containing the date, day, month, year, and total times completed on that day.
 */
export const getHabitRecordsGroupedByDay = async (userId, areaId, habitId) => {
    try {
        const recordsRef = collection(
            db,
            `users/${userId}/areas/${areaId}/habits/${habitId}/records`
        );
        const snapshot = await getDocs(recordsRef);

        const recordsMap = {};
        snapshot.docs.forEach((doc) => {
            const data = doc.data();
            let date;

            if (data.date) {
                if (typeof data.date.toDate === 'function') {
                    date = data.date.toDate();
                } else if (data.date instanceof Date) {
                    date = data.date;
                } else if (typeof data.date === 'string') {
                    const parsedDate = new Date(data.date);
                    if (!isNaN(parsedDate)) {
                        date = parsedDate;
                    } else {
                        console.error("Warning: Unrecognized date format in Firestore:", data.date);
                        return;
                    }
                } else {
                    console.error("Warning: Unknown date type in Firestore:", data.date);
                    return;
                }
            } else {
                return;
            }

            const day = date.getDate();
            const month = date.getMonth();
            const year = date.getFullYear();
            const monthName = date.toLocaleString("default", { month: "short" });
            const key = `${day}-${month}-${year}`;

            recordsMap[key] = {
                id: doc.id,
                date,
                day,
                month: monthName,
                year,
                times: (recordsMap[key]?.times || 0) + (data.times || 1),
            };
        });

        return Object.values(recordsMap).sort((a, b) => a.date.getTime() - b.date.getTime());
    } catch (error) {
        console.error("Error fetching and grouping habit records:", error);
        throw error;
    }
};

/**
 * Logs out the current user.
 * @param {Function} toast - The toast function from Chakra UI to display messages.
 */
export const logoutUser = async (toast) => {
    try {
        await signOut(auth);
        toast({
            title: <Text fontWeight="600">Sesión cerrada</Text>,
            description: "Has cerrado sesión exitosamente.",
            status: "success",
            position: "bottom",
        });
        window.location.href = "/";
    } catch (error) {
        toast({
            title: <Text fontWeight="600">Error al cerrar sesión</Text>,
            description: error.message,
            status: "error",
            position: "bottom",
        });
    }
};