import { createContext, useState, useEffect, useContext, useCallback, useMemo } from "react";
import { auth, db } from "../../api/firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import PropTypes from "prop-types";

// Create Context
const AuthUserContext = createContext();

// Custom Hook to use AuthUserContext
export const useAuthUser = () => useContext(AuthUserContext);

/**
 * AuthUserProvider
 * Provides authentication state and user data to the app.
 */
export const AuthUserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  /**
   * Create a Firestore user profile if it doesn't exist yet.
   */
  const createInitialUserProfile = async (firebaseUser) => {
    const userDocRef = doc(db, "users", firebaseUser.uid);
    const userName = firebaseUser.displayName || firebaseUser.email.split("@")[0];

    // Determine auth provider
    const providerId = firebaseUser?.providerData?.[0]?.providerId;
    const authProvider = providerId.includes("google.com") ? "google" : "email";

    const initialData = {
      authProvider,
      email: firebaseUser.email,
      name: userName,
      createdAt: new Date(),
      subscriptionStatus: "inactive",
      type_account: "basic",
      preferences: { language: "esp" },
      birthday_date: "",
      planExpiresAt: "",
    };

    await setDoc(userDocRef, initialData, { merge: true });
    return initialData;
  };

  /**
   * Fetch user profile from Firestore and sync with Firebase Auth data.
   */
  const fetchUserProfileAndSync = useCallback(async (firebaseUser) => {
    try {
      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      const firestoreData = userDocSnap.exists()
        ? userDocSnap.data()
        : await createInitialUserProfile(firebaseUser);

      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        emailVerified: firebaseUser.emailVerified,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        providerData: firebaseUser.providerData,
        metadata: firebaseUser.metadata,
        ...firestoreData,
      });

      setAuthError(null);
    } catch (error) {
      setAuthError("No se pudo cargar o crear el perfil del usuario.", error);
      setUser({ uid: firebaseUser.uid, ...firebaseUser });
    }
  }, []);

  /**
  * Force re-sync the user data from Firebase/Firestore.
  */
  const refreshUser = useCallback(async () => {
    if (auth.currentUser) {
      await fetchUserProfileAndSync(auth.currentUser);
    }
  }, [fetchUserProfileAndSync]);

  /**
   * Logout and clear user context.
   */
  const logout = useCallback(async () => {
    try {
      await auth.signOut();
      setUser(null);
      setAuthError(null);
    } catch (error) {
      setAuthError("Error al cerrar sesión.", error);
    }
  }, []);

  /**
   * Subscribe to Firebase Auth state changes.
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        await fetchUserProfileAndSync(firebaseUser);
      } else {
        setUser(null);
        setAuthError(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchUserProfileAndSync]);

  // ✅ Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({ user, loading, authError, refreshUser, logout }),
    [user, loading, authError, refreshUser, logout]
  );

  return (
    <AuthUserContext.Provider value={contextValue}>
      {children}
    </AuthUserContext.Provider>
  );
};

// ✅ Add PropTypes validation
AuthUserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
