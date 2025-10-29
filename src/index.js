import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider } from '@chakra-ui/react';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ThemeProvider, useTheme } from './context/ThemeContext/ThemeContext';
import { AuthUserProvider } from './context/AuthUserContext/AuthUserContext';
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";

/**
 * External wrappers for global analytics and performance tracking.
 */
const ExternalProviders = ({ children }) => (
  <Analytics>
    <SpeedInsights>{children}</SpeedInsights>
  </Analytics>
);


/**
 * Root component that applies global theme, analytics, and authentication context.
 */
export const Root = () => {
  const { chakraTheme } = useTheme();

  return (
    <ExternalProviders>
      <ChakraProvider theme={chakraTheme}>
        <AuthUserProvider>
          <App />
        </AuthUserProvider>
      </ChakraProvider>
    </ExternalProviders>
  );
};

// Mount the app
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <ThemeProvider>
      <Root />
    </ThemeProvider>
  </React.StrictMode>
);

// Optional: track performance metrics
reportWebVitals();
