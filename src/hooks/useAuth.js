import {
    createUserWithEmailAndPassword,
    signInWithPopup,
    updateProfile,
    sendEmailVerification,
    setPersistence,
    browserSessionPersistence,
    browserLocalPersistence,
    signInWithEmailAndPassword,
    signOut,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { auth, googleProvider, db } from "../api/firebase/firebase";

const handleAuthError = (error) => {
    let message = "Ocurrió un error inesperado. Por favor, inténtalo de nuevo.";
    switch (error.code) {
        case "auth/user-not-found":
        case "auth/wrong-password":
        case "auth/invalid-credential":
            message = "Correo o contraseña incorrectos.";
            break;
        case "auth/popup-closed-by-user":
            message = "La ventana emergente de inicio de sesión fue cerrada.";
            break;
        case "auth/network-request-failed":
            message = "Error de red. Por favor, verifica tu conexión a internet.";
            break;
        case "auth/email-already-in-use":
            message = "El correo electrónico ya está en uso.";
            break;
        case "auth/weak-password":
            message = "La contraseña es demasiado débil. Debe tener al menos 6 caracteres.";
            break;
        case "auth/invalid-email":
            message = "El formato del correo electrónico es inválido.";
            break;
        case "auth/too-many-requests":
            message = "Muchos intentos seguidos. Vuelve a intentarlo en unos minutos."
            break;
        default:
            message = error.message;
            break;
    }
    return message;
};

export const useAuth = () => {
    const navigate = useNavigate();

    const login = async (email, password, rememberMe) => {
        try {
            await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const userRef = doc(db, "users", userCredential.user.uid);
            await updateDoc(userRef, { lastLoginAt: serverTimestamp() });
            return userCredential.user;
        } catch (error) {
            const errorMessage = handleAuthError(error);
            throw new Error(errorMessage);
        }
    };

    const loginWithGoogle = async (rememberMe) => {
        try {
            await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
            const result = await signInWithPopup(auth, googleProvider);
            const userRef = doc(db, "users", result.user.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                const newUserDoc = {
                    name: result.user.displayName,
                    email: result.user.email,
                    authProvider: "google",
                    registeredAt: serverTimestamp(),
                    lastLoginAt: serverTimestamp(),
                    type_account: "basic",
                    subscriptionStatus: "inactive",
                    planExpiresAt: null,
                    preferences: {
                        language: "esp",
                        startOfWeek: "monday",
                    },
                };
                await setDoc(userRef, newUserDoc, { merge: true });
            } else {
                await updateDoc(userRef, { lastLoginAt: serverTimestamp() });
            }

            return result;
        } catch (error) {
            const errorMessage = handleAuthError(error);
            throw new Error(errorMessage);
        }
    };

    const registerEmailPassword = async (email, password, name, rememberMe) => {
        try {
            await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, { displayName: name });
            const userRef = doc(db, "users", userCredential.user.uid);

            const newUserDoc = {
                name: name,
                email: email,
                authProvider: "email",
                birthday_date: null,
                planExpiresAt: null,
                registeredAt: serverTimestamp(),
                lastLoginAt: serverTimestamp(),
                subscriptionStatus: "inactive",
                type_account: "basic",
                preferences: {
                    language: "esp",
                    startOfWeek: "monday",
                },
            };

            await setDoc(userRef, newUserDoc);
            return userCredential.user;
        } catch (error) {
            const errorMessage = handleAuthError(error);
            throw new Error(errorMessage);
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            navigate("/login");
        } catch (error) {
            const errorMessage = handleAuthError(error);
            throw new Error(errorMessage);
        }
    };

    const sendVerificationEmail = async () => {
        try {
            if (!auth.currentUser) {
                throw new Error("No hay usuario autenticado.");
            }
            await sendEmailVerification(auth.currentUser);
        } catch (error) {
            const errorMessage = handleAuthError(error);
            throw new Error(errorMessage);
        }
    };

    return {
        login,
        loginWithGoogle,
        registerEmailPassword,
        logout,
        sendVerificationEmail,
    };
};