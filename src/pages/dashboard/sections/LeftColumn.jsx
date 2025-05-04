import React, { useEffect, useState, useRef, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useTheme } from "../../../context/ThemeContext";
import {
  Skeleton,
  Link,
  HStack,
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
  Image,
  IconButton,
  Tooltip,
  Divider,
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
import {
  CustomThemePanel,
  ModalArea,
  ModalHabit,
  ConfirmationModal,
} from "../../../routes/index";

const LeftColumn = ({ userInfo }) => {
  const { user } = useAuth();
  const { themeOptions } = useTheme();
  const { colorMode } = useColorMode();
  const toast = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const { areaId } = useParams();

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [areas, setAreas] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState(null);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });
  const [isContextMenuVisible, setContextMenuVisible] = useState(false);

  const contextMenuRef = useRef(null);

  const {
    isOpen: isOpenCreateHabitModal,
    onOpen: onOpenCreateHabitModal,
    onClose: onCloseCreateHabitModal,
  } = useDisclosure();

  const isHomeActive = location.pathname === "/dashboard";
  const isHabitsActive = location.pathname === "/dashboard/all-habits";
  const isAreasActive = location.pathname === "/dashboard/all-areas";

  const {
    isOpen: isOpenDeleteDialog,
    onOpen: onOpenDeleteDialog,
    onClose: onCloseDeleteDialog,
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

  const fetchAreasData = useCallback(async () => {
    setLoading(true);
    const unsubscribe = getAreas((fetchedAreas) => {
      setAreas(fetchedAreas);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (userInfo?.uid) {
        const userDataFromDB = await fetchUserDataFromFirestore(userInfo.uid);
        setUserData(userDataFromDB);
        await fetchAreasData();
      } else {
        setLoading(false);
      }
    };
    fetchData();
  }, [userInfo?.uid, fetchAreasData]);

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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const userName =
    userInfo?.displayName ||
    userData?.name ||
    userInfo?.email?.split("@")[0] ||
    "Usuario";

  const handleLogout = () => logoutUser(toast);

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

  const handleConfirmLogout = () => {
    logoutUser(toast);
    onCloseLogoutConfirmation();
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

  return (
    <VStack
      as="nav"
      aria-label="Panel lateral de navegación"
      p={2}
      w="100%"
      h="100vh"
      position="relative"
      alignItems="stretch"
      justifyContent="stretch"
      spacing={2}
    >
      {/* General */}
      <VStack align="stretch" spacing={1}>
        {/* General - Logo */}
        <Link p={2} w="100%" href="/" display="flex" justifyContent="center">
          <Image src={HabituoLogo} h="26px" alt="Logotipo de Habituo" />
        </Link>
        {/* General - Profile */}
        <Popover placement="right-start">
          <PopoverTrigger>
            <Button
              px={2}
              py={6}
              w="100%"
              justifyContent="flex-start"
              color={colorMode === "light" ? "#000" : "#fff"}
              _focusVisible="none"
              aria-label="Perfil de usuario"
            >
              <Flex align="center" gap={2} overflow="hidden">
                <Avatar
                  src={
                    userInfo.photoURL
                      ? `//wsrv.nl/?url=${userInfo.photoURL}`
                      : undefined
                  }
                  name={userName}
                  size="sm"
                />
                <VStack alignItems="flex-start" spacing={0} overflow="hidden">
                  <Text fontSize="sm" fontWeight={600} isTruncated>
                    {userName}
                  </Text>
                  <Text fontSize="xs" fontWeight={400} isTruncated>
                    {userInfo.email}
                  </Text>
                </VStack>
              </Flex>
            </Button>
          </PopoverTrigger>
          <PopoverContent w="auto" borderRadius={themeOptions.borderRadius}>
            <PopoverBody p={0} borderRadius={themeOptions.borderRadius}>
              <VStack align="stretch" spacing={0}>
                <Button
                  px={2}
                  py={4}
                  justifyContent="flex-start"
                  size="sm"
                  leftIcon={<LuIcons.LuUserRound size="16px" />}
                  variant="ghost"
                  borderRadius={0}
                  borderTopRadius={themeOptions.borderRadius}
                  _focusVisible="none"
                  onClick={onOpenProfileModal}
                >
                  Ver perfil
                </Button>
                <Button
                  px={2}
                  py={4}
                  justifyContent="flex-start"
                  size="sm"
                  leftIcon={<LuIcons.LuLogOut size="16px" />}
                  variant="ghost"
                  borderRadius={0}
                  borderBottomRadius={themeOptions.borderRadius}
                  _focusVisible="none"
                  onClick={handleLogout}
                >
                  Cerrar sesión
                </Button>
              </VStack>
            </PopoverBody>
          </PopoverContent>
        </Popover>
        {/* General - List */}
        <Button
          as={Button}
          px={3}
          w="100%"
          display="flex"
          alignItems="center"
          justifyContent="flex-start"
          fontSize="sm"
          onClick={() => navigate("/dashboard")}
          variant={isHomeActive ? "solid" : "unstyled"}
          colorScheme={isHomeActive ? themeOptions.focusColor : "blackAlpha"}
          leftIcon={<LuIcons.LuHouse size="16px" />}
          _focusVisible="none"
        >
          Inicio
        </Button>
      </VStack>

      <Divider />
      {/* Habits */}
      <VStack align="stretch" spacing={1}>
        {/* Habits - Title */}
        <HStack justifyContent="space-between">
          <Text
            fontSize="xs"
            fontWeight={600}
            textTransform="uppercase"
            color={colorMode === "light" ? "#00000050" : "#FFFFFF50"}
          >
            Hábitos
          </Text>
          <Tooltip
            label="Añadir hábito"
            placement="top"
            bg={colorMode === "light" ? "rgb(0, 0, 0)" : "rgb(255, 255, 255)"}
            borderRadius={themeOptions.borderRadius}
            hasArrow
          >
            <IconButton size="xs" onClick={onOpenCreateHabitModal}>
              <LuIcons.LuPlus size="16px" />
            </IconButton>
          </Tooltip>
        </HStack>
        {/* Habits - List */}
        <VStack spacing={1}>
          <Button
            as={Button}
            p={3}
            w="100%"
            display="flex"
            alignItems="center"
            justifyContent="flex-start"
            fontSize="sm"
            onClick={() => navigate("/dashboard/all-habits")}
            variant={isHabitsActive ? "solid" : "unstyled"}
            colorScheme={
              isHabitsActive ? themeOptions.focusColor : "blackAlpha"
            }
            leftIcon={<LuIcons.LuClipboardList size="16px" />}
            _focusVisible="none"
          >
            Todos los hábitos
          </Button>
        </VStack>
        {/* Habits - Modal */}
        <ModalHabit
          isOpen={isOpenCreateHabitModal}
          onClose={onCloseCreateHabitModal}
        />
      </VStack>
      {/* Areas */}
      <VStack align="stretch" spacing={1}>
        {/* Areas - Title */}
        <HStack alignItems="center" justifyContent="space-between">
          <Text
            fontSize="xs"
            fontWeight={600}
            textTransform="uppercase"
            color={colorMode === "light" ? "#00000050" : "#FFFFFF50"}
          >
            Áreas
          </Text>
          <Tooltip
            label="Añadir área"
            placement="top"
            bg={colorMode === "light" ? "rgb(0, 0, 0)" : "rgb(255, 255, 255)"}
            borderRadius={themeOptions.borderRadius}
            hasArrow
          >
            <IconButton size="xs" onClick={onOpenCreateModal}>
              <LuIcons.LuPlus size="16px" />
            </IconButton>
          </Tooltip>
        </HStack>
        {/* Areas - List */}
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
            p={3}
            w="100%"
            display="flex"
            alignItems="center"
            justifyContent="flex-start"
            fontSize="sm"
            onClick={() => navigate("/dashboard/all-areas")}
            variant={isAreasActive ? "solid" : "unstyled"}
            colorScheme={isAreasActive ? themeOptions.focusColor : "blackAlpha"}
            leftIcon={<LuIcons.LuClipboardList size="16px" />}
            _focusVisible="none"
          >
            Todas las áreas
          </Button>
          {loading ? (
            <VStack w="100%" alignItems="stretch" spacing={1}>
              {Array.from({ length: 3 }).map((_, index) => (
                <HStack
                  key={index}
                  p={2}
                  w="100%"
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
            <VStack w="100%" alignItems="stretch" spacing={1}>
              {areas.map((area) => {
                const IconComponent = LuIcons[area.icon] || LuIcons.LuFolder;
                return (
                  <div key={area.id}>
                    <Button
                      as={Button}
                      p={3}
                      w="100%"
                      display="flex"
                      alignItems="center"
                      justifyContent="flex-start"
                      fontSize="sm"
                      onClick={() => navigate(`/dashboard/areas/${area.id}`)}
                      variant={areaId === area.id ? "solid" : "unstyled"}
                      colorScheme={
                        areaId === area.id
                          ? themeOptions.focusColor
                          : "blackAlpha"
                      }
                      leftIcon={<IconComponent size="16px" />}
                      onContextMenu={(e) => handleContextMenu(e, area)}
                      _focusVisible="none"
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
                          gap={0}
                        >
                          <Button
                            w="100%"
                            size="sm"
                            fontWeight={500}
                            borderRadius={0}
                            borderTopRadius={themeOptions.borderRadius}
                            onClick={() => handleEdit(area)}
                            _focusVisible="none"
                          >
                            Editar
                          </Button>
                          <Button
                            w="100%"
                            size="sm"
                            fontWeight={500}
                            borderRadius={0}
                            borderBottomRadius={themeOptions.borderRadius}
                            onClick={onOpenDeleteDialog}
                            _focusVisible="none"
                          >
                            Eliminar
                          </Button>
                        </HStack>
                      )}
                  </div>
                );
              })}
            </VStack>
          )}
          {/* Areas - Modal */}
          <ModalArea
            isOpen={isCreateModalOpen}
            onClose={() => {
              setSelectedArea(null);
              onCloseCreateModal();
            }}
            selectedArea={selectedArea}
          />
          {/* Modal - Logout */}
          <ConfirmationModal
            isOpen={isLogoutConfirmationOpen}
            onClose={onCloseLogoutConfirmation}
            title="¿Quieres cerrar la sesión?"
            description="Siempre que cierras sesión podrás volver cuando quieras y no perderás ningún progreso."
            onConfirm={handleConfirmLogout}
            confirmButtonText="Sí, cerrar sesión"
          />
          {/* Modal - Delete area */}
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
        </VStack>
      </VStack>

      <Divider />
      {/* Custom */}
      <VStack align="stretch" spacing={1}>
        {/* Custom - Title */}
        <HStack alignItems="center" justifyContent="flex-start">
          <Text
            fontSize="xs"
            fontWeight={600}
            textTransform="uppercase"
            color={colorMode === "light" ? "#00000050" : "#FFFFFF50"}
          >
            Ajustes generales
          </Text>
        </HStack>
        {/* Areas - List */}
        <VStack spacing={1}>
          <Button
            as={Button}
            p={3}
            w="100%"
            display="flex"
            justifyContent="flex-start"
            fontSize="sm"
            onClick={onOpenProfileModal}
            variant="unstyled"
            colorScheme="blackAlpha"
            leftIcon={<LuIcons.LuSlidersHorizontal size="16px" />}
            _focusVisible="none"
          >
            Ajustes generales
          </Button>
          {userData && (
            <ModalWithTabs
              isOpen={isProfileModalOpen}
              onClose={onCloseProfileModal}
              userData={userData}
              userInfo={userInfo}
            />
          )}
          <CustomThemePanel />
          <Button
            as={Button}
            p={3}
            w="100%"
            display="flex"
            justifyContent="flex-start"
            fontSize="sm"
            color={
              colorMode === "light" ? "rgb(0, 0, 0)" : "rgb(255, 255, 255)"
            }
            onClick={() => navigate("/")}
            leftIcon={<LuIcons.LuArrowLeft size="16px" />}
            _focusVisible="none"
          >
            Volver a la web
          </Button>
        </VStack>
      </VStack>
      {/* App Version */}
      <Text
        position="absolute"
        bottom={1}
        left="50%"
        transform="translateX(-50%)"
        textAlign="center"
        fontSize="xs"
        userSelect="none"
        color={colorMode === "light" ? "#00000050" : "#ffffff50"}
      >
        v0.0.1 - Habituo App
      </Text>
    </VStack>
  );
};

export default LeftColumn;
