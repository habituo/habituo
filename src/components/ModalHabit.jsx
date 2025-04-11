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
  FormErrorMessage,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
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
} from "@chakra-ui/react";
import { db } from "../hooks/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
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

  // Validate the name on real time
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

  // Lazy load icons
  const loadMoreIcons = () => {
    setVisibleIcons((prev) => prev + 30);
  };

  const filteredIcons = Object.keys(LuIcons).filter((iconName) =>
    iconName.toLowerCase().includes(searchIcon.toLowerCase())
  );

  const handleSave = async () => {
    if (!validateName(habitName) || !user || !selectedArea) {
      if (!selectedArea) {
        toast({
          title: <Text fontWeight="600">Seleccionar área</Text>,
          description: "Debes seleccionar un área antes de continuar.",
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

  // Fetch areas from Firestore
  const fetchAreas = async () => {
    if (!user) return;

    const userId = user.uid;
    const areasRef = collection(db, `users/${userId}/areas`);

    try {
      const snapshot = await getDocs(areasRef);
      const areasList = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        icon: doc.data().icon || "LuFolder",
      }));

      setAreas(areasList);
    } catch (error) {
      toast({
        title: <Text fontWeight="600">Error al cargar</Text>,
        description: "No se pudo cargar las áreas. Inténtalo de nuevo.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom-center",
        containerStyle: { borderRadius: themeOptions.borderRadius },
      });
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchAreas();
  }, [user]);

  // Reset form state when modal opens for creating a new habit
  useEffect(() => {
    if (isOpen && !selectedHabit) {
      setHabitName("");
      setSearchIcon("");
      setSelectedIcon("LuActivity");
      setGoalValue(1);
      setGoalUnit("times");
      setGoalPeriod("day");
      setRepeatInterval("day");
      setRepeatType("day");
      setSelectedDays([]);
      setSelectedRepeatInterval("1");
      setSelectedMonthDay(1);
      setReminderTime("");
      setStartDate("");
      setSelectedArea("");
      setError(""); // Clear any previous errors
    } else if (isOpen && selectedHabit) {
      setHabitName(selectedHabit.name || "");
      setSelectedIcon(selectedHabit.icon || "LuActivity");
      setGoalValue(selectedHabit.goal?.value || 1);
      setGoalUnit(selectedHabit.goal?.unit || "times");
      setGoalPeriod(selectedHabit.goal?.period || "day");
      setRepeatInterval(selectedHabit.interval?.value || "day");
      setRepeatType(selectedHabit.repeat?.type || "day");
      setSelectedDays(selectedHabit.repeat?.days || []);
      setSelectedRepeatInterval(selectedHabit.repeat?.interval || "1");
      setSelectedMonthDay(selectedHabit.repeat?.dayOfMonth || 1);
      setSelectedArea(selectedHabit.area || "");
      setReminderTime(selectedHabit.reminder || "");
      setStartDate(selectedHabit.startDate || "");
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
          {selectedHabit ? "Editar hábito" : "Crear un nuevo hábito"}
        </ModalHeader>
        <ModalCloseButton
          top={2}
          right={2}
          borderRadius={themeOptions.borderRadius}
        />
        <ModalBody px={4}>
          <FormLabel
            mb={1}
            fontSize="xs"
            textTransform="uppercase"
            opacity={0.5}
          >
            Nombre
          </FormLabel>
          <HStack mb={2} alignItems="flex-start">
            <FormControl isInvalid={error}>
              <VStack w="100%" alignItems="flex-start" spacing={0}>
                <Input
                  type="text"
                  variant="outline"
                  size="sm"
                  h="2.5rem"
                  placeholder="Nombre del hábito"
                  borderRadius={themeOptions.borderRadius}
                  borderWidth={1}
                  borderColor={`var(--chakra-colors-chakra-border-color)`}
                  _focusVisible="none"
                  _hover={{
                    bg: "none",
                    borderColor:
                      colorMode === "light"
                        ? "#CBD5E0"
                        : "rgba(255, 255, 255, 0.24)",
                  }}
                  value={habitName}
                  onChange={(e) => {
                    setHabitName(e.target.value);
                    validateName(e.target.value);
                  }}
                />
                <FormErrorMessage>{error}</FormErrorMessage>
              </VStack>
            </FormControl>
            <Popover>
              <PopoverTrigger>
                <Button
                  bg={
                    colorMode === "light"
                      ? "var(--chakra-colors-gray-200)"
                      : "var(--chakra-colors-whiteAlpha-200)"
                  }
                  _hover={{
                    bg:
                      colorMode === "light"
                        ? "var(--chakra-colors-gray-300)"
                        : "var(--chakra-colors-whiteAlpha-300)",
                  }}
                  fontSize="20px"
                >
                  {React.createElement(LuIcons[selectedIcon])}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                w="fit-content"
                borderRadius={themeOptions.borderRadius}
                bg={
                  colorMode === "light"
                    ? "rgb(245, 245, 245)"
                    : "rgb(23, 23, 23)"
                }
              >
                <PopoverBody
                  p={2}
                  maxH="300px"
                  overflowY="scroll"
                  overflowX="hidden"
                  borderRadius={themeOptions.borderRadius}
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
                  <Input
                    mb={2}
                    placeholder="Buscar icono..."
                    size="sm"
                    borderRadius={themeOptions.borderRadius}
                    _focusVisible={{
                      borderColor: `var(--chakra-colors-${themeOptions.focusColor}-500)`,
                    }}
                    value={searchIcon}
                    onChange={(e) => setSearchIcon(e.target.value)}
                  />
                  <SimpleGrid columns={6} spacing={1}>
                    {filteredIcons.slice(0, visibleIcons).map((iconName) => {
                      const IconComponent = LuIcons[iconName];
                      return (
                        <Box
                          key={iconName}
                          as="button"
                          p={2}
                          borderRadius={themeOptions.borderRadius}
                          border="1px solid"
                          borderColor={
                            selectedIcon === iconName
                              ? themeOptions.focusColor
                              : "gray.200"
                          }
                          onClick={() => {
                            setSelectedIcon(iconName);
                          }}
                          transition=".1s all linear"
                          bg={
                            colorMode === "light"
                              ? "rgb(255, 255, 255)"
                              : "rgb(0, 0, 0)"
                          }
                          _hover={{
                            bg:
                              colorMode === "light"
                                ? `var(--chakra-colors-${themeOptions.focusColor}-50)`
                                : "var(--chakra-colors-blackAlpha-600)",
                            borderColor: `var(--chakra-colors-${themeOptions.focusColor}-500)`,
                          }}
                        >
                          <IconComponent size="20px" />
                        </Box>
                      );
                    })}
                  </SimpleGrid>
                  {visibleIcons < Object.keys(LuIcons).length && (
                    <Button
                      size="sm"
                      mt={2}
                      onClick={loadMoreIcons}
                      w="100%"
                      colorScheme={themeOptions.focusColor}
                    >
                      Ver más iconos
                    </Button>
                  )}
                </PopoverBody>
              </PopoverContent>
            </Popover>
          </HStack>
          <HStack spacing={4}>
            <Box my={2}>
              <FormLabel
                mb={1}
                fontSize="xs"
                textTransform="uppercase"
                opacity={0.5}
              >
                Meta
              </FormLabel>
              <HStack spacing={4}>
                <NumberInput
                  w="33.33333%"
                  defaultValue={1}
                  min={1}
                  max={9999}
                  value={goalValue}
                  onChange={(value) => setGoalValue(value)}
                >
                  <NumberInputField
                    fontSize="sm"
                    h="2.5rem"
                    borderRadius={themeOptions.borderRadius}
                    _focusVisible="none"
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <Menu closeOnSelect={false}>
                  <MenuButton
                    as={Button}
                    textAlign="left"
                    variant="ghost"
                    size="sm"
                    w="33.33333%"
                    h="2.5rem"
                    borderWidth={1}
                    borderColor={`var(--chakra-colors-chakra-border-color)`}
                    _focusVisible="none"
                    _hover={{
                      bg: "none",
                      borderColor:
                        colorMode === "light"
                          ? "#CBD5E0"
                          : "rgba(255, 255, 255, 0.24)",
                    }}
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
                    textAlign="left"
                    variant="ghost"
                    size="sm"
                    w="33.33333%"
                    h="2.5rem"
                    borderWidth={1}
                    borderColor={`var(--chakra-colors-chakra-border-color)`}
                    _focusVisible="none"
                    _hover={{
                      bg: "none",
                      borderColor:
                        colorMode === "light"
                          ? "#CBD5E0"
                          : "rgba(255, 255, 255, 0.24)",
                    }}
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
            </Box>
          </HStack>
          <HStack w="100%">
            <Box w="100%" my={2}>
              <FormLabel
                mb={1}
                fontSize="xs"
                textTransform="uppercase"
                opacity={0.5}
              >
                Repetición
              </FormLabel>
              <HStack w="100%" spacing={4}>
                <Menu closeOnSelect={false}>
                  <MenuButton
                    as={Button}
                    textAlign="left"
                    variant="ghost"
                    size="sm"
                    w="30%"
                    h="2.5rem"
                    borderWidth={1}
                    borderColor={`var(--chakra-colors-chakra-border-color)`}
                    _focusVisible="none"
                    _hover={{
                      bg: "none",
                      borderColor:
                        colorMode === "light"
                          ? "#CBD5E0"
                          : "rgba(255, 255, 255, 0.24)",
                    }}
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
                        variant="ghost"
                        size="sm"
                        w="70%"
                        h="2.5rem"
                        justifyContent="justify-start"
                        borderRadius={themeOptions.borderRadius}
                        borderWidth={1}
                        borderColor={`var(--chakra-colors-chakra-border-color)`}
                        _focusVisible="none"
                        _hover={{
                          bg: "none",
                          borderColor:
                            colorMode === "light"
                              ? "#CBD5E0"
                              : "rgba(255, 255, 255, 0.24)",
                        }}
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
                    _focusVisible="none"
                    onChange={(e) => setSelectedMonthDay(e.target.value)}
                  />
                )}

                {repeatType === "interval" && (
                  <Menu closeOnSelect={false}>
                    <MenuButton
                      as={Button}
                      textAlign="left"
                      variant="ghost"
                      size="sm"
                      w="70%"
                      h="2.5rem"
                      borderWidth={1}
                      borderColor={`var(--chakra-colors-chakra-border-color)`}
                      _focusVisible="none"
                      _hover={{
                        bg: "none",
                        borderColor:
                          colorMode === "light"
                            ? "#CBD5E0"
                            : "rgba(255, 255, 255, 0.24)",
                      }}
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
            </Box>
          </HStack>
          <HStack spacing={4}>
            <Box my={2} w="50%">
              <FormLabel
                mb={1}
                fontSize="xs"
                textTransform="uppercase"
                opacity={0.5}
              >
                Áreas
              </FormLabel>
              <Menu closeOnSelect={false}>
                <MenuButton
                  as={Button}
                  textAlign="left"
                  variant="ghost"
                  leftIcon={
                    selectedArea &&
                    areas.find((area) => area.id === selectedArea)?.icon ? (
                      LuIcons[
                        areas.find((area) => area.id === selectedArea)?.icon
                      ] ? (
                        React.createElement(
                          LuIcons[
                            areas.find((area) => area.id === selectedArea)?.icon
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
                  iconSpacing={1}
                  size="sm"
                  w="100%"
                  h="2.5rem"
                  borderWidth={1}
                  borderColor={`var(--chakra-colors-chakra-border-color)`}
                  _focusVisible="none"
                  _hover={{
                    bg: "none",
                    borderColor:
                      colorMode === "light"
                        ? "#CBD5E0"
                        : "rgba(255, 255, 255, 0.24)",
                  }}
                >
                  {selectedArea
                    ? areas.find((area) => area.id === selectedArea)?.name
                    : "Área seleccionada"}
                </MenuButton>
                <MenuList
                  borderRadius={themeOptions.borderRadius}
                  bg={
                    colorMode === "light" ? "var(--menu-bg)" : "rgb(23, 23, 23)"
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
                        {area.name}
                      </MenuItemOption>
                    ))}
                  </MenuOptionGroup>
                </MenuList>
              </Menu>
            </Box>
            <Box w="50%" my={2}>
              <FormLabel
                mb={1}
                fontSize="xs"
                textTransform="uppercase"
                opacity={0.5}
              >
                Fecha de comienzo
              </FormLabel>
              <Input
                type="date"
                size="sm"
                w="100%"
                h="2.5rem"
                borderRadius={themeOptions.borderRadius}
                borderWidth={1}
                borderColor={`var(--chakra-colors-chakra-border-color)`}
                _focusVisible="none"
                _hover={{
                  bg: "none",
                  borderColor:
                    colorMode === "light"
                      ? "#CBD5E0"
                      : "rgba(255, 255, 255, 0.24)",
                }}
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                }}
              />
            </Box>
          </HStack>
          <HStack spacing={4}>
            <Box my={2}>
              <FormLabel
                mb={1}
                fontSize="xs"
                textTransform="uppercase"
                opacity={0.5}
              >
                Recordatorio
              </FormLabel>
              <Input
                type="time"
                size="sm"
                h="2.5rem"
                borderRadius={themeOptions.borderRadius}
                borderWidth={1}
                borderColor={`var(--chakra-colors-chakra-border-color)`}
                _focusVisible="none"
                _hover={{
                  bg: "none",
                  borderColor:
                    colorMode === "light"
                      ? "#CBD5E0"
                      : "rgba(255, 255, 255, 0.24)",
                }}
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
              />
            </Box>
          </HStack>
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
