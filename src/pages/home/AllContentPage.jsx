import { useState, useEffect, useCallback } from "react";
import { useTheme } from "../../context/ThemeContext/ThemeContext";
import { useAuthUser } from "../../context/AuthUserContext/AuthUserContext";
import {
  Box,
  Text,
  useColorMode,
  Alert,
  AlertIcon,
  Spinner,
  Center,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tag,
} from "@chakra-ui/react";
import { subscribeToAllAreasAndHabits } from "../../hooks/useDatabase";

const AllContentPage = () => {
  const { user, loading: authLoading } = useAuthUser();
  const { themeOptions } = useTheme();
  const { colorMode } = useColorMode();
  const [allHabits, setAllHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHabits = useCallback((userId) => {
    setLoading(true);
    setError(null);

    try {
      const unsubscribe = subscribeToAllAreasAndHabits(
        userId,
        (data) => {
          const { areas, habitsByArea } = data;

          if (areas && Array.isArray(areas)) {
            const flattenedHabits = areas.flatMap((area) => {
              const habitsInArea = habitsByArea[area.id] || [];
              return habitsInArea.map((habit) => ({
                ...habit,
                areaName: area.name,
                areaIcon: area.icon,
              }));
            });

            setAllHabits(flattenedHabits);
            setError(null);
          } else {
            setAllHabits([]);
          }
          setLoading(false);
        },
        (err) => {
          setError(
            "No se pudieron cargar los hábitos. Inténtalo de nuevo más tarde."
          );
          setLoading(false);
        }
      );

      return unsubscribe;
    } catch (err) {
      setError(
        "Error de configuración inicial de hábitos. Por favor, contacta a soporte."
      );
      setLoading(false);
      return () => {};
    }
  }, []);

  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      return;
    }

    const userId = user?.uid;

    if (!userId) {
      setAllHabits([]);
      setLoading(false);
      setError("Necesitas iniciar sesión para ver tus hábitos.");
      return;
    }

    const unsubscribe = fetchHabits(userId);

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [user, authLoading, fetchHabits]);

  if (authLoading || loading) {
    return (
      <Center
        p={4}
        gridColumnStart={1}
        gridColumnEnd={4}
        bg={colorMode === "light" ? "white" : "gray.900"}
        borderRadius={themeOptions.borderRadius}
        border="2px solid var(--chakra-colors-chakra-border-color)"
        gap={2}
      >
        <Spinner
          size="lg"
          emptyColor={colorMode === "light" ? "gray.200" : "gray.700"}
          color={`${themeOptions.focusColor}.500`}
        />
        <Text size="lg">Cargando...</Text>
      </Center>
    );
  }

  if (error) {
    return (
      <Alert
        status="error"
        borderRadius={themeOptions.borderRadius}
        gridColumnStart={1}
        gridColumnEnd={4}
      >
        <AlertIcon />
        <Text>{error}</Text>
      </Alert>
    );
  }

  return (
    <Box
      p={4}
      borderRadius={themeOptions.borderRadius}
      bg={colorMode === "light" ? "white" : "black"}
      border="2px solid var(--chakra-colors-chakra-border-color)"
      gridColumnStart={1}
      gridColumnEnd={{ base: 1, md: 4 }}
    >
      <HStack
        pb={2}
        alignItems="center"
        justifyContent="flex-start"
        spacing={2}
      >
        <Text fontSize="xl" fontWeight={600}>
          Contenido
        </Text>
      </HStack>
      <Box overflowX="auto" maxH="346px" overflowY="scroll">
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th fontWeight={600}>Icono</Th>
              <Th fontWeight={600}>Nombre</Th>
              <Th fontWeight={600}>Estado</Th>
              <Th fontWeight={600}>Área</Th>
              <Th fontWeight={600}>Meta a lograr</Th>
              <Th fontWeight={600}>Fecha de comienzo</Th>
            </Tr>
          </Thead>
          <Tbody>
            {allHabits.length > 0 ? (
              allHabits.map((habit) => (
                <Tr key={habit.id}>
                  <Td>{habit.icon}</Td>
                  <Td>
                    <Text fontWeight={600} isTruncated maxW="150px">
                      {habit.name}
                    </Text>
                  </Td>
                  <Td>
                    <Tag
                      size="sm"
                      variant="solid"
                      textTransform="capitalize"
                      colorScheme={
                        habit.lastStatus === "completed"
                          ? "green"
                          : "failed"
                          ? "red"
                          : "gray"
                      }
                    >
                      {habit.lastStatus || "Pendiente"}
                    </Tag>
                  </Td>
                  <Td>
                    <HStack spacing={1}>
                      <Text>
                        {habit.areaIcon}
                        {habit.areaName}
                      </Text>
                    </HStack>
                  </Td>
                  <Td>
                    <Text>{habit.goal || "N/A"}</Text>
                  </Td>
                  <Td>
                    <Text>
                      {habit.startDate
                        ? new Date(
                            habit.startDate.seconds * 1000
                          ).toLocaleDateString()
                        : "N/A"}
                    </Text>
                  </Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={6}>
                  <Center py={6}>
                    <Text color="gray.500" fontSize="sm">
                      No tienes hábitos aún. Crea uno para empezar a hacer
                      seguimiento.
                    </Text>
                  </Center>
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default AllContentPage;
