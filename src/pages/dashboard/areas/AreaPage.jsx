import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import { useAuthUser } from "../../../context/AuthUserContext";
import {
  SimpleGrid,
  VStack,
  Box,
  Text,
  Center,
  Spinner,
  Alert,
  AlertIcon,
  useToast,
  useDisclosure,
  useColorMode,
} from "@chakra-ui/react";
import {
  subscribeToHabitsByArea,
  deleteHabit as deleteHabitFromDb,
  skipHabit as skipHabitInDb,
  completeHabit as completeHabitInDb,
  checkFailedHabit as checkFailedHabitInDb,
  getAreaNameById,
  getWeekNumber,
} from "../../../hooks/database";
import {
  ColumnHeader,
  ModalHabit,
  HabitCard,
  ConfirmationModal,
  NoDataPage,
} from "../../../routes/index";

const AreaPage = ({ areas, setSelectedHabit }) => {
  const { themeOptions } = useTheme();
  const { colorMode } = useColorMode();
  const { user, loading: authLoading } = useAuthUser();
  const toast = useToast();
  const { areaId } = useParams();
  const [habits, setHabits] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState(null);
  const [habitToDelete, setHabitToDelete] = useState(null);
  const [habitToEdit, setHabitToEdit] = useState(null);
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

  useEffect(() => {
    if (authLoading) {
      setDataLoading(true);
      return;
    }

    if (!user?.uid || !areaId) {
      setHabits([]);
      setDataLoading(false);
      if (!user?.uid) {
        setDataError("Necesitas iniciar sesión para ver tus hábitos.");
      } else {
        setDataError(
          "Área no encontrada. Por favor, selecciona un área válida."
        );
      }
      return;
    }

    setDataLoading(true);
    setDataError(null);
    const unsubscribe = subscribeToHabitsByArea(
      user.uid,
      areaId,
      (habitsData) => {
        setHabits(habitsData);
        setDataLoading(false);
        setDataError(null);
      },
      (err) => {
        setDataError(
          "No se pudieron cargar los hábitos de esta área. Inténtalo de nuevo."
        );
        setDataLoading(false);
      }
    );

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [user?.uid, areaId, authLoading]);

  useEffect(() => {
    if (!user?.uid || habits.length === 0) return;

    const runCheck = () => {
      habits.forEach((habit) => {
        checkFailedHabitInDb(user.uid, habit.area, habit.id, toast, habit.name);
      });
    };

    runCheck();
    const interval = setInterval(runCheck, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [habits, user?.uid, toast]);

  const handleConfirmDelete = useCallback(
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
    [openModalHabit, setSelectedHabit]
  );

  const handleDelete = useCallback(async () => {
    if (!habitToDelete || !user?.uid) return;

    try {
      await deleteHabitFromDb(user.uid, habitToDelete.area, habitToDelete.id);
      closeDeleteModal();
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
  }, [habitToDelete, user?.uid, closeDeleteModal, toast]);

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
          title: <Text fontWeight={600}>Error</Text>,
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
    [user?.uid, toast, getWeekNumber]
  );

  const orderBy = searchParams.get("order_by") || "asc";
  const viewLayout = searchParams.get("layout") || "grid";

  const sortedHabits = useMemo(() => {
    if (!habits || habits.length === 0) {
      return [];
    }
    return [...habits].sort((a, b) => {
      if (orderBy === "asc") return a.name.localeCompare(b.name);
      if (orderBy === "desc") return b.name.localeCompare(a.name);
      return 0;
    });
  }, [habits, orderBy]);

  const isLoading = authLoading || dataLoading;
  const hasError =
    authLoading && !user?.uid ? "Necesitas iniciar sesión." : dataError;

  if (isLoading) {
    return (
      <Center
        w="100%"
        minH="100vh"
        maxH="100vh"
        bg={colorMode === "light" ? "gray.100" : "gray.900"}
        p={4}
      >
        <Spinner
          size="xl"
          thickness="4px"
          emptyColor={colorMode === "light" ? "gray.200" : "gray.700"}
          color={`${themeOptions.focusColor}.500`}
        />
      </Center>
    );
  }

  if (hasError) {
    return (
      <Box
        w="100%"
        minH="100vh"
        maxH="100vh"
        bg={colorMode === "light" ? "gray.100" : "gray.900"}
        p={4}
      >
        <Alert status="error" borderRadius={themeOptions.borderRadius}>
          <AlertIcon />
          {hasError}
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      w="100%"
      minH="100vh"
      maxH="100vh"
      overflowY="scroll"
      bg={colorMode === "light" ? "gray.100" : "gray.900"}
    >
      <ColumnHeader page="habit" title={getAreaNameById(areaId, areas)} />
      <VStack spacing={6} align="stretch" p={4}>
        {habits.length > 0 ? (
          <SimpleGrid
            columns={{
              base: 1,
              md: viewLayout === "grid" ? 2 : 1,
              lg: viewLayout === "grid" ? 3 : 1,
            }}
            spacing={4}
          >
            {sortedHabits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                setSelectedHabit={setSelectedHabit}
                handleComplete={handleComplete}
                handleSkip={handleSkip}
                handleEdit={handleEdit}
                confirmDelete={handleConfirmDelete}
              />
            ))}
          </SimpleGrid>
        ) : (
          <NoDataPage type="habits" />
        )}
        <ModalHabit
          isOpen={isModalHabitOpen}
          onClose={() => {
            setHabitToEdit(null);
            setSelectedHabit(null);
            closeModalHabit();
          }}
          selectedHabit={habitToEdit}
          userId={user?.uid}
          areaId={areaId}
        />
        <ConfirmationModal
          isOpen={isDeleteOpen}
          onClose={closeDeleteModal}
          title={`¿Deseas eliminar el hábito: ${habitToDelete?.name}?`}
          description="Perderás todos los registros que contenga dicho hábito y su progreso. Esta acción no se puede deshacer."
          onConfirm={handleDelete}
          confirmButtonText="Sí, eliminar"
          cancelButtonText="No, cancelar"
        />
      </VStack>
    </Box>
  );
};

export default AreaPage;
