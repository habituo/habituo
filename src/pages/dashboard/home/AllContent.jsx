import { useState, useEffect, useCallback } from "react";
import { useTheme } from "../../../context/ThemeContext";
import { useAuthUser } from "../../../context/AuthUserContext";
import {
  Box,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  TabIndicator,
  useColorMode,
  List,
  ListItem,
  Link,
  HStack,
  Divider,
  Alert,
  AlertIcon,
  Spinner,
  Center,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from "@chakra-ui/react";
import { subscribeToAllAreasAndHabits } from "../../../hooks/database";
import * as LuIcons from "react-icons/lu";

const AllContent = () => {
  const { user, loading: authLoading } = useAuthUser();
  const { themeOptions } = useTheme();
  const { colorMode } = useColorMode();
  const [areasWithHabits, setAreasWithHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHabits = useCallback((userId) => {
    setLoading(true);
    setError(null);

    try {
      const unsubscribe = subscribeToAllAreasAndHabits(
        userId,
        (areasData) => {
          if (areasData && Array.isArray(areasData)) {
            setAreasWithHabits(areasData);
            setError(null);
          } else {
            setAreasWithHabits([]);
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
      setAreasWithHabits([]);
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

  if (!areasWithHabits || areasWithHabits.length === 0) {
    return (
      <Alert mt={4} status="info" borderRadius={themeOptions.borderRadius}>
        <AlertIcon />
        Todavía no tenemos contenido que mostrar.
      </Alert>
    );
  }

  if (loading) {
    return (
      <Center
        p={4}
        gridColumnStart={1}
        gridColumnEnd={4}
        gridAutoRows={"max-content"}
        bg={colorMode === "light" ? "white" : "gray.900"}
        borderRadius={themeOptions.borderRadius}
        border="2px solid var(--chakra-colors-chakra-border-color)"
        gap={2}
      >
        <Spinner
          size="lg"
          thickness="3px"
          emptyColor={colorMode === "light" ? "gray.200" : "gray.700"}
          color={`${themeOptions.focusColor}.500`}
        />
        <Text size="lg">Cargando...</Text>
      </Center>
    );
  }

  if (error) {
    return (
      <Box
        p={4}
        gridColumnStart={1}
        gridColumnEnd={4}
        bg={colorMode === "light" ? "white" : "gray.900"}
        borderRadius={themeOptions.borderRadius}
        border="2px solid var(--chakra-colors-chakra-border-color)"
      >
        <Alert status="error" borderRadius={themeOptions.borderRadius}>
          <AlertIcon />
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      p={4}
      borderRadius={themeOptions.borderRadius}
      bg={colorMode === "light" ? "white" : "black"}
      border="2px solid var(--chakra-colors-chakra-border-color)"
      gridColumnStart={1}
      gridColumnEnd={4}
    >
      <HStack
        pb={2}
        alignItems="center"
        justifyContent="flex-start"
        spacing={2}
      >
        <LuIcons.LuCircuitBoard
          size="25px"
          color={
            themeOptions.focusColor
              ? `${themeOptions.focusColor}.500`
              : undefined
          }
        />
        <Text fontSize="xl" fontWeight={600}>
          Contenido
        </Text>
      </HStack>
      <Divider />
      <Box overflowY="auto" overflowX="hidden" maxH="300px">
        <Accordion allowToggle>
          {areasWithHabits.map((area) => {
            const areaKey = area.id;
            const IconComponent = LuIcons[area.icon];
            return (
              <AccordionItem key={areaKey}>
                <h3>
                  <AccordionButton>
                    <Box as="span" flex="1" textAlign="left">
                      <HStack>
                        {IconComponent && <IconComponent />}
                        <Text fontSize="md" fontWeight="semibold">
                          {area.name}
                        </Text>
                      </HStack>
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h3>
                <AccordionPanel pb={4}>
                  {area.habits && area.habits.length > 0 ? (
                    <List
                      display="flex"
                      flexWrap="wrap"
                      alignItems="center"
                      justifyContent="flex-start"
                      gap={2}
                    >
                      {area.habits.map((habit) => {
                        const habitKey = habit.id;
                        const HabitIconComponent = LuIcons[habit.icon];
                        return (
                          <ListItem
                            px={3}
                            py={1}
                            key={habitKey}
                            display="flex"
                            alignItems="center"
                            gap={1}
                            borderWidth={1}
                            borderColor={
                              colorMode === "light" ? "gray.200" : "gray.700"
                            }
                            borderRadius={themeOptions.borderRadius}
                            _hover={{
                              borderColor: `${themeOptions.focusColor}.500`,
                              boxShadow: `0 0 0 1px ${themeOptions.focusColor}.200`,
                              cursor: "pointer",
                            }}
                            transition="all 0.2s"
                            // onClick={() => handleHabitClick(habit)}
                          >
                            {HabitIconComponent && (
                              <HabitIconComponent
                                size="16px"
                                color={
                                  themeOptions.focusColor
                                    ? `${themeOptions.focusColor}.500`
                                    : undefined
                                }
                              />
                            )}
                            <Text fontSize="sm" fontWeight="medium">
                              {habit.name}
                            </Text>
                          </ListItem>
                        );
                      })}
                    </List>
                  ) : (
                    <Alert
                      status="info"
                      borderRadius={themeOptions.borderRadius}
                      mt={2}
                    >
                      <AlertIcon />
                      No hay hábitos registrados en esta área.
                    </Alert>
                  )}
                </AccordionPanel>
              </AccordionItem>
            );
          })}
        </Accordion>
      </Box>
    </Box>
  );
};

export default AllContent;
