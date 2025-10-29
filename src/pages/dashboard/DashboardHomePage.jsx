import { useTheme } from "../../context/ThemeContext/ThemeContext";
import { useAuthUser } from "../../context/AuthUserContext/AuthUserContext";
import {
  Box,
  Center,
  SimpleGrid,
  Spinner,
  Text,
  useColorMode,
  VStack,
} from "@chakra-ui/react";
import {
  TodoListPage,
  TimeTrackerPage,
  ActivityTrackerPage,
  AllContentPage,
} from "../../exports";
import { useOutletContext } from "react-router-dom";
import { DashboardHeader } from "../../exports";

const DashboardHomePage = () => {
  const { colorMode } = useColorMode();
  const { themeOptions } = useTheme();
  const { user, loading } = useAuthUser();
  const { onOpenLeftMenu, onOpenRightMenu, isMobile } = useOutletContext();

  const userName =
    user?.displayName || user?.name || user?.email?.split("@")[0] || "Usuario";

  const useDateAndGreeting = () => {
    const now = new Date();
    const hour = now.getHours();

    const getGreeting = () => {
      if (hour >= 5 && hour < 12) {
        return "Buenos días";
      } else if (hour >= 12 && hour < 20) {
        return "Buenas tardes";
      } else {
        return "Buenas noches";
      }
    };

    const getCurrentDate = () => {
      const day = now.getDate();
      const month = new Intl.DateTimeFormat("es-ES", { month: "long" }).format(
        now
      );
      const year = now.getFullYear();
      return `${day} de ${month} de ${year}`;
    };

    return {
      greeting: getGreeting(),
      currentDate: getCurrentDate(),
    };
  };

  const { greeting, currentDate } = useDateAndGreeting();

  if (loading || !user) {
    return (
      <Center
        p={4}
        w="100%"
        minH="100vh"
        bg={colorMode === "light" ? "gray.100" : "gray.900"}
      >
        <VStack spacing={4}>
          <Spinner
            size="lg"
            color={`var(--chakra-colors-${themeOptions.focusColor}-500)`}
            thickness="2px"
          />
          <Text fontSize="lg">Cargando...</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Box
      w="100%"
      minH="100vh"
      overflowX="hidden"
      bg={colorMode === "light" ? "gray.100" : "gray.900"}
      _hover={{ textDecoration: "none" }}
    >
      <DashboardHeader
        onOpenLeftMenu={onOpenLeftMenu}
        onOpenRightMenu={onOpenRightMenu}
        isMobile={isMobile}
        userName={userName}
        greeting={greeting}
        currentDate={currentDate}
        colorMode={colorMode}
      />
      <SimpleGrid
        height="calc(100vh - 58px)"
        p={{ base: 2, md: 4 }}
        columns={{ base: 1, md: 3 }}
        templateRows={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)" }}
        spacing={4}
      >
        <TodoListPage />
        <TimeTrackerPage />
        <ActivityTrackerPage />
        <AllContentPage userId={user.uid} />
      </SimpleGrid>
    </Box>
  );
};

export default DashboardHomePage;
