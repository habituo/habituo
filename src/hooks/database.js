import { db, auth } from "./firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";

/**
 * Retrieves all areas for the authenticated user in real-time.
 * @param {Function} callback - Function to handle the retrieved areas.
 * @throws {Error} If the user is not authenticated.
 * @returns {Function} Firestore unsubscribe function.
 */
export const getAreas = (callback) => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    return onSnapshot(collection(db, `users/${user.uid}/areas`), (snapshot) => {
        const areas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(areas);
    });
};

/**
 * Retrieves all habits within a specific area for the authenticated user in real-time.
 * @param {string} areaId - The ID of the area.
 * @param {Function} callback - Function to handle the retrieved habits.
 * @throws {Error} If the user is not authenticated or areaId is not provided.
 * @returns {Function} Firestore unsubscribe function.
 */
export const getHabits = (areaId, callback) => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");
    if (!areaId) throw new Error("Area ID is required");

    return onSnapshot(collection(db, `users/${user.uid}/areas/${areaId}/habits`), (snapshot) => {
        const habits = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(habits);
    });
};

/**
 * Adds a new area for the authenticated user.
 * @param {Object} areaData - The data of the area to be added.
 * @throws {Error} If the user is not authenticated.
 * @returns {Promise<DocumentReference>} A promise that resolves with the added document reference.
 */
export const addArea = async (areaData) => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    return await addDoc(collection(db, `users/${user.uid}/areas`), areaData);
};

/**
 * Adds a new habit within a specific area for the authenticated user.
 * @param {string} areaId - The ID of the area.
 * @param {Object} habitData - The data of the habit to be added.
 * @throws {Error} If the user is not authenticated or areaId is not provided.
 * @returns {Promise<DocumentReference>} A promise that resolves with the added document reference.
 */
export const addHabit = async (areaId, habitData) => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");
    if (!areaId) throw new Error("Area ID is required");

    return await addDoc(collection(db, `users/${user.uid}/areas/${areaId}/habits`), habitData);
};

/**
 * Updates an existing area for the authenticated user.
 * @param {string} id - The ID of the area to update.
 * @param {Object} areaData - The updated data for the area.
 * @throws {Error} If the user is not authenticated.
 * @returns {Promise<void>} A promise that resolves when the update is complete.
 */
export const updateArea = async (id, areaData) => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const areaRef = doc(db, `users/${user.uid}/areas`, id);
    return await updateDoc(areaRef, areaData);
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
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");
    if (!areaId) throw new Error("Area ID is required");

    const habitRef = doc(db, `users/${user.uid}/areas/${areaId}/habits`, id);
    return await updateDoc(habitRef, habitData);
};

/**
 * Deletes an existing area for the authenticated user.
 * @param {string} id - The ID of the area to delete.
 * @throws {Error} If the user is not authenticated.
 * @returns {Promise<void>} A promise that resolves when the deletion is complete.
 */
export const deleteArea = async (id) => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const areaRef = doc(db, `users/${user.uid}/areas`, id);
    return await deleteDoc(areaRef);
};

/**
 * Deletes an existing habit within a specific area for the authenticated user.
 * @param {string} areaId - The ID of the area.
 * @param {string} id - The ID of the habit to delete.
 * @throws {Error} If the user is not authenticated or areaId is not provided.
 * @returns {Promise<void>} A promise that resolves when the deletion is complete.
 */
export const deleteHabit = async (areaId, id) => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");
    if (!areaId) throw new Error("Area ID is required");

    const habitRef = doc(db, `users/${user.uid}/areas/${areaId}/habits`, id);
    return await deleteDoc(habitRef);
};
