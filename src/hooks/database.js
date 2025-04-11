import { db, auth } from "./firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, getDoc, onSnapshot, getDocs } from "firebase/firestore";
import { signOut } from "firebase/auth";

/**
 * Helper function to get user ID or throw an error if not authenticated.
 */
const getUserId = () => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");
    return user.uid;
};

export const getAreas = (callback) => {
    const userId = getUserId();
    const areasRef = collection(db, `users/${userId}/areas`);

    return onSnapshot(areasRef, (areasSnapshot) => {
        const areasData = areasSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            registeredAt: doc.data().registeredAt ? doc.data().registeredAt.toDate() : null,
        }));
        callback(areasData);
    });
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
            title: "Error al actualizar el usuario",
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
 * Logs out the current user.
 * @param {Function} toast - The toast function from Chakra UI to display messages.
 */
export const logoutUser = async (toast) => {
    try {
        await signOut(auth);
        toast({
            title: "Sesión cerrada",
            description: "Has cerrado sesión exitosamente.",
            status: "success",
            position: "bottom",
        });
        window.location.href = "/";
    } catch (error) {
        toast({
            title: "Error al cerrar sesión",
            description: error.message,
            status: "error",
            position: "bottom",
        });
    }
};