import { useTheme } from "../../context/ThemeContext";
import { useAuthUser } from "../../context/AuthUserContext";
import {
  Box,
  Center,
  HStack,
  SimpleGrid,
  Spinner,
  Text,
  useColorMode,
  VStack,
} from "@chakra-ui/react";
import {
  TodoList,
  TimeTracker,
  ActivityTracker,
  AllContent,
} from "../../routes/index";
import * as LuIcons from "react-icons/lu";

const DashboardHome = () => {
  const { colorMode } = useColorMode();
  const { themeOptions } = useTheme();
  const { user, loading } = useAuthUser();

  const getGreeting = () => {
    const now = new Date();
    const hour = now.getHours();

    if (hour >= 5 && hour < 12) {
      return "Buenos días";
    } else if (hour >= 12 && hour < 20) {
      return "Buenas tardes";
    } else {
      return "Buenas noches";
    }
  };

  const getCurrentDate = () => {
    const now = new Date();
    const day = now.getDate();
    const month = new Intl.DateTimeFormat("es-ES", { month: "long" }).format(
      now
    );
    const year = now.getFullYear();
    return `${day} de ${month} de ${year}`;
  };

  if (loading || !user) {
    return (
      <Center
        p={4}
        w="100%"
        minH="100vh"
        bg={colorMode === "light" ? "gray.100" : "gray.900"}
      >
        <VStack spacing={4}>
          <Spinner size="lg" color={themeOptions.focusColor} thickness="2px" />
          <Text fontSize="lg">Cargando...</Text>
        </VStack>
      </Center>
    );
  }

  const userName =
    user?.displayName || user?.name || user?.email?.split("@")[0] || "Usuario";

  return (
    <Box
      p={4}
      w="100%"
      minH="100vh"
      overflowX="hidden"
      bg={colorMode === "light" ? "gray.100" : "gray.900"}
      _hover={{ textDecoration: "none" }}
    >
      <HStack
        mb={4}
        w="100%"
        alignItems="center"
        justifyContent="space-between"
      >
        <Text
          as="h2"
          fontSize="4xl"
          fontWeight={400}
          color={colorMode === "light" ? "#00000060" : "#FFFFFF60"}
        >
          {getGreeting()},
          <Text
            as="span"
            fontWeight={600}
            color={colorMode === "light" ? "#000000" : "#FFFFFF"}
          >
            {userName}
          </Text>
        </Text>
        <HStack spacing={2}>
          <LuIcons.LuCalendarDays size="18px" />
          <Text fontSize="lg" fontWeight={400}>
            {getCurrentDate()}
          </Text>
        </HStack>
      </HStack>
      <SimpleGrid columns={3} templateRows='repeat(2, 1fr)' spacing={4}>
        <TodoList />
        <TimeTracker />
        <ActivityTracker />
        <AllContent userId={user.uid} />
      </SimpleGrid>
    </Box>
  );
};

export default DashboardHome;
