import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useParams } from "react-router-dom";
import { getAllHabitsByArea } from "../../../hooks/database";
import { auth } from "../../../hooks/firebase";
import { ColumnHeader, ModalHabit } from "../../../routes/index";
import {
  VStack,
  Box,
  Text,
  Stack,
  Skeleton,
  Button,
  Grid,
  useColorMode,
  Alert,
  AlertIcon,
  IconButton,
  LinkBox,
  HStack,
  LinkOverlay,
  Tooltip,
  Menu,
  MenuItem,
  MenuList,
  MenuButton,
  useDisclosure,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import { useTheme } from "../../../context/ThemeContext";
import { FaPlus } from "react-icons/fa6";
import { db } from "../../../hooks/firebase";
import {
  collection,
  onSnapshot,
  deleteDoc,
  setDoc,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { useAuth } from "../../../context/AuthContext";
import * as LuIcons from "react-icons/lu";

const AllHabits = ({ setSelectedHabit }) => {
  const { themeOptions } = useTheme();
  const { colorMode } = useColorMode();
  const [isLoaded, setIsLoaded] = useState(false);
  const [habits, setHabits] = useState([]);
  const [habitsByArea, setHabitsByArea] = useState([]);
  const { areaId } = useParams();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const [selectedHabit] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState(null);
  const cancelRef = useRef();

  // useEffect(() => {
  //   if (!user) return;
  //   const userId = user.uid;
  //   const areasRef = collection(db, `users/${userId}/areas`);

  //   const unsubscribeAreas = onSnapshot(areasRef, async (areasSnapshot) => {
  //     const areasData = [];

  //     for (const areaDoc of areasSnapshot.docs) {
  //       const area = { id: areaDoc.id, ...areaDoc.data() };
  //       const habitsRef = collection(
  //         db,
  //         `users/${userId}/areas/${area.id}/habits`
  //       );

  //       const unsubscribeHabits = onSnapshot(habitsRef, (habitsSnapshot) => {
  //         const habits = habitsSnapshot.docs.map((doc) => ({
  //           id: doc.id,
  //           ...doc.data(),
  //         }));

  //         areasData.push({ ...area, habits });

  //         if (areasData.length === areasSnapshot.docs.length) {
  //           setHabitsByArea(areasData);
  //           setIsLoaded(true);
  //         }
  //       });
  //     }
  //   });

  //   return () => unsubscribeAreas();
  // }, [user]);

  useEffect(() => {
    if (!auth.currentUser) return;

    const unsubscribe = getAllHabitsByArea((areasData) => {
        setHabitsByArea(areasData);
        setIsLoaded(true);
    });

    return () => unsubscribe();
}, []);

  useEffect(() => {
    const interval = setInterval(checkFailedHabits, 60 * 60 * 1000);
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

  // Function to delete habit selected
  const handleDelete = async () => {
    if (!habitToDelete || !user) return;

    try {
      await deleteDoc(
        doc(
          db,
          `users/${user.uid}/areas/${habitToDelete.areaId}/habits/${habitToDelete.id}`
        )
      );
      setHabitsByArea((prev) =>
        prev.map((area) => ({
          ...area,
          habits: area.habits.filter((h) => h.id !== habitToDelete.id),
        }))
      );
      setIsDeleteOpen(false);
      toast({
        title: <Text fontWeight="600">Hábito eliminada</Text>,
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

  // Function to comlpete habit
  const completedHabit = async (habit) => {
    try {
      if (!user || !user.uid) {
        toast({
          title: <Text fontWeight="600">Error de autenticación</Text>,
          description: "Usuario no autenticado.",
          status: "error",
          isClosable: true,
          containerStyle: { borderRadius: themeOptions.borderRadius },
        });
        return;
      }

      const now = new Date();
      const dateString = now.toISOString();

      const recordsRef = collection(
        db,
        `users/${user.uid}/areas/${habit.area}/habits/${habit.id}/records`
      );
      const snapshot = await getDocs(recordsRef);

      const existingRecord = snapshot.docs.find(
        (doc) => doc.data().date === dateString
      );

      let recordData = {
        status: "completed",
        timestamp: now,
        date: dateString,
        times: 1,
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

      if (existingRecord) {
        await updateDoc(existingRecord.ref, {
          times: (existingRecord.data().times || 0) + 1,
        });
      } else {
        const recordId = dateString;
        await setDoc(
          doc(
            db,
            `users/${user.uid}/areas/${habit.area}/habits/${habit.id}/records/${recordId}`
          ),
          recordData
        );
      }

      toast({
        title: <Text fontWeight="600">¡Hábito completado!</Text>,
        description: `Se ha completado el hábito "${habit.name}" por hoy correctamente.`,
        status: "success",
        isClosable: true,
        containerStyle: { borderRadius: themeOptions.borderRadius },
      });
    } catch (error) {
      console.error("Error completing habit:", error);
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
      if (!user || !user.uid) {
        toast({
          title: <Text fontWeight="600">Error de autenticación</Text>,
          description: "Usuario no autenticado.",
          status: "error",
          isClosable: true,
          containerStyle: { borderRadius: themeOptions.borderRadius },
        });
        return;
      }

      if (!habit || !habit.id) {
        toast({
          title: <Text fontWeight="600">Error al mostrar los datos</Text>,
          description: "Hábito no seleccionado.",
          status: "error",
          isClosable: true,
          containerStyle: { borderRadius: themeOptions.borderRadius },
        });
        return;
      }

      const now = new Date();
      const dateString = now.toISOString().split("T")[0];

      const recordsRef = collection(
        db,
        `users/${user.uid}/areas/${habit.area}/habits/${habit.id}/records`
      );
      const snapshot = await getDocs(recordsRef);

      const existingRecord = snapshot.docs.find(
        (doc) => doc.data().date === dateString
      );

      let recordData = {
        status: "skipped",
        timestamp: now,
        date: dateString,
        times: 0,
      };

      if (existingRecord) {
        await updateDoc(existingRecord.ref, recordData);
      } else {
        const recordId = dateString;
        await setDoc(doc(recordsRef, recordId), recordData);
      }

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

  const checkFailedHabits = async (habit) => {
    try {
      const now = new Date();
      const dateString = now.toLocaleDateString();

      // Obtener todos los registros del hábito
      const recordsRef = collection(
        db,
        `users/${user.uid}/areas/${habit.area}/habits/${habit.id}/records`
      );
      const snapshot = await getDocs(recordsRef);

      // Verificar si existe un registro para el día actual usando JavaScript
      const recordExists = snapshot.docs.some(
        (doc) => doc.data().date === dateString
      );

      if (!recordExists) {
        // Si no hay registros para hoy, crear uno como "failed"
        const recordId = now.toISOString();
        await setDoc(
          doc(
            db,
            `users/${user.uid}/areas/${habit.area}/habits/${habit.id}/records/${recordId}`
          ),
          {
            status: "failed",
            timestamp: now,
            date: dateString,
          }
        );
      }
    } catch (error) {
      toast({
        title: <Text fontWeight="600">Error al registrar el proceso</Text>,
        description: "Ha ocurrido un problema. Prueba más tarde.",
        status: "error",
        isClosable: true,
        containerStyle: { borderRadius: themeOptions.borderRadius },
      });
    }
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

  // Show content based on habits load
  const renderContent = () => {
    if (habitsByArea.length > 0) {
      return (
        <>
          <Box p={3}>
            {habitsByArea.map((area) => (
              <Box key={area.id} py={4} borderBottomWidth="1px">
                <Text fontSize="xl" fontWeight="600" mb={2}>
                  {area.name}
                </Text>
                {area.habits.length > 0 ? (
                  <Grid
                    templateColumns={{
                      base: "repeat(1, 1fr)",
                      md:
                        viewLayout === "grid"
                          ? "repeat(3, 1fr)"
                          : "repeat(1, 1fr)",
                    }}
                    gap={3}
                    w="100%"
                  >
                    {area.habits.map((habit) => {
                      const IconComponent =
                        LuIcons[habit.icon] || LuIcons.LuFolder;
                      return (
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
                          onClick={() => {
                            setSelectedHabit(habit);
                          }}
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
                          <Box as="time" fontSize="sm" opacity={0.8}>
                            {habit.createdAt
                              ? `${habit.createdAt
                                  .toDate()
                                  .toLocaleDateString("es-ES", {
                                    day: "2-digit",
                                  })} de ${habit.createdAt
                                  .toDate()
                                  .toLocaleDateString("es-ES", {
                                    month: "long",
                                  })
                                  .replace(/^\w/, (c) =>
                                    c.toUpperCase()
                                  )} de ${habit.createdAt
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
                            {habit.repeat.type === "day"
                              ? habit.reminder
                              : "--:-- "}
                            h
                          </Text>
                          <Tooltip
                            label="Opciones"
                            aria-label="Tooltip"
                            borderRadius={themeOptions.borderRadius}
                            bg={
                              colorMode === "light"
                                ? "rgb(255, 255, 255)"
                                : "rgb(0, 0, 0)"
                            }
                            color={
                              colorMode === "light"
                                ? "rgb(0, 0, 0)"
                                : "rgb(255, 255, 255)"
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
                                  colorMode === "light"
                                    ? "var(--menu-bg)"
                                    : "rgb(23, 23, 23)"
                                }
                              >
                                <MenuItem
                                  icon={<LuIcons.LuCheck size={16} />}
                                  borderTopRadius={themeOptions.borderRadius}
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
                                  onClick={() => completedHabit(habit)}
                                >
                                  Completado
                                </MenuItem>
                                <MenuItem
                                  icon={<LuIcons.LuArrowRight size={16} />}
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
                                  onClick={() => skipedHabit(habit)}
                                >
                                  Saltar
                                </MenuItem>
                                <MenuItem
                                  icon={<LuIcons.LuPenLine size={16} />}
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
                                  onClick={() => confirmDelete(habit)}
                                >
                                  Eliminar
                                </MenuItem>
                              </MenuList>
                            </Menu>
                          </Tooltip>
                        </LinkBox>
                      );
                    })}
                  </Grid>
                ) : (
                  <Alert status="info" borderRadius={themeOptions.borderRadius}>
                    <AlertIcon />
                    No hay hábitos disponibles para esta área
                  </Alert>
                )}
              </Box>
            ))}
          </Box>

          <ModalHabit
            isOpen={isOpen}
            onClose={() => {
              setSelectedHabit(null);
              onClose();
            }}
            selectedHabit={selectedHabit}
            isCentered
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
                  colorMode === "light"
                    ? "rgb(245, 245, 245)"
                    : "rgb(23, 23, 23)"
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
                  <Button
                    ref={cancelRef}
                    onClick={() => setIsDeleteOpen(false)}
                  >
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
              isLoaded={isLoaded}
              w="200px"
              h="40px"
              borderRadius={themeOptions.borderRadius}
            />
            <Skeleton
              isLoaded={isLoaded}
              w="200px"
              h="40px"
              borderRadius={themeOptions.borderRadius}
            />
            <Skeleton
              isLoaded={isLoaded}
              w="200px"
              h="40px"
              borderRadius={themeOptions.borderRadius}
            />
          </Stack>
          <Text as="h2" fontSize="lg" fontFamily="600">
            Da el paso y construye tu mejor versión
          </Text>
          <Text as="h2" fontSize="sm" maxW="600px" textAlign="center">
            Los hábitos son como los escalones de una escalera: al dar el primer
            paso, el resto se va sumando uno a uno.
          </Text>
          <Button
            mt={2}
            variant="outline"
            leftIcon={<FaPlus size="16px" />}
            iconSpacing={1}
          >
            Añadir un hábito
          </Button>
        </VStack>
      );
    }
  };

  return (
    <Box
      w="100%"
      minH="100vh"
      maxH="100vh"
      overflowY="scroll"
      userSelect="none"
      sx={{
        "&::-webkit-scrollbar": {
          width: "6px",
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
      bg={colorMode === "light" ? "rgb(245, 245, 245)" : "rgb(23, 23, 23)"}
    >
      <ColumnHeader page="all-habits" title="Todos los hábitos" />
      {renderContent()}
    </Box>
  );
};

export default AllHabits;
