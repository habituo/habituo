import React, { useState, useEffect } from "react";
import { ModalCreateHabitArea } from "../../../routes/index";
import {
  Grid,
  HStack,
  VStack,
  Box,
  Text,
  Stack,
  Skeleton,
  Button,
  LinkBox,
  LinkOverlay,
  Heading,
  IconButton,
  useColorMode,
} from "@chakra-ui/react";
import * as LuIcons from "react-icons/lu";
import {useTheme} from "../../../theme/ThemeContext";

const HabitPage = ({ habits, fetchHabits }) => {
  const {colorMode} = useColorMode();
  const [isLoaded, setIsLoaded] = useState(false);
  const {themeOptions} = useTheme();
  return (
    <Box w="100%" minH="100vh" bg={colorMode === "light" ? "rgb(245, 245, 245)" : "rgb(23, 23, 23)"} p={4}>
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
                </VStack>
    </Box>
  );
};

export default HabitPage;
