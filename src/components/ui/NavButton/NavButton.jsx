import { Button, Text, useTheme } from "@chakra-ui/react";
import PropTypes from "prop-types";

/**
 * NavButton component
 * 
 * A reusable navigation button for sidebar or menu items.
 * It supports an optional icon, active state styling, and a click handler.
 *
 * Props:
 * - icon: React node (optional) – an icon or element to display on the left.
 * - label: string (required) – the text to display inside the button.
 * - isActive: boolean (optional) – if true, button is styled as active.
 * - onClick: function (required) – callback when the button is clicked.
 */
const NavButton = ({ icon, label, isActive, onClick }) => {
  const { themeOptions } = useTheme(); // Get the theme context for colors and styling

  return (
    <Button
      px={2} // Horizontal padding
      w="100%" // Full width
      display="flex"
      alignItems="center" // Vertically center content
      justifyContent="flex-start" // Left-align content
      fontSize="sm" // Small font size
      onClick={onClick} // Click handler passed from props
      variant={isActive ? "solid" : "unstyled"} // Solid if active, otherwise unstyled
      colorScheme={isActive ? themeOptions.focusColor : "blackAlpha"} // Dynamic color based on active state
      leftIcon={icon} // Optional left icon
      _focusVisible={{}} // Remove default focus outline
    >
      <Text isTruncated>{label}</Text> {/* Truncate text if too long */}
    </Button>
  );
};

// PropTypes for type checking and documentation
NavButton.propTypes = {
  icon: PropTypes.node, // Can be any React element like an icon
  label: PropTypes.string.isRequired, // Text is required
  isActive: PropTypes.bool, // Boolean to indicate active state
  onClick: PropTypes.func.isRequired, // Function to handle click events
};

// Default props for optional props
NavButton.defaultProps = {
  icon: null, // No icon by default
  isActive: false, // Default to inactive
};

export default NavButton;
