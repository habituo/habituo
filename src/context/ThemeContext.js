import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const defaultTheme = {
    focusColor: "blue",
    fontFamily: "Inter",
    borderRadius: "lg",
  };

  const [themeOptions, setThemeOptions] = useState(defaultTheme);

  // Load theme from localStorage after mounting (avoids SSR issues)
  useEffect(() => {
    const savedTheme = localStorage.getItem("themeOptions");
    if (savedTheme) {
      setThemeOptions(JSON.parse(savedTheme));
    }
  }, []);

  // Update theme and persist in localStorage
  const updateTheme = (newThemeOptions) => {
    const updatedTheme = {
      ...themeOptions,
      ...newThemeOptions,
    };
    setThemeOptions(updatedTheme);
    localStorage.setItem("themeOptions", JSON.stringify(updatedTheme));
  };

  // Reset to default theme
  const resetTheme = () => {
    setThemeOptions(defaultTheme);
    localStorage.removeItem("themeOptions");
  };

  return (
    <ThemeContext.Provider value={{ themeOptions, updateTheme, resetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
