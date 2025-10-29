import { jest } from "@jest/globals";

/**
 * Firebase module mocks
 * 
 * We mock all Firebase SDK modules so that:
 * - No real Firebase connection is made.
 * - The `initializeApp`, `getAuth`, etc. functions are replaced with controlled mock versions.
 * - We can verify which Firebase configuration file (dev/prod) is being loaded.
 */
jest.mock("firebase/app", () => ({
    initializeApp: jest.fn((config) => ({ appName: "mockApp", config })),
    getApps: jest.fn(() => []), // Pretend no apps are initialized by default
    getApp: jest.fn(() => ({ appName: "existingApp" })), // Return an existing mock app
}));

jest.mock("firebase/auth", () => {
    class MockGoogleAuthProvider { }
    return {
        getAuth: jest.fn(() => "mockAuth"),
        GoogleAuthProvider: MockGoogleAuthProvider,
        signInAnonymously: jest.fn(),
        onAuthStateChanged: jest.fn(),
    };
});

jest.mock("firebase/firestore", () => ({
    getFirestore: jest.fn(() => "mockFirestore"),
    doc: jest.fn(),
    getDoc: jest.fn(),
    setDoc: jest.fn(),
    serverTimestamp: jest.fn(),
}));

jest.mock("firebase/storage", () => ({
    getStorage: jest.fn(() => "mockStorage"),
}));

/**
 * Configuration mocks (Dev / Prod)
 * 
 * The firebase.js file dynamically imports either:
 *  - "../config/firebaseConfig.dev.js" (for development)
 *  - "../config/firebaseConfig.prod.js" (for production)
 * We mock both to ensure the correct one is used depending on `process.env.REACT_APP_ENV`.
 */
jest.mock("../../config/firebaseConfig.dev.js", () => ({
    firebaseConfig: { env: "dev", apiKey: "DEV_KEY" },
}));
jest.mock("../../config/firebaseConfig.prod.js", () => ({
    firebaseConfig: { env: "prod", apiKey: "PROD_KEY" },
}));

/**
 * Test suite: Firebase Initialization
 *
 * Tests three main scenarios:
 *  1. Development environment loads dev config.
 *  2. Production environment loads prod config.
 *  3. Existing Firebase app is reused instead of re-initialized.
 */
describe("Firebase initialization", () => {
    let firebase;    // Module under test
    let appModule;   // Firebase App module to spy on functions

    /**
     * Reset modules before each test to avoid cross-test contamination.
     * Also, reload the firebase/app module for spying.
     */
    beforeEach(() => {
        jest.resetModules();
        appModule = require("firebase/app");
    });

    /**
     * Helper function to load the Firebase module under a given environment.
     *
     * @param {string} env - Environment name: "development" or "production"
     */
    const loadFirebase = (env) => {
        process.env.REACT_APP_ENV = env;
        firebase = require("./firebase.js");
    };

    /**
     * ✅ Test 1: Development environment
     *
     * Ensures the development config is loaded when REACT_APP_ENV="development".
     * Verifies that `initializeApp` is called with dev config and that all
     * Firebase exports are correctly returned.
     */
    test("uses development config when REACT_APP_ENV=development", () => {
        loadFirebase("development");

        expect(appModule.initializeApp).toHaveBeenCalledWith({
            env: "dev",
            apiKey: "DEV_KEY",
        });

        expect(firebase.auth).toBe("mockAuth");
        expect(firebase.db).toBe("mockFirestore");
        expect(firebase.storage).toBe("mockStorage");
        expect(firebase.googleProvider).toBeInstanceOf(
            require("firebase/auth").GoogleAuthProvider
        );
    });

    /**
     * ✅ Test 2: Production environment
     *
     * Ensures the production config is loaded when REACT_APP_ENV is not "development".
     * Verifies `initializeApp` call with prod config and all exported instances.
     */
    test("uses production config when REACT_APP_ENV!=development", () => {
        loadFirebase("production");

        expect(appModule.initializeApp).toHaveBeenCalledWith({
            env: "prod",
            apiKey: "PROD_KEY",
        });

        expect(firebase.auth).toBe("mockAuth");
        expect(firebase.db).toBe("mockFirestore");
        expect(firebase.storage).toBe("mockStorage");
        expect(firebase.googleProvider).toBeInstanceOf(
            require("firebase/auth").GoogleAuthProvider
        );
    });

    /**
     * ✅ Test 3: Reuse existing Firebase app
     *
     * If `getApps()` returns a non-empty array, the module should reuse
     * the existing app instead of reinitializing Firebase.
     */
    test("reuses existing app if already initialized", () => {
        appModule.getApps.mockReturnValueOnce(["alreadyInitialized"]);

        loadFirebase("development");

        // Ensure initializeApp is NOT called and getApp is called instead
        expect(appModule.initializeApp).not.toHaveBeenCalled();
        expect(appModule.getApp).toHaveBeenCalled();

        // Verify Firebase exports are still correctly returned
        expect(firebase.auth).toBe("mockAuth");
        expect(firebase.db).toBe("mockFirestore");
        expect(firebase.googleProvider).toBeInstanceOf(
            require("firebase/auth").GoogleAuthProvider
        );
    });
});
