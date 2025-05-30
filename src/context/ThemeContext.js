import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const defaultTheme = {
    focusColor: "blue",
    fontFamily: "Outfit",
    borderRadius: "lg",
  };

  const [themeOptions, setThemeOptions] = useState(defaultTheme);

  useEffect(() => {
    const savedTheme = localStorage.getItem("themeOptions");
    if (savedTheme) {
      setThemeOptions(JSON.parse(savedTheme));
    }
  }, []);

  const updateTheme = (newThemeOptions) => {
    const updatedTheme = {
      ...themeOptions,
      ...newThemeOptions,
    };
    setThemeOptions(updatedTheme);
    localStorage.setItem("themeOptions", JSON.stringify(updatedTheme));
  };

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
