// Imports
import { db, auth } from "./firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";

/**
 * Gets the UID of the authenticated user and generates the base path in Firestore.
 * @throws {Error} If the user is not authenticated.
 */
const getUserPath = () => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");
    return `users/${user.uid}`;
};

/**
 * Retrieves all areas for the authenticated user in real-time.
 * @param {Function} callback - Function to handle the retrieved areas.
 * @throws {Error} If the user is not authenticated.
 * @returns {Function} Firestore unsubscribe function.
 */
export const getAreas = (callback) => {
    try {
        const path = `${getUserPath()}/areas`;
        return onSnapshot(collection(db, path), (snapshot) => {
            callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
    } catch (error) {
        throw new Error("Error getting areas:", error);
    }
};

/**
 * Retrieves all habits within a specific area for the authenticated user in real-time.
 * @param {string} areaId - The ID of the area.
 * @param {Function} callback - Function to handle the retrieved habits.
 * @throws {Error} If the user is not authenticated or areaId is not provided.
 * @returns {Function} Firestore unsubscribe function.
 */
export const getHabits = (areaId, callback) => {
    try {
        if (!areaId) throw new Error("Area ID is required");
        const path = `${getUserPath()}/areas/${areaId}/habits`;
        return onSnapshot(collection(db, path), (snapshot) => {
            callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
    } catch (error) {
        throw new Error("Error getting habits:", error);
    }
};

/**
 * Adds a new area for the authenticated user.
 * @param {Object} areaData - The data of the area to be added.
 * @throws {Error} If the user is not authenticated.
 * @returns {Promise<DocumentReference>} A promise that resolves with the added document reference.
 */
export const addArea = async (areaData) => {
    try {
        return await addDoc(collection(db, `${getUserPath()}/areas`), areaData);
    } catch (error) {
        throw new Error("Error adding area:", error);
    }
};

/**
 * Adds a new habit within a specific area for the authenticated user.
 * @param {string} areaId - The ID of the area.
 * @param {Object} habitData - The data of the habit to be added.
 * @throws {Error} If the user is not authenticated or areaId is not provided.
 * @returns {Promise<DocumentReference>} A promise that resolves with the added document reference.
 */
export const addHabit = async (areaId, habitData) => {
    try {
        if (!areaId) throw new Error("Area ID is required");
        return await addDoc(collection(db, `${getUserPath()}/areas/${areaId}/habits`), habitData);
    } catch (error) {
        throw new Error("Error adding habit:", error);
    }
};

/**
 * Updates an existing area for the authenticated user.
 * @param {string} id - The ID of the area to update.
 * @param {Object} areaData - The updated data for the area.
 * @throws {Error} If the user is not authenticated.
 * @returns {Promise<void>} A promise that resolves when the update is complete.
 */
export const updateArea = async (id, areaData) => {
    try {
        return await updateDoc(doc(db, `${getUserPath()}/areas`, id), areaData);
    } catch (error) {
        throw new Error("Error updating area:", error);
    }
};

/**
 * Updates an existing habit within a specific area for the authenticated user.
 * @param {string} areaId - The ID of the area.
 * @param {string} id - The ID of the habit to update.
 * @param {Object} habitData - The updated data for the habit.
 * @throws {Error} If the user is not authenticated or areaId is not provided.
 * @returns {Promise<void>} A promise that resolves when the update is complete.
 */
export const updateHabit = async (areaId, id, habitData) => {
    try {
        if (!areaId) throw new Error("Area ID is required");
        return await updateDoc(doc(db, `${getUserPath()}/areas/${areaId}/habits`, id), habitData);
    } catch (error) {
        throw new Error("Error updating habit:", error);
    }
};

/**
 * Deletes an existing area for the authenticated user.
 * @param {string} id - The ID of the area to delete.
 * @throws {Error} If the user is not authenticated.
 * @returns {Promise<void>} A promise that resolves when the deletion is complete.
 */
export const deleteArea = async (id) => {
    try {
        return await deleteDoc(doc(db, `${getUserPath()}/areas`, id));
    } catch (error) {
        throw new Error("Error deleting area:", error);
    }
};

/**
 * Deletes an existing habit within a specific area for the authenticated user.
 * @param {string} areaId - The ID of the area.
 * @param {string} id - The ID of the habit to delete.
 * @throws {Error} If the user is not authenticated or areaId is not provided.
 * @returns {Promise<void>} A promise that resolves when the deletion is complete.
 */
export const deleteHabit = async (areaId, id) => {
    try {
        if (!areaId) throw new Error("Area ID is required");
        return await deleteDoc(doc(db, `${getUserPath()}/areas/${areaId}/habits`, id));
    } catch (error) {
        throw new Error("Error deleting habit:", error);
    }
};
