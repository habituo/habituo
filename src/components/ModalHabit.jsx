import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  subscribeToAreas,
} from "../hooks/database";
import { useAuthUser } from "../context/AuthUserContext";
import { useTheme } from "../context/ThemeContext";
import * as LuIcons from "react-icons/lu";

const ModalHabit = ({ isOpen, onClose, selectedHabit }) => {
  const { user } = useAuthUser();
  const { themeOptions } = useTheme();
  const { colorMode } = useColorMode();
  const toast = useToast();
  const [habitName, setHabitName] = useState("");
  const [searchIcon, setSearchIcon] = useState("");
  const [visibleIcons, setVisibleIcons] = useState(30);
  const [selectedIcon, setSelectedIcon] = useState("LuActivity");
  const [goalValue, setGoalValue] = useState(1);
  const [goalUnit, setGoalUnit] = useState("times");
  const [goalPeriod, setGoalPeriod] = useState("day");
  const [repeatType, setRepeatType] = useState("day");
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedMonthDay, setSelectedMonthDay] = useState(1);
  const [repeatIntervalValue, setRepeatIntervalValue] = useState(1);
  const [reminderTime, setReminderTime] = useState("");
  const [startDate, setStartDate] = useState("");
  const [areas, setAreas] = useState([]);
  const [selectedAreaId, setSelectedAreaId] = React.useState(null);
  const [formError, setFormError] = useState("");
  const getTodayDateString = () => new Date().toISOString().split("T")[0];

  const { getInputProps, getIncrementButtonProps, getDecrementButtonProps } =
    useNumberInput({
      step: 1,
      defaultValue: 1,
      min: 1,
      max: 9999,
      value: goalValue,
      onChange: (valueAsString, valueAsNumber) => {
        setGoalValue(isNaN(valueAsNumber) ? 1 : valueAsNumber);
      },
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

  const validateHabitName = useCallback((value) => {
    if (!value.trim()) {
      setFormError("El nombre del hábito no puede estar vacío.");
      return false;
    }
    if (!/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
      setFormError("Solo se permiten letras, números y espacios.");
      return false;
    }
    setFormError("");
    return true;
  }, []);

  const filteredIcons = useMemo(() => {
    return Object.keys(LuIcons).filter((iconName) =>
      iconName.toLowerCase().includes(searchIcon.toLowerCase())
    );
  }, [searchIcon]);

  const loadMoreIcons = () => {
    setVisibleIcons((prev) => prev + 30);
  };

  useEffect(() => {
    if (!isOpen) {
      setHabitName("");
      setSelectedIcon("LuActivity");
      setGoalValue(1);
      setGoalUnit("times");
      setGoalPeriod("day");
      setRepeatType("day");
      setSelectedDays([]);
      setSelectedMonthDay(1);
      setRepeatIntervalValue(1);
      setReminderTime("");
      setStartDate(getTodayDateString());
      setSelectedAreaId(null);
      setSearchIcon("");
      setVisibleIcons(30);
      setFormError("");
      return;
    }

    if (selectedHabit) {
      setHabitName(selectedHabit.name || "");
      setSelectedIcon(selectedHabit.icon || "LuActivity");
      setGoalValue(selectedHabit.goal?.value || 1);
      setGoalUnit(selectedHabit.goal?.unit || "times");
      setGoalPeriod(selectedHabit.goal?.period || "day");
      setRepeatType(selectedHabit.repeat?.type || "day");
      setSelectedDays(selectedHabit.repeat?.days || []);
      setSelectedMonthDay(selectedHabit.repeat?.dayOfMonth || 1);
      setRepeatIntervalValue(selectedHabit.repeat?.interval || 1);
      setReminderTime(selectedHabit.reminder || "");
      setStartDate(() => {
        if (!selectedHabit.startDate) return getTodayDateString();
        return typeof selectedHabit.startDate.toDate === "function"
          ? selectedHabit.startDate.toDate().toISOString().split("T")[0]
          : new Date(selectedHabit.startDate).toISOString().split("T")[0];
      });
      setSelectedAreaId(selectedHabit.area?.toString() || null);
    } else {
      setHabitName("");
      setSelectedIcon("LuActivity");
      setGoalValue(1);
      setGoalUnit("times");
      setGoalPeriod("day");
      setRepeatType("day");
      setSelectedDays([]);
      setSelectedMonthDay(1);
      setRepeatIntervalValue(1);
      setReminderTime("");
      setStartDate(getTodayDateString());
      setSelectedAreaId(null);
    }
    setSearchIcon("");
    setVisibleIcons(30);
    setFormError("");
  }, [isOpen, selectedHabit, areas]);

  useEffect(() => {
    if (!user?.uid) {
      setAreas([]);
      setSelectedAreaId(null);
      return;
    }

    const unsubscribe = subscribeToAreas(
      user.uid,
      (fetchedAreas) => {
        setAreas(fetchedAreas);

        let targetAreaId = null;
        if (selectedHabit && selectedHabit.area) {
          targetAreaId = selectedHabit.area.toString();
        } else if (fetchedAreas.length > 0) {
          targetAreaId = fetchedAreas[0].id.toString();
        }

        if (selectedAreaId !== targetAreaId) {
          setSelectedAreaId(targetAreaId);
        }
      },
      (error) => {
        toast({
          title: <Text fontWeight={600}>Error al cargar áreas</Text>,
          description:
            "No se pudieron cargar tus áreas. Intenta recargar la página.",
          status: "error",
          position: "bottom",
        });
      }
    );

    return () => unsubscribe();
  }, [user?.uid, toast, selectedHabit]);

  const currentSelectedArea = useMemo(() => {
    return areas.find((area) => area.id.toString() === selectedAreaId);
  }, [areas, selectedAreaId]);

  const MenuButtonIcon =
    currentSelectedArea?.icon && LuIcons[currentSelectedArea.icon]
      ? LuIcons[currentSelectedArea.icon]
      : LuIcons.LuGroup;

  const handleSave = async () => {
    if (!validateHabitName(habitName)) {
      toast({
        title: <Text fontWeight={600}>Revisa el nombre del hábito</Text>,
        description: formError,
        status: "error",
        position: "bottom",
      });
      return;
    }
    if (!selectedAreaId) {
      toast({
        title: <Text fontWeight={600}>Seleccionar área</Text>,
        description: "Debes seleccionar un área antes de continuar.",
        status: "error",
        position: "bottom",
      });
      return;
    }
    if (!user?.uid) {
      toast({
        title: <Text fontWeight={600}>Error de autenticación</Text>,
        description:
          "No se pudo obtener tu ID de usuario. Por favor, intenta iniciar sesión de nuevo.",
        status: "error",
        position: "bottom",
      });
      return;
    }

    const habitData = {
      name: habitName,
      icon: selectedIcon,
      goal: { value: goalValue, unit: goalUnit, period: goalPeriod },
      repeat: {
        type: repeatType,
        days: repeatType === "week" ? selectedDays : [],
        dayOfMonth: repeatType === "month" ? selectedMonthDay : null,
        interval: repeatType === "interval" ? repeatIntervalValue : null,
      },
      area: selectedAreaId,
      reminder: reminderTime,
      startDate: startDate ? new Date(startDate) : null,
    };

    try {
      if (selectedHabit) {
        await updateHabitInDb(
          user.uid,
          selectedAreaId,
          selectedHabit.id,
          habitData
        );
        toast({
          title: <Text fontWeight={600}>Hábito actualizado</Text>,
          description: `El hábito "${habitName}" ha sido actualizado correctamente.`,
          status: "success",
          position: "bottom",
        });
      } else {
        habitData.createdAt = serverTimestamp();
        await addHabitToDb(user.uid, selectedAreaId, habitData);
        toast({
          title: <Text fontWeight={600}>Hábito creado</Text>,
          description: `El hábito "${habitName}" ha sido creado correctamente.`,
          status: "success",
          position: "bottom",
        });
      }
      onClose();
    } catch (error) {
      toast({
        title: <Text fontWeight={600}>Error al guardar</Text>,
        description: `No se pudo guardar el hábito. ${
          error.message || "Inténtalo de nuevo."
        }`,
        status: "error",
        position: "bottom",
      });
    }
  };

  const dayOptions = useMemo(
    () => [
      { value: "monday", label: "Lunes" },
      { value: "tuesday", label: "Martes" },
      { value: "wednesday", label: "Miércoles" },
      { value: "thursday", label: "Jueves" },
      { value: "friday", label: "Viernes" },
      { value: "saturday", label: "Sábado" },
      { value: "sunday", label: "Domingo" },
    ],
    []
  );

  return (
    <Modal size="xl" isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent
        borderRadius={themeOptions.borderRadius}
        bg={colorMode === "light" ? "gray.100" : "gray.900"}
      >
        <ModalHeader p={4}>
          {selectedHabit ? "Editar hábtio" : "Crear hábito"} hábito
        </ModalHeader>
        <ModalCloseButton
          top={2}
          right={2}
          borderRadius={themeOptions.borderRadius}
        />
        <ModalBody px={4}>
          <VStack alignItems="stretch" spacing={4}>
            <HStack spacing={4}>
              <FormControl w="70%" isRequired isInvalid={!!formError}>
                <FormLabel
                  fontSize="xs"
                  fontWeight={600}
                  textTransform="uppercase"
                  color={colorMode === "light" ? "gray.400" : "gray.600"}
                >
                  Nombre del hábito
                </FormLabel>
                <Input
                  value={habitName}
                  size="sm"
                  h="2.5rem"
                  borderRadius={themeOptions.borderRadius}
                  _focusVisible="none"
                  onChange={(e) => {
                    setHabitName(e.target.value);
                    validateHabitName(e.target.value);
                  }}
                  onBlur={(e) => validateHabitName(e.target.value)}
                />
              </FormControl>
              <FormControl w="10%">
                <FormLabel
                  fontSize="xs"
                  fontWeight={600}
                  textTransform="uppercase"
                  color={colorMode === "light" ? "gray.400" : "gray.600"}
                >
                  Icono
                </FormLabel>
                <Popover placement="bottom-start">
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
                        ? "gray.100"
                        : "gray.900"
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
                    {visibleIcons < filteredIcons.length && (
                      <Button size="sm" mt={2} onClick={loadMoreIcons}>
                        Cargar más
                      </Button>
                    )}
                  </PopoverContent>
                </Popover>
              </FormControl>
              <FormControl w="20%">
                <FormLabel
                  fontSize="xs"
                  fontWeight={600}
                  textTransform="uppercase"
                  color={colorMode === "light" ? "gray.400" : "gray.600"}
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
            <HStack>
              <FormControl>
                <FormLabel
                  htmlFor="habit-name"
                  fontSize="xs"
                  fontWeight={600}
                  textTransform="uppercase"
                  color={colorMode === "light" ? "gray.400" : "gray.600"}
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
                          ? "gray.100"
                          : "gray.900"
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
                              ? "gray.100"
                              : "gray.900"
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
                              ? "gray.100"
                              : "gray.900"
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
                          ? "gray.100"
                          : "gray.900"
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
                              ? "gray.100"
                              : "gray.900"
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
                              ? "gray.100"
                              : "gray.900"
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
                              ? "gray.100"
                              : "gray.900"
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
            <HStack>
              <FormControl>
                <FormLabel
                  htmlFor="habit-repeat"
                  fontSize="xs"
                  fontWeight={600}
                  textTransform="uppercase"
                  color={colorMode === "light" ? "gray.400" : "gray.600"}
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
                          ? "gray.100"
                          : "gray.900"
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
                              ? "gray.100"
                              : "gray.900"
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
                              ? "gray.100"
                              : "gray.900"
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
                              ? "gray.100"
                              : "gray.900"
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
                            ? "rgb(254, 254, 254)"
                            : "gray.900"
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
                        {"Repetir cada " + repeatIntervalValue}
                      </MenuButton>
                      <MenuList
                        borderRadius={themeOptions.borderRadius}
                        bg={
                          colorMode === "light"
                            ? "gray.100"
                            : "gray.900"
                        }
                      >
                        <MenuOptionGroup
                          type="radio"
                          value={repeatIntervalValue.toString()}
                          onChange={(value) => setRepeatIntervalValue(value)}
                        >
                          {[1, 2, 3, 4, 5].map((num) => (
                            <MenuItemOption
                              key={num}
                              value={num.toString()}
                              bg={
                                colorMode === "light"
                                  ? "gray.100"
                                  : "gray.900"
                              }
                              _hover={{
                                bg:
                                  colorMode === "light"
                                    ? "rgb(237 242 247)"
                                    : "rgba(255, 255, 255, 0.06)",
                              }}
                            >
                              Repetir cada {num}
                            </MenuItemOption>
                          ))}
                        </MenuOptionGroup>
                      </MenuList>
                    </Menu>
                  )}
                </HStack>
              </FormControl>
            </HStack>
            <HStack spacing={4}>
              <FormControl isRequired>
                <HStack>
                  <Box w="50%">
                    <FormLabel
                      fontSize="xs"
                      fontWeight={600}
                      textTransform="uppercase"
                      color={colorMode === "light" ? "gray.400" : "gray.600"}
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
                        leftIcon={<Icon as={MenuButtonIcon} size="16px" />}
                      >
                        <Text isTruncated>
                          {currentSelectedArea?.name || "Selecciona área"}
                        </Text>
                      </MenuButton>
                      <MenuList
                        borderRadius={themeOptions.borderRadius}
                        bg={
                          colorMode === "light"
                            ? "gray.100"
                            : "gray.900"
                        }
                      >
                        {areas.length > 0 ? (
                          <MenuOptionGroup
                            type="radio"
                            value={selectedAreaId ?? ""}
                            onChange={(value) => {
                              setSelectedAreaId(value.toString());
                            }}
                          >
                            {areas.map((area) => (
                              <MenuItemOption
                                bg={
                                  colorMode === "light"
                                    ? "gray.100"
                                    : "gray.900"
                                }
                                _hover={{
                                  bg:
                                    colorMode === "light"
                                      ? "rgb(237 242 247)"
                                      : "rgba(255, 255, 255, 0.06)",
                                }}
                                _checked={{
                                  bg:
                                    colorMode === "light"
                                      ? "blue.50"
                                      : "whiteAlpha.100",
                                  color:
                                    colorMode === "light"
                                      ? "blue.700"
                                      : "blue.200",
                                }}
                                key={area.id}
                                value={area.id.toString()}
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
                        ) : (
                          <MenuItemOption isDisabled>
                            No hay áreas disponibles.
                          </MenuItemOption>
                        )}
                      </MenuList>
                    </Menu>
                  </Box>
                  <Box w="50%">
                    <FormLabel
                      htmlFor="habit-start"
                      fontSize="xs"
                      fontWeight={600}
                      textTransform="uppercase"
                      color={colorMode === "light" ? "gray.400" : "gray.600"}
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
