import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useAuthUser } from "../../context/AuthUserContext";
import customTheme from "../../theme/theme";
import { getAreas } from "../../hooks/database";
import {
  AllAreas,
  AllHabits,
  AreaPage,
  HabitPage,
  LeftColumn,
  DashboardHome,
} from "../../routes/index";
import {
  Box,
  HStack,
  VStack,
  Text,
  ChakraProvider,
  SimpleGrid,
  Skeleton,
  Spinner,
  Center,
} from "@chakra-ui/react";

const Dashboard = () => {
  const { themeOptions } = useTheme();
  const { user, loading } = useAuthUser();
  const navigate = useNavigate();
  const location = useLocation();
  const { areaId } = useParams();

  const [areas, setAreas] = useState([]);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [content, setContent] = useState(null);
  const [loadingAreas, setLoadingAreas] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [loading, user, navigate]);

  const fetchAreas = useCallback(async () => {
    if (!user) {
      setLoadingAreas(false);
      return;
    }

    setLoadingAreas(true);

    const unsubscribe = getAreas(user.uid, (areasList) => {
      setAreas(areasList);
      setLoadingAreas(false);
    });

    return unsubscribe;
  }, [user]);

  useEffect(() => {
    if (user && !loading) {
      const unsubscribe = fetchAreas();
      return () => {
        if (unsubscribe && typeof unsubscribe === "function") {
          unsubscribe();
        }
      };
    }
  }, [user, loading, fetchAreas]);

  useEffect(() => {
    if (areaId) {
      setContent(
        <AreaPage areas={areas} setSelectedHabit={setSelectedHabit} />
      );
    } else {
      const routeContent = {
        "/dashboard/all-habits": (
          <AllHabits setSelectedHabit={setSelectedHabit} />
        ),
        "/dashboard/all-areas": <AllAreas />,
      };

      setContent(routeContent[location.pathname] || <DashboardHome />);
    }
  }, [location.pathname, areaId, areas, setSelectedHabit]);

  if (loading || !user) {
    return (
      <ChakraProvider
        theme={customTheme(
          themeOptions.focusColor,
          themeOptions.fontFamily,
          themeOptions.borderRadius
        )}
      >
        <Center minH="100vh">
          <VStack spacing={4}>
            <Spinner
              size="lg"
              color={themeOptions.focusColor}
              thickness="4px"
            />
            <Text fontSize="lg">Cargando...</Text>
          </VStack>
        </Center>
      </ChakraProvider>
    );
  }

  return (
    <ChakraProvider
      theme={customTheme(
        themeOptions.focusColor,
        themeOptions.fontFamily,
        themeOptions.borderRadius
      )}
    >
      <HStack
        w="100%"
        minH="100vh"
        display="flex"
        overflow="hidden"
        spacing={0}
      >
        <Box w="13%">
          <LeftColumn />
        </Box>
        <Box w="67%" borderLeftWidth={2} borderRightWidth={2}>
          {loadingAreas ? (
            <Center minH="calc(100vh - 4px)">
              <VStack spacing={4}>
                <Spinner
                  size="lg"
                  color={themeOptions.focusColor}
                  thickness="2px"
                />
                <Text fontSize="lg">Cargando...</Text>
              </VStack>
            </Center>
          ) : (
            content
          )}
        </Box>
        <Box w="20%">
          {selectedHabit ? (
            <HabitPage habit={selectedHabit} allAreas={areas}  />
          ) : (
            <VStack
              w="100%"
              h="100vh"
              p={4}
              spacing={2}
              textAlign="center"
              justifyContent="center"
              bg="transparent"
            >
              <SimpleGrid mb={4} columns={2} rows={2} spacing={2}>
                {[...Array(4)].map((_, index) => (
                  <Skeleton
                    key={index}
                    w="50px"
                    h="50px"
                    borderRadius={themeOptions.borderRadius}
                  />
                ))}
              </SimpleGrid>
              <Text as="h2" fontSize="xl" fontWeight={600}>
                Selecciona un hábito para visualizar su contenido
              </Text>
              <Text as="p" fontSize="sm" fontWeight={400}>
                Para poder ver los progresos e información acerca de un hábito,
                solo selecciona el hábito deseado.
              </Text>
            </VStack>
          )}
        </Box>
      </HStack>
    </ChakraProvider>
  );
};

export default Dashboard;
