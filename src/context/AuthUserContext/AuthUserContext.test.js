/**
 * @file AuthUserContext.test.js
 * @description Unit tests for the AuthUserContext provider and hook.
 * These tests validate context behavior for authentication, Firestore syncing,
 * error handling, and context methods such as refreshUser() and logout().
*/
import { render, screen, act } from "@testing-library/react";
import { AuthUserProvider, useAuthUser } from "./AuthUserContext";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth } from "../../api/firebase/firebase";

// Mock Firebase dependencies
jest.mock("firebase/auth", () => ({
    onAuthStateChanged: jest.fn(),
}));

jest.mock("firebase/firestore", () => ({
    doc: jest.fn(),
    getDoc: jest.fn(),
    setDoc: jest.fn(),
}));

jest.mock("../../api/firebase/firebase", () => ({
    auth: {
        currentUser: null,
        signOut: jest.fn(),
    },
    db: {},
}));

/**
 * Helper Consumer component
 * 
 * A small consumer component that exposes AuthUserContext values
 * to the test environment for easy inspection and interaction.
 */
const Consumer = () => {
    const { user, loading, authError, refreshUser, logout } = useAuthUser();

    return (
        <div>
            <p data-testid="loading">{loading ? "true" : "false"}</p>
            <p data-testid="authError">{authError || ""}</p>
            <p data-testid="userEmail">{user?.email || ""}</p>
            <button data-testid="refresh" onClick={refreshUser}>
                Refresh
            </button>
            <button data-testid="logout" onClick={logout}>
                Logout
            </button>
        </div>
    );
};

// Common setup before each test
let authCallback;
beforeEach(() => {
    jest.clearAllMocks();
    onAuthStateChanged.mockImplementation((_auth, cb) => {
        authCallback = cb;
        return jest.fn(); // unsubscribe
    });
    auth.currentUser = null;
});

// Test Suite
describe("AuthUserProvider", () => {
    // Basic rendering
    test("renders children", () => {
        render(
            <AuthUserProvider>
                <div data-testid="child">Hola</div>
            </AuthUserProvider>
        );
        expect(screen.getByTestId("child")).toBeInTheDocument();
    });

    // Auth flow: No authenticated user
    test("handles no authenticated user", async () => {
        render(
            <AuthUserProvider>
                <Consumer />
            </AuthUserProvider>
        );

        await act(async () => {
            await authCallback(null);
        });

        expect(screen.getByTestId("loading").textContent).toBe("false");
        expect(screen.getByTestId("userEmail").textContent).toBe("");
        expect(screen.getByTestId("authError").textContent).toBe("");
    });

    // Auth flow: User with existing Firestore profile
    test("loads user with existing Firestore profile", async () => {
        const mockUser = {
            uid: "123",
            email: "test@example.com",
            displayName: "Tester",
            emailVerified: true,
            providerData: [],
            metadata: {},
        };

        getDoc.mockResolvedValueOnce({
            exists: () => true,
            data: () => ({ name: "Tester", type_account: "basic" }),
        });
        doc.mockReturnValue("userDocRef");

        render(
            <AuthUserProvider>
                <Consumer />
            </AuthUserProvider>
        );

        await act(async () => {
            await authCallback(mockUser);
        });

        expect(screen.getByTestId("userEmail").textContent).toBe("test@example.com");
        expect(screen.getByTestId("loading").textContent).toBe("false");
        expect(screen.getByTestId("authError").textContent).toBe("");
        expect(getDoc).toHaveBeenCalledWith("userDocRef");
    });

    // Auth flow: Firestore document does not exist → create new profile
    test("creates profile if Firestore doc does not exist", async () => {
        const mockUser = {
            uid: "321",
            email: "nuevo@example.com",
            displayName: null,
            providerData: [{ providerId: "password" }],
            metadata: {},
        };

        getDoc.mockResolvedValueOnce({ exists: () => false });
        setDoc.mockResolvedValueOnce();
        doc.mockReturnValue("userDocRef");

        render(
            <AuthUserProvider>
                <Consumer />
            </AuthUserProvider>
        );

        await act(async () => {
            await authCallback(mockUser);
        });

        expect(setDoc).toHaveBeenCalledTimes(1);
        expect(getDoc).toHaveBeenCalledTimes(1);
        expect(screen.getByTestId("userEmail").textContent).toBe("nuevo@example.com");
    });

    // Error handling: Firestore failure
    test("handles Firestore fetch error", async () => {
        const mockUser = {
            uid: "111",
            email: "error@example.com",
            displayName: "ErrUser",
            providerData: [],
            metadata: {},
        };

        getDoc.mockRejectedValueOnce(new Error("Firestore error"));
        doc.mockReturnValue("userDocRef");

        render(
            <AuthUserProvider>
                <Consumer />
            </AuthUserProvider>
        );

        await act(async () => {
            await authCallback(mockUser);
        });

        expect(screen.getByTestId("authError").textContent).toContain("No se pudo cargar");
        expect(screen.getByTestId("userEmail").textContent).toBe("error@example.com");
    });

    // refreshUser(): called when currentUser exists
    test("refreshUser triggers profile sync when logged in", async () => {
        const mockUser = { uid: "999", email: "refresh@example.com" };
        auth.currentUser = mockUser;
        getDoc.mockResolvedValueOnce({ exists: () => true, data: () => ({ name: "Refresh" }) });
        doc.mockReturnValue("userDocRef");

        render(
            <AuthUserProvider>
                <Consumer />
            </AuthUserProvider>
        );

        await act(async () => {
            await authCallback(mockUser);
        });

        const btn = screen.getByTestId("refresh");
        await act(async () => {
            btn.click();
        });

        expect(getDoc).toHaveBeenCalledTimes(2); // one for initial, one for refresh
    });

    // logout(): success and error branches
    test("logout clears user and handles error case", async () => {
        const mockUser = { uid: "999", email: "logout@example.com" };
        auth.currentUser = mockUser;
        auth.signOut.mockResolvedValueOnce();

        render(
            <AuthUserProvider>
                <Consumer />
            </AuthUserProvider>
        );

        await act(async () => {
            await authCallback(mockUser);
        });

        // ✅ Successful logout
        const logoutBtn = screen.getByTestId("logout");
        await act(async () => {
            logoutBtn.click();
        });

        expect(auth.signOut).toHaveBeenCalled();
        expect(screen.getByTestId("userEmail").textContent).toBe("");

        // ❌ Logout error branch
        auth.signOut.mockRejectedValueOnce(new Error("Error al cerrar sesión"));
        await act(async () => {
            logoutBtn.click();
        });

        expect(screen.getByTestId("authError").textContent).toContain("Error al cerrar sesión");
    });

    // Auth provider branch: Google login path
    test("creates profile with google auth provider", async () => {
        const mockUser = {
            uid: "456",
            email: "google@example.com",
            displayName: "GUser",
            providerData: [{ providerId: "google.com" }],
            metadata: {},
        };

        getDoc.mockResolvedValueOnce({ exists: () => false });
        setDoc.mockResolvedValueOnce();
        doc.mockReturnValue("userDocRef");

        render(
            <AuthUserProvider>
                <Consumer />
            </AuthUserProvider>
        );

        await act(async () => {
            await authCallback(mockUser);
        });

        expect(setDoc).toHaveBeenCalled();
    });

    // refreshUser(): does nothing when no user logged in
    test("refreshUser does nothing when no currentUser", async () => {
        auth.currentUser = null;
        render(
            <AuthUserProvider>
                <Consumer />
            </AuthUserProvider>
        );

        const btn = screen.getByTestId("refresh");
        await act(async () => {
            btn.click();
        });

        expect(getDoc).not.toHaveBeenCalled();
    });
});
