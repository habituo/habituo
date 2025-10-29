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
} from "../../hooks/useDatabase";
import { useAuthUser } from "../../context/AuthUserContext/AuthUserContext";
import { useTheme } from "../../context/ThemeContext/ThemeContext";
import * as LuIcons from "react-icons/lu";
import { isValid, parseISO, format } from "date-fns";
import { EmojiSelector } from "../../exports";

const dayMap = {
  0: "D",
  1: "L",
  2: "M",
  3: "X",
  4: "J",
  5: "V",
  6: "S",
};

const getTodayDateString = () => format(new Date(), "yyyy-MM-dd");

const convertDateToInputFormat = (dateValue) => {
  if (!dateValue) return getTodayDateString();
  let date;
  if (typeof dateValue.toDate === "function") {
    date = dateValue.toDate();
  } else if (dateValue instanceof Date) {
    date = dateValue;
  } else {
    try {
      date = parseISO(dateValue);
    } catch (e) {
      date = new Date();
    }
  }
  return isValid(date) ? format(date, "yyyy-MM-dd") : getTodayDateString();
};

const HabitModal = ({ isOpen, onClose, selectedHabit, onHabitSaved }) => {
  const { user } = useAuthUser();
  const { themeOptions } = useTheme();
  const { colorMode } = useColorMode();
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: "",
    icon: "💪",
    reminder: "",
    goals: {
      value: 1,
      unit: "times",
      period: "day",
    },
    repetition: {
      type: "diary",
      days: [],
      dayOfMonth: 1,
      interval: "1",
    },
    area: null,
    startDate: getTodayDateString(),
  });

  const [areas, setAreas] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const initialFocusRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleAreaSelect = useCallback((value) => {
    setFormData((prev) => ({
      ...prev,
      area: value,
    }));
    setFormErrors((prev) => ({ ...prev, area: "" }));
  }, []);

  const handleIconSelect = useCallback((emoji) => {
    setFormData((prev) => ({
      ...prev,
      icon: emoji,
    }));
  }, []);

  const handleRepetitionTypeChange = useCallback((value) => {
    setFormData((prev) => ({
      ...prev,
      repetition: {
        ...prev.repetition,
        type: value,
        days: [],
        dayOfMonth: 1,
        interval: "1",
      },
    }));
    setFormErrors((prev) => ({ ...prev, "repetition.type": "" }));
  }, []);

  const handleGoalChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      goals: {
        ...prev.goals,
        [name]: value,
      },
    }));
    setFormErrors((prev) => ({ ...prev, [`goals.${name}`]: "" }));
  };

  const handleSelectedDaysChange = (dayIndex) => {
    setFormData((prev) => {
      const newDays = prev.repetition.days.includes(dayIndex)
        ? prev.repetition.days.filter((d) => d !== dayIndex)
        : [...prev.repetition.days, dayIndex];
      return {
        ...prev,
        repetition: {
          ...prev.repetition,
          days: newDays.sort((a, b) => a - b),
        },
      };
    });
    setFormErrors((prev) => ({ ...prev, "repetition.days": "" }));
  };

  const handleSelectedMonthDayChange = (_, valueAsNumber) => {
    setFormData((prev) => ({
      ...prev,
      repetition: {
        ...prev.repetition,
        dayOfMonth: isNaN(valueAsNumber) ? 1 : valueAsNumber,
      },
    }));
    setFormErrors((prev) => ({ ...prev, "repetition.dayOfMonth": "" }));
  };

  const handleRepeatIntervalValueChange = (_, valueAsNumber) => {
    setFormData((prev) => ({
      ...prev,
      repetition: {
        ...prev.repetition,
        interval: `${isNaN(valueAsNumber) ? 1 : valueAsNumber}`,
      },
    }));
    setFormErrors((prev) => ({ ...prev, "repetition.interval": "" }));
  };

  const {
    getInputProps: getGoalInputProps,
    getIncrementButtonProps: getGoalIncrementButtonProps,
    getDecrementButtonProps: getGoalDecrementButtonProps,
  } = useNumberInput({
    step: 1,
    defaultValue: 1,
    min: 1,
    max: 9999,
    value: formData.goals.value,
    onChange: (valueAsString, valueAsNumber) => {
      handleGoalChange("value", isNaN(valueAsNumber) ? 1 : valueAsNumber);
    },
  });

  const {
    getInputProps: getMonthDayInputProps,
    getIncrementButtonProps: getMonthDayIncrementButtonProps,
    getDecrementButtonProps: getMonthDayDecrementButtonProps,
  } = useNumberInput({
    step: 1,
    defaultValue: 1,
    min: 1,
    max: 31,
    value: formData.repetition.dayOfMonth,
    onChange: handleSelectedMonthDayChange,
  });

  const {
    getInputProps: getIntervalInputProps,
    getIncrementButtonProps: getIntervalIncrementButtonProps,
    getDecrementButtonProps: getIntervalDecrementButtonProps,
  } = useNumberInput({
    step: 1,
    defaultValue: 1,
    min: 1,
    max: 31,
    value: parseInt(
      formData.repetition.interval?.replace("every ", "") || "1",
      10
    ),
    onChange: handleRepeatIntervalValueChange,
  });

  useEffect(() => {
    if (!isOpen) {
      setFormData({
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
        startDate: getTodayDateString(),
      });
      setAreas([]);
      setFormErrors({});
      return;
    }

    if (selectedHabit) {
      setFormData({
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
          interval: selectedHabit.repetition?.interval || "1",
        },
        area: selectedHabit.area || null,
        startDate: convertDateToInputFormat(selectedHabit.startDate),
      });
    } else {
      setFormData((prev) => ({ ...prev, startDate: getTodayDateString() }));
    }

    if (initialFocusRef.current) {
      initialFocusRef.current.focus();
    }
  }, [isOpen, selectedHabit]);

  useEffect(() => {
    if (!user?.uid || !isOpen) {
      setAreas([]);
      return;
    }

    const handleAreasData = (fetchedAreas) => {
      const areasToSet = Array.isArray(fetchedAreas) ? fetchedAreas : [];
      setAreas(areasToSet);

      if (!formData.area && areasToSet.length > 0) {
        setFormData((prev) => ({ ...prev, area: areasToSet[0].id }));
      } else if (
        formData.area &&
        !areasToSet.some((area) => area.id === formData.area)
      ) {
        if (areasToSet.length > 0) {
          setFormData((prev) => ({ ...prev, area: areasToSet[0].id }));
        } else {
          setFormData((prev) => ({ ...prev, area: null }));
        }
      }
    };

    const handleAreasError = (error) => {
      toast({
        title: <Text fontWeight={600}>Error al cargar áreas</Text>,
        description:
          "No se pudieron cargar tus áreas. Intenta recargar la página.",
        status: "error",
        position: "bottom",
      });
    };

    const unsubscribe = subscribeToAreas(
      user.uid,
      handleAreasData,
      handleAreasError
    );

    return () => unsubscribe();
  }, [user?.uid, isOpen, toast, formData.area]);

  const currentSelectedArea = useMemo(() => {
    return (areas || []).find((area) => area.id === formData.area);
  }, [areas, formData.area]);

  const validateForm = useCallback(() => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = "El nombre del hábito no puede estar vacío.";
    } else if (formData.name.trim().length > 30) {
      errors.name = "El nombre del hábito no puede exceder los 30 caracteres.";
    } else if (!/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.name)) {
      errors.name = "Solo se permiten letras, números y espacios.";
    }

    if (!formData.area) {
      errors.area = "Debes seleccionar un área para el hábito.";
    }

    if (
      isNaN(formData.goals.value) ||
      formData.goals.value < 1 ||
      formData.goals.value > 9999
    ) {
      errors["goals.value"] = "La meta debe ser un número entre 1 y 9999.";
    }
    if (!["times", "minutes"].includes(formData.goals.unit)) {
      errors["goals.unit"] = "Unidad de meta inválida.";
    }
    if (!["day", "week", "month"].includes(formData.goals.period)) {
      errors["goals.period"] = "Periodo de meta inválido.";
    }

    switch (formData.repetition.type) {
      case "diary":
        if (
          !Array.isArray(formData.repetition.days) ||
          formData.repetition.days.length === 0
        ) {
          errors["repetition.days"] =
            "Debes seleccionar al menos un día de la semana.";
        }
        break;
      case "monthly":
        if (
          isNaN(formData.repetition.dayOfMonth) ||
          formData.repetition.dayOfMonth < 1 ||
          formData.repetition.dayOfMonth > 31
        ) {
          errors["repetition.dayOfMonth"] =
            "El día del mes debe ser entre 1 y 31.";
        }
        break;
      case "interval":
        let validIntervals = [];
        if (formData.goals.period === "day") {
          validIntervals = Array.from({ length: 31 }, (_, i) => `${i + 1}`);
        } else if (formData.goals.period === "week") {
          validIntervals = Array.from({ length: 4 }, (_, i) => `${i + 1}`);
        } else {
          validIntervals = Array.from({ length: 12 }, (_, i) => `${i + 1}`);
        }
        if (!validIntervals.includes(formData.repetition.interval)) {
          errors[
            "repetition.interval"
          ] = `El valor debe estar dentro de lo permitido.`;
        }
        break;
      default:
        errors["repetition.type"] = "Tipo de repetición inválido.";
        break;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleSave = async () => {
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

    if (!validateForm()) {
      toast({
        title: <Text fontWeight={600}>Revisa el formulario</Text>,
        description: "Hay errores en los campos. Por favor, corrígelos.",
        status: "error",
        position: "bottom",
      });
      return;
    }

    setIsSaving(true);
    try {
      const dataToSave = {
        ...formData,
        startDate: formData.startDate ? parseISO(formData.startDate) : null,
      };

      if (selectedHabit) {
        await updateHabit(
          user.uid,
          formData.area,
          selectedHabit.id,
          dataToSave
        );
        toast({
          title: <Text fontWeight={600}>Hábito actualizado</Text>,
          description: `El hábito "${formData.name}" ha sido actualizado correctamente.`,
          status: "success",
          position: "bottom",
        });
      } else {
        await createHabit(user.uid, formData.area, dataToSave);
        toast({
          title: <Text fontWeight={600}>Hábito creado</Text>,
          description: `El hábito "${formData.name}" ha sido creado correctamente.`,
          status: "success",
          position: "bottom",
        });
      }
      onClose(true);
      if (onHabitSaved) {
        onHabitSaved(true);
      }
    } catch (error) {
      toast({
        title: <Text fontWeight={600}>Error al guardar</Text>,
        description:
          error.message || "No se pudo guardar el hábito. Inténtalo de nuevo.",
        status: "error",
        position: "bottom",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const DayButton = ({ dayIndex, label }) => {
    const isSelected = formData.repetition.days.includes(dayIndex);
    return (
      <Button
        key={dayIndex}
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

  const repetitionTypeLabels = {
    diary: "Diario",
    monthly: "Mensual",
    interval: "Intervalo",
  };

  return (
    <Modal
      size="xl"
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
            <HStack w="100%" align="start" spacing={4}>
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
              <FormControl w="10%" zIndex={1}>
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
                <FormControl>
                  <NumberInput
                    value={formData.goals.value}
                    onChange={(val, valNum) =>
                      handleGoalChange("value", valNum)
                    }
                    min={1}
                    max={9999}
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
            </VStack>
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
              <HStack w="full" spacing={4}>
                <FormControl width="40%">
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

                {formData.repetition.type === "diary" && (
                  <FormControl
                    width="60%"
                    isRequired
                    isInvalid={!!formErrors["repetition.days"]}
                  >
                    <SimpleGrid columns={{ base: 2, md: 4 }} spacing={2}>
                      {Object.entries(dayMap).map(([index, label]) => (
                        <DayButton
                          key={index}
                          dayIndex={parseInt(index)}
                          label={label}
                        />
                      ))}
                    </SimpleGrid>
                    {formErrors["repetition.days"] && (
                      <Text fontSize="sm" color="red.500" mt={1}>
                        {formErrors["repetition.days"]}
                      </Text>
                    )}
                  </FormControl>
                )}

                {formData.repetition.type === "monthly" && (
                  <FormControl width="60%" isRequired>
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

                {formData.repetition.type === "interval" && (
                  <FormControl
                    width="60%"
                    isRequired
                    isInvalid={!!formErrors["repetition.interval"]}
                  >
                    <NumberInput
                      value={parseInt(
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
            <HStack w="100%" align="start" spacing={4}>
              <FormControl w="60%" isRequired isInvalid={!!formErrors.area}>
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
              <FormControl w="40%">
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
            {/* <FormControl w="30%">
              <FormLabel>Recordatorio</FormLabel>
              <Input
                name="reminder"
                type="time"
                value={formData.reminder}
                onChange={handleChange}
                borderRadius={themeOptions.borderRadius}
                _focusVisible={{}}
              />
            </FormControl> */}
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

export default HabitModal;
