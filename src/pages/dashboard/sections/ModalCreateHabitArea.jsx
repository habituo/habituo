import React, { useEffect, useState, useRef  } from "react";
import {
  HStack,
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
  PopoverArrow,
  PopoverBody,
  FormLabel,
  FormControl,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Select,
  Stack,
  Checkbox,
  CheckboxGroup,
  Menu,
  MenuButton,
  MenuList,
  MenuOptionGroup,
  MenuItemOption,
} from "@chakra-ui/react";
import * as LuIcons from "react-icons/lu";
import { db } from "../../../hooks/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";
import { useAuth } from "../../../hooks/AuthContext";
import { useTheme } from "../../../theme/ThemeContext";

const ModalCreateHabitArea = ({ isOpen, onClose }) => {
  const [areas, setAreas] = useState([]);
  const { user } = useAuth();
  const { themeOptions } = useTheme();
  const [habitName, setHabitName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("LuActivity");
  const [goalValue, setGoalValue] = useState(1);
  const [goalUnit, setGoalUnit] = useState("times");
  const [repeatType, setRepeatType] = useState("day");
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState("1");
  const [selectedMonthDay, setSelectedMonthDay] = useState(1);
  const [selectedArea, setSelectedArea] = useState("");
  const [reminderTime, setReminderTime] = useState("");
  const [startDate, setStartDate] = useState("");
  const [visibleIcons, setVisibleIcons] = useState(30); // Inicialmente cargamos 30 iconos
  const scrollContainerRef = useRef(null);

  const allIcons = Object.keys(LuIcons);

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
  
    console.log('scrollTop:', container.scrollTop);
    console.log('clientHeight:', container.clientHeight);
    console.log('scrollHeight:', container.scrollHeight);
  
    if (container.scrollTop + container.clientHeight >= container.scrollHeight - 5) {
      setVisibleIcons((prev) => Math.min(prev + 50, allIcons.length));
    }
  };
  

  const handleSave = async () => {
    try {
      await addDoc(collection(db, `users/${user.uid}/areas/${selectedArea}/habits`), {
        name: habitName,
        icon: selectedIcon,
        goal: {
          value: goalValue,
          unit: goalUnit,
        },
        repeat: {
          type: repeatType,
          days: repeatType === "week" ? selectedDays : [],
          week: repeatType === "month" ? selectedWeek : null,
          dayOfMonth: repeatType === "month" ? selectedMonthDay : null,
        },
        area: selectedArea,
        reminder: reminderTime,
        startDate: startDate,
        createdAt: serverTimestamp()
      });

      onClose();
    } catch (error) {
      console.error("Error al guardar el hábito: ", error);
      alert("Hubo un error al guardar el hábito");
    }
  };

  // Fetch areas from Firestore
  const fetchAreas = async () => {
    if (!user) return;

    const userId = user.uid;
    const areasRef = collection(db, `users/${userId}/areas`);

    try {
      const snapshot = await getDocs(areasRef);
      const areasList = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          icon: data.icon || "LuFolder",
          registeredAt: data.registeredAt
            ? data.registeredAt.toDate().toLocaleDateString("es-ES")
            : "Desconocido",
        };
      });

      setAreas(areasList);
    } catch (error) {
      console.error("Error obteniendo las áreas:", error);
    }
  };

  useEffect(() => {
    fetchAreas();
  }, [user]);

  return (
    <>
      {/* Modal que se activa desde cualquier botón */}
      <Modal size="lg" isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent borderRadius={themeOptions.borderRadius}>
          <ModalHeader>Crear nuevo hábito</ModalHeader>
          <ModalCloseButton borderRadius={themeOptions.borderRadius} />
          <ModalBody>
            <FormControl>
              <HStack spacing={4}>
                <Input
                  type="text"
                  variant="outline"
                  size="sm"
                  h="2.5rem"
                  placeholder="Nombre del ábito"
                  borderRadius={themeOptions.borderRadius}
                  _focus={{ borderColor: themeOptions.focusColor }}
                  _focusVisible={{ borderColor: themeOptions.focusColor }}
                  onChange={(e) => setHabitName(e.target.value)}
                />
                <Popover>
                  <PopoverTrigger>
                    <Button>
                      {React.createElement(LuIcons[selectedIcon])}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent w="fit-content">
                    <PopoverArrow />
                    <PopoverBody
                      maxH="300px"
                      overflowY="scroll"
                      overflowX="hidden"
                      borderRadius={themeOptions.borderRadius}
                    >
                      <SimpleGrid columns={6} spacing={1} ref={scrollContainerRef}
                      onScroll={handleScroll}>
                      {allIcons.slice(0, visibleIcons).map((iconName) => {
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
                              _hover={{ borderColor: themeOptions.focusColor }}
                            >
                              <IconComponent size="20px" />
                            </Box>
                          );
                        })}
                      </SimpleGrid>
                    </PopoverBody>
                  </PopoverContent>
                </Popover>
              </HStack>
              <HStack spacing={4}>
                <Box my={2}>
                  <FormLabel
                    mb={0}
                    fontSize="xs"
                    textTransform="uppercase"
                    opacity={0.5}
                  >
                    Meta
                  </FormLabel>
                  <HStack spacing={4}>
                    <NumberInput defaultValue={1} min={1} max={100}>
                      <NumberInputField
                        fontSize="sm"
                        h="2.5rem"
                        borderRadius={themeOptions.borderRadius}
                        _focus={{ borderColor: themeOptions.focusColor }}
                        _focusVisible={{ borderColor: themeOptions.focusColor }}
                      />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <Select
                      value={goalUnit}
                      size="sm"
                      h="2.5rem"
                      borderRadius={themeOptions.borderRadius}
                      _focus={{ borderColor: themeOptions.focusColor }}
                      _focusVisible={{ borderColor: themeOptions.focusColor }}
                      onChange={(e) => setGoalUnit(e.target.value)}
                    >
                      <option value="times">Veces</option>
                      <option value="minutes">Minutos</option>
                    </Select>
                    <Select
                      size="sm"
                      h="2.5rem"
                      borderRadius={themeOptions.borderRadius}
                      _focus={{ borderColor: themeOptions.focusColor }}
                      _focusVisible={{ borderColor: themeOptions.focusColor }}
                      onChange={(e) => setRepeatType(e.target.value)}
                      value={repeatType}
                    >
                      <option value="day">Diario</option>
                      <option value="week">Semanal</option>
                      <option value="month">Mensual</option>
                    </Select>
                  </HStack>
                </Box>
              </HStack>
              <HStack spacing={4}>
                <Box my={2}>
                  <FormLabel
                    mb={0}
                    fontSize="xs"
                    textTransform="uppercase"
                    opacity={0.5}
                  >
                    Repetición
                  </FormLabel>
                  {repeatType === "day" && (
                    <Input
                      type="date"
                      size="sm"
                      h="2.5rem"
                      borderRadius={themeOptions.borderRadius}
                      _focus={{ borderColor: themeOptions.focusColor }}
                      _focusVisible={{ borderColor: themeOptions.focusColor }}
                      onChange={(e) => setReminderTime(e.target.value)}
                    />
                  )}

                  {repeatType === "week" && (
                    <Popover>
                      <PopoverTrigger>
                        <Button
                          variant="ghost"
                          size="sm"
                          h="2.5rem"
                          maxW="200px"
                          justifyContent="justify-start"
                          borderRadius={themeOptions.borderRadius}
                          _focus={{ borderColor: themeOptions.focusColor }}
                          _focusVisible={{
                            borderColor: themeOptions.focusColor,
                          }}
                          overflow="hidden"
                        >
                          {selectedDays.length > 0
                            ? selectedDays.join(", ")
                            : "Seleccionar días"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        w="auto"
                        borderRadius={themeOptions.borderRadius}
                      >
                        <PopoverBody>
                          <CheckboxGroup
                            value={selectedDays}
                            onChange={setSelectedDays}
                          >
                            <Stack direction="column">
                              {[
                                "Lunes",
                                "Martes",
                                "Miércoles",
                                "Jueves",
                                "Viernes",
                                "Sábado",
                                "Domingo",
                              ].map((day, index) => (
                                <Checkbox key={index} value={day}>
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
                    <HStack>
                      <Select
                        size="sm"
                        onChange={(e) => setSelectedWeek(e.target.value)}
                        value={selectedWeek}
                        h="2.5rem"
                        borderRadius={themeOptions.borderRadius}
                        _focus={{ borderColor: themeOptions.focusColor }}
                        _focusVisible={{ borderColor: themeOptions.focusColor }}
                      >
                        <option value="1">1ª Semana</option>
                        <option value="2">2ª Semana</option>
                        <option value="3">3ª Semana</option>
                        <option value="4">4ª Semana</option>
                      </Select>
                      <NumberInput
                        min={1}
                        max={31}
                        value={selectedMonthDay}
                        onChange={(value) => setSelectedMonthDay(value)}
                      >
                        <NumberInputField
                          placeholder="Día del mes"
                          fontSize="sm"
                          h="2.5rem"
                          borderRadius={themeOptions.borderRadius}
                          _focus={{ borderColor: themeOptions.focusColor }}
                          _focusVisible={{
                            borderColor: themeOptions.focusColor,
                          }}
                        />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </HStack>
                  )}
                </Box>
                <Box my={2}>
                  <FormLabel
                    mb={0}
                    fontSize="xs"
                    textTransform="uppercase"
                    opacity={0.5}
                  >
                    Áreas
                  </FormLabel>
                  <Menu closeOnSelect={false}>
                    <MenuButton
                      as={Button}
                      variant="ghost"
                      leftIcon={<LuIcons.LuGroup size="16px" />}
                      iconSpacing={1}
                      size="sm"
                      h="2.5rem"
                    >
                      {selectedArea ? areas.find((area) => area.id === selectedArea)?.name : "Área seleccionada"}
                    </MenuButton>
                    <MenuList borderRadius={themeOptions.borderRadius}>
                      <MenuOptionGroup type="radio" value={selectedArea} onChange={(value) => setSelectedArea(value)}>
                        {areas.map((area) => (
                          <MenuItemOption key={area.id} value={area.id}>
                            {area.name}
                          </MenuItemOption>
                        ))}
                      </MenuOptionGroup>
                    </MenuList>
                  </Menu>
                </Box>
              </HStack>
              <HStack spacing={4}>
                <Box my={2}>
                  <FormLabel
                    mb={0}
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
                    _focus={{ borderColor: themeOptions.focusColor }}
                    _focusVisible={{ borderColor: themeOptions.focusColor }}
                    onChange={(e) => setReminderTime(e.target.value)}
                  />
                </Box>
                <Box my={2}>
                  <FormLabel
                    mb={0}
                    fontSize="xs"
                    textTransform="uppercase"
                    opacity={0.5}
                  >
                    Fecha comienzo
                  </FormLabel>
                  <Input
                    type="date"
                    size="sm"
                    h="2.5rem"
                    borderRadius={themeOptions.borderRadius}
                    _focus={{ borderColor: themeOptions.focusColor }}
                    _focusVisible={{ borderColor: themeOptions.focusColor }}
                  />
                </Box>
              </HStack>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose} mr={3}>
              Cancelar
            </Button>
            <Button colorScheme={themeOptions.focusColor} onClick={handleSave}>
              Guardar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ModalCreateHabitArea;
