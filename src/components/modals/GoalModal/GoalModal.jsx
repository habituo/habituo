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
import { useTheme } from "../../../context/ThemeContext/ThemeContext";
import PropTypes from "prop-types";

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
        if (inputRef?.current) {
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
                  setCompletionValue(Number.parseInt(valueString) || 1)
                }
                ref={inputRef}
                isDisabled={isLoading}
              >
                <NumberInputField
                  borderRadius={themeOptions.borderRadius}
                  _focusVisible={{}}
                />
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

GoalModal.propTypes = {
  /** Flag to control the visibility of the modal. */
  isOpen: PropTypes.bool.isRequired,
  /** Callback function to close the modal. */
  onClose: PropTypes.func.isRequired,
  /** Title text displayed in the modal header. */
  title: PropTypes.node.isRequired,
  /** Description text displayed above the number input. */
  description: PropTypes.node.isRequired,
  /** Callback function executed on confirming the action. Receives the final number value. */
  onConfirm: PropTypes.func.isRequired,
  /** Text for the confirm button. */
  confirmButtonText: PropTypes.string,
  /** Text for the cancel button. */
  cancelButtonText: PropTypes.string,
  /** Initial number value for the input field. */
  initialValue: PropTypes.number,
  /** Flag to show loading state on buttons and disable input. */
  isLoading: PropTypes.bool,
  /** React ref object to apply focus to the NumberInput field. */
  inputRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  ]),
  /** The unit type for the goal (e.g., 'times', 'minutes'). */
  unitType: PropTypes.oneOf(["times", "minutes"]),
  /** The maximum allowed value for the number input. */
  maxValue: PropTypes.number,
};

// Default Props Definition (Good practice for optional props)
GoalModal.defaultProps = {
  confirmButtonText: "Registrar",
  cancelButtonText: "Cancelar",
  initialValue: 1,
  isLoading: false,
  inputRef: null,
  unitType: "times",
  maxValue: undefined, // undefined to let NumberInput handle its defaults
};

export default GoalModal;
