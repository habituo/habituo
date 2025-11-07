import { useState, useRef, useCallback, useMemo } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { compareByOrder } from "../../utils/sortingUtils/sortingUtils";
import { useAuthUser } from "../../context/AuthUserContext/AuthUserContext";
import {
  VStack,
  Box,
  Text,
  Divider,
  SimpleGrid,
  useColorMode,
  HStack,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { completeHabit, skipHabit, deleteHabit } from "../../hooks/useDatabase";
import {
  ColumnHeader,
  HabitModal,
  HabitCard,
  ConfirmationModal,
  GoalModal,
  EmptyState,
} from "../../exports";

const AllHabitsPage = () => {
  const { colorMode } = useColorMode();
  const { user } = useAuthUser();
  const toast = useToast();
  const {
    areas,
    habitsByArea,
    setSelectedHabit,
    isMobile,
    onOpenLeftMenu,
  onOpenRightMenu,
    loadingData,
  } = useOutletContext();
  const [isSaving, setIsSaving] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState(null);
  const [habitToDelete, setHabitToDelete] = useState(null);
  const [habitToCompleteQuantified, setHabitToCompleteQuantified] =
    useState(null);
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
  const {
    isOpen: isQuantityModalOpen,
    onOpen: openQuantityModal,
    onClose: closeQuantityModal,
  } = useDisclosure();
  const inputRef = useRef(null);

  const todayFormatted = useMemo(() => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

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
      openModalHabit();
    },
    [openModalHabit]
  );

  const handleDelete = useCallback(async () => {
    if (!habitToDelete || !user?.uid) return;

    setIsSaving(true);
    try {
      await deleteHabit(
        user.uid,
        habitToDelete.area,
        habitToDelete.id,
        toast,
        habitToDelete.name,
        new Date()
      );

      toast({
        title: <Text fontWeight={600}>Hábito eliminado</Text>,
        description: `Se eliminó el hábito "${habitToDelete.name}" correctamente.`,
        status: "success",
        position: "bottom",
      });
      closeDeleteModal();
      setHabitToDelete(null);
    } catch (error) {
      toast({
        title: <Text fontWeight={600}>Error al eliminar</Text>,
        description:
          error.message || "No se pudo eliminar el hábito. Inténtalo de nuevo.",
        status: "error",
        position: "bottom",
      });
    } finally {
      setIsSaving(false);
    }
  }, [habitToDelete, user?.uid, closeDeleteModal, toast]);

  const handleSkip = useCallback(
    async (habit) => {
      if (!user?.uid) return;
      try {
        await skipHabit(
          user.uid,
          habit.area,
          habit.id,
          toast,
          habit.name,
          new Date()
        );
        toast({
          title: <Text fontWeight={600}>Hábito omitido</Text>,
          description: `"${habit.name}" ha sido omitido para hoy.`,
          status: "info",
          position: "bottom",
        });
      } catch (error) {
        toast({
          title: <Text fontWeight={600}>Error al omitir</Text>,
          description:
            error.message || "No se pudo omitir el hábito. Inténtalo de nuevo.",
          status: "error",
          position: "bottom",
        });
      }
    },
    [user?.uid, toast]
  );

  const executeCompleteHabit = useCallback(
    async (habit, amount) => {
      if (amount <= 0 || isNaN(amount)) {
        toast({
          title: <Text fontWeight={600}>Valor inválido</Text>,
          description: "La cantidad debe ser un número positivo.",
          status: "warning",
          position: "bottom",
        });
        return;
      }

      setIsSaving(true);
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
            error.message ||
            "No se pudo completar el hábito. Inténtalo de nuevo.",
          status: "error",
          position: "bottom",
        });
      } finally {
        setIsSaving(false);
        closeQuantityModal();
        setHabitToCompleteQuantified(null);
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

  const handleModalHabitClose = useCallback(
    (shouldRefresh = false) => {
      setHabitToEdit(null);
      closeModalHabit();
    },
    [closeModalHabit]
  );

  const orderBy = searchParams.get("order_by") || "name-asc";
  const viewLayout = searchParams.get("layout") || "grid";

  const filteredAndSortedHabitsByArea = useMemo(() => {
    if (!areas || areas.length === 0) {
      return [];
    }

    if (!habitsByArea || typeof habitsByArea !== "object") {
      return [];
    }

    return areas
      .map((area) => ({
        ...area,
        habits: habitsByArea[area.id]
          ? [...habitsByArea[area.id]].sort((a, b) =>
              compareByOrder(a, b, orderBy)
            )
          : [],
      }))
      .filter((area) => area.habits.length > 0);
  }, [areas, habitsByArea, orderBy]);

  const hasHabits = useMemo(() => {
    return filteredAndSortedHabitsByArea.some((area) => area.habits.length > 0);
  }, [filteredAndSortedHabitsByArea]);

  return (
    <Box w="100%" minH="100vh" maxH="100vh">
      <ColumnHeader
        page="all-habits"
        title={isMobile ? "Hábitos" : "Todos los hábitos"}
        onModalCloseAndRefresh={handleModalHabitClose}
        isMobile={isMobile}
        onOpenLeftMenu={onOpenLeftMenu}
  onOpenRightMenu={onOpenRightMenu}
      />
      {loadingData ? (
        <Box
          w="100%"
          minH="100vh"
          maxH="100vh"
          overflowY="scroll"
          bg={colorMode === "light" ? "gray.100" : "gray.900"}
        >
          <EmptyState type="loading" />
        </Box>
      ) : !hasHabits ? (
        <Box
          w="100%"
          minH="100vh"
          maxH="100vh"
          overflowY="scroll"
          bg={colorMode === "light" ? "gray.100" : "gray.900"}
        >
          <EmptyState type="habits" />
        </Box>
      ) : (
        <Box
          w="100%"
          minH="100vh"
          maxH="100vh"
          overflowY="scroll"
          bg={colorMode === "light" ? "gray.100" : "gray.900"}
        >
          <VStack p={4} spacing={6} align="stretch">
            {filteredAndSortedHabitsByArea.map(
              (area) =>
                area.habits.length > 0 && (
                  <div key={area.id}>
                    <HStack justify="flex-start">
                      <Text as="h2" fontSize="xl" fontWeight={600}>
                        {area.icon} {area.name}
                      </Text>
                      <Text
                        fontSize="md"
                        fontWeight={400}
                        color={colorMode === "light" ? "gray.400" : "#ffffff50"}
                      >
                        - {area.habits.length}{" "}
                        {area.habits.length >= 1 ? "hábito" : "hábitos"}
                      </Text>
                    </HStack>
                    <Divider my={2} />
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
                          handleComplete={handleComplete}
                          handleSkip={handleSkip}
                          handleEdit={handleEdit}
                          confirmDelete={confirmDelete}
                          setSelectedHabit={setSelectedHabit}
                          isListView={viewLayout === "list"}
                        />
                      ))}
                    </SimpleGrid>
                  </div>
                )
            )}

            <ConfirmationModal
              isOpen={isDeleteOpen}
              onClose={closeDeleteModal}
              title={`¿Deseas eliminar el hábito: ${
                habitToDelete?.name || "..."
              }?`}
              description="Perderás todos los registros que contenga dicho hábito y sus progresos. Esta acción no se puede deshacer."
              onConfirm={handleDelete}
              confirmButtonText="Sí, eliminar"
              cancelButtonText="No, cancelar"
              isLoading={isSaving}
            />
            <HabitModal
              isOpen={isModalHabitOpen}
              onClose={handleModalHabitClose}
              selectedHabit={habitToEdit}
              onHabitSaved={handleModalHabitClose}
            />
            <GoalModal
              isOpen={isQuantityModalOpen}
              onClose={closeQuantityModal}
              title={`Completar "${
                habitToCompleteQuantified?.name || "hábito"
              }"`}
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
      )}
    </Box>
  );
};

export default AllHabitsPage;
