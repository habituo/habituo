import { useState, useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext/ThemeContext";
import { useAuthUser } from "../../context/AuthUserContext/AuthUserContext";
import { subscribeToAllAreasAndHabits } from "../../hooks/useDatabase";
import { HabitDetailPage, LeftColumnMenu } from "../../exports";
import {
  Box,
  HStack,
  VStack,
  Text,
  SimpleGrid,
  Skeleton,
  Spinner,
  Center,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useBreakpointValue,
  useDisclosure,
} from "@chakra-ui/react";

const LoadingPanel = ({ message }) => {
  const { themeOptions } = useTheme();
  return (
    <Center minH="100vh">
      <VStack spacing={4}>
        <Spinner
          size="lg"
          color={`var(--chakra-colors-${themeOptions.focusColor}-500)`}
        />
        <Text fontSize="lg">{message}</Text>
      </VStack>
    </Center>
  );
};

const DashboardLayout = () => {
  const { themeOptions } = useTheme();
  const { user, loading: authLoading } = useAuthUser();
  const navigate = useNavigate();
  const [areas, setAreas] = useState([]);
  const [habitsByArea, setHabitsByArea] = useState([]);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const isMobile = useBreakpointValue({ base: true, md: false });
  const {
    isOpen: isLeftOpen,
    onOpen: onLeftOpen,
    onClose: onLeftClose,
  } = useDisclosure();
  const {
    isOpen: isRightOpen,
    onOpen: onRightOpen,
    onClose: onRightClose,
  } = useDisclosure();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!authLoading && user) {
      setLoadingData(true);
      const unsubscribe = subscribeToAllAreasAndHabits(user.uid, (data) => {
        setAreas(data.areas);
        setHabitsByArea(data.habitsByArea);
        setLoadingData(false);
      });
      return () => {
        unsubscribe();
      };
    } else if (!authLoading && !user) {
      setLoadingData(false);
    }
  }, [authLoading, user]);

  useEffect(() => {
    if (!isMobile && isLeftOpen) {
      onLeftClose();
    }
  }, [isMobile, isLeftOpen, onLeftClose]);

  useEffect(() => {
    if (!isMobile && isRightOpen) {
      onRightClose();
    }
  }, [isMobile, isRightOpen, onRightClose]);

  if (authLoading || loadingData) {
    return <LoadingPanel message="Cargando..." />;
  }

  return (
    <HStack w="100%" minH="100vh" display="flex" overflow="hidden" spacing={0}>
      {isMobile ? (
        <Drawer placement="left" onClose={onLeftClose} isOpen={isLeftOpen}>
          <DrawerOverlay />
          <DrawerContent fontFamily={themeOptions.fontFamily}>
            <DrawerCloseButton top={3.5} right={3} zIndex={99} />
            <LeftColumnMenu
              areas={areas}
              habitsByArea={habitsByArea}
              onCloseLeftMenu={onLeftClose}
            />
          </DrawerContent>
        </Drawer>
      ) : (
        <Box w="13%">
          <LeftColumnMenu areas={areas} habitsByArea={habitsByArea} />
        </Box>
      )}
      <Box
        w={isMobile ? "100%" : "67%"}
        borderLeftWidth={!isMobile ? 2 : 0}
        borderRightWidth={!isMobile ? 2 : 0}
      >
        <Outlet
          context={{
            areas,
            habitsByArea,
            setSelectedHabit,
            onOpenLeftMenu: onLeftOpen,
            onOpenRightMenu: onRightOpen,
            isMobile,
          }}
        />
      </Box>
      {isMobile ? (
        <Drawer placement="right" onClose={onRightClose} isOpen={isRightOpen}>
          <DrawerOverlay />
          <DrawerContent fontFamily={themeOptions.fontFamily}>
            <DrawerCloseButton top={3.5} right={3} zIndex={99} />
            {selectedHabit ? (
              <HabitDetailPage
                habit={selectedHabit}
                allAreas={areas}
                onCloseRightMenu={onRightClose}
              />
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
                  Para poder ver los progresos e información acerca de un
                  hábito, solo selecciona el hábito deseado.
                </Text>
              </VStack>
            )}
          </DrawerContent>
        </Drawer>
      ) : (
        <Box w="20%">
          {selectedHabit ? (
            <HabitDetailPage habit={selectedHabit} allAreas={areas} />
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
      )}
    </HStack>
  );
};

export default DashboardLayout;
