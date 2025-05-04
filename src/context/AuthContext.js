import React, { createContext, useState, useEffect, useContext } from "react";
import { auth, googleProvider } from "../hooks/firebase";
import {
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import Cookies from "js-cookie";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Añadimos un estado de carga
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false); // La carga inicial ha terminado
    });
    return () => unsubscribe();
  }, []);

  const login = async (email, password, rememberMe) => {
    setError(null); // Limpiamos cualquier error previo
    setLoading(true); // Iniciamos el estado de carga
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      if (rememberMe) {
        Cookies.set("userSession", email, { expires: 30 });
      } else {
        Cookies.remove("userSession");
      }
      window.location("/dashboard"); // Usamos navigate para la redirección
    } catch (error) {
      handleAuthError(error);
    } finally {
      setLoading(false); // Finalizamos el estado de carga
    }
  };

  const loginWithGoogle = async () => {
    setError(null); // Limpiamos cualquier error previo
    setLoading(true); // Iniciamos el estado de carga
    try {
      await signInWithPopup(auth, googleProvider);
      window.location("/dashboard"); // Usamos navigate para la redirección
    } catch (error) {
      handleAuthError(error);
    } finally {
      setLoading(false); // Finalizamos el estado de carga
    }
  };

  const logout = async () => {
    setError(null); // Limpiamos cualquier error previo
    setLoading(true); // Iniciamos el estado de carga
    try {
      await signOut(auth);
      setUser(null);
      window.location("/login"); // Redirigimos a la página de login
    } catch (error) {
      setError("Error al cerrar sesión.");
    } finally {
      setLoading(false); // Finalizamos el estado de carga
    }
  };

  const handleAuthError = (error) => {
    let message = "Ocurrió un error inesperado.";
    if (error.code === "auth/user-not-found") {
      message = "No se encontró una cuenta con este correo.";
    } else if (error.code === "auth/wrong-password") {
      message = "La contraseña es incorrecta.";
    } else if (error.code === "auth/invalid-credential") {
      message = "El correo o la contraseña son incorrectos.";
    } else if (error.code === "auth/popup-closed-by-user") {
      message = "La ventana emergente de inicio de sesión fue cerrada.";
    } else if (error.code === "auth/network-request-failed") {
      message = "Error de red. Por favor, verifica tu conexión a internet.";
    }
    setError(message);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);