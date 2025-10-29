module.exports = {
  testEnvironment: "jsdom",
  reporters: [
    "default",
    ["jest-html-reporter", {
      "pageTitle": "Test Report",
      "outputPath": "tests/test-report.html",
      "includeFailureMsg": true,
      "includeConsoleLog": true
    }]
  ],
  setupFilesAfterEnv: ["<rootDir>/src/tests/setup/jest.setup.js"],
  moduleNameMapper: {
    "\\.(css|scss|sass)$": "identity-obj-proxy",
    "\\.(jpg|jpeg|png|gif|svg)$": "<rootDir>/src/tests/setup/__mocks__/fileMock.js",
  },
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },
  transformIgnorePatterns: [
    "/node_modules/(?!(@chakra-ui|@emotion|framer-motion|firebase)/)"
  ],
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "\\.test\\.js?$",
    "\\.test\\.jsx?$",
    "\\.spec\\.jsx?$"
  ],
  moduleFileExtensions: ["js", "jsx", "ts", "tsx"],
};