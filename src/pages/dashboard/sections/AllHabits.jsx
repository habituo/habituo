import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
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
import { useTheme } from "../../../context/ThemeContext";
import { useAuth } from "../../../context/AuthContext";
import {
  ColumnHeader,
  ModalHabit,
  HabitCard,
  ConfirmationModal,
  NoDataPage,
} from "../../../routes/index";

const AllHabits = ({ setSelectedHabit }) => {
  // Basic experience states
  const { themeOptions } = useTheme();
  const { colorMode } = useColorMode();
  const { user } = useAuth();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const isMountedRef = useRef(true);

  // Areas and Habits states
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

  useEffect(() => {
    if (!user?.uid) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    isMountedRef.current = true;

    const unsubscribe = getAllHabitsByArea((data) => {
      if (isMountedRef.current) {
        setHabitsByArea(data);
        setIsLoading(false);
      }
    });

    return () => {
      isMountedRef.current = false;
      unsubscribe();
    };
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid || habitsByArea.length === 0) return;

    const interval = setInterval(() => {
      habitsByArea.forEach((area) => {
        area.habits.forEach((habit) => {
          checkFailedHabitInDb(area.id, habit.id, toast, habit.name);
        });
      });
    }, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user?.uid, habitsByArea, toast]);

  const confirmDelete = (habit) => {
    setHabitToDelete(habit);
    openDeleteModal();
  };

  const orderBy = searchParams.get("order_by") || "asc";
  const viewLayout = searchParams.get("layout") || "grid";

  const handleEdit = (habit) => {
    setHabitToEdit(habit);
    setSelectedHabit(habit);
    openModalHabit();
  };

  const handleDelete = async () => {
    if (!habitToDelete || !user) return;

    try {
      await deleteHabitFromDb(habitToDelete.area, habitToDelete.id);
      setHabitsByArea((prev) =>
        prev.map((area) => {
          if (area.id !== habitToDelete.area) return area;
          return {
            ...area,
            habits: area.habits.filter((h) => h.id !== habitToDelete.id),
          };
        })
      );
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
  };

  const handleSkip = (habit) => {
    skipHabitInDb(habit.area, habit.id, toast, habit.name);
  };

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

  const filteredHabitsByArea = habitsByArea.map((area) => ({
    ...area,
    habits: [...area.habits].sort((a, b) => {
      if (orderBy === "asc") return a.name.localeCompare(b.name);
      if (orderBy === "desc") return b.name.localeCompare(a.name);
      return 0;
    }),
  }));

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
      <ColumnHeader page="all-habits" title="Todos los hábitos" />
      {isLoading ? (
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
                  color={colorMode === "light" ? "#00000050" : "#ffffff50"}
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
            onClose={() => {
              setHabitToEdit(null);
              setSelectedHabit(null);
              closeModalHabit();
            }}
            selectedHabit={habitToEdit}
          />
        </VStack>
      )}
    </Box>
  );
};

export default AllHabits;
