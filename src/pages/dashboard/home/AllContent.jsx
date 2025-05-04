import React, { useState, useEffect } from "react";
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
} from "@chakra-ui/react";
import { useTheme } from "../../../context/ThemeContext";
import { getAllHabitsByArea } from "../../../hooks/database";
import * as LuIcons from "react-icons/lu";
import { useAuth } from "../../../context/AuthContext";

const AllContent = () => {
  const { user } = useAuth();
  const { loading: authLoading } = useAuth();
  const { themeOptions } = useTheme();
  const { colorMode } = useColorMode();
  const [areasWithHabits, setAreasWithHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = user?.uid;

    if (authLoading) {
      return;
    }

    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = getAllHabitsByArea((areasData) => {
      if (areasData && Array.isArray(areasData)) {
        setAreasWithHabits(areasData);
      } else {
        setAreasWithHabits([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, authLoading]);

  if (loading) {
    return (
      <Box
        p={4}
        gridColumnStart={1}
        gridColumnEnd={4}
        bg={colorMode === "light" ? "rgb(255, 255, 255)" : "rgb(0, 0, 0)"}
        borderRadius={themeOptions.borderRadius}
      >
        <Spinner />
      </Box>
    );
  }

  return (
    <Box
      p={4}
      borderRadius={themeOptions.borderRadius}
      bg={colorMode === "light" ? "rgb(255, 255, 255)" : "rgb(0, 0, 0)"}
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
        <LuIcons.LuCircuitBoard size="25px" />
        <Text fontSize="xl" fontWeight={600}>
          Contenido
        </Text>
      </HStack>
      <Divider />
      {areasWithHabits ? (
        <Tabs mt={2} position="relative" variant="unstyled">
          <TabList>
            {areasWithHabits.map((area) => {
              const IconComponent = LuIcons[area.icon];
              return (
                <Tab key={area.id} gap={1}>
                  {IconComponent && <IconComponent />}
                  {area.name}
                </Tab>
              );
            })}
          </TabList>
          <TabIndicator
            mt="-1.5px"
            height="2px"
            bg={themeOptions.focusColor}
            borderRadius="1px"
          />
          <TabPanels>
            {areasWithHabits.map((area) => (
              <TabPanel p={0} pt={4} key={area.id}>
                {area.habits && area.habits.length > 0 ? (
                  <List
                    display="flex"
                    alignItems="center"
                    justifyContent="flex-start"
                    gap={2}
                  >
                    {area.habits.map((habit) => {
                      const IconComponent = LuIcons[habit.icon];
                      return (
                        <ListItem
                          px={3}
                          py={1}
                          key={habit.id}
                          display="flex"
                          alignItems="center"
                          gap={1}
                          borderWidth={1}
                          borderRadius={themeOptions.borderRadius}
                        >
                          {IconComponent && <IconComponent />}
                          <Link href={"/dashboard/all-habits"}>
                            {habit.name}
                          </Link>
                        </ListItem>
                      );
                    })}
                  </List>
                ) : (
                  <Alert status="info" borderRadius={themeOptions.borderRadius}>
                    <AlertIcon />
                    No hay hábitos registrados en este área
                  </Alert>
                )}
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      ) : (
        <Alert mt={4} status="info" borderRadius={themeOptions.borderRadius}>
          <AlertIcon />
          Todavía no tenemos contenido que mostrar
        </Alert>
      )}
    </Box>
  );
};

export default AllContent;
