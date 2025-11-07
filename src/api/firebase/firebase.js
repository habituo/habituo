import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

import { firebaseConfig } from "../../config/firebaseConfig.js"; 

/**
 * Initializes Firebase if no instance exists, otherwise retrieves
 * the existing app instance.
 *
 * This ensures Firebase is not reinitialized multiple times in the same runtime.
 *
 * @constant {FirebaseApp} app - The active Firebase App instance
 */
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

/**
 * Firebase Authentication instance.
 * Used for user management and login mechanisms.
 *
 * @constant {Auth} auth
 */
export const auth = getAuth(app);

/**
 * Firestore database instance.
 * Used for real-time data storage and retrieval.
 *
 * @constant {Firestore} db
 */
export const db = getFirestore(app);

/**
 * Firebase Storage instance.
 * Used for file uploads, downloads, and media handling.
 *
 * @constant {FirebaseStorage} storage
 */

export const storage = getStorage(app);

/**
 * Google Authentication provider.
 * Used for enabling Google Sign-In.
 *
 * @constant {GoogleAuthProvider} googleProvider
 */

export const googleProvider = new GoogleAuthProvider();

/**
 * Re-exports selected Firebase helper functions for easier access.
 * These are directly used throughout the application.
 */
export { signInAnonymously, onAuthStateChanged } from "firebase/auth";
export { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
