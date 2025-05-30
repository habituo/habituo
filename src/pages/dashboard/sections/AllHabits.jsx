import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import { useAuthUser } from "../../../context/AuthUserContext";
import {
  VStack,
  Box,
  Text,
  Divider,
  SimpleGrid,
  useColorMode,
  Alert,
  AlertIcon,
  HStack,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import {
  getAllHabitsByArea,
  deleteHabit as deleteHabitFromDb,
  skipHabit as skipHabitInDb,
  completeHabit as completeHabitInDb,
  checkFailedHabit as checkFailedHabitInDb,
  getWeekNumber,
} from "../../../hooks/database";
import {
  ColumnHeader,
  ModalHabit,
  HabitCard,
  ConfirmationModal,
  NoDataPage,
} from "../../../routes/index";

const AllHabits = ({ setSelectedHabit }) => {
  const { themeOptions } = useTheme();
  const { colorMode } = useColorMode();
  const { user } = useAuthUser();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const isMountedRef = useRef(true);
  const [habitToEdit, setHabitToEdit] = useState(null);
  const [habitsByArea, setHabitsByArea] = useState([]);
  const [habitToDelete, setHabitToDelete] = useState(null);
  const [searchParams] = useSearchParams();
  const {
    isOpen: isDeleteOpen,
    onOpen: openDeleteModal,
    onClose: closeDeleteModal,
  } = useDisclosure();
  const {
    isOpen: isModalHabitOpen,
    onOpen: openModalHabit,
    onClose: closeModalHabit,
  } = useDisclosure();

  const refreshHabits = useCallback(async () => {
    if (!user?.uid) {
      setHabitsByArea([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const fetchedHabits = await getAllHabitsByArea(user.uid);
      if (isMountedRef.current) {
        setHabitsByArea(fetchedHabits);
      }
    } catch (error) {
      toast({
        title: <Text fontWeight={600}>Error de carga</Text>,
        description: "No se pudieron cargar los hábitos. Inténtalo de nuevo.",
        status: "error",
        position: "bottom",
      });
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [user?.uid, toast]);

  useEffect(() => {
    isMountedRef.current = true;
    refreshHabits();

    return () => {
      isMountedRef.current = false;
    };
  }, [refreshHabits]);

  useEffect(() => {
    if (!user?.uid || habitsByArea.length === 0) return;

    habitsByArea.forEach((area) => {
      area.habits.forEach((habit) => {
        checkFailedHabitInDb(user.uid, area.id, habit.id, toast, habit.name);
      });
    });

    const interval = setInterval(() => {
      habitsByArea.forEach((area) => {
        area.habits.forEach((habit) => {
          checkFailedHabitInDb(user.uid, area.id, habit.id, toast, habit.name);
        });
      });
    }, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user?.uid, habitsByArea, toast]);

  const confirmDelete = useCallback(
    (habit) => {
      setHabitToDelete(habit);
      openDeleteModal();
    },
    [openDeleteModal]
  );

  const handleEdit = useCallback(
    (habit) => {
      setHabitToEdit(habit);
      setSelectedHabit(habit);
      openModalHabit();
    },
    [setSelectedHabit, openModalHabit]
  );

  const handleDelete = useCallback(async () => {
    if (!habitToDelete || !user?.uid) return;

    try {
      await deleteHabitFromDb(user.uid, habitToDelete.area, habitToDelete.id);
      closeDeleteModal();
      refreshHabits();
      toast({
        title: <Text fontWeight={600}>Hábito eliminado</Text>,
        description: `Se eliminó el hábito "${habitToDelete.name}" correctamente.`,
        status: "success",
        position: "bottom",
      });
    } catch (error) {
      toast({
        title: <Text fontWeight={600}>Error al eliminar</Text>,
        description: "No se pudo eliminar el hábito. Inténtalo de nuevo.",
        status: "error",
        position: "bottom",
      });
    }
  }, [habitToDelete, user?.uid, closeDeleteModal, refreshHabits, toast]);

  const handleSkip = useCallback(
    (habit) => {
      if (!user?.uid) return;
      skipHabitInDb(user.uid, habit.area, habit.id, toast, habit.name);
    },
    [user?.uid, toast]
  );

  const handleComplete = useCallback(
    (habit) => {
      if (!habit || !user?.uid) {
        toast({
          title: <Text fontWeight="600">Error</Text>,
          description:
            "No se ha seleccionado ningún hábito válido para completar.",
          status: "error",
          position: "bottom",
        });
        return;
      }
      completeHabitInDb(
        user.uid,
        habit.area,
        habit.id,
        habit,
        toast,
        getWeekNumber
      );
    },
    [user?.uid, toast]
  );

  const handleModalHabitClose = useCallback(
    (shouldRefresh) => {
      setHabitToEdit(null);
      setSelectedHabit(null);
      closeModalHabit();

      if (shouldRefresh) {
        refreshHabits();
      }
    },
    [closeModalHabit, refreshHabits, setSelectedHabit]
  );

  const orderBy = searchParams.get("order_by") || "asc";
  const viewLayout = searchParams.get("layout") || "grid";

  const filteredHabitsByArea = React.useMemo(() => {
    if (isLoading || !habitsByArea || habitsByArea.length === 0) return [];

    return habitsByArea.map((area) => ({
      ...area,
      habits: [...area.habits].sort((a, b) => {
        const nameA = a.name || "";
        const nameB = b.name || "";

        if (orderBy === "asc") return nameA.localeCompare(nameB);
        if (orderBy === "desc") return nameB.localeCompare(nameA);
        if (orderBy === "new-creation")
          return (
            (b.registeredAt?.toDate() || 0) - (a.registeredAt?.toDate() || 0)
          );
        if (orderBy === "last-creation")
          return (
            (a.registeredAt?.toDate() || 0) - (b.registeredAt?.toDate() || 0)
          );
        return 0;
      }),
    }));
  }, [habitsByArea, orderBy, isLoading]);

  return (
    <Box
      w="100%"
      minH="100vh"
      maxH="100vh"
      overflowY="scroll"
      bg={colorMode === "light" ? "gray.100" : "gray.900"}
    >
      <ColumnHeader
        page="all-habits"
        title="Todos los hábitos"
        onModalCloseAndRefresh={refreshHabits}
      />
      {isLoading ? (
        <NoDataPage type="loading" />
      ) : filteredHabitsByArea.length === 0 ? (
        <NoDataPage type="habits" />
      ) : (
        <VStack p={4} spacing={6} align="stretch">
          {filteredHabitsByArea.map((area) => (
            <div key={area.id}>
              <HStack justify="flex-start">
                <Text as="h2" fontSize="xl" fontWeight={600}>
                  {area.name}
                </Text>
                <Text
                  fontSize="md"
                  fontWeight={400}
                  color={colorMode === "light" ? "gray.400" : "#ffffff50"}
                >
                  - {area.habits.length}
                </Text>
              </HStack>
              <Divider my={2} />
              {area.habits.length > 0 ? (
                <SimpleGrid
                  columns={{
                    base: 1,
                    md: viewLayout === "grid" ? 2 : 1,
                    lg: viewLayout === "grid" ? 3 : 1,
                  }}
                  spacing={4}
                  mt={4}
                >
                  {area.habits.map((habit) => (
                    <HabitCard
                      key={habit.id}
                      habit={habit}
                      setSelectedHabit={setSelectedHabit}
                      handleComplete={handleComplete}
                      handleSkip={handleSkip}
                      handleEdit={handleEdit}
                      confirmDelete={confirmDelete}
                    />
                  ))}
                </SimpleGrid>
              ) : (
                <Alert status="info" borderRadius={themeOptions.borderRadius}>
                  <AlertIcon />
                  No hay hábitos disponibles para esta área
                </Alert>
              )}
            </div>
          ))}

          <ConfirmationModal
            isOpen={isDeleteOpen}
            onClose={closeDeleteModal}
            title={`¿Deseas eliminar el hábito: ${habitToDelete?.name}?`}
            description="Perderás todos los registros que contenga dicho hábito y sus progresos. Esta acción no se puede deshacer."
            onConfirm={handleDelete}
            confirmButtonText="Sí, eliminar"
            cancelButtonText="No, cancelar"
          />
          <ModalHabit
            isOpen={isModalHabitOpen}
            onClose={handleModalHabitClose}
            selectedHabit={habitToEdit}
          />
        </VStack>
      )}
    </Box>
  );
};

export default AllHabits;
