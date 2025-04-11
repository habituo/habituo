import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useTheme } from "../../../context/ThemeContext";
import {
  Skeleton,
  Link,
  HStack,
  Box,
  Flex,
  Avatar,
  Text,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  VStack,
  useColorMode,
  useToast,
  useDisclosure,
} from "@chakra-ui/react";
import {
  deleteAreaById,
  getAreas,
  fetchUserDataFromFirestore,
  logoutUser,
} from "../../../hooks/database";
import HabituoLogo from "../../../assets/images/habituo-logo.svg";
import ModalWithTabs from "./ModalWithTabs";
import * as LuIcons from "react-icons/lu";
import { FiPlus } from "react-icons/fi";
import {
  CustomThemePanel,
  ModalArea,
  ModalHabit,
  ConfirmationModal,
} from "../../../routes/index";

const LeftColumn = () => {
  const [userData, setUserData] = useState(null);
  const { user: userInfo } = useAuth();
  const [loading, setLoading] = useState(true);
  const [areas, setAreas] = useState([]);
  const { themeOptions } = useTheme();
  const { colorMode } = useColorMode();
  const toast = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const isHabitsActive = location.pathname === "/dashboard/all-habits";
  const isAreasActive = location.pathname === "/dashboard/all-areas";
  const {
    isOpen: isOpenDeleteDialog,
    onOpen: onOpenDeleteDialog,
    onClose: onCloseDeleteDialog,
  } = useDisclosure();
  const {
    isOpen: isOpenCreateHabitModal,
    onOpen: onOpenCreateHabitModal,
    onClose: onCloseCreateHabitModal,
  } = useDisclosure();
  const {
    isOpen: isProfileModalOpen,
    onOpen: onOpenProfileModal,
    onClose: onCloseProfileModal,
  } = useDisclosure();
  const {
    isOpen: isLogoutConfirmationOpen,
    onOpen: onOpenLogoutConfirmation,
    onClose: onCloseLogoutConfirmation,
  } = useDisclosure();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState(null);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });
  const [isContextMenuVisible, setContextMenuVisible] = useState(false);
  const { areaId } = useParams();

  const contextMenuRef = useRef(null);

  const handleContextMenu = (e, area) => {
    e.preventDefault();
    setSelectedArea(area);
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setContextMenuVisible(true);
  };

  const handleDelete = async () => {
    if (!selectedArea) return;
    try {
      await deleteAreaById(selectedArea.id);
      setContextMenuVisible(false);
      onCloseDeleteDialog();
    } catch (error) {
      toast({
        title: <Text fontWeight="600">Error al eliminar el área</Text>,
        description: error.message,
        status: "error",
        isClosable: true,
        position: "bottom",
      });
    }
  };

  const handleLogout = () => {
    onOpenLogoutConfirmation();
  };

  const handleConfirmLogout = () => {
    logoutUser(toast);
    onCloseLogoutConfirmation();
  };

  const fetchAreasData = async () => {
    setLoading(true);
    const unsubscribe = getAreas((fetchedAreas) => {
      setAreas(fetchedAreas);
      setLoading(false);
    });
    return unsubscribe;
  };

  const onOpenCreateModal = () => {
    setSelectedArea(null);
    setIsCreateModalOpen(true);
  };

  const handleEdit = (area) => {
    setSelectedArea(area);
    setIsCreateModalOpen(true);
  };

  const onCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setSelectedArea(null);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (userInfo?.uid) {
        const userDataFromDB = await fetchUserDataFromFirestore(userInfo?.uid);
        setUserData(userDataFromDB);
        await fetchAreasData();
      } else {
        setLoading(false);
      }
    };

    fetchData();
  }, [userInfo?.uid]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(e.target)
      ) {
        setContextMenuVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  let userName = "";
  if (userInfo?.displayName) {
    userName = userInfo.displayName;
  } else if (userData?.name) {
    userName = userData.name;
  } else if (userInfo?.email) {
    userName = userInfo.email.split("@")[0];
  }

  return (
    <Box
      p={2}
      w="100%"
      h="100vh"
      position="relative"
      bg={colorMode === "light" ? "rgb(245, 245, 245)" : "rgb(23, 23, 23)"}
      fontFamily={themeOptions.fontFamily}
    >
      <Link
        href="/"
        pt={2}
        pb={4}
        w="100%"
        display="flex"
        alignItems="center"
        justifyContent="flex-start"
      >
        <img
          src={HabituoLogo}
          title="Habituo App - Tracker de hábitos"
          alt="Logotipo de Habituo App"
          width="150px"
          height="32.45px"
          style={{ userSelect: "none", pointerEvents: "none" }}
        />
      </Link>
      <Popover align="right">
        <PopoverTrigger>
          <Button
            as={Button}
            px={2}
            py={6}
            w="100%"
            display="flex"
            justifyContent="flex-start"
            colorScheme=""
            variant="ghost"
            _focusVisible={{ boxShadow: "none" }}
          >
            <Flex alignItems="center" justifyContent="flex-start" gap={3} overflow="hidden">
              <Avatar
                src={`//wsrv.nl/?url=${userInfo.photoURL}`}
                name={userName}
                size="sm"
              />
              <VStack alignItems="flex-start" spacing={0}>
                <Text fontSize="sm" fontWeight="600">
                  {userName}
                </Text>
                <Text fontSize="xs" fontWeight="300">
                  {userInfo.email}
                </Text>
              </VStack>
            </Flex>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          w="auto"
          bg={colorMode === "light" ? "rgb(245, 245, 245)" : "rgb(23, 23, 23)"}
          borderRadius={themeOptions.borderRadius}
        >
          <PopoverBody p={0} borderRadius={themeOptions.borderRadius}>
            <VStack alignItems="stretch" gap={0}>
              <Button
                px={4}
                py={5}
                display="flex"
                justifyContent="flex-start"
                size="xs"
                onClick={onOpenProfileModal}
                leftIcon={<LuIcons.LuUserRound size="16px" />}
                variant="ghost"
                borderRadius={0}
                borderTopRadius={themeOptions.borderRadius}
                _focusVisible={{ boxShadow: "none" }}
              >
                Ver Perfil
              </Button>
              <Button
                px={4}
                py={5}
                display="flex"
                justifyContent="flex-start"
                size="xs"
                onClick={handleLogout}
                leftIcon={<LuIcons.LuLogOut size="16px" />}
                variant="ghost"
                borderRadius={0}
                borderBottomRadius={themeOptions.borderRadius}
                _focusVisible={{ boxShadow: "none" }}
              >
                Cerrar sesión
              </Button>
            </VStack>
          </PopoverBody>
        </PopoverContent>
      </Popover>

      <Text
        mt={4}
        mb={1}
        fontSize="xs"
        fontWeight={600}
        textTransform="uppercase"
        color={colorMode === "light" ? "#00000050" : "#FFFFFF50"}
      >
        Hábitos
      </Text>
      <VStack spacing={1}>
        <Button
          as={Button}
          px={3}
          w="100%"
          minH="40px"
          display="flex"
          justifyContent="flex-start"
          fontSize="sm"
          onClick={() => navigate("/dashboard/all-habits")}
          variant={isHabitsActive ? "solid" : "ghost"}
          colorScheme={isHabitsActive ? themeOptions.focusColor : ""}
          leftIcon={<LuIcons.LuClipboardList size="16px" />}
          _focusVisible={{ boxShadow: "none" }}
        >
          Todos los hábitos
        </Button>

        <Button
          as={Button}
          px={3}
          w="100%"
          minH="40px"
          display="flex"
          justifyContent="flex-start"
          fontSize="sm"
          onClick={onOpenCreateHabitModal}
          variant={"ghost"}
          colorScheme={""}
          leftIcon={<LuIcons.LuPlus size="16px" />}
          _focusVisible={{ boxShadow: "none" }}
        >
          Agregar hábito
        </Button>
      </VStack>
      <ModalHabit
        isOpen={isOpenCreateHabitModal}
        onClose={onCloseCreateHabitModal}
      />

      <Text
        mt={4}
        mb={1}
        fontSize="xs"
        fontWeight={600}
        textTransform="uppercase"
        color={colorMode === "light" ? "#00000050" : "#FFFFFF50"}
      >
        Áreas
      </Text>
      <VStack
        maxH="350px"
        overflow="auto"
        sx={{
          "&": {
            overflowX: "hidden",
            transition: "width 0.3s ease-in-out",
          },
          "&::-webkit-scrollbar": {
            width: 0,
            transition: "width 1s ease-in-out",
          },
          "&:hover::-webkit-scrollbar": {
            width: 1,
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: `var(--chakra-colors-${themeOptions.focusColor}-200)`,
            borderRadius: themeOptions.borderRadius,
          },
          "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor: `var(--chakra-colors-${themeOptions.focusColor}-400)`,
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "transparent",
            borderRadius: themeOptions.borderRadius,
          },
        }}
        spacing={1}
      >
        <Button
          as={Button}
          px={3}
          w="100%"
          minH="40px"
          display="flex"
          justifyContent="flex-start"
          fontSize="sm"
          onClick={() => navigate("/dashboard/all-areas")}
          variant={isAreasActive ? "solid" : "ghost"}
          colorScheme={isAreasActive ? themeOptions.focusColor : ""}
          leftIcon={<LuIcons.LuClipboardList size="16px" />}
          _focusVisible={{ boxShadow: "none" }}
        >
          Todas las áreas
        </Button>
        {loading ? (
          <VStack w="100%" my={1} spacing={1}>
            {Array.from({ length: 3 }).map((_, index) => (
              <HStack
                key={index}
                px={2}
                w="100%"
                minH="40px"
                bg={colorMode === "light" ? "#00000010" : "#ffffff10"}
                borderRadius={themeOptions.borderRadius}
                alignItems="center"
              >
                <Skeleton
                  w="20px"
                  h="20px"
                  borderRadius={themeOptions.borderRadius}
                />
                <Skeleton
                  w="calc(100% - 20px - 8px)"
                  h="20px"
                  borderRadius={themeOptions.borderRadius}
                />
              </HStack>
            ))}
          </VStack>
        ) : (
          <VStack w="100%" spacing={1}>
            {areas.map((area) => {
              const IconComponent = LuIcons[area.icon] || LuIcons.LuFolder;
              return (
                <>
                  <Button
                    as={Button}
                    key={area.id}
                    px={3}
                    w="100%"
                    minH="40px"
                    display="flex"
                    justifyContent="flex-start"
                    fontSize="sm"
                    onClick={() => navigate(`/dashboard/areas/${area.id}`)}
                    variant={areaId === area.id ? "solid" : "ghost"}
                    colorScheme={
                      areaId === area.id ? themeOptions.focusColor : ""
                    }
                    leftIcon={<IconComponent size="16px" />}
                    onContextMenu={(e) => handleContextMenu(e, area)}
                    _focusVisible={{ boxShadow: "none" }}
                  >
                    {area.name}
                  </Button>
                  {isContextMenuVisible &&
                    selectedArea &&
                    selectedArea.id === area.id && (
                      <HStack
                        ref={contextMenuRef}
                        position="absolute"
                        top={contextMenuPosition.y}
                        left={contextMenuPosition.x}
                        bg={
                          colorMode === "light"
                            ? "rgb(245, 245, 245)"
                            : "rgb(23, 23, 23)"
                        }
                        borderRadius={themeOptions.borderRadius}
                        borderWidth="1px"
                        zIndex="1000"
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="stretch"
                        gap="0"
                      >
                        <Button
                          w="100%"
                          size="sm"
                          fontWeight={500}
                          borderRadius={0}
                          borderTopRadius={themeOptions.borderRadius}
                          variant="ghost"
                          onClick={() => handleEdit(area)}
                          _focusVisible={{ boxShadow: "none" }}
                        >
                          Editar
                        </Button>
                        <Button
                          w="100%"
                          size="sm"
                          fontWeight={500}
                          borderRadius={0}
                          borderBottomRadius={themeOptions.borderRadius}
                          variant="ghost"
                          onClick={onOpenDeleteDialog}
                          _focusVisible={{ boxShadow: "none" }}
                        >
                          Eliminar
                        </Button>
                      </HStack>
                    )}
                </>
              );
            })}
          </VStack>
        )}

        {/* Modal de confirmación genérico para cerrar sesión */}
        <ConfirmationModal
          isOpen={isLogoutConfirmationOpen}
          onClose={onCloseLogoutConfirmation}
          title="¿Quieres cerrar la sesión?"
          description="Siempre que cierras sesión podrás volver cuando quieras y no perderás ningún progreso."
          onConfirm={handleConfirmLogout}
          confirmButtonText="Sí, cerrar sesión"
        />

        {/* Modal de confirmación genérico para eliminar una área */}
        <ConfirmationModal
          isOpen={isOpenDeleteDialog}
          onClose={onCloseDeleteDialog}
          title="Eliminar área"
          description={`¿Estás seguro de que deseas eliminar el área "${
            selectedArea?.name || "seleccionada"
          }"? Esta acción no se puede deshacer. Perderás todos los hábitos y sus procesos dentro de esta área.`}
          onConfirm={() => {
            handleDelete();
            onCloseDeleteDialog();
          }}
          confirmButtonText="Sí, eliminar"
        />

        <Button
          as={Button}
          px={3}
          w="100%"
          minH="40px"
          display="flex"
          justifyContent="flex-start"
          fontSize="sm"
          onClick={onOpenCreateModal}
          variant={"ghost"}
          colorScheme={""}
          leftIcon={<FiPlus size="16px" />}
          _focusVisible={{ boxShadow: "none" }}
        >
          Agregar área
        </Button>
        <ModalArea
          isOpen={isCreateModalOpen}
          onClose={() => {
            setSelectedArea(null);
            onCloseCreateModal();
          }}
          selectedArea={selectedArea}
        />
      </VStack>
      <Text
        mt={4}
        mb={1}
        fontSize="xs"
        fontWeight={600}
        textTransform="uppercase"
        color={colorMode === "light" ? "#00000050" : "#FFFFFF50"}
      >
        Ajustes generales
      </Text>
      <Button
        as={Button}
        px={3}
        fontSize="sm"
        display="flex"
        justifyContent="flex-start"
        onClick={onOpenProfileModal}
        variant={"ghost"}
        colorScheme={""}
        width="100%"
        leftIcon={<LuIcons.LuSlidersHorizontal size="16px" />}
        _focusVisible={{ boxShadow: "none" }}
      >
        Ajustes generales
      </Button>
      <CustomThemePanel />
      {userData && (
        <ModalWithTabs
          isOpen={isProfileModalOpen}
          onClose={onCloseProfileModal}
          userInfo={userInfo}
          userData={userData}
        />
      )}

      <Text
        position="absolute"
        bottom={1}
        left="50%"
        transform="translateX(-50%)"
        textAlign="center"
        fontSize={12}
        userSelect="none"
        color={colorMode === "light" ? "#00000050" : "#ffffff50"}
      >
        v0.0.1
      </Text>
    </Box>
  );
};

export default LeftColumn;
