import React, { useState, useEffect } from "react";
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
  Box,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  FormLabel,
  FormControl,
  Icon,
  Stack,
  Checkbox,
  CheckboxGroup,
  Menu,
  MenuButton,
  MenuList,
  MenuOptionGroup,
  MenuItemOption,
  useToast,
  useColorMode,
  useNumberInput,
} from "@chakra-ui/react";
import { serverTimestamp } from "firebase/firestore";
import {
  addHabit as addHabitToDb,
  updateHabit as updateHabitInDb,
  getAreas as getAreasFromDb,
} from "../hooks/database";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import * as LuIcons from "react-icons/lu";

const ModalHabit = ({ isOpen, onClose, selectedHabit }) => {
  // Default configuration
  const { user } = useAuth();
  const { themeOptions } = useTheme();
  const { colorMode } = useColorMode();
  const toast = useToast();

  // Modal data variables
  const [habitName, setHabitName] = useState("");
  const [searchIcon, setSearchIcon] = useState("");
  const [visibleIcons, setVisibleIcons] = useState(30);
  const [selectedIcon, setSelectedIcon] = useState("LuActivity");
  const [goalValue, setGoalValue] = useState(1);
  const [goalUnit, setGoalUnit] = useState("times");
  const [goalPeriod, setGoalPeriod] = useState("day");
  const [repeatInterval, setRepeatInterval] = useState("day");
  const [repeatType, setRepeatType] = useState("day");
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedRepeatInterval, setSelectedRepeatInterval] = useState("1");
  const [selectedMonthDay, setSelectedMonthDay] = useState(1);
  const [reminderTime, setReminderTime] = useState("");
  const [startDate, setStartDate] = useState("");
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState("");

  // Errors and labels
  const [error, setError] = useState("");

  /**
   * Validates the habit name in real time.
   * It checks if the input value is not empty and contains only letters, numbers, and spaces.
   * If the validation fails, it sets an error message.
   * @function validateName
   * @param {string} value - The current value of the habit name input.
   * @returns {boolean} - True if the name is valid, false otherwise.
   */
  const validateName = (value) => {
    if (!value.trim()) {
      setError("El nombre del hábito no puede estar vacío.");
      return false;
    }
    if (!/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ ]+$/.test(value)) {
      setError("Solo se permiten letras, números y espacios.");
      return false;
    }
    setError("");
    return true;
  };

  /**
   * Loads more icons for the user to select from.
   * It increments the number of visible icons in the icon selection interface.
   * @function loadMoreIcons
   * @returns {void}
   */
  const loadMoreIcons = () => {
    setVisibleIcons((prev) => prev + 30);
  };

  /**
   * Filters the available icons based on the user's search input.
   * It converts both the icon name and the search term to lowercase for case-insensitive filtering.
   * @constant filteredIcons
   * @type {Array<string>}
   */
  const filteredIcons = Object.keys(LuIcons).filter((iconName) =>
    iconName.toLowerCase().includes(searchIcon.toLowerCase())
  );

  /**
   * Handles the save operation for a habit (either creating a new one or updating an existing one).
   * It first validates the habit name and checks if a user and area are selected.
   * If validation passes, it constructs the habit data object and calls the appropriate database function
   * (addHabitToDb or updateHabitInDb). It also displays a success or error toast notification.
   * @async
   * @function handleSave
   * @returns {void}
   */
  const handleSave = async () => {
    if (!validateName(habitName) || !user || !selectedArea) {
      if (!selectedArea) {
        toast({
          title: <Text fontWeight="600">Seleccionar área</Text>,
          description: "Debes seleccionar un área antes de continuar.",
          status: "error",
          position: "bottom",
        });
      } else if (!validateName(habitName)) {
        toast({
          title: <Text fontWeight="600">Revisa el nombre del hábito</Text>,
          description: error,
          status: "error",
          position: "bottom",
        });
      }
      return;
    }

    const habitData = {
      name: habitName,
      icon: selectedIcon,
      goal: { value: goalValue, unit: goalUnit, period: goalPeriod },
      repeat: {
        type: repeatType,
        days: repeatType === "day" ? selectedDays : [],
        dayOfMonth: repeatType === "month" ? selectedMonthDay : null,
        interval: repeatType === "interval" ? repeatInterval : null,
      },
      area: selectedArea,
      reminder: reminderTime,
      startDate: startDate,
    };

    try {
      if (selectedHabit) {
        await updateHabitInDb(selectedArea, selectedHabit.id, habitData);
        toast({
          title: <Text fontWeight="600">Hábito actualizado</Text>,
          description: `El hábito "${habitName}" ha sido actualizado correctamente.`,
          status: "success",
          position: "bottom",
        });
      } else {
        habitData.createdAt = serverTimestamp();
        await addHabitToDb(selectedArea, habitData);
        toast({
          title: <Text fontWeight="600">Hábito creado</Text>,
          description: `El hábito "${habitName}" ha sido creado correctamente.`,
          status: "success",
          position: "bottom",
        });
      }
      onClose();
    } catch (error) {
      toast({
        title: <Text fontWeight="600">Error al guardar</Text>,
        description: "No se pudo guardar el hábito. Inténtalo de nuevo.",
        status: "error",
        position: "bottom",
      });
    }
  };

  /**
   * Provides properties for controlling a number input component from Chakra UI.
   * It sets the step, default value, minimum, maximum, current value, and an onChange handler.
   * @constant {object} numberInputProps
   */
  const { getInputProps, getIncrementButtonProps, getDecrementButtonProps } =
    useNumberInput({
      step: 1,
      defaultValue: 1,
      min: 1,
      max: 9999,
      value: goalValue,
      onChange: (value) => setGoalValue(value),
    });

  const inc = getIncrementButtonProps();
  const dec = getDecrementButtonProps();
  const inputProps = getInputProps({
    fontSize: "sm",
    h: "2.5rem",
    borderRadius: themeOptions.borderRadius,
    _focusVisible: "none",
    w: "100%",
  });

  /**
   * Fetches the user's areas from Firestore when the component mounts or when the user changes.
   * It uses the `getAreasFromDb` function and updates the `areas` state.
   * If editing a habit, it also ensures that the selected area is still valid; otherwise, it resets the selected area.
   * @useEffect
   * @dependency {[user, selectedHabit]} - This effect runs when the user object or the selectedHabit object changes.
   * @returns {void}
   */
  useEffect(() => {
    if (user) {
      getAreasFromDb((fetchedAreas) => {
        setAreas(fetchedAreas);
        if (
          selectedHabit &&
          !fetchedAreas.find((area) => area.id === selectedHabit.area)
        ) {
          setSelectedArea("");
        }
      });
    }
  }, [user, selectedHabit]);

  /**
   * Resets the form state when the modal opens.
   * It populates the form fields with the data of the selected habit if in edit mode,
   * or sets them to default empty values if creating a new habit.
   * @useEffect
   * @dependency {[isOpen, selectedHabit]} - This effect runs when the modal's open state or the selectedHabit object changes.
   * @returns {void}
   */
  useEffect(() => {
    if (isOpen) {
      setHabitName(selectedHabit?.name || "");
      setSearchIcon("");
      setSelectedIcon(selectedHabit?.icon || "LuActivity");
      setGoalValue(selectedHabit?.goal?.value || 1);
      setGoalUnit(selectedHabit?.goal?.unit || "times");
      setGoalPeriod(selectedHabit?.goal?.period || "day");
      setRepeatInterval(selectedHabit?.repeat?.interval || "day");
      setRepeatType(selectedHabit?.repeat?.type || "day");
      setSelectedDays(selectedHabit?.repeat?.days || []);
      setSelectedRepeatInterval(selectedHabit?.repeat?.interval || "1");
      setSelectedMonthDay(selectedHabit?.repeat?.dayOfMonth || 1);
      setReminderTime(selectedHabit?.reminder || "");
      setStartDate(selectedHabit?.startDate || "");
      setSelectedArea(selectedHabit?.area || "");
      setError("");
    }
  }, [isOpen, selectedHabit]);

  return (
    <Modal size="xl" isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent
        borderRadius={themeOptions.borderRadius}
        bg={colorMode === "light" ? "rgb(245, 245, 245)" : "rgb(23, 23, 23)"}
      >
        <ModalHeader p={4}>
          {selectedHabit ? "Editar " : "Crear "} hábito
        </ModalHeader>
        <ModalCloseButton
          top={2}
          right={2}
          borderRadius={themeOptions.borderRadius}
        />
        <ModalBody px={4}>
          <VStack alignItems="stretch" spacing={4}>
            <HStack spacing={4}>
              {/* Habit name */}
              <FormControl w="70%" isInvalid={!!error}>
                <FormLabel
                  htmlFor="habit-name"
                  fontSize="xs"
                  fontWeight={600}
                  textTransform="uppercase"
                  color={colorMode === "light" ? "#00000050" : "#FFFFFF50"}
                >
                  Nombre del hábito
                </FormLabel>
                <Input
                  id="habit-name"
                  value={habitName}
                  size="sm"
                  h="2.5rem"
                  borderRadius={themeOptions.borderRadius}
                  _focusVisible="none"
                  onChange={(e) => setHabitName(e.target.value)}
                  onBlur={(e) => validateName(e.target.value)}
                />
              </FormControl>

              {/* Habit icon */}
              <FormControl w="10%">
                <FormLabel
                  htmlFor="habit-icon"
                  fontSize="xs"
                  fontWeight={600}
                  textTransform="uppercase"
                  color={colorMode === "light" ? "#00000050" : "#FFFFFF50"}
                >
                  Icono
                </FormLabel>
                <Popover id="habit-icon" placement="bottom-start">
                  <PopoverTrigger>
                    <Button>
                      {React.createElement(LuIcons[selectedIcon])}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    p={2}
                    borderRadius={themeOptions.borderRadius}
                    bg={
                      colorMode === "light"
                        ? "rgb(245, 245, 245)"
                        : "rgb(23, 23, 23)"
                    }
                  >
                    <Input
                      placeholder="Buscar icono..."
                      value={searchIcon}
                      size="sm"
                      h="2.5rem"
                      borderRadius={themeOptions.borderRadius}
                      _focusVisible="none"
                      onChange={(e) => {
                        setSearchIcon(e.target.value);
                        setVisibleIcons(30);
                      }}
                    />
                    <SimpleGrid
                      columns={5}
                      spacing={1}
                      mt={2}
                      maxH="200px"
                      overflowY="auto"
                      overflowX="hidden"
                      userSelect="none"
                      sx={{
                        "&::-webkit-scrollbar": {
                          width: "4px",
                        },
                        "&::-webkit-scrollbar-thumb": {
                          backgroundColor: `var(--chakra-colors-${themeOptions.focusColor}-200)`,
                          borderRadius: "4px",
                        },
                        "&::-webkit-scrollbar-thumb:hover": {
                          backgroundColor: `var(--chakra-colors-${themeOptions.focusColor}-400)`,
                        },
                        "&::-webkit-scrollbar-track": {
                          backgroundColor: "transparent",
                          borderRadius: "4px",
                        },
                      }}
                    >
                      {filteredIcons.slice(0, visibleIcons).map((iconName) => (
                        <Box
                          key={iconName}
                          as={Button}
                          onClick={() => setSelectedIcon(iconName)}
                          p={2}
                          textAlign="center"
                          borderRadius={themeOptions.borderRadius}
                          _hover={{
                            bg:
                              colorMode === "light"
                                ? `${themeOptions.focusColor}.100`
                                : `${themeOptions.focusColor}.700`,
                          }}
                          transition=".1s all linear"
                        >
                          {React.createElement(LuIcons[iconName], { size: 20 })}
                        </Box>
                      ))}
                    </SimpleGrid>
                    {filteredIcons.length > visibleIcons && (
                      <Button size="sm" mt={2} onClick={loadMoreIcons}>
                        Cargar más
                      </Button>
                    )}
                  </PopoverContent>
                </Popover>
              </FormControl>

              {/* Habit reminder */}
              <FormControl w="20%">
                <FormLabel
                  htmlFor="habit-reminder"
                  fontSize="xs"
                  fontWeight={600}
                  textTransform="uppercase"
                  color={colorMode === "light" ? "#00000050" : "#FFFFFF50"}
                >
                  Recordatorio
                </FormLabel>
                <Input
                  type="time"
                  value={reminderTime}
                  size="sm"
                  h="2.5rem"
                  borderRadius={themeOptions.borderRadius}
                  border="1px solid var(--chakra-colors-chakra-border-color)"
                  _focusVisible="none"
                  onChange={(e) => setReminderTime(e.target.value)}
                />
              </FormControl>
            </HStack>

            {/* Habit goal */}
            <HStack>
              <FormControl>
                <FormLabel
                  htmlFor="habit-name"
                  fontSize="xs"
                  fontWeight={600}
                  textTransform="uppercase"
                  color={colorMode === "light" ? "#00000050" : "#FFFFFF50"}
                >
                  Meta a lograr
                </FormLabel>
                <HStack spacing={4}>
                  <HStack w="33.33333%">
                    <Button {...dec}>-</Button>
                    <Input id="goal-value" {...inputProps} />
                    <Button {...inc}>+</Button>
                  </HStack>
                  <Menu closeOnSelect={true}>
                    <MenuButton
                      as={Button}
                      size="sm"
                      w="33.33333%"
                      h="2.5rem"
                      variant="ghost"
                      textAlign="left"
                      border="1px solid var(--chakra-colors-chakra-border-color)"
                      borderRadius={themeOptions.borderRadius}
                      _focusVisible="none"
                    >
                      {goalUnit === "times" ? "Veces" : "Minutos"}
                    </MenuButton>
                    <MenuList
                      borderRadius={themeOptions.borderRadius}
                      bg={
                        colorMode === "light"
                          ? "var(--menu-bg)"
                          : "rgb(23, 23, 23)"
                      }
                    >
                      <MenuOptionGroup
                        type="radio"
                        value={goalUnit}
                        onChange={(value) => setGoalUnit(value)}
                      >
                        <MenuItemOption
                          bg={
                            colorMode === "light"
                              ? "var(--menu-bg)"
                              : "rgb(23, 23, 23)"
                          }
                          _hover={{
                            bg:
                              colorMode === "light"
                                ? "rgb(237 242 247)"
                                : "rgba(255, 255, 255, 0.06)",
                          }}
                          value="times"
                        >
                          Veces
                        </MenuItemOption>
                        <MenuItemOption
                          bg={
                            colorMode === "light"
                              ? "var(--menu-bg)"
                              : "rgb(23, 23, 23)"
                          }
                          _hover={{
                            bg:
                              colorMode === "light"
                                ? "rgb(237 242 247)"
                                : "rgba(255, 255, 255, 0.06)",
                          }}
                          value="minutes"
                        >
                          Minutos
                        </MenuItemOption>
                      </MenuOptionGroup>
                    </MenuList>
                  </Menu>
                  <Menu closeOnSelect={false}>
                    <MenuButton
                      as={Button}
                      size="sm"
                      w="33.33333%"
                      h="2.5rem"
                      variant="ghost"
                      textAlign="left"
                      border="1px solid var(--chakra-colors-chakra-border-color)"
                      borderRadius={themeOptions.borderRadius}
                      _focusVisible="none"
                    >
                      {goalPeriod === "day"
                        ? "Al día"
                        : goalPeriod === "week"
                        ? "A la semana"
                        : "Al mes"}
                    </MenuButton>
                    <MenuList
                      borderRadius={themeOptions.borderRadius}
                      bg={
                        colorMode === "light"
                          ? "var(--menu-bg)"
                          : "rgb(23, 23, 23)"
                      }
                    >
                      <MenuOptionGroup
                        type="radio"
                        value={goalPeriod}
                        onChange={(value) => setGoalPeriod(value)}
                      >
                        <MenuItemOption
                          bg={
                            colorMode === "light"
                              ? "var(--menu-bg)"
                              : "rgb(23, 23, 23)"
                          }
                          _hover={{
                            bg:
                              colorMode === "light"
                                ? "rgb(237 242 247)"
                                : "rgba(255, 255, 255, 0.06)",
                          }}
                          value="day"
                        >
                          Al día
                        </MenuItemOption>
                        <MenuItemOption
                          bg={
                            colorMode === "light"
                              ? "var(--menu-bg)"
                              : "rgb(23, 23, 23)"
                          }
                          _hover={{
                            bg:
                              colorMode === "light"
                                ? "rgb(237 242 247)"
                                : "rgba(255, 255, 255, 0.06)",
                          }}
                          value="week"
                        >
                          A la semana
                        </MenuItemOption>
                        <MenuItemOption
                          bg={
                            colorMode === "light"
                              ? "var(--menu-bg)"
                              : "rgb(23, 23, 23)"
                          }
                          _hover={{
                            bg:
                              colorMode === "light"
                                ? "rgb(237 242 247)"
                                : "rgba(255, 255, 255, 0.06)",
                          }}
                          value="month"
                        >
                          Al més
                        </MenuItemOption>
                      </MenuOptionGroup>
                    </MenuList>
                  </Menu>
                </HStack>
              </FormControl>
            </HStack>

            {/* Habit repeat */}
            <HStack>
              <FormControl>
                <FormLabel
                  htmlFor="habit-repeat"
                  fontSize="xs"
                  fontWeight={600}
                  textTransform="uppercase"
                  color={colorMode === "light" ? "#00000050" : "#FFFFFF50"}
                >
                  Repetición
                </FormLabel>
                <HStack spacing={4}>
                  <Menu closeOnSelect={false}>
                    <MenuButton
                      as={Button}
                      size="sm"
                      w="33.33333%"
                      h="2.5rem"
                      variant="ghost"
                      textAlign="left"
                      border="1px solid var(--chakra-colors-chakra-border-color)"
                      borderRadius={themeOptions.borderRadius}
                      _focusVisible="none"
                      onChange={(e) => setReminderTime(e.target.value)}
                    >
                      {repeatType === "day"
                        ? "Diario"
                        : repeatType === "month"
                        ? "Mensual"
                        : "Intervalo"}
                    </MenuButton>
                    <MenuList
                      borderRadius={themeOptions.borderRadius}
                      bg={
                        colorMode === "light"
                          ? "var(--menu-bg)"
                          : "rgb(23, 23, 23)"
                      }
                    >
                      <MenuOptionGroup
                        type="radio"
                        value={repeatType}
                        onChange={(value) => setRepeatType(value)}
                      >
                        <MenuItemOption
                          bg={
                            colorMode === "light"
                              ? "var(--menu-bg)"
                              : "rgb(23, 23, 23)"
                          }
                          _hover={{
                            bg:
                              colorMode === "light"
                                ? "rgb(237 242 247)"
                                : "rgba(255, 255, 255, 0.06)",
                          }}
                          value="day"
                        >
                          Diario
                        </MenuItemOption>
                        <MenuItemOption
                          bg={
                            colorMode === "light"
                              ? "var(--menu-bg)"
                              : "rgb(23, 23, 23)"
                          }
                          _hover={{
                            bg:
                              colorMode === "light"
                                ? "rgb(237 242 247)"
                                : "rgba(255, 255, 255, 0.06)",
                          }}
                          value="month"
                        >
                          Mensual
                        </MenuItemOption>
                        <MenuItemOption
                          bg={
                            colorMode === "light"
                              ? "var(--menu-bg)"
                              : "rgb(23, 23, 23)"
                          }
                          _hover={{
                            bg:
                              colorMode === "light"
                                ? "rgb(237 242 247)"
                                : "rgba(255, 255, 255, 0.06)",
                          }}
                          value="interval"
                        >
                          Intervalo
                        </MenuItemOption>
                      </MenuOptionGroup>
                    </MenuList>
                  </Menu>
                  {repeatType === "day" && (
                    <Popover>
                      <PopoverTrigger>
                        <Button
                          as={Button}
                          size="sm"
                          w="70%"
                          h="2.5rem"
                          variant="ghost"
                          justifyContent="flex-start"
                          border="1px solid var(--chakra-colors-chakra-border-color)"
                          borderRadius={themeOptions.borderRadius}
                          overflow="hidden"
                        >
                          {selectedDays.length > 0
                            ? selectedDays.join(", ")
                            : "Seleccionar días"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        borderRadius={themeOptions.borderRadius}
                        bg={
                          colorMode === "light"
                            ? "var(--menu-bg)"
                            : "rgb(23, 23, 23)"
                        }
                      >
                        <PopoverBody px={0} py={2}>
                          <CheckboxGroup
                            value={selectedDays}
                            onChange={setSelectedDays}
                          >
                            <Stack direction="column" spacing={0}>
                              {[
                                "Lunes",
                                "Martes",
                                "Miércoles",
                                "Jueves",
                                "Viernes",
                                "Sábado",
                                "Domingo",
                              ].map((day, index) => (
                                <Checkbox
                                  px={2}
                                  py={1}
                                  key={index}
                                  value={day}
                                  _hover={{
                                    bg:
                                      colorMode === "light"
                                        ? "rgb(237 242 247)"
                                        : "rgba(255, 255, 255, 0.06)",
                                  }}
                                >
                                  {day}
                                </Checkbox>
                              ))}
                            </Stack>
                          </CheckboxGroup>
                        </PopoverBody>
                      </PopoverContent>
                    </Popover>
                  )}

                  {repeatType === "month" && (
                    <Input
                      type="date"
                      size="sm"
                      w="70%"
                      h="2.5rem"
                      borderRadius={themeOptions.borderRadius}
                      border="1px solid var(--chakra-colors-chakra-border-color)"
                      _focusVisible="none"
                      onChange={(e) => setSelectedMonthDay(e.target.value)}
                    />
                  )}

                  {repeatType === "interval" && (
                    <Menu closeOnSelect={true}>
                      <MenuButton
                        as={Button}
                        size="sm"
                        w="70%"
                        h="2.5rem"
                        variant="ghost"
                        textAlign="left"
                        border="1px solid var(--chakra-colors-chakra-border-color)"
                        borderRadius={themeOptions.borderRadius}
                        _focusVisible="none"
                      >
                        {"Repetir cada " + selectedRepeatInterval}
                      </MenuButton>
                      <MenuList
                        borderRadius={themeOptions.borderRadius}
                        bg={
                          colorMode === "light"
                            ? "var(--menu-bg)"
                            : "rgb(23, 23, 23)"
                        }
                      >
                        <MenuOptionGroup
                          type="radio"
                          value={selectedRepeatInterval}
                          onChange={(value) => setSelectedRepeatInterval(value)}
                        >
                          <MenuItemOption
                            bg={
                              colorMode === "light"
                                ? "var(--menu-bg)"
                                : "rgb(23, 23, 23)"
                            }
                            _hover={{
                              bg:
                                colorMode === "light"
                                  ? "rgb(237 242 247)"
                                  : "rgba(255, 255, 255, 0.06)",
                            }}
                            value="1"
                          >
                            Repetir cada 1
                          </MenuItemOption>
                          <MenuItemOption
                            bg={
                              colorMode === "light"
                                ? "var(--menu-bg)"
                                : "rgb(23, 23, 23)"
                            }
                            _hover={{
                              bg:
                                colorMode === "light"
                                  ? "rgb(237 242 247)"
                                  : "rgba(255, 255, 255, 0.06)",
                            }}
                            value="2"
                          >
                            Repetir cada 2
                          </MenuItemOption>
                          <MenuItemOption
                            bg={
                              colorMode === "light"
                                ? "var(--menu-bg)"
                                : "rgb(23, 23, 23)"
                            }
                            _hover={{
                              bg:
                                colorMode === "light"
                                  ? "rgb(237 242 247)"
                                  : "rgba(255, 255, 255, 0.06)",
                            }}
                            value="3"
                          >
                            Repetir cada 3
                          </MenuItemOption>
                          <MenuItemOption
                            bg={
                              colorMode === "light"
                                ? "var(--menu-bg)"
                                : "rgb(23, 23, 23)"
                            }
                            _hover={{
                              bg:
                                colorMode === "light"
                                  ? "rgb(237 242 247)"
                                  : "rgba(255, 255, 255, 0.06)",
                            }}
                            value="4"
                          >
                            Repetir cada 4
                          </MenuItemOption>
                          <MenuItemOption
                            bg={
                              colorMode === "light"
                                ? "var(--menu-bg)"
                                : "rgb(23, 23, 23)"
                            }
                            _hover={{
                              bg:
                                colorMode === "light"
                                  ? "rgb(237 242 247)"
                                  : "rgba(255, 255, 255, 0.06)",
                            }}
                            value="5"
                          >
                            Repetir cada 5
                          </MenuItemOption>
                          <MenuItemOption
                            bg={
                              colorMode === "light"
                                ? "var(--menu-bg)"
                                : "rgb(23, 23, 23)"
                            }
                            _hover={{
                              bg:
                                colorMode === "light"
                                  ? "rgb(237 242 247)"
                                  : "rgba(255, 255, 255, 0.06)",
                            }}
                            value="6"
                          >
                            Repetir cada 6
                          </MenuItemOption>
                          <MenuItemOption
                            bg={
                              colorMode === "light"
                                ? "var(--menu-bg)"
                                : "rgb(23, 23, 23)"
                            }
                            _hover={{
                              bg:
                                colorMode === "light"
                                  ? "rgb(237 242 247)"
                                  : "rgba(255, 255, 255, 0.06)",
                            }}
                            value="7"
                          >
                            Repetir cada 7
                          </MenuItemOption>
                        </MenuOptionGroup>
                      </MenuList>
                    </Menu>
                  )}
                </HStack>
              </FormControl>
            </HStack>

            {/* Habit start on area... */}
            <HStack spacing={4}>
              <FormControl>
                <HStack>
                  <Box w="50%">
                    <FormLabel
                      htmlFor="habit-area"
                      fontSize="xs"
                      fontWeight={600}
                      textTransform="uppercase"
                      color={colorMode === "light" ? "#00000050" : "#FFFFFF50"}
                    >
                      Áreas
                    </FormLabel>
                    <Menu closeOnSelect={false}>
                      <MenuButton
                        as={Button}
                        size="sm"
                        w="100%"
                        h="2.5rem"
                        variant="ghost"
                        textAlign="left"
                        border="1px solid var(--chakra-colors-chakra-border-color)"
                        borderRadius={themeOptions.borderRadius}
                        iconSpacing={2}
                        _focusVisible="none"
                        leftIcon={
                          selectedArea &&
                          areas.find((area) => area.id === selectedArea)
                            ?.icon ? (
                            LuIcons[
                              areas.find((area) => area.id === selectedArea)
                                ?.icon
                            ] ? (
                              React.createElement(
                                LuIcons[
                                  areas.find((area) => area.id === selectedArea)
                                    ?.icon
                                ],
                                { size: "16px" }
                              )
                            ) : (
                              <LuIcons.LuGroup size="16px" />
                            )
                          ) : (
                            <LuIcons.LuGroup size="16px" />
                          )
                        }
                      >
                        {selectedArea
                          ? areas.find((area) => area.id === selectedArea)?.name
                          : "Selecciona área"}
                      </MenuButton>
                      <MenuList
                        borderRadius={themeOptions.borderRadius}
                        bg={
                          colorMode === "light"
                            ? "var(--menu-bg)"
                            : "rgb(23, 23, 23)"
                        }
                      >
                        <MenuOptionGroup
                          type="radio"
                          value={selectedArea}
                          onChange={(value) => setSelectedArea(value)}
                        >
                          {areas.map((area) => (
                            <MenuItemOption
                              bg={
                                colorMode === "light"
                                  ? "var(--menu-bg)"
                                  : "rgb(23, 23, 23)"
                              }
                              _hover={{
                                bg:
                                  colorMode === "light"
                                    ? "rgb(237 242 247)"
                                    : "rgba(255, 255, 255, 0.06)",
                              }}
                              key={area.id}
                              value={area.id}
                            >
                              {area.icon && LuIcons[area.icon] ? (
                                <Icon
                                  as={LuIcons[area.icon]}
                                  boxSize="16px"
                                  mr={2}
                                />
                              ) : (
                                <Icon
                                  as={LuIcons.LuFolder}
                                  boxSize="16px"
                                  mr={2}
                                />
                              )}
                              <span>{area.name}</span>
                            </MenuItemOption>
                          ))}
                        </MenuOptionGroup>
                      </MenuList>
                    </Menu>
                  </Box>

                  <Box w="50%">
                    <FormLabel
                      htmlFor="habit-start"
                      fontSize="xs"
                      fontWeight={600}
                      textTransform="uppercase"
                      color={colorMode === "light" ? "#00000050" : "#FFFFFF50"}
                    >
                      Fecha de comienzo
                    </FormLabel>
                    <Input
                      type="date"
                      value={startDate}
                      size="sm"
                      h="2.5rem"
                      border="1px solid var(--chakra-colors-chakra-border-color)"
                      borderRadius={themeOptions.borderRadius}
                      _focusVisible="none"
                      onChange={(e) => {
                        setStartDate(e.target.value);
                      }}
                    />
                  </Box>
                </HStack>
              </FormControl>
            </HStack>
          </VStack>
        </ModalBody>

        <ModalFooter p={4}>
          <Button onClick={onClose} mr={3}>
            Cancelar
          </Button>
          <Button colorScheme={themeOptions.focusColor} onClick={handleSave}>
            {selectedHabit ? "Guardar" : "Crear"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ModalHabit;
