import { createContext, useState, useEffect, useContext } from "react";
import { auth, googleProvider, db } from "../hooks/firebase";
import {
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

const AuthUserContext = createContext();

export const AuthUserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setAuthError(null);
      if (firebaseUser) {
        const userDocRef = doc(db, "users", firebaseUser.uid);
        try {
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            setUser({ uid: firebaseUser.uid, ...firebaseUser, ...userDocSnap.data() });
          } else {
            let userName = firebaseUser.displayName || null;
            let authProvider = "email";

            if (firebaseUser.providerData && firebaseUser.providerData.length > 0) {
              const providerId = firebaseUser.providerData[0].providerId;
              if (providerId.includes("google.com")) {
                authProvider = "google";
                if (!userName && firebaseUser.email) {
                  userName = firebaseUser.email.split('@')[0];
                }
              } else if (providerId.includes("password")) {
                authProvider = "email";
              } else {
                userName = firebaseUser.email.split('@')[0];
              }
            } else if (firebaseUser.email && !userName) {
              userName = firebaseUser.email.split('@')[0];
            }

            const initialUserData = {
              authProvider: authProvider,
              birthday_date: "",
              email: firebaseUser.email,
              name: userName,
              planExpiresAt: "",
              preferences: {
                language: "esp",
              },
              createdAt: new Date(),
              subscriptionStatus: "inactive",
              type_account: "basic",
            };
            await setDoc(userDocRef, initialUserData);
            setUser({ uid: firebaseUser.uid, ...firebaseUser, ...initialUserData });
            setAuthError("No se pudo cargar o crear el perfil del usuario. Por favor, inténtalo de nuevo.");
          }
        } catch (error) {
          setUser({ uid: firebaseUser.uid, ...firebaseUser });
          setAuthError("No se pudo cargar o crear el perfil del usuario.");
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
      default:
        message = error;
        break;
    }
    setAuthError(message);
    throw new Error(message);
  };

  const login = async (email, password, rememberMe) => {
    setAuthError(null);
    setLoading(true);
    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (rememberMe) => {
    setAuthError(null);
    setLoading(true);
    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      const userCredential = await signInWithPopup(auth, googleProvider);
      return userCredential.user;
    } catch (error) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  const registerEmailPassword = async (email, password, displayName, rememberMe) => {
    setAuthError(null);
    setLoading(true);
    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName: displayName });
        setUser((currentUser) => ({ ...currentUser, displayName: displayName }));
      }

      return userCredential.user;
    } catch (error) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  const registerWithGooglePopup = async (rememberMe) => {
    setAuthError(null);
    setLoading(true);
    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      const userCredential = await signInWithPopup(auth, googleProvider);
      return userCredential.user;
    } catch (error) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  const sendEmailVerificationLink = async () => {
    setAuthError(null);
    setLoading(true);
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        return true;
      } else {
        throw new Error("No hay un usuario autenticado para enviar el correo de verificación.");
      }
    } catch (error) {
      handleAuthError(error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setAuthError(null);
    setLoading(true);
    try {
      await signOut(auth);
    } catch (error) {
      setAuthError("Error al cerrar sesión.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthUserContext.Provider value={{
      user, loading, login, loginWithGoogle,
      registerEmailPassword,
      registerWithGooglePopup, sendEmailVerificationLink, logout, authError
    }}>
      {children}
    </AuthUserContext.Provider>
  );
};

export const useAuthUser = () => useContext(AuthUserContext);