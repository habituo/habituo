import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider } from '@chakra-ui/react';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ThemeProvider, useTheme } from './context/ThemeContext/ThemeContext';
import { AuthUserProvider } from './context/AuthUserContext/AuthUserContext';

/**
 * Root component that applies the theme and authentication context.
 */
const Root = () => {
  const { chakraTheme } = useTheme();

  return (
    <ChakraProvider theme={chakraTheme}>
      <AuthUserProvider>
        <App />
      </AuthUserProvider>
    </ChakraProvider>
  );
};


// Mount the app to the DOM
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
