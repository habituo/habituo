import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  Text,
  HStack,
  VStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  Input,
  SimpleGrid,
  FormLabel,
  FormControl,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  MenuOptionGroup,
  MenuItemOption,
  useToast,
  useColorMode,
  useNumberInput,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Select,
} from "@chakra-ui/react";
import {
  createHabit,
  updateHabit,
  subscribeToAreas,
} from "../../../hooks/useDatabase";
import { useAuthUser } from "../../../context/AuthUserContext/AuthUserContext";
import { useTheme } from "../../../context/ThemeContext/ThemeContext";
import * as LuIcons from "react-icons/lu";
import { isValid, parseISO, format } from "date-fns";
import { EmojiSelector } from "../../../exports";
import PropTypes from "prop-types";

/**
 * Maps day index (0-6, starting with Sunday) to a single-letter label (Spanish).
 * @type {{[key: number]: string}}
 */
const dayMap = {
  0: "Dom", // Sunday (Domingo)
  1: "Lun", // Monday (Lunes)
  2: "Mar", // Tuesday (Martes)
  3: "Mie", // Wednesday (Miércoles)
  4: "Jue", // Thursday (Jueves)
  5: "Vie", // Friday (Viernes)
  6: "Sab", // Saturday (Sábado)
};

/**
 * Labels for the different repetition types (Spanish).
 * @type {{[key: string]: string}}
 */
const repetitionTypeLabels = {
  diary: "Diario",
  monthly: "Mensual",
  interval: "Intervalo",
};

/**
 * Gets today's date formatted as "yyyy-MM-dd" for use in date inputs.
 * @returns {string} The current date string.
 */
const getTodayDateString = () => format(new Date(), "yyyy-MM-dd");

/**
 * Converts a date value (string, Date, or Firebase Timestamp) to the "yyyy-MM-dd"
 * format required by HTML date inputs.
 * @param {string | Date | {toDate: function}} dateValue - The date value to convert.
 * @returns {string} The date formatted as "yyyy-MM-dd" or today's date if invalid.
 */
const convertDateToInputFormat = (dateValue) => {
  if (!dateValue) return getTodayDateString();
  let date;
  if (typeof dateValue?.toDate === "function") {
    // Handle Firebase Timestamp object
    date = dateValue.toDate();
  } else if (dateValue instanceof Date) {
    date = dateValue;
  } else {
    try {
      // Handle ISO string
      date = parseISO(dateValue);
    } catch (e) {
      // Log error but don't stop execution
      console.error("Error parsing date in convertDateToInputFormat:", e);
      return getTodayDateString();
    }
  }
  return isValid(date) ? format(date, "yyyy-MM-dd") : getTodayDateString();
};

/**
 * Provides the default initial state for the habit form.
 * If a habit is passed (for editing), it loads its data; otherwise, it provides a default new habit structure.
 * @param {object | null} selectedHabit - The habit object to edit, or null for a new habit.
 * @returns {object} The initial form data state.
 */
const getDefaultFormData = (selectedHabit) => {
  const today = getTodayDateString();

  if (selectedHabit) {
    return {
      name: selectedHabit.name || "",
      icon: selectedHabit.icon || "💪",
      reminder: selectedHabit.reminder || "",
      goals: {
        value: selectedHabit.goals?.value || 1,
        unit: selectedHabit.goals?.unit || "times",
        period: selectedHabit.goals?.period || "day",
      },
      repetition: {
        type: selectedHabit.repetition?.type || "diary",
        days: selectedHabit.repetition?.days || [],
        dayOfMonth: selectedHabit.repetition?.dayOfMonth || 1,
        // Ensure interval is a string for input consistency
        interval: `${selectedHabit.repetition?.interval || "1"}`,
      },
      area: selectedHabit.area || null,
      startDate: convertDateToInputFormat(selectedHabit.startDate),
    };
  }

  // Default state for a new habit
  return {
    name: "",
    icon: "💪",
    reminder: "",
    goals: { value: 1, unit: "times", period: "day" },
    repetition: {
      type: "diary",
      days: [],
      dayOfMonth: 1,
      interval: "1",
    },
    area: null,
    startDate: today,
  };
};

/**
 * Custom hook to encapsulate the entire logic for the habit creation/editing form.
 * Handles state, data loading (areas), change handlers, validation, and save operations.
 * @param {object | null} selectedHabit - The habit being edited, or null for creation.
 * @param {boolean} isOpen - Whether the modal is currently open.
 * @param {function} onHabitSaved - Callback function to run after a successful save.
 * @returns {object} An object containing all necessary state and handlers for the form.
 */
const useHabitForm = (selectedHabit, isOpen, onHabitSaved) => {
  const { user } = useAuthUser();
  const toast = useToast();

  const [formData, setFormData] = useState(() =>
    getDefaultFormData(selectedHabit)
  );
  const [areas, setAreas] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Effect to reset or load form data when the modal opens/closes or the habit changes.
  useEffect(() => {
    if (!isOpen) {
      // Reset to default new habit state on close to prepare for next open
      setFormData(getDefaultFormData(null));
      setFormErrors({});
      return;
    }

    // Load selected habit data or default new habit data when opening
    setFormData(getDefaultFormData(selectedHabit));
    setFormErrors({});
  }, [isOpen, selectedHabit]);

  /**
   * Checks if the currently selected area ID exists in the list of fetched areas.
   * @param {Array<object>} areas - List of user's areas.
   * @param {string | null} areaId - The ID of the currently selected area.
   * @returns {boolean} True if the area is valid and exists, false otherwise.
   */
  const isAreaValid = (areas, areaId) =>
    areas.some((area) => area.id === areaId);

  // Effect to subscribe to user areas for the Area dropdown field.
  useEffect(() => {
    if (!user?.uid || !isOpen) {
      setAreas([]);
      return;
    }

    const handleAreasData = (fetchedAreas) => {
      const areasToSet = Array.isArray(fetchedAreas) ? fetchedAreas : [];
      setAreas(areasToSet);

      // Adjust the selected area if the current one is invalid or not set
      setFormData((prev) => {
        const valid = isAreaValid(areasToSet, prev.area);

        if (!prev.area || !valid) {
          return {
            ...prev,
            // Automatically select the first area if available, otherwise set to null
            area: areasToSet.length > 0 ? areasToSet[0].id : null,
          };
        }

        return prev;
      });
    };

    const handleAreasError = (error) => {
      toast({
        title: <Text fontWeight={600}>Error al cargar las áreas areas</Text>,
        description:
          "No se han podido cargar las áreas. Prueba a recargar la página.",
        status: "error",
        position: "bottom",
      });
    };

    // Subscribes to real-time updates of areas
    const unsubscribe = subscribeToAreas(
      user.uid,
      handleAreasData,
      handleAreasError
    );

    // Cleanup function to unsubscribe when the component unmounts or dependencies change
    return () => unsubscribe();
  }, [user?.uid, isOpen, toast]);

  /**
   * General handler for simple input changes (name, startDate, reminder).
   */
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFormErrors((prev) => ({ ...prev, [name]: "" })); // Clear specific error
  }, []);

  /**
   * Handler for selecting the Area from the Menu.
   */
  const handleAreaSelect = useCallback((value) => {
    setFormData((prev) => ({ ...prev, area: value }));
    setFormErrors((prev) => ({ ...prev, area: "" })); // Clear error
  }, []);

  /**
   * Handler for selecting the Icon (Emoji).
   */
  const handleIconSelect = useCallback((emoji) => {
    setFormData((prev) => ({ ...prev, icon: emoji }));
  }, []);

  /**
   * Handler for changing the Repetition Type (Diary, Monthly, Interval).
   */
  const handleRepetitionTypeChange = useCallback((value) => {
    setFormData((prev) => ({
      ...prev,
      repetition: {
        ...prev.repetition,
        type: value,
        // Reset related fields when type changes to ensure clean data
        days: [],
        dayOfMonth: 1,
        interval: "1",
      },
    }));
    setFormErrors((prev) => ({ ...prev, "repetition.type": "" }));
  }, []);

  /**
   * Handler for changing Goal-related fields (value, unit, period).
   * @param {string} name - The goal field name ('value', 'unit', or 'period').
   * @param {number | string} value - The new value.
   */
  const handleGoalChange = useCallback((name, value) => {
    setFormData((prev) => ({
      ...prev,
      goals: {
        ...prev.goals,
        [name]: value,
      },
    }));
    setFormErrors((prev) => ({ ...prev, [`goals.${name}`]: "" }));
  }, []);

  /**
   * Handler for selecting/deselecting days of the week (for 'diary' type).
   * @param {number} dayIndex - The index of the day (0=Sun, 6=Sat).
   */
  const handleSelectedDaysChange = useCallback((dayIndex) => {
    setFormData((prev) => {
      const isSelected = prev.repetition.days.includes(dayIndex);
      const newDays = isSelected
        ? prev.repetition.days.filter((d) => d !== dayIndex) // Remove
        : [...prev.repetition.days, dayIndex]; // Add

      return {
        ...prev,
        repetition: {
          ...prev.repetition,
          // Sort days for consistency
          days: newDays.sort((a, b) => a - b),
        },
      };
    });
    setFormErrors((prev) => ({ ...prev, "repetition.days": "" }));
  }, []);

  /**
   * Handler for changing the day of the month (for 'monthly' type).
   * @param {string} _ - Value as string (ignored).
   * @param {number} valueAsNumber - Value as number.
   */
  const handleSelectedMonthDayChange = useCallback((_, valueAsNumber) => {
    setFormData((prev) => ({
      ...prev,
      repetition: {
        ...prev.repetition,
        // Default to 1 if not a valid number
        dayOfMonth: Number.isNaN(valueAsNumber) ? 1 : valueAsNumber,
      },
    }));
    setFormErrors((prev) => ({ ...prev, "repetition.dayOfMonth": "" }));
  }, []);

  /**
   * Handler for changing the repetition interval (for 'interval' type).
   * @param {string} _ - Value as string (ignored).
   * @param {number} valueAsNumber - Value as number.
   */
  const handleRepeatIntervalValueChange = useCallback((_, valueAsNumber) => {
    setFormData((prev) => ({
      ...prev,
      repetition: {
        ...prev.repetition,
        // Store as string in formData, default to '1' if not a valid number
        interval: `${Number.isNaN(valueAsNumber) ? 1 : valueAsNumber}`,
      },
    }));
    setFormErrors((prev) => ({ ...prev, "repetition.interval": "" }));
  }, []);

  // --- Validation and Save

  /**
   * Performs client-side validation on the form data.
   * Sets formErrors state with relevant messages.
   * @returns {boolean} True if the form is valid, false otherwise.
   */
  const validateForm = useCallback(() => {
    const errors = {};

    // 1. Name Validation
    if (!formData.name.trim()) {
      errors.name = "The habit name cannot be empty.";
    } else if (formData.name.trim().length > 30) {
      errors.name = "The habit name cannot exceed 30 characters.";
    } else if (!/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.name)) {
      errors.name = "Only letters, numbers, and spaces are allowed.";
    }

    // 2. Area Validation
    if (!formData.area) {
      errors.area = "You must select an area for the habit.";
    }

    // 3. Goals Value Validation
    if (
      Number.isNaN(formData.goals.value) ||
      formData.goals.value < 1 ||
      formData.goals.value > 9999
    ) {
      errors["goals.value"] = "The goal must be a number between 1 and 9999.";
    }

    // 4. Repetition Type-Specific Validation
    switch (formData.repetition.type) {
      case "diary":
        if (
          !Array.isArray(formData.repetition.days) ||
          formData.repetition.days.length === 0
        ) {
          errors["repetition.days"] =
            "You must select at least one day of the week.";
        }
        break;
      case "monthly":
        if (
          Number.isNaN(formData.repetition.dayOfMonth) ||
          formData.repetition.dayOfMonth < 1 ||
          formData.repetition.dayOfMonth > 31
        ) {
          errors["repetition.dayOfMonth"] =
            "The day of the month must be between 1 and 31.";
        }
        break;
      case "interval": {
        // Parse the interval value as an integer
        const intervalValue = Number.parseInt(formData.repetition.interval, 10);

        if (
          Number.isNaN(intervalValue) ||
          intervalValue < 1 ||
          intervalValue > 31
        ) {
          errors["repetition.interval"] = `The value must be between 1 and 31.`;
        }
        break;
      }
      default:
        errors["repetition.type"] = "Invalid repetition type selected.";
        break;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]); // Dependencies include formData to re-run validation logic on change

  /**
   * Handles the saving process (create or update) after validation.
   * @param {function} onClose - Function to close the modal, passed from the component.
   */
  const handleSave = useCallback(
    async (onClose) => {
      // Pre-validation checks
      if (!user?.uid) {
        toast({
          title: <Text fontWeight={600}>Error de autenticación</Text>,
          description: "Por favor, inicia sesión de nuevo",
          status: "error",
          position: "bottom",
        });
        return;
      }

      // Run validation
      if (!validateForm()) {
        toast({
          title: <Text fontWeight={600}>Revisa el formulario</Text>,
          description:
            "Hay algunos errores en los campos. Corrígelos para continuar.",
          status: "error",
          position: "bottom",
        });
        return;
      }

      setIsSaving(true);
      try {
        // Convert the string startDate back to a Date object (or Firebase Timestamp)
        const dataToSave = {
          ...formData,
          // Use parseISO to convert "yyyy-MM-dd" string to Date object
          startDate: formData.startDate ? parseISO(formData.startDate) : null,
        };

        if (selectedHabit) {
          // Update existing habit
          await updateHabit(
            user.uid,
            formData.area,
            selectedHabit.id,
            dataToSave
          );
          toast({
            title: <Text fontWeight={600}>Habit Updated</Text>,
            description: `"${formData.name}" se ha actualizado correctamente.`,
            status: "success",
            position: "bottom",
          });
        } else {
          // Create new habit
          await createHabit(user.uid, formData.area, dataToSave);
          toast({
            title: <Text fontWeight={600}>Hábito creado</Text>,
            description: `Se ha creado "${formData.name}" correctamente.`,
            status: "success",
            position: "bottom",
          });
        }
        onClose(true); // Close the modal, indicating success
        if (onHabitSaved) {
          onHabitSaved(true); // Call external success callback
        }
      } catch (error) {
        // Display error toast on failure
        toast({
          title: <Text fontWeight={600}>Save Error</Text>,
          description:
            error.message || "Could not save the habit. Please try again.",
          status: "error",
          position: "bottom",
        });
      } finally {
        setIsSaving(false); // End loading state
      }
    },
    // Dependencies list ensures the save logic uses the latest state/props/functions
    [user, formData, selectedHabit, validateForm, onHabitSaved, toast]
  );

  /**
   * Memoized value to find the currently selected area object for display.
   */
  const currentSelectedArea = useMemo(() => {
    return (areas || []).find((area) => area.id === formData.area);
  }, [areas, formData.area]);

  return {
    formData,
    formErrors,
    areas,
    isSaving,
    isEditing: !!selectedHabit,
    currentSelectedArea,
    // Exporting all handlers
    handleChange,
    handleAreaSelect,
    handleIconSelect,
    handleRepetitionTypeChange,
    handleGoalChange,
    handleSelectedDaysChange,
    handleSelectedMonthDayChange,
    handleRepeatIntervalValueChange,
    handleSave,
  };
};

/**
 * Renders a clickable button for selecting a day of the week.
 * @param {object} props - Component props.
 */
const DayButton = ({
  dayIndex,
  label,
  isSelected,
  handleSelectedDaysChange,
  themeOptions,
}) => {
  return (
    <Button
      size="sm"
      variant={isSelected ? "solid" : "outline"}
      colorScheme={isSelected ? themeOptions.focusColor : "gray"}
      onClick={() => handleSelectedDaysChange(dayIndex)}
      w="full"
    >
      {label}
    </Button>
  );
};

DayButton.propTypes = {
  dayIndex: PropTypes.number.isRequired,
  label: PropTypes.string.isRequired,
  isSelected: PropTypes.bool.isRequired,
  handleSelectedDaysChange: PropTypes.func.isRequired,
  themeOptions: PropTypes.shape({
    focusColor: PropTypes.string.isRequired,
  }).isRequired,
};

/**
 * Modal component for creating or editing a habit.
 * Integrates the useHabitForm hook for all form logic.
 * @param {object} props - Component props.
 */
const HabitModal = ({ isOpen, onClose, selectedHabit, onHabitSaved }) => {
  const { themeOptions } = useTheme();
  const { colorMode } = useColorMode();
  const initialFocusRef = useRef(null); // Ref for initial focus element

  // Destructure state and handlers from the custom hook
  const {
    formData,
    formErrors,
    areas,
    isSaving,
    currentSelectedArea,
    handleChange,
    handleAreaSelect,
    handleIconSelect,
    handleRepetitionTypeChange,
    handleGoalChange,
    handleSelectedDaysChange,
    handleSelectedMonthDayChange,
    handleRepeatIntervalValueChange,
    handleSave,
  } = useHabitForm(selectedHabit, isOpen, onHabitSaved);

  // 1. Goal Value Number Input
  const {
    getInputProps: getGoalInputProps,
    getIncrementButtonProps: getGoalIncrementButtonProps,
    getDecrementButtonProps: getGoalDecrementButtonProps,
  } = useNumberInput({
    step: 1,
    min: 1,
    max: 9999,
    value: formData.goals.value,
    onChange: (_, valueAsNumber) => {
      // The onChange fires with valueAsNumber when step buttons are used
      handleGoalChange(
        "value",
        // Ensure value is at least 1 if not a valid number
        Number.isNaN(valueAsNumber) ? 1 : valueAsNumber
      );
    },
  });

  // 2. Monthly Day Number Input
  const {
    getInputProps: getMonthDayInputProps,
    getIncrementButtonProps: getMonthDayIncrementButtonProps,
    getDecrementButtonProps: getMonthDayDecrementButtonProps,
  } = useNumberInput({
    step: 1,
    min: 1,
    max: 31,
    value: formData.repetition.dayOfMonth,
    // The handler expects (val, valNum) signature from useNumberInput
    onChange: handleSelectedMonthDayChange,
  });

  // 3. Interval Repetition Number Input
  const {
    getInputProps: getIntervalInputProps,
    getIncrementButtonProps: getIntervalIncrementButtonProps,
    getDecrementButtonProps: getIntervalDecrementButtonProps,
  } = useNumberInput({
    step: 1,
    min: 1,
    max: 31,
    // Convert string interval to number for useNumberInput
    value: Number.parseInt(formData.repetition.interval || "1", 10),
    onChange: handleRepeatIntervalValueChange,
  });

  // --- Rendered Modal Content ---
  return (
    <Modal
      size={{ base: "full", md: "xl" }}
      isOpen={isOpen}
      onClose={() => onClose(false)}
      scrollBehavior="inside"
      initialFocusRef={initialFocusRef}
    >
      <ModalOverlay backdropFilter="blur(10px) hue-rotate(90deg)" />
      <ModalContent
        borderRadius={themeOptions.borderRadius}
        color={colorMode === "light" ? "gray.800" : "gray.100"}
      >
        <ModalHeader
          borderBottom="1px solid"
          borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
        >
          {selectedHabit ? "Editar " : "Crear "} hábito
        </ModalHeader>
        <ModalCloseButton
          top={4}
          right={4}
          borderRadius={themeOptions.borderRadius}
          _focusVisible={{}}
        />
        <ModalBody
          py={4}
          overflowX="hidden"
          borderBottom="1px solid"
          borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
        >
          <VStack spacing={4}>
            {/* Name and Icon */}
            <HStack
              w="full"
              alignItems="stretch"
              justifyContent="space-between"
              spacing={4}
            >
              <FormControl w="90%" isRequired isInvalid={!!formErrors.name}>
                <FormLabel>Nombre del hábito</FormLabel>
                <Input
                  ref={initialFocusRef}
                  type="text"
                  name="name"
                  placeholder="Ej. Beber agua"
                  value={formData.name}
                  onChange={handleChange}
                  maxLength={30}
                  borderRadius={themeOptions.borderRadius}
                  _focusVisible={{}}
                />
                {formErrors.name && (
                  <Text fontSize="sm" color="red.500" mt={1}>
                    {formErrors.name}
                  </Text>
                )}
              </FormControl>
              <FormControl w="auto" zIndex={1}>
                <FormLabel userSelect="none" color="transparent">
                  .
                </FormLabel>
                <EmojiSelector
                  selectedEmoji={formData.icon}
                  onSelect={handleIconSelect}
                  borderRadius={themeOptions.borderRadius}
                  themeOptions={themeOptions}
                />
              </FormControl>
            </HStack>

            {/* Goals Section */}
            <VStack
              w="full"
              align="start"
              spacing={2}
              p={4}
              pt={2}
              border="2px dashed var(--chakra-colors-chakra-border-color)"
              borderRadius={themeOptions.borderRadius}
            >
              <FormLabel>Meta a lograr</FormLabel>
              <HStack w="full" spacing={4}>
                <FormControl isInvalid={!!formErrors["goals.value"]}>
                  <NumberInput
                    min={1}
                    max={9999}
                    value={formData.goals.value}
                    borderRadius={themeOptions.borderRadius}
                  >
                    <NumberInputField
                      {...getGoalInputProps()}
                      borderRadius={themeOptions.borderRadius}
                      _focusVisible={{}}
                    />
                    <NumberInputStepper>
                      <NumberIncrementStepper
                        {...getGoalIncrementButtonProps()}
                      />
                      <NumberDecrementStepper
                        {...getGoalDecrementButtonProps()}
                      />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
                <FormControl>
                  <Select
                    name="unit"
                    value={formData.goals.unit}
                    onChange={(e) => handleGoalChange("unit", e.target.value)}
                    borderRadius={themeOptions.borderRadius}
                    _focusVisible={{}}
                  >
                    <option value="times">veces</option>
                    <option value="minutes">minutos</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <Select
                    name="period"
                    value={formData.goals.period}
                    onChange={(e) => handleGoalChange("period", e.target.value)}
                    borderRadius={themeOptions.borderRadius}
                    _focusVisible={{}}
                  >
                    <option value="day">por día</option>
                    <option value="week">por semana</option>
                    <option value="month">al mes</option>
                  </Select>
                </FormControl>
              </HStack>
              {formErrors["goals.value"] && (
                <Text fontSize="sm" color="red.500" mt={1}>
                  {formErrors["goals.value"]}
                </Text>
              )}
            </VStack>

            {/* Repetition Section */}
            <VStack
              w="full"
              align="start"
              spacing={2}
              p={4}
              pt={2}
              border="2px dashed var(--chakra-colors-chakra-border-color)"
              borderRadius={themeOptions.borderRadius}
            >
              <FormLabel>Repetición</FormLabel>
              <HStack w="full" flexDirection={{base: "column", md: "row"}} align="start" spacing={4}>
                {/* Repetition Type Selector */}
                <FormControl w={{base: "100%", md: "40%"}}>
                  <Menu closeOnSelect={true}>
                    <MenuButton
                      as={Button}
                      rightIcon={<Icon as={LuIcons.LuChevronDown} />}
                      w="100%"
                      variant="outline"
                      textAlign="left"
                      borderRadius={themeOptions.borderRadius}
                      _focusVisible={{}}
                    >
                      {repetitionTypeLabels[formData.repetition.type] ||
                        "Selecciona tipo"}
                    </MenuButton>
                    <MenuList borderRadius={themeOptions.borderRadius}>
                      <MenuOptionGroup
                        type="radio"
                        value={formData.repetition.type}
                        onChange={handleRepetitionTypeChange}
                      >
                        <MenuItemOption value="diary">Diario</MenuItemOption>
                        <MenuItemOption value="monthly">Mensual</MenuItemOption>
                        <MenuItemOption value="interval">
                          Intervalo
                        </MenuItemOption>
                      </MenuOptionGroup>
                    </MenuList>
                  </Menu>
                </FormControl>

                {/* Day Selector (Diary) */}
                {formData.repetition.type === "diary" && (
                  <FormControl
                    w={{base: "100%", md: "60%"}}
                    isRequired
                    isInvalid={!!formErrors["repetition.days"]}
                  >
                    <SimpleGrid columns={4} spacing={2}>
                      {Object.entries(dayMap).map(([index, label]) => {
                        const numericIndex = Number.parseInt(index, 10);
                        return (
                          <DayButton
                            key={index}
                            dayIndex={numericIndex}
                            label={label}
                            isSelected={formData.repetition.days.includes(
                              numericIndex
                            )}
                            handleSelectedDaysChange={handleSelectedDaysChange}
                            themeOptions={themeOptions}
                          />
                        );
                      })}
                    </SimpleGrid>
                    {formErrors["repetition.days"] && (
                      <Text fontSize="sm" color="red.500" mt={1}>
                        {formErrors["repetition.days"]}
                      </Text>
                    )}
                  </FormControl>
                )}

                {/* Day of Month Selector (Monthly) */}
                {formData.repetition.type === "monthly" && (
                  <FormControl w={{base: "100%", md: "60%"}} isRequired>
                    <NumberInput
                      value={formData.repetition.dayOfMonth}
                      onChange={(val, valNum) =>
                        handleSelectedMonthDayChange(val, valNum)
                      }
                      min={1}
                      max={31}
                      borderRadius={themeOptions.borderRadius}
                    >
                      <NumberInputField
                        {...getMonthDayInputProps()}
                        borderRadius={themeOptions.borderRadius}
                        _focusVisible={{}}
                      />
                      <NumberInputStepper>
                        <NumberIncrementStepper
                          {...getMonthDayIncrementButtonProps()}
                        />
                        <NumberDecrementStepper
                          {...getMonthDayDecrementButtonProps()}
                        />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                )}

                {/* Interval Selector (Interval) */}
                {formData.repetition.type === "interval" && (
                  <FormControl
                    width="60%"
                    isRequired
                    isInvalid={!!formErrors["repetition.interval"]}
                  >
                    <NumberInput
                      value={Number.parseInt(
                        formData.repetition.interval?.replace("every ", "") ||
                          "1",
                        10
                      )}
                      onChange={(val, valNum) =>
                        handleRepeatIntervalValueChange(val, valNum)
                      }
                      min={1}
                      max={31}
                      borderRadius={themeOptions.borderRadius}
                    >
                      <NumberInputField
                        {...getIntervalInputProps()}
                        borderRadius={themeOptions.borderRadius}
                        _focusVisible={{}}
                      />
                      <NumberInputStepper>
                        <NumberIncrementStepper
                          {...getIntervalIncrementButtonProps()}
                        />
                        <NumberDecrementStepper
                          {...getIntervalDecrementButtonProps()}
                        />
                      </NumberInputStepper>
                    </NumberInput>
                    {formErrors["repetition.interval"] && (
                      <Text fontSize="sm" color="red.500" mt={1}>
                        {formErrors["repetition.interval"]}
                      </Text>
                    )}
                  </FormControl>
                )}
              </HStack>
              {formData.repetition.type === "interval" && (
                <Text mb={-2}>
                  Cada {formData.repetition.interval} día
                  {formData.repetition.interval > 1 ? "s" : ""}
                </Text>
              )}
            </VStack>

            {/* Area and Start Date */}
            <HStack w="100%" flexDirection={{base: "column", md: "row"}} align="start" spacing={4}>
              <FormControl w={{base: "100%", md: "60%"}} isRequired isInvalid={!!formErrors.area}>
                <FormLabel>Área</FormLabel>
                <Menu closeOnSelect={false}>
                  <MenuButton
                    as={Button}
                    name="area"
                    w="100%"
                    variant="outline"
                    textAlign="left"
                    borderRadius={themeOptions.borderRadius}
                    iconSpacing={2}
                    _focusVisible={{}}
                    leftIcon={currentSelectedArea?.icon}
                  >
                    <Text isTruncated>
                      {currentSelectedArea?.name || "Selecciona área"}
                    </Text>
                  </MenuButton>
                  <MenuList borderRadius={themeOptions.borderRadius}>
                    {(areas || []).length > 0 ? (
                      <MenuOptionGroup
                        type="radio"
                        value={formData.area ?? ""}
                        onChange={handleAreaSelect}
                      >
                        {areas.map((area) => {
                          return (
                            <MenuItemOption
                              _checked={{
                                bg:
                                  colorMode === "light"
                                    ? `${themeOptions.focusColor}.50`
                                    : "whiteAlpha.100",
                                color:
                                  colorMode === "light"
                                    ? `${themeOptions.focusColor}.70`
                                    : `${themeOptions.focusColor}.200`,
                              }}
                              key={area.id}
                              value={area.id}
                            >
                              <HStack>
                                <Text>
                                  {area.icon} {area.name}
                                </Text>
                              </HStack>
                            </MenuItemOption>
                          );
                        })}
                      </MenuOptionGroup>
                    ) : (
                      <MenuItemOption isDisabled>
                        No hay áreas disponibles.
                      </MenuItemOption>
                    )}
                  </MenuList>
                </Menu>
                {formErrors.area && (
                  <Text fontSize="sm" color="red.500" mt={1}>
                    {formErrors.area}
                  </Text>
                )}
              </FormControl>
              <FormControl w={{base: "100%", md: "40%"}}>
                <FormLabel>Fecha de comienzo</FormLabel>
                <Input
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  borderRadius={themeOptions.borderRadius}
                  _focusVisible={{}}
                />
              </FormControl>
            </HStack>
          </VStack>
        </ModalBody>

        <ModalFooter p={4}>
          <Button mr={3} onClick={() => onClose(false)} isDisabled={isSaving}>
            Cancelar
          </Button>
          <Button
            colorScheme={themeOptions.focusColor}
            onClick={handleSave}
            isLoading={isSaving}
            loadingText="Guardando..."
          >
            {selectedHabit ? "Guardar cambios" : "Crear hábito"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// --- PropTypes for HabitModal ---
HabitModal.propTypes = {
  /** Flag to control the visibility of the modal. */
  isOpen: PropTypes.bool.isRequired,
  /** Callback function to close the modal. Accepts a boolean (true if saved, false if cancelled). */
  onClose: PropTypes.func.isRequired,
  /** The habit object currently being edited, or null if creating a new habit. */
  selectedHabit: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
    icon: PropTypes.string,
    reminder: PropTypes.string,
    goals: PropTypes.shape({
      value: PropTypes.number,
      unit: PropTypes.string,
      period: PropTypes.string,
    }),
    repetition: PropTypes.shape({
      type: PropTypes.string,
      days: PropTypes.arrayOf(PropTypes.number),
      dayOfMonth: PropTypes.number,
      interval: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), // Added number for more flexibility
    }),
    area: PropTypes.string,
    // Firebase timestamp object or date string
    startDate: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  }),
  /** Optional callback to run after the habit is successfully saved or updated. */
  onHabitSaved: PropTypes.func,
};

HabitModal.defaultProps = {
  selectedHabit: null,
  onHabitSaved: () => {},
};

export default HabitModal;
