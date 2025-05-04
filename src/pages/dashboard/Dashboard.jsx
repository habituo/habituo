import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getAreas } from "../../hooks/database";
import {
  AllAreas,
  AllHabits,
  AreaPage,
  HabitPage,
  LeftColumn,
  DashboardHome,
} from "../../routes/index";
import customTheme from "../../theme/theme";
import { useTheme } from "../../context/ThemeContext";
import {
  Box,
  HStack,
  VStack,
  Text,
  ChakraProvider,
  SimpleGrid,
  Skeleton,
} from "@chakra-ui/react";

const Dashboard = () => {
  const { themeOptions } = useTheme();
  const { user } = useAuth();
  const location = useLocation();
  const { areaId } = useParams();

  const [areas, setAreas] = useState([]);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [content, setContent] = useState(null);

  const fetchAreas = useCallback(async () => {
    if (!user) return;

    const unsubscribe = getAreas((areasList) => {
      setAreas(areasList);
    });

    return unsubscribe;
  }, [user]);

  useEffect(() => {
    const unsubscribe = fetchAreas();
    return () => {
      if (unsubscribe && typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [fetchAreas]);

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

      setContent(
        routeContent[location.pathname] || (
          <DashboardHome setSelectedHabit={setSelectedHabit} />
        )
      );
    }
  }, [location.pathname, areaId, areas, setSelectedHabit]);

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
        <Box w="13%">{user ? <LeftColumn userInfo={user} /> : null}</Box>
        <Box w="67%" borderLeftWidth={2} borderRightWidth={2}>
          {content}
        </Box>
        <Box w="20%">
          {selectedHabit ? (
                <HabitPage habit={selectedHabit} userInfo={user} />
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
