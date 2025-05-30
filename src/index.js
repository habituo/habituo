import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ChakraProvider } from '@chakra-ui/react';
import customTheme from "./theme/theme";
import { ThemeProvider } from './context/ThemeContext';
import { AuthUserProvider } from './context/AuthUserContext';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <ChakraProvider theme={customTheme()}>
        <ThemeProvider>
          <AuthUserProvider>
            <App />
          </AuthUserProvider>
        </ThemeProvider>
    </ChakraProvider>
  </React.StrictMode>
);

reportWebVitals();
