import React, { useState, useEffect } from "react";
import { ColumnHeader } from "../../../routes/index";
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
} from "@chakra-ui/react";
import { useTheme } from "../../../context/ThemeContext";
import { FaPlus } from "react-icons/fa6";
import { db } from "../../../hooks/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { useAuth } from "../../../context/AuthContext";

const AllHabits = () => {
  const { themeOptions } = useTheme();
  const { colorMode } = useColorMode();
  const [isLoaded, setIsLoaded] = useState(false);
  const [habitsByArea, setHabitsByArea] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
  
    const userId = user.uid;
    const areasRef = collection(db, `users/${userId}/areas`);
  
    // Escuchar cambios en las áreas
    const unsubscribeAreas = onSnapshot(areasRef, (areasSnapshot) => {
      const areasData = [];
  
      // Crear una lista de promesas para obtener hábitos de cada área
      const habitsPromises = areasSnapshot.docs.map(async (areaDoc) => {
        const area = { id: areaDoc.id, ...areaDoc.data() };
        const habitsRef = collection(db, `users/${userId}/areas/${area.id}/habits`);
  
        return new Promise((resolve) => {
          const unsubscribeHabits = onSnapshot(habitsRef, (habitsSnapshot) => {
            const habits = habitsSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
  
            areasData.push({ ...area, habits });
            resolve();
          });
  
          // Guardar la referencia para limpiar la suscripción después
          return unsubscribeHabits;
        });
      });
  
      // Esperar a que todas las promesas terminen antes de actualizar el estado
      Promise.all(habitsPromises).then(() => {
        setHabitsByArea(areasData);
        setIsLoaded(true);
      });
    });
  
    // Limpiar suscripciones al desmontar
    return () => {
      unsubscribeAreas();
    };
  }, [user]);

  return (
    <Box
      w="100%"
      minH="100vh"
      maxH="100vh"
      overflowY="scroll"
      userSelect="none"
      sx={{
        "&::-webkit-scrollbar": {
          width: "4px",
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
      <Box p={3}>
        {isLoaded ? (
          habitsByArea.length > 0 ? (
            habitsByArea.map((area) => (
              <Box key={area.id} py={4} borderBottomWidth="1px">
                <Text fontSize="xl" fontWeight="bold" mb={2}>
                  {area.name}
                </Text>
                {area.habits.length > 0 ? (
                  <Grid>
                    {area.habits.map((habit) => (
                      <Box
                        key={habit.id}
                        p={3}
                        borderWidth="2px"
                        borderRadius={themeOptions.borderRadius}
                        mb={2}
                      >
                        <Text fontSize="md" fontWeight="bold">
                          {habit.name}
                        </Text>
                        <Text fontSize="sm">
                          {habit.description || "Sin descripción"}
                        </Text>
                      </Box>
                    ))}
                  </Grid>
                ) : (
                  <Alert status="info" borderRadius={themeOptions.borderRadius}>
                    <AlertIcon />
                    No hay hábitos disponibles para esta área
                  </Alert>
                )}
              </Box>
            ))
          ) : (
            <Text>No hay hábitos disponibles.</Text>
          )
        ) : (
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
            <Text as="h2" fontSize="lg" fontWeight="bold">
              Da el paso y construye tu mejor versión
            </Text>
            <Text as="h2" fontSize="sm" maxW="600px" textAlign="center">
              Los hábitos son como los escalones de una escalera: al dar el
              primer paso, el resto se va sumando uno a uno.
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
        )}
      </Box>
    </Box>
  );
};

export default AllHabits;
