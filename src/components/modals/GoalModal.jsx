import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Button,
  Text,
  FormControl,
  FormLabel,
  NumberInput,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInputStepper,
  NumberInputField,
} from "@chakra-ui/react";
import { useTheme } from "../../context/ThemeContext/ThemeContext";

const GoalModal = ({
  isOpen,
  onClose,
  title,
  description,
  onConfirm,
  confirmButtonText = "Registrar",
  cancelButtonText = "Cancelar",
  initialValue = 1,
  isLoading = false,
  inputRef,
  unitType = "times",
  maxValue,
}) => {
  const { themeOptions } = useTheme();
  const [completionValue, setCompletionValue] = useState(initialValue);

  useEffect(() => {
    if (isOpen) {
      setCompletionValue(initialValue);
      setTimeout(() => {
        if (inputRef && inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  }, [isOpen, initialValue, inputRef]);

  const handleConfirmClick = () => {
    onConfirm(completionValue);
  };

  return (
    <AlertDialog isOpen={isOpen} onClose={onClose}>
      <AlertDialogOverlay backdropFilter="blur(10px) hue-rotate(90deg)">
        <AlertDialogContent borderRadius={themeOptions.borderRadius}>
          <AlertDialogHeader p={4} fontSize="lg" fontWeight={600}>
            {title}
          </AlertDialogHeader>
          <AlertDialogBody px={4}>
            <FormControl>
              <FormLabel>
                {description}
                <Text as="span" ml={1} fontWeight={600}>
                  {unitType}
                </Text>
              </FormLabel>
              <NumberInput
                min={1}
                max={maxValue}
                value={completionValue}
                onChange={(valueString) =>
                  setCompletionValue(parseInt(valueString) || 1)
                }
                ref={inputRef}
                isDisabled={isLoading}
              >
                <NumberInputField borderRadius={themeOptions.borderRadius} _focusVisible={{}} />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
          </AlertDialogBody>
          <AlertDialogFooter p={4}>
            <Button
              onClick={() => {
                onClose();
                setCompletionValue(initialValue);
              }}
              isDisabled={isLoading}
            >
              {cancelButtonText}
            </Button>
            <Button
              ml={3}
              colorScheme={themeOptions.focusColor}
              onClick={handleConfirmClick}
              isLoading={isLoading}
            >
              {confirmButtonText}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};

export default GoalModal;
