describe("firebaseConfig", () => {
    // Store the original environment variables to restore them later
    const OLD_ENV = process.env;

    beforeEach(() => {
        // Reset the module cache before each test to ensure that the new 
        // process.env values are read when the module is required.
        jest.resetModules();
        // Create a fresh clone of the original environment variables
        process.env = { ...OLD_ENV };
    });

    afterAll(() => {
        // Restore the original environment variables after all tests in this suite are done
        process.env = OLD_ENV;
    });

    it("should have all required keys populated from environment variables", () => {
        // 1. Set mock environment variables
        process.env.REACT_APP_API_KEY = "mock-api-key";
        process.env.REACT_APP_AUTH_DOMAIN = "mock-auth-domain";
        process.env.REACT_APP_PROJECT_ID = "mock-project-id";
        process.env.REACT_APP_STORAGE_BUCKET = "mock-storage-bucket";
        process.env.REACT_APP_MESSAGING_SENDER_ID = "mock-messaging-id";
        process.env.REACT_APP_APP_ID = "mock-app-id";

        // 2. Import the centralized module after setting the environment variables
        // NOTE: Updated path to './firebaseConfig'
        const { firebaseConfig } = require("./firebaseConfig");

        // 3. Assert the configuration object matches the mocked values
        expect(firebaseConfig).toEqual({
            apiKey: "mock-api-key",
            authDomain: "mock-auth-domain",
            projectId: "mock-project-id",
            storageBucket: "mock-storage-bucket",
            messagingSenderId: "mock-messaging-id",
            appId: "mock-app-id",
        });
    });

    it("should have undefined values if env variables are missing", () => {
        // 1. Delete the specific environment variables to simulate a missing config
        delete process.env.REACT_APP_API_KEY;
        delete process.env.REACT_APP_AUTH_DOMAIN;
        delete process.env.REACT_APP_PROJECT_ID;
        delete process.env.REACT_APP_STORAGE_BUCKET;
        delete process.env.REACT_APP_MESSAGING_SENDER_ID;
        delete process.env.REACT_APP_APP_ID;

        // 2. Import the centralized module after clearing the environment variables
        // NOTE: Updated path to './firebaseConfig'
        const { firebaseConfig } = require("./firebaseConfig");

        // 3. Assert the configuration object has 'undefined' for all missing keys
        expect(firebaseConfig).toEqual({
            apiKey: undefined,
            authDomain: undefined,
            projectId: undefined,
            storageBucket: undefined,
            messagingSenderId: undefined,
            appId: undefined,
        });
    });
});
