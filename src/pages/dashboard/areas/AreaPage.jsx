import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import {
  SimpleGrid,
  VStack,
  Box,
  Text,
  useToast,
  useDisclosure,
  useColorMode,
} from "@chakra-ui/react";
import {
  getHabitsByArea as getHabitsByAreaFromDb,
  deleteHabit as deleteHabitFromDb,
  skipHabit as skipHabitInDb,
  completeHabit as completeHabitInDb,
  checkFailedHabit as checkFailedHabitInDb,
  getAreaNameById,
  getWeekNumber,
} from "../../../hooks/database";
import { useAuth } from "../../../context/AuthContext";
import {
  ColumnHeader,
  ModalHabit,
  HabitCard,
  ConfirmationModal,
  NoDataPage,
} from "../../../routes/index";
import { useTheme } from "../../../context/ThemeContext";

const AreaPage = ({ areas, setSelectedHabit }) => {
  // Basic experience states
  const {themeOptions} = useTheme();
  const { colorMode } = useColorMode();
  const { user } = useAuth();
  const toast = useToast();

  const { areaId } = useParams();
  const [habits, setHabits] = useState([]);
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

  /**
   * React useEffect hook that fetches all habits grouped by area for the currently logged-in user
   * when the component mounts. It uses the `getHabitsByAreaFromDb` function to subscribe to
   * real-time updates from the database. When the data is received, it updates the `habitsByArea` state
   * and sets the `isLoaded` state to true. The hook returns a cleanup function that unsubscribes
   * from the Firestore listener when the component unmounts, preventing memory leaks.
   * @useEffect
   * @dependency [] - This effect runs only once after the initial render, as it has an empty dependency array.
   * @returns {Function} A cleanup function that unsubscribes the Firestore listener.
   */
  useEffect(() => {
    if (!user?.uid || !areaId) return;

    const unsubscribe = getHabitsByAreaFromDb(areaId, (habitsData) => {
      setHabits(habitsData);
    });

    return () => unsubscribe();
  }, [user?.uid, areaId]);

  /**
   * React useEffect hook that sets up an interval to periodically check for habits that have not been
   * marked as completed, skipped, or failed for the current day. It iterates through the `habitsByArea` state
   * and for each habit, it calls the `checkFailedHabitInDb` function. This check is performed every hour (60 * 60 * 1000 milliseconds).
   * The interval is only set up if `habitsByArea` is not null or undefined and the user is authenticated (`user?.uid` is truthy).
   * The hook returns a cleanup function that clears the interval when the component unmounts, preventing potential issues.
   * @useEffect
   * @dependency {[habitsByArea, user, toast]} - This effect runs when any of these dependencies change.
   * In particular, it will re-run if `habitsByArea` is initially null and then gets populated with data.
   * @returns {Function} A cleanup function that clears the interval.
   */
  useEffect(() => {
    const interval = setInterval(() => {
      if (habits.length > 0 && user?.uid) {
        habits.forEach((habit) => {
          checkFailedHabitInDb(habit.area, habit.id, toast, habit.name);
        });
      }
    }, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [habits, user?.uid, toast]);

  /**
   * @function confirmDelete
   * @desc Opens the confirmation modal and sets the habit to be deleted.
   * @param {Object} habit - The habit selected for deletion.
   */
  const confirmDelete = (habit) => {
    setHabitToDelete(habit);
    openDeleteModal();
  };

  /**
   * @function handleEdit
   * @desc Sets the selected habit for editing and opens the edit modal.
   * @param {Object} habit - The habit selected for editing.
   */
  const handleEdit = (habit) => {
    setHabitToEdit(habit);
    setSelectedHabit(habit);
    openModalHabit();
  };

  /**
   * @async
   * @function handleDelete
   * @desc Deletes the selected habit using its ID and updates the state.
   */
  const handleDelete = async () => {
    if (!habitToDelete || !user) return;

    try {
      await deleteHabitFromDb(habitToDelete.area, habitToDelete.id);
      setHabits((prevHabits) =>
        prevHabits.filter((h) => h.id !== habitToDelete.id)
      );
      closeDeleteModal();
      toast({
        title: <Text fontWeight="600">Hábito eliminado</Text>,
        description: `Se eliminó el hábito "${habitToDelete.name}" correctamente.`,
        status: "success",
        position: "bottom",
      });
    } catch (error) {
      toast({
        title: <Text fontWeight="600">Error al eliminar</Text>,
        description: "No se pudo eliminar el hábito. Inténtalo de nuevo.",
        status: "error",
        position: "bottom",
      });
    }
  };

  /**
   * Handles the action of skipping a habit.
   * @param {object} habit - The habit object containing the habit's details, including `area`, `id`, and `name`.
   */
  const handleSkip = (habit) => {
    skipHabitInDb(habit.area, habit.id, toast, habit.name);
  };

  /**
   * Handles the action of completing a habit.
   * @param {object | null} habit - The habit object to mark as complete.
   */
  const handleComplete = (habit) => {
    if (habit) {
      completeHabitInDb(habit.area, habit.id, habit, toast, getWeekNumber);
    } else {
      toast({
        title: <Text fontWeight="600">Error</Text>,
        description: "No se ha seleccionado ningún hábito para completar.",
        status: "error",
        position: "bottom",
      });
    }
  };

  const orderBy = searchParams.get("order_by") || "asc";
  const viewLayout = searchParams.get("layout") || "grid";

  const sortedHabits = [...habits].sort((a, b) => {
    if (orderBy === "asc") return a.name.localeCompare(b.name);
    if (orderBy === "desc") return b.name.localeCompare(a.name);
    return 0;
  });

  return (
    <Box
      w="100%"
      minH="100vh"
      maxH="100vh"
      overflowY="scroll"
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
                confirmDelete={confirmDelete}
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
