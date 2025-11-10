import React from "react";
import {
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Button,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import { useTheme } from "../../../context/ThemeContext/ThemeContext";
import PropTypes from "prop-types";

/**
 * A reusable confirmation dialog (AlertDialog) component built with Chakra UI.
 * It's used to ask the user for confirmation before performing a destructive or important action.
 *
 * @param {object} props - Component props.
 * @param {boolean} props.isOpen - Controls the visibility of the modal.
 * @param {function} props.onClose - Function to be called when the modal is dismissed (e.g., clicking Cancel or Overlay).
 * @param {string} props.title - The main heading of the dialog.
 * @param {string} props.description - The detailed text describing the action to confirm.
 * @param {function} props.onConfirm - Function to be executed when the user clicks the confirmation button.
 * @param {string} [props.confirmButtonText="Sí, confirmar"] - Text for the confirmation button (usually red).
 * @param {string} [props.cancelButtonText="No, cancelar"] - Text for the cancel button.
 * @returns {JSX.Element} The Confirmation Modal component.
 */
const ConfirmationModal = ({
  isOpen,
  onClose,
  title,
  description,
  onConfirm,
  confirmButtonText = "Sí, confirmar",
  cancelButtonText = "No, cancelar",
}) => {
  const { themeOptions } = useTheme();
  const { colorMode } = useColorMode();

  // Create a ref for the cancel button, which is required by Chakra's AlertDialog
  // to manage focus accessibility upon mounting.
  const cancelRef = React.useRef(null);

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef} // Set the least destructive action (Cancel) for initial focus
      onClose={onClose}
    >
      {/* Apply a blurred and hue-rotated backdrop for visual effect */}
      <AlertDialogOverlay backdropFilter="blur(10px) hue-rotate(90deg)">
        <AlertDialogContent
          borderRadius={themeOptions.borderRadius}
          color={colorMode === "light" ? "gray.800" : "gray.100"}
        >
          {/* Dialog Header: Displays the title of the action */}
          <AlertDialogHeader p={4} fontSize="lg" fontWeight={600}>
            {title}
          </AlertDialogHeader>

          {/* Dialog Body: Displays the descriptive text */}
          <AlertDialogBody px={4}>
            <Text fontSize="md">{description}</Text>
          </AlertDialogBody>

          {/* Dialog Footer: Contains action buttons */}
          <AlertDialogFooter p={4}>
            {/* Cancel Button */}
            <Button ref={cancelRef} onClick={onClose}>
              {cancelButtonText}
            </Button>
            {/* Confirm Button (colored red to indicate a potentially destructive action) */}
            <Button colorScheme="red" onClick={onConfirm} ml={3}>
              {confirmButtonText}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};

// --- PropTypes Definition ---
ConfirmationModal.propTypes = {
  /** Flag to control the visibility of the modal. (Required) */
  isOpen: PropTypes.bool.isRequired,
  /** Callback function to close the modal (e.g., when clicking Cancel or Overlay). (Required) */
  onClose: PropTypes.func.isRequired,
  /** The main title/heading for the confirmation request. (Required) */
  title: PropTypes.string.isRequired,
  /** The descriptive text detailing what the user is confirming. (Required) */
  description: PropTypes.string.isRequired,
  /** Function to execute when the 'confirm' button is clicked. (Required) */
  onConfirm: PropTypes.func.isRequired,
  /** Custom text for the confirmation button. (Optional, defaults to "Sí, confirmar") */
  confirmButtonText: PropTypes.string,
  /** Custom text for the cancel button. (Optional, defaults to "No, cancelar") */
  cancelButtonText: PropTypes.string,
};

export default ConfirmationModal;
