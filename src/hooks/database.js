import { db, auth } from "./firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, getDoc, onSnapshot, getDocs, setDoc, serverTimestamp, writeBatch } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { Text } from "@chakra-ui/react";

export const getUserId = () => {
    const user = auth.currentUser;
    if (!user) {
        console.warn("No user is currently authenticated.");
        return null;
    }
    return user.uid;
};

export const getUserInfo = async (userId) => {
    try {
        const uidToUse = userId || auth.currentUser?.uid;
        if (!uidToUse) {
            console.error("No user ID provided and no user is currently authenticated.");
            return null;
        }

        const userDocRef = doc(db, "users", uidToUse);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            return userDocSnap.data();
        } else {
            console.warn(`User document not found for ID: ${uidToUse}`);
            return null;
        }
    } catch (error) {
        console.error("Error fetching user information:", error);
        return null;
    }
};

export const getTasks = (callback) => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
        console.error("User not authenticated");
        return () => { };
    }

    try {
        const tasksRef = collection(db, "users", userId, "tasks");
        return onSnapshot(tasksRef, (snapshot) => {
            const tasksList = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            callback(tasksList);
        });
    } catch (error) {
        console.error("Error setting up tasks listener: ", error);
        return () => { };
    }
};

export const getAreas = (callback) => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
        console.error("User not authenticated");
        return () => { };
    }

    try {
        const areasRef = collection(db, "users", userId, "areas");
        const unsubscribe = onSnapshot(areasRef, (snapshot) => {
            const areasList = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            callback(areasList);
        }, (error) => {
            console.error("Error setting up areas listener: ", error);
        });

        return unsubscribe;
    } catch (error) {
        console.error("Error setting up areas listener: ", error);
        return () => { };
    }
};

export const getAllHabitsByArea = (callback) => {
    const userId = auth.currentUser?.uid;
    const areasRef = collection(db, `users/${userId}/areas`);

    const unsubscribers = [];

    const unsubscribeAreas = onSnapshot(areasRef, (areasSnapshot) => {
        const areasData = [];

        unsubscribers.forEach((unsub) => unsub());
        unsubscribers.length = 0;

        areasSnapshot.forEach((areaDoc) => {
            const area = { id: areaDoc.id, ...areaDoc.data(), habits: [] };
            areasData.push(area);
            const habitsRef = collection(db, `users/${userId}/areas/${area.id}/habits`);

            const unsubscribeHabits = onSnapshot(habitsRef, (habitsSnapshot) => {
                const habits = habitsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
                const index = areasData.findIndex((a) => a.id === area.id);

                if (index !== -1) {
                    areasData[index].habits = habits;
                    callback([...areasData]); // Emitir una nueva copia para detección de cambios
                }
            });

            unsubscribers.push(unsubscribeHabits);
        });
    });

    return () => {
        unsubscribeAreas();
        unsubscribers.forEach((unsub) => unsub());
    };
};

export const getHabitsByArea = (areaId, callback) => {
    const userId = auth.currentUser?.uid;
    const habitsRef = collection(db, `users/${userId}/areas/${areaId}/habits`);

    return onSnapshot(habitsRef, (habitsSnapshot) => {
        const habitsData = habitsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        callback(habitsData);
    });
};

export const getAllHabits = async (areaId, callback, onErrorCallback) => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
        console.error("User not authenticated.");
        if (onErrorCallback) {
            onErrorCallback(new Error("User not authenticated."));
        }
        return () => { };
    }

    if (!areaId) {
        console.error("Area ID is required.");
        if (onErrorCallback) {
            onErrorCallback(new Error("Area ID is required."));
        }
        return () => { };
    }

    try {
        const habitsCollection = collection(db, 'users', userId, 'areas', areaId, 'habits');
        const unsubscribe = onSnapshot(habitsCollection, (snapshot) => {
            const habits = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            callback(habits);
        }, (error) => {
            console.error("Error listening for habits in area:", error);
            if (onErrorCallback) {
                onErrorCallback(error);
            }
        });

        return unsubscribe;
    } catch (error) {
        console.error("Error setting up habits listener for area:", error);
        if (onErrorCallback) {
            onErrorCallback(error);
        }
        return () => { };
    }
};

export const getAreasWithHabitCounts = async () => {
    const user = auth.currentUser;
    if (!user) {
        console.error("User not authenticated");
        return [];
    }

    const userId = user.uid;
    const areasRef = collection(db, `users/${userId}/areas`);
    const areasSnapshot = await getDocs(areasRef);

    return areasSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        registeredAt: doc.data().registeredAt ? doc.data().registeredAt.toDate() : null,
        icon: doc.data().icon || "LuFolder",
        habitCount: doc.data().habitCount || 0,
    }));
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

export const checkUserExists = async (userId) => {
    const userDoc = await getDoc(doc(db, "users", userId));
    return userDoc.exists();
};

export const createUserDocument = async (userId, name, email, authProvider) => {
    await setDoc(doc(db, "users", userId), {
        authProvider,
        birthday_date: "",
        email,
        name,
        planExpiresAt: "",
        registeredAt: serverTimestamp(),
        subscriptionStatus: "inactive",
        type_account: "basic",
    });
};

export const createDefaultAreas = async (userId) => {
    const batch = writeBatch(db);
    const areasRef = collection(db, "users", userId, "areas");
    const defaultAreas = [
        { icon: "LuSun", name: "Mañanas" },
        { icon: "LuMoon", name: "Noches" },
        { icon: "LuCloudSun", name: "Tardes" },
    ];

    defaultAreas.forEach((area) => {
        batch.set(doc(areasRef, area.name), {
            ...area,
            registeredAt: serverTimestamp(),
        });
    });

    await batch.commit();
};

const addDocument = async (path, data) => await addDoc(collection(db, path), data);
const updateDocument = async (path, id, data) => await updateDoc(doc(db, path, id), data);
const deleteDocument = async (path, id) => await deleteDoc(doc(db, path, id));

export const addTask = (taskData) => addDocument(`users/${auth.currentUser?.uid}/tasks`, taskData);
export const updateTask = (id, taskData) => updateDocument(`users/${auth.currentUser?.uid}/tasks`, id, taskData);
export const deleteTask = (id) => deleteDocument(`users/${auth.currentUser?.uid}/tasks`, id);

export const addArea = (areaData) => addDocument(`users/${auth.currentUser?.uid}/areas`, areaData);
export const updateArea = (id, areaData) => updateDocument(`users/${auth.currentUser?.uid}/areas`, id, areaData);
export const deleteArea = (id) => deleteDocument(`users/${auth.currentUser?.uid}/areas`, id);

export const addHabit = (areaId, habitData) => addDocument(`users/${auth.currentUser?.uid}/areas/${areaId}/habits`, habitData);
export const updateHabit = (areaId, id, habitData) => updateDocument(`users/${auth.currentUser?.uid}/areas/${areaId}/habits`, id, habitData);
export const deleteHabit = (areaId, id) => deleteDocument(`users/${auth.currentUser?.uid}/areas/${areaId}/habits`, id);

export const skipHabit = async (areaId, habitId, toast, habitName, selectedDate) => {
    let now, year, month, day, dateString;

    try {
        const userId = auth.currentUser?.uid;

        if (selectedDate) {
            now = selectedDate;
            year = selectedDate.getFullYear();
            month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
            day = selectedDate.getDate().toString().padStart(2, '0');
            dateString = `${year}-${month}-${day}`;
        } else {
            now = new Date();
            year = now.getFullYear();
            month = (now.getMonth() + 1).toString().padStart(2, '0');
            day = now.getDate().toString().padStart(2, '0');
            dateString = `${year}-${month}-${day}`;
        }

        const recordsRef = collection(
            db,
            `users/${userId}/areas/${areaId}/habits/${habitId}/records`
        );
        const recordDoc = doc(recordsRef, dateString);
        const recordSnap = await getDoc(recordDoc);

        const recordData = {
            status: "skipped",
            timestamp: now,
            date: dateString,
            times: 0,
        };

        if (recordSnap.exists()) {
            await updateDoc(recordDoc, recordData);
            toast({
                title: <Text fontWeight="600">Hábito actualizado a saltado</Text>,
                description: `Se ha marcado el hábito "${habitName}" como saltado.`,
                status: "warning",
                position: "bottom"
            });
        } else {
            await setDoc(recordDoc, recordData);
            toast({
                title: <Text fontWeight="600">Hábito saltado</Text>,
                description: `Se ha marcado el hábito "${habitName}" como saltado.`,
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

export const completeHabit = async (areaId, habitId, habit, toast, getWeekNumber, selectedDate) => {
    let now, year, month, day, dateString;

    try {
        const userId = auth.currentUser?.uid;
        if (selectedDate) {
            now = selectedDate;
            year = selectedDate.getFullYear();
            month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
            day = selectedDate.getDate().toString().padStart(2, '0');
            dateString = `${year}-${month}-${day}`;
        } else {
            now = new Date();
            year = now.getFullYear();
            month = (now.getMonth() + 1).toString().padStart(2, '0');
            day = now.getDate().toString().padStart(2, '0');
            dateString = `${year}-${month}-${day}`;
        }

        const recordsRef = collection(
            db,
            `users/${userId}/areas/${areaId}/habits/${habitId}/records`
        );
        const recordDoc = doc(recordsRef, dateString);
        const recordSnap = await getDoc(recordDoc);

        if (habit?.repeat?.type === "day" && habit?.daysOfWeek) {
            const dayOfWeekSpain = selectedDate ? selectedDate.getDay() : new Date().getDay();
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
            recordData.week = selectedDate ? getWeekNumber(selectedDate) : getWeekNumber(new Date());
        } else if (habit?.type === "monthly") {
            if (selectedDate) {
                const date = new Date((now).seconds * 1000);
                recordData.month = date.getMonth() + 1;
                recordData.year = date.getFullYear();
            } else {
                recordData.month = selectedDate.getMonth() + 1;
                recordData.year = selectedDate.getFullYear();
            }
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
                description: `Se ha actualizado la completación del hábito "${habit.name}".`,
                status: "success",
                position: "bottom"
            });
        } else {
            await setDoc(recordDoc, recordData);
            toast({
                title: <Text fontWeight="600">¡Hábito completado!</Text>,
                description: `Se ha completado el hábito "${habit.name}" correctamente.`,
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

export const deleteHabitRecord = async (areaId, habitId, toast, habitName, selectedDate) => {
    try {
        const userId = auth.currentUser?.uid;
        let year, month, day, dateString;

        if (selectedDate) {
            year = selectedDate.getFullYear();
            month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
            day = selectedDate.getDate().toString().padStart(2, '0');
            dateString = `${year}-${month}-${day}`;
        } else {
            const now = new Date();
            year = now.getFullYear();
            month = (now.getMonth() + 1).toString().padStart(2, '0');
            day = now.getDate().toString().padStart(2, '0');
            dateString = `${year}-${month}-${day}`;
        }

        const recordDocRef = doc(
            db,
            `users/${userId}/areas/${areaId}/habits/${habitId}/records`,
            dateString
        );

        const recordSnap = await getDoc(recordDocRef);

        if (recordSnap.exists()) {
            await deleteDoc(recordDocRef);
            toast({
                title: <Text fontWeight="600">Registro borrado</Text>,
                description: `Se ha borrado el registro del hábito "${habitName}" para el ${dateString}.`,
                status: "success",
                position: "bottom",
            });
        } else {
            toast({
                title: <Text fontWeight="600">Sin registro</Text>,
                description: `No hay ningún registro del hábito "${habitName}" para el ${dateString}.`,
                status: "info",
                position: "bottom",
            });
        }
    } catch (error) {
        console.error("Error deleting habit record:", error);
        toast({
            title: <Text fontWeight="600">Error al borrar</Text>,
            description: "Ha ocurrido un problema al intentar borrar el registro. Prueba más tarde.",
            status: "error",
            position: "bottom",
        });
    }
};

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

export const checkFailedHabit = async (areaId, habitId, toast, habitName) => {
    try {
        const userId = auth.currentUser?.uid;
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

export const getAreaNameById = (areaId, areas) => {
    if (typeof areaId !== 'string') {
        console.warn("getAreaNameById: areaId must be a string.");
        return undefined;
    }

    if (!Array.isArray(areas)) {
        console.warn("getAreaNameById: areas must be an array.");
        return undefined;
    }

    const foundArea = areas.find(area => area?.id === areaId);
    return foundArea?.name;
};

export const getHabitRecords = async (areaId, habitId) => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
        console.error("Usuario no autenticado.");
        return [];
    }

    if (!areaId || !habitId) {
        console.error("Faltan Area ID o Habit ID.");
        return [];
    }

    try {
        const recordsRef = collection(
            db,
            `users/${userId}/areas/${areaId}/habits/${habitId}/records`
        );
        const querySnapshot = await getDocs(recordsRef);
        const records = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            date: doc.data().timestamp?.toDate() || null, // Asegúrate de manejar el timestamp
        }));
        return records;
    } catch (error) {
        console.error("Error al obtener los records del hábito:", error);
        return [];
    }
};

export const getHabitRecordsListener = (userId, areaId, habitId, onUpdate, onError) => {
    try {
        const recordsRef = collection(
            db,
            `users/${userId}/areas/${areaId}/habits/${habitId}/records`
        );

        const unsubscribe = onSnapshot(
            recordsRef,
            (snapshot) => {
                const records = snapshot.docs.map((doc) => {
                    const data = doc.data();
                    return {
                        date: data.timestamp?.toDate() || (typeof data.date === 'string' ? new Date(data.date) : data.date) || null,
                        status: data.status,
                        timestamp: data.timestamp,
                    };
                });
                onUpdate(records);
            },
            (error) => {
                console.error("Error listening for habit records:", error);
                if (onError) {
                    onError(error);
                }
            }
        );

        return unsubscribe;
    } catch (error) {
        console.error("Error setting up listener for habit records:", error);
        return () => { };
    }
};

export const getHabitRecordsGroupedByDay = async (userId, areaId, habitId) => {
    try {
        const recordsCollectionRef = collection(
            db,
            `users/${userId}/areas/${areaId}/habits/${habitId}/records`
        );

        const querySnapshot = await getDocs(recordsCollectionRef);
        const groupedRecords = [];

        querySnapshot.forEach((doc) => {
            const dateStr = doc.id;
            const data = doc.data();
            let dateObj;

            try {
                const [year, month, day] = dateStr.split('-').map(Number);
                dateObj = new Date(year, month - 1, day);
                if (isNaN(dateObj.getTime())) {
                    console.warn(`ID de documento con formato de fecha inválido: ${dateStr}`);
                    return;
                }
            } catch (error) {
                console.warn(`Error al parsear la fecha del ID del documento: ${dateStr}`, error);
                return;
            }

            groupedRecords.push({
                date: dateObj,
                dateStr,
                status: data.status,
                timestamp: data.timestamp,
                recordId: doc.id
            });
        });

        groupedRecords.sort((a, b) => a.date.getTime() - b.date.getTime());

        return groupedRecords;
    } catch (error) {
        console.error("Error al obtener los records de hábitos agrupados por día:", error);
        return [];
    }
};

export const getHabitRecordsGroupedByDayListener = (userId, areaId, habitId, onUpdate, onError) => {
    try {
        const recordsRef = collection(
            db,
            `users/${userId}/areas/${areaId}/habits/${habitId}/records`
        );

        const unsubscribe = onSnapshot(
            recordsRef,
            (snapshot) => {
                const recordsMap = {};
                snapshot.forEach((doc) => {
                    const data = doc.data();
                    const timestamp = data.timestamp || data.date;
                    let date;

                    if (timestamp) {
                        if (typeof timestamp.toDate === 'function') {
                            date = timestamp.toDate();
                        } else if (timestamp instanceof Date) {
                            date = timestamp;
                        } else {
                            try {
                                const parsedDate = new Date(timestamp);
                                if (!isNaN(parsedDate)) {
                                    date = parsedDate;
                                } else {
                                    console.warn("Warning: Unrecognized date format in Firestore:", timestamp);
                                    return;
                                }
                            } catch (error) {
                                console.error("Error parsing date:", error);
                                return;
                            }
                        }
                    } else {
                        console.warn("Warning: Document has no date or timestamp:", doc.id);
                        return;
                    }

                    if (date) {
                        const day = date.getDate();
                        const month = date.getMonth();
                        const year = date.getFullYear();
                        const key = `${year}-${month + 1}-${day}`;

                        recordsMap[key] = {
                            date: new Date(year, month, day),
                            day,
                            month: new Intl.DateTimeFormat('es', { month: 'short' }).format(date),
                            year,
                            times: (recordsMap[key]?.times || 0) + (data.times || 1),
                        };
                    }
                });
                const sortedRecords = Object.values(recordsMap).sort((a, b) => a.date.getTime() - b.date.getTime());
                onUpdate(sortedRecords);
            },
            (error) => {
                console.error("Error listening for habit records:", error);
                if (onError) {
                    onError(error);
                }
            }
        );
        return unsubscribe;
    } catch (error) {
        console.error("Error setting up listener:", error);
        return () => { };
    }
};

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