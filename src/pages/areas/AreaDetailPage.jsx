import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useOutletContext, useParams, useSearchParams } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext/ThemeContext";
import { useAuthUser } from "../../context/AuthUserContext/AuthUserContext";
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
  completeHabit,
  getAreaName,
} from "../../hooks/useDatabase";
import {
  ColumnHeader,
  HabitModal,
  HabitCard,
  ConfirmationModal,
  EmptyState,
  GoalModal,
} from "../../exports";

const AreaDetailPage = () => {
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
  const [, setCompletingHabitId] = useState(null);
  const { areas, onOpenLeftMenu, onOpenRightMenu, isMobile, setSelectedHabit } =
    useOutletContext();
  const [habitToCompleteQuantified, setHabitToCompleteQuantified] =
    useState(null);
  const {
    isOpen: isQuantityModalOpen,
    onOpen: openQuantityModal,
    onClose: closeQuantityModal,
  } = useDisclosure();
  const [isSaving, setIsSaving] = useState(false);
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
  const inputRef = useRef(null);

  const todayFormatted = useMemo(() => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (!user?.uid || !areaId) {
      setHabits([]);
      setDataLoading(false);
      setDataError(
        !user?.uid
          ? "Necesitas iniciar sesión para ver tus hábitos."
          : "Área no encontrada."
      );
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
      () => {
        setDataError("No se pudieron cargar los hábitos de esta área.");
        setDataLoading(false);
      }
    );

    return () => unsubscribe?.();
  }, [user?.uid, areaId, authLoading]);

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

  const executeCompleteHabit = useCallback(
    async (habit, amount) => {
      if (!habit || amount <= 0 || isNaN(amount)) {
        toast({
          title: <Text fontWeight={600}>Valor inválido</Text>,
          description: "La cantidad debe ser un número positivo.",
          status: "warning",
          position: "bottom",
        });
        return;
      }

      setIsSaving(true);
      setCompletingHabitId(habit.id);
      try {
        await completeHabit(
          user.uid,
          habit.area,
          habit.id,
          habit,
          toast,
          todayFormatted,
          amount
        );
      } catch (error) {
        toast({
          title: <Text fontWeight={600}>Error al completar</Text>,
          description:
            error?.message ||
            "No se pudo completar el hábito. Inténtalo de nuevo.",
          status: "error",
          position: "bottom",
        });
      } finally {
        setIsSaving(false);
        closeQuantityModal();
        setHabitToCompleteQuantified(null);
        setCompletingHabitId(null);
      }
    },
    [user?.uid, toast, closeQuantityModal, todayFormatted]
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

      if (habit.goals?.value > 1 || habit.goals?.unit === "minutes") {
        setHabitToCompleteQuantified(habit);
        openQuantityModal();
      } else {
        executeCompleteHabit(habit, 1);
      }
    },
    [user?.uid, toast, openQuantityModal, executeCompleteHabit]
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
          size="lg"
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
      <ColumnHeader
        page="habit"
        title={getAreaName(areaId, areas)}
        isMobile={isMobile}
        onOpenLeftMenu={onOpenLeftMenu}
        onOpenRightMenu={onOpenRightMenu}
      />
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
                handleComplete={handleComplete}
                handleSkip={handleSkip}
                handleEdit={handleEdit}
                confirmDelete={handleConfirmDelete}
                setSelectedHabit={setSelectedHabit}
              />
            ))}
          </SimpleGrid>
        ) : (
          <EmptyState type="habits" />
        )}
        <ConfirmationModal
          isOpen={isDeleteOpen}
          onClose={closeDeleteModal}
          title={`¿Deseas eliminar el hábito: ${habitToDelete?.name}?`}
          description="Perderás todos los registros que contenga dicho hábito y su progreso. Esta acción no se puede deshacer."
          onConfirm={handleDelete}
          confirmButtonText="Sí, eliminar"
          cancelButtonText="No, cancelar"
        />
        <HabitModal
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
        <GoalModal
          isOpen={isQuantityModalOpen}
          onClose={closeQuantityModal}
          title={`Completar "${habitToCompleteQuantified?.name || "hábito"}"`}
          description="Cantidad completada"
          unitType={
            habitToCompleteQuantified?.goals?.unit === "minutes"
              ? "minuto(s)"
              : "vez(veces)"
          }
          initialValue={
            habitToCompleteQuantified?.goals?.unit === "minutes"
              ? Math.min(habitToCompleteQuantified.goals.value, 15)
              : 1
          }
          maxValue={habitToCompleteQuantified?.goals?.value}
          onConfirm={(amount) => {
            if (habitToCompleteQuantified) {
              executeCompleteHabit(habitToCompleteQuantified, amount);
            }
          }}
          confirmButtonText="Registrar"
          cancelButtonText="Cancelar"
          isLoading={isSaving}
          inputRef={inputRef}
        />
      </VStack>
    </Box>
  );
};

export default AreaDetailPage;
