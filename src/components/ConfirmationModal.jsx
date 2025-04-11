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
import { useTheme } from "../context/ThemeContext";

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

  return (
    <AlertDialog isOpen={isOpen} onClose={onClose} isCentered>
      <AlertDialogOverlay>
        <AlertDialogContent
          borderRadius={themeOptions.borderRadius}
          bg={colorMode === "light" ? "rgb(245, 245, 245)" : "rgb(23, 23, 23)"}
        >
          <AlertDialogHeader p={4} fontSize="lg" fontWeight="600">
            {title}
          </AlertDialogHeader>
          <AlertDialogBody px={4}>
            <Text fontSize="md">{description}</Text>
          </AlertDialogBody>
          <AlertDialogFooter p={4}>
            <Button ref={React.createRef()} onClick={onClose}>
              {cancelButtonText}
            </Button>
            <Button colorScheme="red" onClick={onConfirm} ml={3}>
              {confirmButtonText}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};

export default ConfirmationModal;
