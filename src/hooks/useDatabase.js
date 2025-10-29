import { db } from "../api/firebase/firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, getDoc, onSnapshot, getDocs, setDoc, serverTimestamp, writeBatch, increment, query, orderBy, Timestamp } from "firebase/firestore";
import { Text } from "@chakra-ui/react";
import { getAreasCollectionRef } from "../utils/firestorePaths";
import { getAreaDocRef } from "../utils/firestorePaths";

const HABIT_STATUS = {
    COMPLETED: "completed",
    FAILED: "failed",
    SKIPPED: "skipped",
    IN_PROGRESS: "in_progress",
    DELETED: "deleted"
};

const formatDateId = (dateOrString) => {
    if (typeof dateOrString === "string") return dateOrString;
    const d = dateOrString instanceof Date ? dateOrString : new Date(dateOrString);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const parseLocalDateFromId = (id) => {
    if (typeof id === "string" && /^\d{4}-\d{2}-\d{2}$/.test(id)) {
        const [y, m, d] = id.split("-").map(Number);
        return new Date(y, m - 1, d, 0, 0, 0, 0);
    }
    const maybe = new Date(id);
    return isNaN(maybe.getTime()) ? null : new Date(maybe.getFullYear(), maybe.getMonth(), maybe.getDate(), 0, 0, 0, 0);
};

export const getWeekNumber = (d = new Date()) => {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return weekNo;
};

// TASKS
export const addTask = async (text, userId) => {
    try {
        if (!userId) {
            throw new Error("El ID de usuario es necesario para añadir una tarea.");
        }

        const trimmedText = text.trim();
        if (!trimmedText) {
            throw new Error("El texto de la tarea no puede estar vacío.");
        }

        const tasksCollectionRef = collection(db, "users", userId, "tasks");
        const docRef = await addDoc(tasksCollectionRef, {
            text: trimmedText,
            completed: false,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        return docRef.id;
    } catch (error) {
        throw new Error("Error al añadir la tarea. Por favor, inténtalo de nuevo.");
    }
};

export const updateTask = async (taskId, updateData, userId) => {
    try {
        if (!userId) {
            throw new Error("El ID de usuario es necesario para actualizar una tarea.");
        }
        if (!taskId) {
            throw new Error("El ID de la tarea es necesario para actualizarla.");
        }
        if (!updateData || Object.keys(updateData).length === 0) {
            throw new Error("Los datos de actualización no pueden estar vacíos.");
        }

        const taskDocRef = doc(db, "users", userId, "tasks", taskId);
        await updateDoc(taskDocRef, {
            ...updateData,
            updatedAt: serverTimestamp(),
        });

        return true;
    } catch (error) {
        throw new Error("Error al actualizar la tarea. Por favor, inténtalo de nuevo.");
    }
};

export const deleteTask = async (taskId, userId) => {
    try {
        if (!userId) {
            throw new Error("El ID de usuario es necesario para eliminar una tarea.");
        }
        if (!taskId) {
            throw new Error("El ID de la tarea es necesario para eliminarla.");
        }

        const taskDocRef = doc(db, "users", userId, "tasks", taskId);
        await deleteDoc(taskDocRef);

        return true;
    } catch (error) {
        throw new Error("Error al eliminar la tarea. Por favor, inténtalo de nuevo.");
    }
};

export const subscribeToTasks = (userId, onData, onError) => {
    if (!userId) {
        if (onError) onError(new Error("El ID de usuario es necesario para la suscripción."));
        return () => { };
    }

    if (typeof onData !== "function") {
        if (onError) onError(new Error("La función de callback 'onData' es necesaria."));
        return () => { };
    }

    const tasksCollectionRef = collection(db, "users", userId, "tasks");

    const q = query(
        tasksCollectionRef,
        orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
            try {
                const fetchedTasks = snapshot.docs.map((doc) => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        createdAt: data.createdAt?.toDate() || null,
                        updatedAt: data.updatedAt?.toDate() || null,
                    };
                });
                onData(fetchedTasks);
            } catch (e) {
                if (onError) onError(new Error("Error al procesar las tareas."));
            }
        },
        (error) => {
            if (onError) onError(new Error("No se pudieron cargar las tareas en tiempo real. Por favor, revisa tu conexión."));
        }
    );

    return unsubscribe;
};

// SECTION = Áreas
export const createDefaultAreas = async (userId) => {
    if (!userId) {
        throw new Error("El ID de usuario es obligatorio para crear las áreas por defecto.");
    }

    const batch = writeBatch(db);
    const areasCollectionRef = collection(db, `users/${userId}/areas`);

    const defaultAreas = [
        { name: "Salud", icon: "🌱", color: "#4CAF50" },
        { name: "Finanzas", icon: "💰", color: "#2196F3" },
        { name: "Educación", icon: "📚", color: "#FFC107" },
    ];

    try {
        defaultAreas.forEach((area) => {
            const newAreaRef = doc(areasCollectionRef);
            batch.set(newAreaRef, {
                ...area,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
        });

        await batch.commit();
        return true;
    } catch (error) {
        throw new Error("No se pudieron crear las áreas iniciales. Por favor, inténtalo de nuevo.");
    }
};

export const createArea = async (userId, areaData) => {
    if (!userId) {
        throw new Error("Se requiere el ID de usuario para crear un área.");
    }

    if (!areaData || !areaData.name || typeof areaData.name !== 'string' || areaData.name.trim() === '') {
        throw new Error("Los datos del área no son válidos. El campo 'name' es obligatorio y no puede estar vacío.");
    }

    try {
        const docRef = await addDoc(collection(db, getAreasCollectionRef(userId)), {
            ...areaData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (error) {
        throw new Error("Hubo un problema al crear el área. Por favor, inténtalo de nuevo.");
    }
};

export const updateArea = async (userId, areaId, areaData) => {
    if (!userId || !areaId) {
        throw new Error("Se requiere el ID de usuario y el ID de área para actualizar.");
    }

    if (!areaData || Object.keys(areaData).length === 0) {
        throw new Error("No se proporcionaron datos válidos para actualizar el área.");
    }

    try {
        const areaRef = doc(db, getAreaDocRef(userId, areaId));
        await updateDoc(areaRef, {
            ...areaData,
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        throw new Error("No se pudo actualizar el área. Por favor, inténtalo de nuevo.");
    }
};

export const deleteArea = async (areaId, userId) => {
    if (!userId || !areaId) {
        throw new Error("Se requiere el ID de usuario y el ID de área para eliminar.");
    }

    try {
        const areaDocRef = doc(db, getAreaDocRef(userId, areaId));
        await deleteDoc(areaDocRef);
        return true;
    } catch (error) {
        throw new Error("No se pudo eliminar el área. Por favor, inténtalo de nuevo.");
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

        areasWithHabits.push({
            ...areaData,
            habits,
            habitCount: habits.length,
        });
    }));

    return areasWithHabits;
};

// SECTION = Areas & Habits
export const subscribeToAllAreasAndHabits = (userId, onData, onError) => {
    if (!userId) {
        onData({ areas: [], habitsByArea: {} });
        return () => { };
    }
    if (typeof onData !== "function") {
        if (onError) onError(new Error("onData callback must be a function."));
        return () => { };
    }

    const habitsUnsubscribers = [];
    let habitsByArea = {};
    let areasData = [];

    const mainUnsubscribe = onSnapshot(
        collection(db, "users", userId, "areas"),
        (areasSnapshot) => {
            habitsUnsubscribers.forEach((unsub) => unsub());
            habitsUnsubscribers.length = 0;
            habitsByArea = {};

            areasData = areasSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            if (areasData.length === 0) {
                onData({ areas: [], habitsByArea: {} });
                return;
            }

            let habitsLoaded = 0;
            const totalAreas = areasData.length;

            areasData.forEach((area) => {
                const habitsCollectionRef = collection(
                    db,
                    "users",
                    userId,
                    "areas",
                    area.id,
                    "habits"
                );

                const habitsUnsubscribe = onSnapshot(
                    habitsCollectionRef,
                    (habitsSnapshot) => {
                        const updatedHabits = habitsSnapshot.docs.map((doc) => {
                            const data = doc.data();
                            return {
                                id: doc.id,
                                ...data,
                                createdAt:
                                    data.createdAt instanceof Timestamp
                                        ? data.createdAt.toDate()
                                        : data.createdAt,
                            };
                        });

                        habitsByArea = {
                            ...habitsByArea,
                            [area.id]: updatedHabits,
                        };

                        habitsLoaded++;
                        if (habitsLoaded === totalAreas) {
                            onData({ areas: areasData, habitsByArea });
                        }
                    }
                );
                habitsUnsubscribers.push(habitsUnsubscribe);
            });
        },
        onError
    );

    return () => {
        mainUnsubscribe();
        habitsUnsubscribers.forEach((unsub) => unsub());
    };
};

export const fetchMonthlyHabitStats = async (userId, year, month) => {
    if (!userId) throw new Error("El ID de usuario es necesario.");

    try {
        const now = new Date();
        const targetYear = year ?? now.getFullYear();
        const targetMonth = month ?? now.getMonth();

        const startOfMonth = new Date(targetYear, targetMonth, 1);
        const endOfMonth = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);

        let completed = 0;
        let skipped = 0;
        let failed = 0;

        const areasRef = collection(db, "users", userId, "areas");
        const areasSnap = await getDocs(areasRef);

        for (const areaDoc of areasSnap.docs) {
            const habitsRef = collection(db, "users", userId, "areas", areaDoc.id, "habits");
            const habitsSnap = await getDocs(habitsRef);

            for (const habitDoc of habitsSnap.docs) {
                const recordsRef = collection(
                    db,
                    "users",
                    userId,
                    "areas",
                    areaDoc.id,
                    "habits",
                    habitDoc.id,
                    "records"
                );
                const recordsSnap = await getDocs(recordsRef);

                for (const recordDoc of recordsSnap.docs) {
                    const data = recordDoc.data();
                    const ts = data.timestamp;
                    if (!ts) continue;

                    const recordDate = ts.toDate();
                    if (recordDate >= startOfMonth && recordDate <= endOfMonth) {
                        switch (data.status) {
                            case "completed":
                                completed++;
                                break;
                            case "skipped":
                                skipped++;
                                break;
                            case "failed":
                                failed++;
                                break;
                            default:
                                failed++;
                        }
                    }
                }
            }
        }

        return { completed, skipped, failed };
    } catch (err) {
        throw new Error("No se pudieron obtener las estadísticas mensuales.");
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

// SECTION = User
export const updateUserData = async (userId, data) => {
    if (typeof userId !== "string" || userId.trim() === "") {
        throw new Error("El ID de usuario debe ser una cadena de texto no vacía.");
    }
    if (typeof data !== "object" || data === null || Object.keys(data).length === 0) {
        throw new Error("Los datos para actualizar deben ser un objeto no vacío.");
    }

    try {
        const userDocRef = doc(db, "users", userId);
        await updateDoc(userDocRef, data);
    } catch (error) {
        throw new Error(`No se pudieron actualizar los datos del usuario. Detalles: ${error.message}`);
    }
};

export const subscribeToAreas = (userId, onData, onError) => {
    if (!userId) {
        if (onError) onError(new Error("User ID is required for area subscription."));
        return () => { };
    }

    if (typeof onData !== 'function') {
        if (onError) onError(new Error("onData callback function is required."));
        return () => { };
    }

    const areasCollectionRef = collection(db, `users/${userId}/areas`);
    const q = query(areasCollectionRef, orderBy('createdAt', 'desc'));

    let unsubscribe;

    try {
        unsubscribe = onSnapshot(
            q,
            async (snapshot) => {
                const fetchedAreas = await Promise.all(snapshot.docs.map(async doc => {
                    const data = doc.data();
                    const areaId = doc.id;
                    const createdAt = data.createdAt && typeof data.createdAt.toDate === 'function' ? data.createdAt.toDate() : null;
                    const updatedAt = data.updatedAt && typeof data.updatedAt.toDate === 'function' ? data.updatedAt.toDate() : null;

                    let habitCount = 0;
                    try {
                        habitCount = await getHabitCountByArea(userId, areaId);
                    } catch (countError) {
                        habitCount = 0;
                    }

                    return {
                        id: areaId,
                        ...data,
                        createdAt,
                        updatedAt,
                        habitCount,
                    };
                }));
                onData(fetchedAreas);
            },
            (error) => {
                if (onError) onError(new Error("Failed to load areas in real-time. Please check your connection."));
            }
        );

        return unsubscribe;
    } catch (error) {
        if (onError) onError(new Error("An error occurred while setting up the area listener."));
        return () => { };
    }
};

export const getAreaName = (areaId, areas) => {
    if (typeof areaId !== 'string' || areaId.trim() === '') {
        return "Área Desconocida";
    }

    if (!Array.isArray(areas) || areas.length === 0) {
        return "Área Desconocida";
    }

    const area = areas.find((a) => a.id === areaId);

    return (area && typeof area.name === 'string' && area.name.trim() !== '')
        ? area.icon + " " + area.name
        : "Área Desconocida";
};

// SECTION = Habits
const normalizeStartDate = (dateInput) => {
    if (dateInput instanceof Date && !isNaN(dateInput.getTime())) {
        return Timestamp.fromDate(dateInput);
    }

    return serverTimestamp();
};

export const createHabit = async (userId, areaId, habitData) => {
    try {
        if (!userId) {
            throw new Error("User ID is required to add a habit.");
        }
        if (!areaId) {
            throw new Error("Area ID is required to add a habit.");
        }
        if (!habitData || typeof habitData !== 'object' || Array.isArray(habitData)) {
            throw new Error("Habit data must be a valid object.");
        }
        if (typeof habitData.name !== 'string' || habitData.name.trim() === '') {
            throw new Error("Habit 'name' is required and must be a non-empty string.");
        }

        const habitToSave = {};

        if (typeof habitData.name !== 'string' || habitData.name.trim() === '') {
            throw new Error("Habit 'name' is required and must be a non-empty string.");
        }
        if (habitData.name.trim().length > 30) {
            throw new Error("Habit 'name' cannot exceed 30 characters.");
        }
        habitToSave.name = habitData.name.trim();

        habitToSave.icon = typeof habitData.icon === 'string' && habitData.icon.trim() !== ''
            ? habitData.icon.trim()
            : "LuActivity";

        if (habitData.reminder && typeof habitData.reminder === 'string' && /^\d{2}:\d{2}$/.test(habitData.reminder)) {
            habitToSave.reminder = habitData.reminder;
        } else {
            habitToSave.reminder = null;
        }

        if (!habitData.goals || typeof habitData.goals !== 'object') {
            throw new Error("Habit 'goals' object is required.");
        }
        habitToSave.goals = {};

        const goalValue = parseInt(habitData.goals.value, 10);
        if (isNaN(goalValue) || goalValue < 1 || goalValue > 9999) {
            throw new Error("Habit 'goals.value' must be an integer between 1 and 9999.");
        }
        habitToSave.goals.value = goalValue;

        const goalUnit = typeof habitData.goals.unit === 'string' ? habitData.goals.unit.toLowerCase() : '';
        if (!['times', 'days'].includes(goalUnit)) {
            habitToSave.goals.unit = "times";
        } else {
            habitToSave.goals.unit = goalUnit;
        }

        const goalPeriod = typeof habitData.goals.period === 'string' ? habitData.goals.period.toLowerCase() : '';
        if (!['day', 'week', 'month'].includes(goalPeriod)) {
            habitToSave.goals.period = "day";
        } else {
            habitToSave.goals.period = goalPeriod;
        }

        if (!habitData.repetition || typeof habitData.repetition !== 'object') {
            throw new Error("Habit 'repetition' object is required.");
        }
        habitToSave.repetition = {};

        const repetitionType = typeof habitData.repetition.type === 'string' ? habitData.repetition.type.toLowerCase() : '';
        if (!['diary', 'monthly', 'interval'].includes(repetitionType)) {
            habitToSave.repetition.type = "diary";
        } else {
            habitToSave.repetition.type = repetitionType;
        }

        switch (habitToSave.repetition.type) {
            case 'diary':
                const days = Array.isArray(habitData.repetition.days)
                    ? habitData.repetition.days.filter(d => typeof d === 'number' && d >= 0 && d <= 6)
                    : [];
                if (days.length === 0) {
                    throw new Error("For 'diary' repetition, 'repetition.days' must be an array with at least one day (0-6).");
                }
                habitToSave.repetition.days = [...new Set(days)].sort((a, b) => a - b);
                break;
            case 'monthly':
                const dayOfMonth = parseInt(habitData.repetition.dayOfMonth, 10);
                if (isNaN(dayOfMonth) || dayOfMonth < 1 || dayOfMonth > 31) {
                    throw new Error("For 'monthly' repetition, 'repetition.dayOfMonth' must be an integer between 1 and 31.");
                }
                habitToSave.repetition.dayOfMonth = dayOfMonth;
                break;
            case 'interval':
                const validIntervals = ["every 1", "every 2", "every 3", "every 4", "every 5"];
                const interval = typeof habitData.repetition.interval === 'string' ? habitData.repetition.interval.toLowerCase() : '';
                if (!validIntervals.includes(interval)) {
                    throw new Error(`For 'interval' repetition, 'repetition.interval' must be one of: ${validIntervals.join(', ')}.`);
                }
                habitToSave.repetition.interval = interval;
                break;
            default:
                break;
        }

        habitToSave.area = areaId;
        habitToSave.startDate = normalizeStartDate(habitData.startDate);
        habitToSave.createdAt = serverTimestamp();
        habitToSave.updatedAt = serverTimestamp();
        habitToSave.lastCompleted = null;
        habitToSave.lastLoggedAt = null;
        habitToSave.lastStatus = "pending";
        habitToSave.timesCompleted = 0;
        habitToSave.currentStreak = 0;
        habitToSave.longestStreak = 0;
        habitToSave.skippedCount = 0;
        habitToSave.failedCount = 0;

        const habitsCollectionRef = collection(db, "users", userId, "areas", areaId, "habits");
        const docRef = await addDoc(habitsCollectionRef, habitToSave);

        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const startDate = habitData.startDate instanceof Date
                ? new Date(habitData.startDate)
                : new Date(habitData.startDate?.toDate?.() || new Date());

            startDate.setHours(0, 0, 0, 0);

            const batch = writeBatch(db);

            for (
                let d = new Date(startDate);
                d < today;
                d.setDate(d.getDate() + 1)
            ) {
                const dateId = formatDateId(d);
                const recordRef = doc(
                    db,
                    "users",
                    userId,
                    "areas",
                    areaId,
                    "habits",
                    docRef.id,
                    "records",
                    dateId
                );

                batch.set(recordRef, {
                    date: Timestamp.fromDate(new Date(d)),
                    status: "failed",
                    times: 0,
                    amount: 0,
                    unit: "times",
                    timestamp: serverTimestamp(),
                });
            }

            await batch.commit();
        } catch (error) {
        }

        return docRef.id;
    } catch (error) {
        if (error.message.includes("required") || error.message.includes("must be") || error.message.includes("cannot exceed")) {
            throw error;
        } else {
            throw new Error("Failed to create habit. Please check your network connection or try again later.");
        }
    }
};

export const updateHabit = async (userId, areaId, habitId, updatedData) => {
    try {
        if (!userId) {
            throw new Error("User ID is required to update a habit.");
        }
        if (!areaId) {
            throw new Error("Area ID is required to update a habit.");
        }
        if (!habitId) {
            throw new Error("Habit ID is required to update a habit.");
        }
        if (!updatedData || Object.keys(updatedData).length === 0) {
            throw new Error("No data provided for habit update.");
        }

        const habitDocRef = doc(db, "users", userId, "areas", areaId, "habits", habitId);

        await updateDoc(habitDocRef, {
            ...updatedData,
            updatedAt: serverTimestamp(),
        });

        return true;

    } catch (error) {
        throw new Error("Failed to update habit. Please try again.");
    }
};

export const deleteHabit = async (userId, areaId, habitId) => {
    try {
        if (!userId) {
            throw new Error("User ID is required to delete a habit.");
        }
        if (!areaId) {
            throw new Error("Area ID is required to delete a habit.");
        }
        if (!habitId) {
            throw new Error("Habit ID is required to delete a habit.");
        }

        const recordsRef = collection(db, "users", userId, "areas", areaId, "habits", habitId, "records");
        const recordsSnap = await getDocs(recordsRef);

        if (!recordsSnap.empty) {
            const deletePromises = recordsSnap.docs.map(docSnap => deleteDoc(docSnap.ref));
            await Promise.all(deletePromises);
        }

        const habitRef = doc(db, "users", userId, "areas", areaId, "habits", habitId);
        await deleteDoc(habitRef);

        return true;

    } catch (error) {
        throw new Error("Failed to delete habit. Please try again.");
    }
};

export const completeHabit = async (
    userId,
    areaId,
    habitId,
    habitData,
    toast,
    formattedDate,
    completionAmountProvided
) => {
    if (!userId || !areaId || !habitId || !habitData || !toast || completionAmountProvided === undefined) {
        toast({
            title: <Text fontWeight={600}>Error de datos</Text>,
            description: "Faltan datos esenciales para completar el hábito.",
            status: "error",
            position: "bottom",
        });
        return;
    }

    const batch = writeBatch(db);

    const localDate = parseLocalDateFromId(formattedDate);
    if (habitData.startDate && habitData.startDate.toDate) {
        const habitStart = habitData.startDate.toDate();
        habitStart.setHours(0, 0, 0, 0);
        if (localDate < habitStart) {
            toast({
                title: <Text fontWeight={600}>Fecha inválida</Text>,
                description: "No puedes registrar progreso antes de la fecha de inicio del hábito.",
                status: "error",
                position: "bottom",
            });
            return;
        }
    }

    if (!localDate) {
        toast({
            title: <Text fontWeight={600}>Fecha inválida</Text>,
            description: "Fecha no válida para completar el hábito.",
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
        const unitField = habitData.goals.unit === "minutes" ? "minutes" : "times";
        const dailyGoal = Number(habitData.goals.value) || 1;

        const recordSnap = await getDoc(recordDocRef);
        const currentProgress = recordSnap.exists() ? (recordSnap.data()[unitField] || 0) : 0;
        const newProgress = currentProgress + Number(completionAmountProvided);

        const recordStatus =
            newProgress >= dailyGoal ? HABIT_STATUS.COMPLETED : HABIT_STATUS.IN_PROGRESS;

        batch.set(
            recordDocRef,
            {
                date: Timestamp.fromDate(localDate),
                status: recordStatus,
                timestamp: serverTimestamp(),
                [unitField]: increment(Number(completionAmountProvided)),
                amount: increment(Number(completionAmountProvided)),
                dailyGoal,
                unit: unitField,
            },
            { merge: true }
        );

        const habitDocRef = doc(db, "users", userId, "areas", areaId, "habits", habitId);
        batch.update(habitDocRef, {
            lastStatus: recordStatus,
            lastCompletionDate: serverTimestamp(),
        });

        await batch.commit();

        toast({
            title: <Text fontWeight={600}>Progreso registrado</Text>,
            description: `"${habitData.name}" completado ${completionAmountProvided} ${unitField === "times" ? "veces" : "minuto(s)"} .`,
            status: "success",
            position: "bottom",
        });
    } catch (error) {
        toast({
            title: <Text fontWeight={600}>Error al completar</Text>,
            description: "No se pudo completar el hábito. Inténtalo de nuevo.",
            status: "error",
            position: "bottom",
        });
        throw error;
    }
};

export const skipHabit = async (userId, areaId, habitId, toast, habitName, date = new Date()) => {
    if (!userId || !areaId || !habitId) {
        toast({
            title: <Text fontWeight={600}>Error</Text>,
            description: "Faltan datos para saltar el hábito.",
            status: "error",
            position: "bottom",
        });
        return;
    }

    const formattedDate = formatDateId(date);
    const localDate = parseLocalDateFromId(formattedDate);

    const batch = writeBatch(db);

    try {
        const recordRef = doc(db, "users", userId, "areas", areaId, "habits", habitId, "records", formattedDate);

        batch.set(
            recordRef,
            {
                date: Timestamp.fromDate(localDate),
                status: HABIT_STATUS.SKIPPED,
                times: 0,
                minutes: 0,
                amount: 0,
                unit: "times",
                timestamp: serverTimestamp(),
            },
            { merge: true }
        );

        const habitRef = doc(db, "users", userId, "areas", areaId, "habits", habitId);
        batch.update(habitRef, {
            lastStatus: HABIT_STATUS.SKIPPED,
            lastStatusDate: serverTimestamp(),
        });

        await batch.commit();
    } catch (error) {
        toast({
            title: <Text fontWeight={600}>Error</Text>,
            description: `No se pudo saltar el hábito "${habitName}". Por favor, inténtalo de nuevo.`,
            status: "error",
            position: "bottom",
        });
        throw error;
    }
};

export const markMissedHabitsAsFailed = async (userId) => {
    const areasRef = collection(db, "users", userId, "areas");
    const areasSnap = await getDocs(areasRef);

    const yesterday = new Date();
    yesterday.setHours(0, 0, 0, 0);
    yesterday.setDate(yesterday.getDate() - 1);
    const formattedDate = formatDateId(yesterday);
    const localDate = parseLocalDateFromId(formattedDate);

    const batch = writeBatch(db);

    for (const areaDoc of areasSnap.docs) {
        const habitsRef = collection(db, "users", userId, "areas", areaDoc.id, "habits");
        const habitsSnap = await getDocs(habitsRef);

        for (const habitDoc of habitsSnap.docs) {
            const recordRef = doc(db, "users", userId, "areas", areaDoc.id, "habits", habitDoc.id, "records", formattedDate);
            const recordSnap = await getDoc(recordRef);

            if (!recordSnap.exists()) {
                batch.set(recordRef, {
                    date: Timestamp.fromDate(localDate),
                    status: HABIT_STATUS.FAILED,
                    times: 0,
                    minutes: 0,
                    amount: 0,
                    timestamp: serverTimestamp(),
                });
            }
        }
    }

    await batch.commit();
};

export const checkFailedHabit = async (userId, areaId, habitId, habitName) => {
    if (!userId || !areaId || !habitId) return;

    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const todayId = formatDateId(todayDate);
    const localDate = parseLocalDateFromId(todayId);

    const recordDocRef = doc(db, "users", userId, "areas", areaId, "habits", habitId, "records", todayId);

    try {
        const recordSnap = await getDoc(recordDocRef);

        if (!recordSnap.exists()) {
            await setDoc(recordDocRef, {
                date: Timestamp.fromDate(localDate),
                status: HABIT_STATUS.FAILED,
                times: 0,
                minutes: 0,
                amount: 0,
                timestamp: serverTimestamp(),
            });

            const habitDocRef = doc(db, "users", userId, "areas", areaId, "habits", habitId);
            await updateDoc(habitDocRef, {
                lastStatus: HABIT_STATUS.FAILED,
                lastStatusDate: serverTimestamp(),
            });
        } else {
            const recordData = recordSnap.data();
            if (recordData.status === HABIT_STATUS.FAILED) return;
            if (recordData.status === HABIT_STATUS.COMPLETED || recordData.status === HABIT_STATUS.SKIPPED) return;

            await setDoc(recordDocRef, {
                date: Timestamp.fromDate(localDate),
                status: HABIT_STATUS.FAILED,
                times: recordData.times || 0,
                minutes: recordData.minutes || 0,
                amount: recordData.amount || 0,
                timestamp: serverTimestamp(),
            }, { merge: true });
        }
    } catch (error) {
        throw new Error(error);
    }
};

export const deleteHabitRecord = async (
    userId,
    areaId,
    habitId,
    toast,
    habitName,
    date
) => {
    if (!userId || !areaId || !habitId) {
        return;
    }

    const formattedDate = formatDateId(date);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(formattedDate)) {
        toast({
            title: <Text fontWeight={600}>Error</Text>,
            description: "Fecha no válida para eliminar registro.",
            status: "error",
            position: "bottom",
        });
        return;
    }

    try {
        const recordRef = doc(db, "users", userId, "areas", areaId, "habits", habitId, "records", formattedDate);
        await deleteDoc(recordRef);

        toast({
            title: <Text fontWeight={600}>Registro eliminado</Text>,
            description: `Se ha eliminado el registro de "${habitName}" para el ${formattedDate}.`,
            status: "success",
            position: "bottom",
        });
    } catch (error) {
        toast({
            title: <Text fontWeight={600}>Error</Text>,
            description: "No se pudo eliminar el registro.",
            status: "error",
            position: "bottom",
        });
    }
};

export const autoGenerateFailedDaysOnLoad = async (userId, areaId, habitId, habit) => {
    if (!userId || !areaId || !habitId || !habit?.startDate) return;

    const startDate = habit.startDate.toDate ? habit.startDate.toDate() : new Date(habit.startDate);
    const today = new Date();
    startDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (startDate > today) return;

    const recordsRef = collection(db, "users", userId, "areas", areaId, "habits", habitId, "records");
    const existingRecordsSnap = await getDocs(recordsRef);
    const existingDates = new Set(
        existingRecordsSnap.docs.map((doc) => doc.id)
    );

    const batch = writeBatch(db);
    const current = new Date(startDate);

    while (current < today) {
        const formatted = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}-${String(current.getDate()).padStart(2, "0")}`;
        if (!existingDates.has(formatted)) {
            const recordRef = doc(recordsRef, formatted);
            batch.set(recordRef, {
                date: Timestamp.fromDate(new Date(formatted)),
                status: "failed",
                times: 0,
                minutes: 0,
                dailyGoal: habit.goals?.value || 1,
                unit: habit.goals?.unit || "times",
                timestamp: serverTimestamp(),
            });
        }
        current.setDate(current.getDate() + 1);
    }

    if (!batch._mutations || batch._mutations.length === 0) return;
    await batch.commit();
};

export const getHabitRecord = async (userId, areaId, habitId, formattedDate) => {
    if (!userId || !areaId || !habitId || !formattedDate) {
        return null;
    }
    try {
        const recordRef = doc(db, "users", userId, "areas", areaId, "habits", habitId, "records", formattedDate);
        const recordSnap = await getDoc(recordRef);
        if (!recordSnap.exists()) return null;
        const data = recordSnap.data();
        if (data.date && typeof data.date.toDate === "function") data.date = data.date.toDate();
        else if (typeof data.date === "string") data.date = parseLocalDateFromId(data.date);
        return { id: recordSnap.id, ...data };
    } catch (error) {
        throw error;
    }
};

export const getHabitRecordsListener = (userId, areaId, habitId, onUpdate, onError) => {
    if (!userId || !areaId || !habitId) {
        if (onError) onError(new Error("Missing params for getHabitRecordsListener"));
        return () => { };
    }

    try {
        const recordsRef = collection(db, `users/${userId}/areas/${areaId}/habits/${habitId}/records`);
        const q = query(recordsRef, orderBy("date", "asc"));

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const records = snapshot.docs.map((doc) => {
                    const data = doc.data();

                    let recordDate = null;
                    if (data.date && typeof data.date.toDate === "function") {
                        recordDate = data.date.toDate();
                    } else if (data.timestamp && typeof data.timestamp.toDate === "function") {
                        recordDate = data.timestamp.toDate();
                    } else {
                        recordDate = parseLocalDateFromId(doc.id);
                    }

                    const unit = data.unit || (data.minutes !== undefined ? "minutes" : "times");
                    const amount = (unit && data[unit] !== undefined) ? data[unit] : (data.amount ?? 0);

                    return {
                        id: doc.id,
                        date: recordDate,
                        status: data.status,
                        timestamp: data.timestamp,
                        amount,
                        dailyGoal: data.dailyGoal || 0,
                        unit,
                        raw: data,
                    };
                });
                onUpdate(records);
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

export const getHabitRecordsGroupedByDayListener = (userId, areaId, habitId, onUpdate, onError) => {
    try {
        const recordsRef = collection(db, `users/${userId}/areas/${areaId}/habits/${habitId}/records`);
        const unsubscribe = onSnapshot(
            recordsRef,
            (snapshot) => {
                const recordsMap = {};
                snapshot.forEach((doc) => {
                    const data = doc.data();
                    let date;
                    if (data.date && typeof data.date.toDate === 'function') {
                        date = data.date.toDate();
                    } else if (data.timestamp && typeof data.timestamp.toDate === 'function') {
                        date = data.timestamp.toDate();
                    } else {
                        date = parseLocalDateFromId(doc.id);
                    }
                    if (!date) return;

                    const year = date.getFullYear();
                    const month = date.getMonth();
                    const day = date.getDate();
                    const key = `${year}-${month + 1}-${day}`;

                    if (!recordsMap[key]) {
                        recordsMap[key] = {
                            date: new Date(year, month, day),
                            day,
                            month: new Intl.DateTimeFormat('es', { month: 'short' }).format(date),
                            year,
                            times: 0,
                            status: data.status || "unknown",
                        };
                    }

                    const unit = data.unit || (data.minutes !== undefined ? "minutes" : "times");
                    const amount = (unit && data[unit] !== undefined) ? data[unit] : (data.amount ?? 0);
                    recordsMap[key].times = (recordsMap[key].times || 0) + amount;
                    recordsMap[key].status = data.status || recordsMap[key].status;
                });

                const sorted = Object.values(recordsMap).sort((a, b) => a.date.getTime() - b.date.getTime());
                onUpdate(sorted);
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

export const getHabitCountByArea = async (userId, areaId) => {
    try {
        if (!userId) {
            throw new Error("User ID is required to get habit count.");
        }
        if (!areaId) {
            throw new Error("Area ID is required to get habit count.");
        }

        const habitsCollectionRef = collection(db, "users", userId, "areas", areaId, "habits");
        const q = query(habitsCollectionRef);
        const snapshot = await getDocs(q);

        return snapshot.size;
    } catch (error) {
        throw new Error("Failed to get habit count. Please try again.");
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

// App info
export const getAppInfo = async () => {
    try {
        const docRef = doc(db, "app_info", "app_version");
        const snapshot = await getDoc(docRef);

        if (snapshot.exists()) {
            const data = snapshot.data();
            return {
                name: data.name || "Habituo App",
                version: data.number || "X.X.X",
                launch: data.launch || null,
            };
        } else {
            return {
                name: "Habituo App",
                version: "X.X.X",
                launch: null,
            };
        }
    } catch (err) {
        return {
            name: "Habituo App",
            version: "X.X.X",
            launch: null,
            error: err,
        };
    }
};