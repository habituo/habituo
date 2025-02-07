import React, { createContext, useState, useEffect, useContext } from "react";
import { auth, googleProvider } from "../hooks/firebase";
import { onAuthStateChanged, signOut, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import Cookies from "js-cookie";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email, password, rememberMe) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      if (rememberMe) {
        Cookies.set("userSession", email, { expires: 30 });
      } else {
        Cookies.remove("userSession");
      }
      window.location.href = "/dashboard";
    } catch (error) {
      handleAuthError(error);
    }
  };

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      window.location.href = "/dashboard";
    } catch (error) {
      handleAuthError(error);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const handleAuthError = (error) => {
    let message = "Ocurrió un error inesperado.";
    if (error.code === "auth/user-not-found") {
      message = "No se encontró una cuenta con este correo.";
    } else if (error.code === "auth/wrong-password") {
      message = "La contraseña es incorrecta.";
    } else if (error.code === "auth/invalid-credential") {
      message = "El correo o la contraseña son incorrectos.";
    }
    setError(message);
  };

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
