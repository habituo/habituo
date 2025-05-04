import React, {useState, useEffect} from "react";
import { Box, HStack, SimpleGrid, Text, useColorMode } from "@chakra-ui/react";
import {
  TodoList,
  TimeTracker,
  ActivityTracker,
  AllContent,
} from "../../routes/index";
import { useAuth } from "../../context/AuthContext";
import * as LuIcons from "react-icons/lu";
import {getUserInfo} from "../../hooks/database"

const DashboardHome = () => {
  const { colorMode } = useColorMode();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

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

  useEffect(() => {
    const fetchUserInfo = async () => {
      setLoading(true);
      if (user?.uid) {
        const info = await getUserInfo(user.uid);
        setUserData(info);
      }
      setLoading(false);
    };

    fetchUserInfo();
  }, [user]);

  return (
    <Box
      p={4}
      w="100%"
      minH="100vh"
      overflowX="hidden"
      bg={colorMode === "light" ? "rgb(245, 245, 245)" : "rgb(23, 23, 23)"}
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
          {getGreeting()}
          {userData && (
            <>
              ,{" "}
              <Text
                as="span"
                fontWeight={600}
                color={colorMode === "light" ? "#000000" : "#FFFFFF"}
              >
                {userData.name}
              </Text>
            </>
          )}
        </Text>
        <HStack spacing={2}>
          <LuIcons.LuCalendarDays size="18px" />
        <Text fontSize="lg" fontWeight={400}>
          {getCurrentDate()}
        </Text>
        </HStack>
      </HStack>
      <SimpleGrid columns={3} spacing={4}>
        <TodoList />
        <TimeTracker />
        <ActivityTracker />
        {userData && <AllContent />}
      </SimpleGrid>
    </Box>
  );
};

export default DashboardHome;
