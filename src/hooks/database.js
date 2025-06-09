import { db } from "./firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, getDoc, onSnapshot, getDocs, setDoc, serverTimestamp, writeBatch, increment } from "firebase/firestore";
import { Text } from "@chakra-ui/react";

const HABIT_STATUS = {
    COMPLETED: "completed",
    FAILED: "failed",
    SKIPPED: "skipped",
    DELETED: "deleted"
};

export const getTasks = (userId, callback, onError) => {
    if (!userId) {
        if (onError) onError(new Error("User ID is missing."));
        return () => { };
    }

    if (typeof callback !== 'function') {
        return () => { };
    }

    try {
        const tasksCollectionRef = collection(db, "users", userId, "tasks");

        const unsubscribe = onSnapshot(tasksCollectionRef, (snapshot) => {
            const tasksList = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            callback(tasksList);
        }, (error) => {
            if (onError) onError(error);
        });

        return unsubscribe;
    } catch (error) {
        if (onError) onError(error);
        return () => { };
    }
};

export const getAreas = (userId, callback, onError) => {
    if (!userId) {
        if (onError) onError(new Error("User ID is missing."));
        return () => { };
    }

    if (typeof callback !== 'function') {
        return () => { };
    }

    try {
        const areasCollectionRef = collection(db, "users", userId, "areas");
        const unsubscribe = onSnapshot(areasCollectionRef, (snapshot) => {
            const areasList = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            callback(areasList);
        }, (error) => {
            if (onError) onError(error);
        });

        return unsubscribe;
    } catch (error) {
        if (onError) onError(error);
        return () => { };
    }
};

export const subscribeToAreas = (userId, callback, onError) => {
    if (!userId) {
        if (onError) onError(new Error("User ID is missing."));
        return () => { };
    }

    if (typeof callback !== 'function') {
        return () => { };
    }

    try {
        const areasCollectionRef = collection(db, "users", userId, "areas");
        const unsubscribe = onSnapshot(
            areasCollectionRef,
            (snapshot) => {
                const areasList = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                callback(areasList);
            },
            (error) => {
                if (onError) onError(error);
            }
        );

        return unsubscribe;
    } catch (error) {
        if (onError) onError(error);
        return () => { };
    }
};

export const getAllHabitsByArea = async (userId) => {
    if (!userId) {
        return [];
    }

    const areasRef = collection(db, `users/${userId}/areas`);
    const areasSnapshot = await getDocs(areasRef);

    const areasWithHabits = [];

    await Promise.all(areasSnapshot.docs.map(async (areaDoc) => {
        const areaData = { id: areaDoc.id, ...areaDoc.data() };
        const habitsRef = collection(doc(db, `users/${userId}/areas`, areaDoc.id), 'habits');
        const habitsSnapshot = await getDocs(habitsRef);
        const habits = habitsSnapshot.docs.map((habitDoc) => ({
            id: habitDoc.id,
            ...habitDoc.data(),
            registeredAt: habitDoc.data().registeredAt ? habitDoc.data().registeredAt.toDate() : null,
        }));

        areasWithHabits.push({ ...areaData, habits });
    }));

    return areasWithHabits;
};

export const subscribeToAllAreasAndHabits = (userId, onData, onError) => {
    if (!userId) {
        const error = new Error("User ID is missing. Cannot subscribe to habits.");
        if (onError) onError(error);
        return () => { };
    }

    if (typeof onData !== 'function') {
        const error = new Error("onData callback must be a function.");
        if (onError) onError(error);
        return () => { };
    }

    const handleError = typeof onError === 'function' ? onError : (err) => {
        new Error("Unhandled error in subscribeToAllAreasAndHabits:", err);
    };

    const unsubscribes = [];

    try {
        const areasCollectionRef = collection(db, "users", userId, "areas");
        const unsubscribeAreas = onSnapshot(
            areasCollectionRef,
            (areasSnapshot) => {
                const allAreas = {};
                const newUnsubscribes = [];

                unsubscribes.forEach(unsub => unsub());
                unsubscribes.length = 0;

                if (areasSnapshot.empty) {
                    onData([]);
                    return;
                }

                areasSnapshot.docs.forEach(areaDoc => {
                    const areaData = { id: areaDoc.id, ...areaDoc.data(), habits: [] };
                    allAreas[areaData.id] = areaData;

                    const habitsCollectionRef = collection(db, "users", userId, "areas", areaDoc.id, "habits");

                    const unsubscribeHabits = onSnapshot(
                        habitsCollectionRef,
                        (habitsSnapshot) => {
                            allAreas[areaDoc.id].habits = [];

                            habitsSnapshot.docs.forEach(habitDoc => {
                                const habit = { id: habitDoc.id, ...habitDoc.data() };
                                allAreas[areaDoc.id].habits.push(habit);
                            });

                            const resultAreas = Object.values(allAreas).map(area => ({
                                id: area.id,
                                name: area.name || "General",
                                icon: area.icon || "LuCircleDot",
                                habits: area.habits
                            }));
                            onData(resultAreas);
                        },
                        (error) => {
                            handleError(error);
                        }
                    );
                    newUnsubscribes.push(unsubscribeHabits);
                });

                unsubscribes.push(unsubscribeAreas, ...newUnsubscribes);

            },
            (error) => {
                handleError(error);
            }
        );

        return () => {
            unsubscribes.forEach(unsub => unsub());
        };
    } catch (error) {
        handleError(error);
        return () => { };
    }
};

export const subscribeToHabitsByArea = (userId, areaId, onData, onError) => {
    if (!userId) {
        const error = new Error("User ID is required to subscribe to habits by area.");
        if (onError) onError(error);
        return () => { };
    }
    if (!areaId) {
        const error = new Error("Area ID is required to subscribe to habits.");
        if (onError) onError(error);
        return () => { };
    }
    if (typeof onData !== 'function') {
        const error = new Error("onData callback must be a function.");
        if (onError) onError(error);
        return () => { };
    }

    const handleError = typeof onError === 'function' ? onError : (err) => {
        new Error("Unhandled error in subscribeToHabitsByArea:", err);
    };

    try {
        const habitsRef = collection(db, "users", userId, "areas", areaId, "habits");
        const unsubscribe = onSnapshot(
            habitsRef,
            (habitsSnapshot) => {
                const habitsData = habitsSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                onData(habitsData);
            },
            (error) => {
                handleError(error);
            }
        );

        return unsubscribe;
    } catch (error) {
        handleError(error);
        return () => { };
    }
};

export const deleteAreaById = async (areaId, userId) => {
    if (!userId || !areaId) {
        throw new Error("User ID and Area ID are required to delete an area.");
    }

    const areaDocRef = doc(db, "users", userId, "areas", areaId);
    await deleteDoc(areaDocRef);
};

export const updateAreaById = async (areaId, userId, areaData) => {
    if (!userId) {
        throw new Error("User ID is required to update an area.");
    }
    try {
        const areaDoc = doc(db, `users/${userId}/areas/${areaId}`);
        await updateDoc(areaDoc, areaData);
    } catch (error) {
        throw new Error(`Error updating area with ID ${areaId}: ${error.message}`);
    }
};

export const updateUserData = async (userId, data) => {
    if (!userId) {
        throw new Error("User ID is required to update user data.");
    }
    const userDocRef = doc(db, "users", userId);
    await updateDoc(userDocRef, data);
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

export const fetchMonthlyHabitStats = async (userId) => {
    if (!userId) {
        throw new Error("User ID is required");
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    let completed = 0;
    let skipped = 0;
    let failed = 0;

    const areasRef = collection(db, "users", userId, "areas");
    const areasSnapshot = await getDocs(areasRef);
    const recordPromises = [];

    for (const areaDoc of areasSnapshot.docs) {
        const areaId = areaDoc.id;
        const habitsRef = collection(db, "users", userId, "areas", areaId, "habits");
        const habitsSnapshot = await getDocs(habitsRef);

        for (const habitDoc of habitsSnapshot.docs) {
            const habitId = habitDoc.id;
            const recordsRef = collection(
                db,
                "users",
                userId,
                "areas",
                areaId,
                "habits",
                habitId,
                "records"
            );
            recordPromises.push(getDocs(recordsRef));
        }
    }

    const allRecordsSnapshots = await Promise.all(recordPromises);

    allRecordsSnapshots.forEach(recordsSnapshot => {
        recordsSnapshot.forEach(recordDoc => {
            const data = recordDoc.data();
            const date = data.timestamp?.toDate?.();

            if (
                date &&
                date.getFullYear() === currentYear &&
                date.getMonth() === currentMonth
            ) {
                if (data.status === HABIT_STATUS.COMPLETED) {
                    completed++;
                } else if (data.status === HABIT_STATUS.SKIPPED) {
                    skipped++;
                } else if (data.status === HABIT_STATUS.FAILED) {
                    failed++;
                }
            }
        });
    });

    return { completed, skipped, failed };
};

const addDocument = async (path, data) => await addDoc(collection(db, path), data);

export const addTask = async (taskData, userId) => {
    if (!userId) {
        throw new Error("User ID is required to add a task.");
    }
    const tasksCollectionRef = collection(db, "users", userId, "tasks");
    return await addDoc(tasksCollectionRef, { ...taskData, createdAt: new Date() });
};

export const updateTask = async (taskId, updateData, userId) => {
    if (!userId || !taskId) {
        throw new Error("User ID and Task ID are required to update a task.");
    }
    const taskDocRef = doc(db, "users", userId, "tasks", taskId);
    await updateDoc(taskDocRef, updateData);
};

export const deleteTask = async (taskId, userId) => {
    if (!userId || !taskId) {
        throw new Error("User ID and Task ID are required to delete a task.");
    }
    const taskDocRef = doc(db, "users", userId, "tasks", taskId);
    await deleteDoc(taskDocRef);
};

export const addArea = (userId, areaData) => {
    if (!userId) throw new Error("User ID is required to add an area.");
    return addDocument(`users/${userId}/areas`, areaData);
};

const getTodayFormattedDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const deleteHabit = async (userId, areaId, habitId, toast) => {
    if (!userId || !areaId || !habitId) {
        const errorMsg = "Faltan datos necesarios para eliminar el hábito.";
        if (toast) {
            toast({
                title: <Text fontWeight={600}>Error</Text>,
                description: errorMsg,
                status: "error",
                position: "bottom",
            });
        }
        throw new Error(errorMsg);
    }

    try {
        const recordsRef = collection(db, "users", userId, "areas", areaId, "habits", habitId, "records");
        const recordsSnap = await getDocs(recordsRef);
        const deletePromises = recordsSnap.docs.map(docSnap => deleteDoc(docSnap.ref));
        await Promise.all(deletePromises);
        const habitRef = doc(db, "users", userId, "areas", areaId, "habits", habitId);
        await deleteDoc(habitRef);

        if (toast) {
            toast({
                title: <Text fontWeight={600}>Hábito eliminado</Text>,
                description: `El hábito ha sido eliminado correctamente.`,
                status: "success",
                position: "bottom",
            });
        }
    } catch (error) {
        if (toast) {
            toast({
                title: <Text fontWeight={600}>Error al eliminar</Text>,
                description: error.message || "No se pudo eliminar el hábito.",
                status: "error",
                position: "bottom",
            });
        }
        throw error;
    }
};

export const completeHabit = async (
    userId,
    areaId,
    habitId,
    habitData,
    toast,
    formattedDate,
    completionAmount = 1
) => {
    if (!userId || !areaId || !habitId || !habitData || !toast) {
        toast({
            title: <Text fontWeight={600}>Error de datos</Text>,
            description: "Faltan datos esenciales para completar el hábito.",
            status: "error",
            position: "bottom",
        });
        return;
    }

    if (!habitData.goal || !habitData.goal.unit) {
        toast({
            title: <Text fontWeight={600}>Error de configuración</Text>,
            description:
                "El hábito no tiene una unidad de meta definida (e.g., 'times' o 'minutes').",
            status: "error",
            position: "bottom",
        });
        return;
    }

    const recordDocRef = doc(
        db,
        "users",
        userId,
        "areas",
        areaId,
        "habits",
        habitId,
        "records",
        formattedDate
    );

    try {
        const recordSnap = await getDoc(recordDocRef);
        let updateRecordFields = {
            date: new Date(formattedDate),
            status: HABIT_STATUS.COMPLETED,
            timestamp: new Date(formattedDate),
        };

        const unitField = habitData.goal.unit === "minutes" ? "minutes" : "times";
        updateRecordFields[unitField] = increment(completionAmount);

        if (recordSnap.exists()) {
            const existingData = recordSnap.data();
            if (typeof existingData[unitField] !== "number") {
                updateRecordFields[unitField] = completionAmount;
            }
        } else {
            updateRecordFields[unitField] = completionAmount;
        }
        await setDoc(recordDocRef, updateRecordFields, { merge: true });

        const habitDocRef = doc(db, "users", userId, "areas", areaId, "habits", habitId);
        await updateDoc(habitDocRef, {
            lastStatus: HABIT_STATUS.COMPLETED,
            lastCompletionDate: serverTimestamp(),
        });

        toast({
            title: <Text fontWeight={600}>Hábito completado</Text>,
            description: `¡Felicidades! "${habitData.name}" completado para el ${formattedDate}.`,
            status: "success",
            position: "bottom",
        });
    } catch (error) {
        toast({
            title: <Text fontWeight={600}>Error al completar</Text>,
            description: `No se pudo completar el hábito "${habitData.name}". Por favor, inténtalo de nuevo.`,
            status: "error",
            position: "bottom",
        });
        throw error;
    }
};

export const skipHabit = async (userId, areaId, habitId, toast, habitName, date = new Date()) => {
    if (!userId || !areaId || !habitId) {
        toast?.({
            title: <Text fontWeight={600}>Error</Text>,
            description: "Faltan datos para saltar el hábito.",
            status: "error",
            position: "bottom",
        });
        return;
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    const parsedDate = new Date(`${formattedDate}T00:00:00`);

    try {
        const recordRef = doc(db, "users", userId, "areas", areaId, "habits", habitId, "records", formattedDate);

        await setDoc(recordRef, {
            date: parsedDate,
            status: "skipped",
            times: 1,
            timestamp: parsedDate,
        });

        const habitRef = doc(db, "users", userId, "areas", areaId, "habits", habitId);
        await updateDoc(habitRef, {
            lastStatus: "skipped",
            lastStatusDate: parsedDate,
        });

        toast?.({
            title: <Text fontWeight={600}>Hábito saltado</Text>,
            description: `"${habitName}" ha sido marcado como saltado para el ${formattedDate}.`,
            status: "info",
            position: "bottom",
        });
    } catch (error) {
        toast({
            title: <Text fontWeight={600}>Error</Text>,
            description: "No se pudo saltar el hábito.",
            status: "error",
            position: "bottom",
        });
    }
};

export const checkFailedHabit = async (userId, areaId, habitId, toast, habitName) => {
    if (!userId || !areaId || !habitId) return;

    const today = getTodayFormattedDate();
    const recordDocRef = doc(db, "users", userId, "areas", areaId, "habits", habitId, "records", today);

    try {
        const recordSnap = await getDoc(recordDocRef);

        if (!recordSnap.exists()) {
            await setDoc(recordDocRef, {
                date: today,
                status: "failed",
                times: 0,
                timestamp: serverTimestamp(),
            });
            toast({
                title: <Text fontWeight={600}>Hábito fallido</Text>,
                description: `¡Ups! Parece que "${habitName}" no se completó hoy.`,
                status: "warning",
                position: "bottom",
            });

            const habitDocRef = doc(db, "users", userId, "areas", areaId, "habits", habitId);
            await updateDoc(habitDocRef, {
                lastStatus: "failed",
                lastStatusDate: serverTimestamp(),
            });
        } else {
            const recordData = recordSnap.data();
            if (recordData.status === "failed") {
                return;
            }
            if (recordData.status === "completed" || recordData.status === "skipped") {
                return;
            }
            await setDoc(recordDocRef, {
                date: today,
                status: "failed",
                times: recordData.times || 0,
                timestamp: serverTimestamp(),
            });
            toast({
                title: <Text fontWeight={600}>Hábito fallido</Text>,
                description: `¡Ups! Parece que "${habitName}" no se completó hoy.`,
                status: "warning",
                position: "bottom",
            });
        }
    } catch (error) {
        toast({
            title: <Text fontWeight={600}>Error al chequear hábito</Text>,
            description: `No se pudo verificar si "${habitName}" falló.`,
            status: "error",
            position: "bottom",
        });
    }
};

export const addHabit = async (userId, areaId, habitData) => {
    if (!userId || !areaId) {
        throw new Error("User ID and Area ID are required to add a habit.");
    }
    const habitsCollectionRef = collection(db, "users", userId, "areas", areaId, "habits");
    return await addDoc(habitsCollectionRef, habitData);
};

export const updateHabit = async (userId, areaId, habitId, updatedData) => {
    if (!userId || !areaId || !habitId) {
        throw new Error("User ID, Area ID, and Habit ID are required to update a habit.");
    }
    const habitDocRef = doc(db, "users", userId, "areas", areaId, "habits", habitId);
    return await updateDoc(habitDocRef, updatedData);
};

export const deleteHabitRecord = async (userId, areaId, habitId, toast, habitName, selectedDate = new Date()) => {
    if (!userId || !areaId || !habitId) {
        toast?.({
            title: <Text fontWeight={600}>Error</Text>,
            description: "Faltan datos necesarios para borrar el registro.",
            status: "error",
            position: "bottom",
        });
        return;
    }

    if (!(selectedDate instanceof Date) || isNaN(selectedDate.getTime())) {
        toast?.({
            title: <Text fontWeight={600}>Error</Text>,
            description: "Fecha seleccionada no válida.",
            status: "error",
            position: "bottom",
        });
        return;
    }

    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");
    const dateString = `${year}-${month}-${day}`;

    try {
        const recordDocRef = doc(
            db,
            `users/${userId}/areas/${areaId}/habits/${habitId}/records`,
            dateString
        );

        const recordSnap = await getDoc(recordDocRef);

        if (recordSnap.exists()) {
            await deleteDoc(recordDocRef);
            toast?.({
                title: <Text fontWeight={600}>Registro borrado</Text>,
                description: `Se ha eliminado el registro de "${habitName}" para el ${dateString}.`,
                status: "success",
                position: "bottom",
            });
        } else {
            toast?.({
                title: <Text fontWeight={600}>Sin registro</Text>,
                description: `No se encontró ningún registro de "${habitName}" para el ${dateString}.`,
                status: "info",
                position: "bottom",
            });
        }
    } catch (error) {
        toast?.({
            title: <Text fontWeight={600}>Error al borrar</Text>,
            description:
                "Ocurrió un problema al intentar eliminar el registro. Intenta nuevamente.",
            status: "error",
            position: "bottom",
        });
    }
};

export const getWeekNumber = (d = new Date()) => {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return weekNo;
};

export const getAreaNameById = (areaId, areas) => {
    if (!Array.isArray(areas) || areas.length === 0) {
        return "Área Desconocida";
    }

    const area = areas.find((a) => a.id === areaId);

    return area ? area.name : "Área Desconocida";
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
                if (onError) {
                    onError(error);
                }
            }
        );

        return unsubscribe;
    } catch (error) {
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
                    return;
                }
            } catch (error) {
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
                                    return;
                                }
                            } catch (error) {
                                return;
                            }
                        }
                    } else {
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
                            status: data.status || "unknown",
                        };
                    }
                });
                const sortedRecords = Object.values(recordsMap).sort((a, b) => a.date.getTime() - b.date.getTime());
                onUpdate(sortedRecords);
            },
            (error) => {
                if (onError) {
                    onError(error);
                }
            }
        );
        return unsubscribe;
    } catch (error) {
        return () => { };
    }
};