import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import customTheme from "../../theme/theme";
import PropTypes from "prop-types";

// Create a React Context to store theme data globally
const ThemeContext = createContext();

/**
 * Custom hook to consume the ThemeContext.
 * This allows any component to access `themeOptions`, `updateTheme`, and `chakraTheme`.
 */
export const useTheme = () => useContext(ThemeContext);

/**
 * Retrieves initial theme settings from localStorage (if available),
 * or applies default values for each configurable theme property.
 * 
 * @returns {Object} Initial theme settings (focusColor, fontFamily, borderRadius)
 */
const getInitialThemeSettings = () => {
  const storedColor = localStorage.getItem('focusColor');
  const storedFontFamily = localStorage.getItem('fontFamily');
  const storedBorderRadius = localStorage.getItem('borderRadius');

  return {
    focusColor: storedColor || "orange", // Default primary color
    fontFamily: storedFontFamily || "Outfit", // Default font
    borderRadius: storedBorderRadius || "lg", // Default border radius
  };
};

/**
 * Wraps the application (or part of it) and provides theme data via React Context.
 * Handles reading, persisting, and updating theme options in real time.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The content that should have access to the theme.
 */
export const ThemeProvider = ({ children }) => {
  // Holds current theme configuration (color, font, radius)
  const [themeOptions, setThemeOptions] = useState(() => getInitialThemeSettings());

  // Stores the Chakra UI theme object, generated based on `themeOptions`
  const [chakraTheme, setChakraTheme] = useState(() =>
    customTheme(themeOptions.focusColor, themeOptions.fontFamily, themeOptions.borderRadius)
  );

  /**
   * Updates the Chakra UI theme whenever the user changes any theme option.
   * This ensures UI updates reactively when the theme changes.
   */
  useEffect(() => {
    const newChakraTheme = customTheme(
      themeOptions.focusColor,
      themeOptions.fontFamily,
      themeOptions.borderRadius
    );
    setChakraTheme(newChakraTheme);
  }, [themeOptions]);

  /**
   * Updates one or more theme settings.
   * The function also persists the new values in localStorage so that the theme
   * remains consistent across sessions.
   */
  const updateTheme = useCallback((newSettings) => {
    setThemeOptions((prevSettings) => {
      const updatedSettings = { ...prevSettings, ...newSettings };

      // Persist updates to localStorage
      localStorage.setItem("focusColor", updatedSettings.focusColor);
      localStorage.setItem("fontFamily", updatedSettings.fontFamily);
      localStorage.setItem("borderRadius", updatedSettings.borderRadius);

      return updatedSettings;
    });
  }, []);

  /**
   * Memoized context value to avoid unnecessary re-renders.
   * It only recalculates when one of its dependencies changes.
   */
  const contextValue = useMemo(() => ({
    themeOptions,
    updateTheme,
    chakraTheme,
  }), [themeOptions, updateTheme, chakraTheme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Prop validation: ensures the component receives valid props
ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
