import React, { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { ColumnHeader, ModalHabit } from "../../../routes/index";
import {
  Grid,
  HStack,
  VStack,
  Box,
  Text,
  Stack,
  Skeleton,
  Button,
  LinkBox,
  LinkOverlay,
  useDisclosure,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tooltip,
  IconButton,
  useColorMode,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from "@chakra-ui/react";
import { useTheme } from "../../../context/ThemeContext";
import { FaPlus } from "react-icons/fa6";
import * as LuIcons from "react-icons/lu";
import { deleteDoc, setDoc, getDoc, doc } from "firebase/firestore";
import { db } from "../../../hooks/firebase";

const AreaPage = ({ areas, fetchHabits, user, toast }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { colorMode } = useColorMode();
  const { areaId } = useParams();
  const [habits, setHabits] = useState([]);
  const area = areas.find((area) => area.id === areaId);
  const { themeOptions } = useTheme();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [searchParams] = useSearchParams();

  const [selectedHabit, setSelectedHabit] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState(null);
  const cancelRef = useRef();

  useEffect(() => {
    const fetchAreaHabits = async () => {
      if (areaId) {
        try {
          const habitsData = await fetchHabits(areaId);
          setHabits(habitsData);
        } catch (error) {
          console.error("Error fetching habits:", error);
        }
      }
    };

    fetchAreaHabits();
    setIsLoaded(true);
  }, [areaId, areas, fetchHabits]);

  useEffect(() => {
    const interval = setInterval(checkFailedHabits, 60 * 60 * 1000); // Ejecutar cada hora
    return () => clearInterval(interval);
  }, [habits, user, areaId]);

  // Open confirmation modal
  const confirmDelete = (habit) => {
    setHabitToDelete(habit);
    setIsDeleteOpen(true);
  };

  // Get order by URL
  const orderBy = searchParams.get("order_by") || "asc";
  const viewLayout = searchParams.get("layout") || "grid";

  const sortedHabits = [...habits].sort((a, b) => {
    if (orderBy === "asc") return a.name.localeCompare(b.name);
    if (orderBy === "desc") return b.name.localeCompare(a.name);
    if (orderBy === "oldest")
      return (b.registeredAt || 0) - (a.registeredAt || 0);
    if (orderBy === "newest")
      return (a.registeredAt || 0) - (b.registeredAt || 0);
    return 0;
  });

  const handleDelete = async () => {
    if (!habitToDelete || !user) return;

    try {
      await deleteDoc(
        doc(db, `users/${user.uid}/areas/${areaId}/habits/${habitToDelete.id}`)
      );

      setHabits((prevHabits) =>
        prevHabits.filter((h) => h.id !== habitToDelete.id)
      );

      setIsDeleteOpen(false);
      toast({
        title: <Text fontWeight="600">Hábito eliminado</Text>,
        description: `Se eliminó el hábito "${habitToDelete.name}" correctamente.`,
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "bottom-center",
        containerStyle: { borderRadius: themeOptions.borderRadius },
      });
    } catch (error) {
      toast({
        title: <Text fontWeight="600">Error al eliminar</Text>,
        description: "No se pudo eliminar el hábito. Inténtalo de nuevo.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom-center",
        containerStyle: { borderRadius: themeOptions.borderRadius },
      });
    }
  };

  const completedHabit = async (habit) => {
    try {
      const now = new Date();
      const recordId = now.toISOString();

      let recordData = {
        status: "completed",
        timestamp: now,
        date: now.toISOString().split("T")[0],
      };

      if (habit.type === "weekly") {
        recordData.week = getWeekNumber(now);
      } else if (habit.type === "monthly") {
        recordData.month = now.getMonth() + 1;
        recordData.year = now.getFullYear();
      } else if (habit.repeat.type === "day" && habit.daysOfWeek) {
        const dayOfWeek = now.getDay();
        if (!habit.daysOfWeek.includes(dayOfWeek === 0 ? 7 : dayOfWeek)) {
          toast({
            title: <Text fontWeight="600">Hábito no programado</Text>,
            description: `El hábito "${habit.name}" no está programado para hoy.`,
            status: "warning",
            isClosable: true,
            containerStyle: { borderRadius: themeOptions.borderRadius },
          });
          return;
        }
      }

      await setDoc(
        doc(
          db,
          `users/${user.uid}/areas/${areaId}/habits/${habit.id}/records/${recordId}`
        ),
        recordData
      );

      toast({
        title: <Text fontWeight="600">¡Hábito completado!</Text>,
        description: `Se ha completado el hábito "${habit.name}" por hoy correctamente.`,
        status: "success",
        isClosable: true,
        containerStyle: { borderRadius: themeOptions.borderRadius },
      });
    } catch (error) {
      toast({
        title: <Text fontWeight="600">Error al completar</Text>,
        description: "Ha ocurrido un problema. Prueba más tarde.",
        status: "error",
        isClosable: true,
        containerStyle: { borderRadius: themeOptions.borderRadius },
      });
    }
  };

  const skipedHabit = async (habit) => {
    try {
      const now = new Date();
      const recordId = now.toISOString();

      await setDoc(
        doc(
          db,
          `users/${user.uid}/areas/${areaId}/habits/${habit.id}/records/${recordId}`
        ),
        {
          status: "skipped",
          timestamp: now,
          date: now.toISOString().split("T")[0],
        }
      );

      toast({
        title: <Text fontWeight="600">Hábito saltado</Text>,
        description: `Se ha saltado el hábito "${habit.name}".`,
        status: "warning",
        isClosable: true,
        containerStyle: { borderRadius: themeOptions.borderRadius },
      });
    } catch (error) {
      toast({
        title: <Text fontWeight="600">Error al saltar</Text>,
        description: "Ha ocurrido un problema. Prueba más tarde.",
        status: "error",
        isClosable: true,
        containerStyle: { borderRadius: themeOptions.borderRadius },
      });
    }
  };

  const checkFailedHabits = async () => {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    habits.forEach(async (habit) => {
      const dayDoc = doc(
        db,
        `users/${user.uid}/areas/${areaId}/habits/${habit.id}/days/${
          new Date().toISOString().split("T")[0]
        }`
      );
      const daySnap = await getDoc(dayDoc);

      if (!daySnap.exists()) {
        await setDoc(dayDoc, { status: "failed", timestamp: new Date() });
      }
    });
  };

  // Función para obtener el número de semana
  const getWeekNumber = (date) => {
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  };

  const HabitCard = ({
    habit,
    areaId,
    confirmDelete,
    completedHabit,
    skipedHabit,
  }) => {
    const [isHovered, setIsHovered] = useState(false);
    const IconComponent = LuIcons[habit.icon] || LuIcons.LuFolder;

    return (
      <>
        <LinkBox
          as="article"
          key={habit.id}
          p={3}
          borderWidth="2px"
          borderRadius={themeOptions.borderRadius}
          w="100%"
          maxH="min-content"
          userSelect="none"
          cursor="pointer"
          transition=".1s all linear"
          onClick={() => {}}
          bg={colorMode === "light" ? "rgb(255, 255, 255)" : "rgb(0, 0, 0)"}
          _hover={{
            bg:
              colorMode === "light"
                ? `var(--chakra-colors-${themeOptions.focusColor}-50)`
                : "var(--chakra-colors-blackAlpha-600)",
            borderColor: `var(--chakra-colors-${themeOptions.focusColor}-500)`,
          }}
        >
          <Box as="time" fontSize="sm" opacity={0.8}>
            {habit.createdAt
              ? `${habit.createdAt.toDate().toLocaleDateString("es-ES", {
                  day: "2-digit",
                })} de ${habit.createdAt
                  .toDate()
                  .toLocaleDateString("es-ES", {
                    month: "long",
                  })
                  .replace(/^\w/, (c) => c.toUpperCase())} de ${habit.createdAt
                  .toDate()
                  .getFullYear()}`
              : "Sin fecha de creación"}
          </Box>
          <HStack alignItems="center">
            <IconComponent size="20px" />
            <Text
              my={2}
              fontFamily={themeOptions.fontFamily}
              fontSize="xl"
              fontWeight="600"
            >
              <LinkOverlay>{habit.name}</LinkOverlay>
            </Text>
          </HStack>
          <Text
            fontFamily={themeOptions.fontFamily}
            fontSize="sm"
            fontWeight="400"
            opacity={0.8}
          >
            Todos los días a las{" "}
            {habit.repeat.type === "day" ? habit.reminder : "--:-- "}h
          </Text>
          <Tooltip
            label="Opciones"
            aria-label="Tooltip"
            borderRadius={themeOptions.borderRadius}
            bg={colorMode === "light" ? "rgb(255, 255, 255)" : "rgb(0, 0, 0)"}
            color={
              colorMode === "light" ? "rgb(0, 0, 0)" : "rgb(255, 255, 255)"
            }
          >
            <Menu>
              <MenuButton
                as={IconButton}
                aria-label="Options"
                icon={<LuIcons.LuEllipsisVertical />}
                position="absolute"
                right={1}
                top={1}
                fontSize="lg"
                bg="transparent"
                size="sm"
                borderRadius={themeOptions.borderRadius}
              />
              <MenuList
                m={0}
                p={0}
                minW="auto"
                borderRadius={themeOptions.borderRadius}
                bg={
                  colorMode === "light" ? "var(--menu-bg)" : "rgb(23, 23, 23)"
                }
              >
                <MenuItem
                  icon={<LuIcons.LuCheck size={16} />}
                  borderTopRadius={themeOptions.borderRadius}
                  bg={
                    colorMode === "light" ? "var(--menu-bg)" : "rgb(23, 23, 23)"
                  }
                  _hover={{
                    bg:
                      colorMode === "light"
                        ? "rgb(237 242 247)"
                        : "rgba(255, 255, 255, 0.06)",
                  }}
                  onClick={() => completedHabit(habit)}
                >
                  Completado
                </MenuItem>
                <MenuItem
                  icon={<LuIcons.LuArrowRight size={16} />}
                  bg={
                    colorMode === "light" ? "var(--menu-bg)" : "rgb(23, 23, 23)"
                  }
                  _hover={{
                    bg:
                      colorMode === "light"
                        ? "rgb(237 242 247)"
                        : "rgba(255, 255, 255, 0.06)",
                  }}
                  onClick={() => skipedHabit(habit)}
                >
                  Saltar
                </MenuItem>
                <MenuItem
                  icon={<LuIcons.LuPenLine size={16} />}
                  bg={
                    colorMode === "light" ? "var(--menu-bg)" : "rgb(23, 23, 23)"
                  }
                  _hover={{
                    bg:
                      colorMode === "light"
                        ? "rgb(237 242 247)"
                        : "rgba(255, 255, 255, 0.06)",
                  }}
                  onClick={() => {
                    setSelectedHabit(habit);
                    onOpen();
                  }}
                >
                  Editar
                </MenuItem>
                <MenuItem
                  icon={<LuIcons.LuTrash size={16} />}
                  borderBottomRadius={themeOptions.borderRadius}
                  bg={
                    colorMode === "light" ? "var(--menu-bg)" : "rgb(23, 23, 23)"
                  }
                  _hover={{
                    bg:
                      colorMode === "light"
                        ? "rgb(237 242 247)"
                        : "rgba(255, 255, 255, 0.06)",
                  }}
                  onClick={() => confirmDelete(habit)}
                >
                  Eliminar
                </MenuItem>
              </MenuList>
            </Menu>
          </Tooltip>

          {/* Botones visibles solo en hover */}
          {isHovered && (
            <HStack position="absolute" top={2} right={2}>
              <IconButton
                aria-label="Editar hábito"
                icon={<LuIcons.LuPencil />}
                size="sm"
                variant="ghost"
                onClick={() => console.log("Editar", habit.id)}
              />
              <IconButton
                aria-label="Eliminar hábito"
                icon={<LuIcons.LuTrash />}
                size="sm"
                variant="ghost"
                colorScheme="red"
                onClick={() => console.log("Eliminar", habit.id)}
              />
            </HStack>
          )}
        </LinkBox>
        <ModalHabit
          isOpen={isOpen}
          onClose={() => {
            setSelectedHabit(null);
            onClose();
          }}
          selectedHabit={selectedHabit}
        />

        <AlertDialog
          isOpen={isDeleteOpen}
          leastDestructiveRef={cancelRef}
          onClose={() => setIsDeleteOpen(false)}
          isCentered
        >
          <AlertDialogOverlay>
            <AlertDialogContent
              borderRadius={themeOptions.borderRadius}
              bg={
                colorMode === "light" ? "rgb(245, 245, 245)" : "rgb(23, 23, 23)"
              }
            >
              <AlertDialogHeader p={4} fontSize="lg" fontWeight="600">
                ¿Eliminar este hábito: {habitToDelete?.name}?
              </AlertDialogHeader>
              <AlertDialogBody px={4}>
                <Text fontSize="md">
                  Se eliminará el hábito "{habitToDelete?.name}" y sus
                  progresos. Esta acción no se puede deshacer.
                </Text>
              </AlertDialogBody>
              <AlertDialogFooter p={4}>
                <Button ref={cancelRef} onClick={() => setIsDeleteOpen(false)}>
                  Cancelar
                </Button>
                <Button colorScheme="red" onClick={handleDelete} ml={3}>
                  Eliminar
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </>
    );
  };

  // Show content based on areas load
  const renderContent = () => {
    if (isLoaded && habits.length > 0) {
      return viewLayout === "grid" ? (
        <Grid
          templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(3, 1fr)" }}
          gap={3}
          w="100%"
        >
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              areaId={areaId}
              confirmDelete={confirmDelete}
              completedHabit={completedHabit}
              skipedHabit={skipedHabit}
            />
          ))}
        </Grid>
      ) : (
        <VStack spacing={3}>
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              areaId={areaId}
              confirmDelete={confirmDelete}
              completedHabit={completedHabit}
              skipedHabit={skipedHabit}
            />
          ))}
        </VStack>
      );
    } else {
      return (
        <VStack
          w="100%"
          h={`calc(100vh - 90px)`}
          alignItems="center"
          justifyContent="center"
          userSelect="none"
        >
          <Stack mb={2} borderRadius={themeOptions.borderRadius}>
            <Skeleton
              w="200px"
              h="40px"
              borderRadius={themeOptions.borderRadius}
            />
            <Skeleton
              w="200px"
              h="40px"
              borderRadius={themeOptions.borderRadius}
            />
            <Skeleton
              w="200px"
              h="40px"
              borderRadius={themeOptions.borderRadius}
            />
          </Stack>
          <Text as="h2" fontSize="xl" fontWeight="600">
            Da el paso y construye tu mejor versión
          </Text>
          <Text as="h2" fontSize="sm" maxW="600px" textAlign="center">
            Los hábitos son como los escalones de una escalera: al dar el primer
            paso, el resto se va sumando uno a uno.
          </Text>
          <Button
            ps={3}
            mt={2}
            colorScheme={themeOptions.focusColor}
            variant="ghost"
            leftIcon={<FaPlus size="16px" />}
            iconSpacing={1}
            onClick={onOpen}
          >
            Añadir una hábito
          </Button>
          <ModalHabit isOpen={isOpen} onClose={onClose} />
        </VStack>
      );
    }
  };

  return (
    <Box
      w="100%"
      minH="100vh"
      bg={colorMode === "light" ? "rgb(245, 245, 245)" : "rgb(23, 23, 23)"}
    >
      <ColumnHeader
        page="habit"
        title={area ? area.name : "Área no encontrada"}
      />
      <Box p={3}>{renderContent()}</Box>
    </Box>
  );
};

export default AreaPage;
