import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from "./context/AuthContext";
import { ChakraProvider } from '@chakra-ui/react';
import customTheme from "./theme/theme";
import { ThemeProvider } from './context/ThemeContext';

// Generate 'root' element
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <ChakraProvider theme={customTheme()}>
      <AuthProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </AuthProvider>
    </ChakraProvider>
  </React.StrictMode>
);

// Execute Google metrics
reportWebVitals();
