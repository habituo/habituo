import React, { useEffect, useState, useRef, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import { useAuthUser } from "../../../context/AuthUserContext";
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
  Center,
  Spinner,
  Spacer,
} from "@chakra-ui/react";
import { deleteAreaById, getAreas } from "../../../hooks/database";
import HabituoLogo from "../../../assets/images/habituo-logo.svg";
import ModalWithTabs from "./ModalWithTabs";
import * as LuIcons from "react-icons/lu";
import {
  CustomThemePanel,
  ModalArea,
  ModalHabit,
  ConfirmationModal,
} from "../../../routes/index";

const LeftColumn = () => {
  const { themeOptions } = useTheme();
  const { colorMode } = useColorMode();
  const toast = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const { areaId } = useParams();
  const { user, loading, logout } = useAuthUser();
  const [areas, setAreas] = useState([]);
  const [loadingAreas, setLoadingAreas] = useState(true);
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

  const fetchAreasData = useCallback(() => {
    if (!user || loading) {
      setLoadingAreas(false);
      return () => {};
    }

    setLoadingAreas(true);
    const unsubscribe = getAreas(
      user.uid,
      (fetchedAreas) => {
        setAreas(fetchedAreas);
        setLoadingAreas(false);
      },
      (error) => {
        toast({
          title: <Text fontWeight={600}>Error al cargar áreas</Text>,
          description: "No se pudieron cargar tus áreas. Inténtalo de nuevo.",
          status: "error",
          position: "bottom",
        });
        setLoadingAreas(false);
      }
    );
    return unsubscribe;
  }, [user, loading, toast]);

  useEffect(() => {
    const unsubscribe = fetchAreasData();
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [fetchAreasData]);

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
    user?.displayName || user?.name || user?.email?.split("@")[0] || "Usuario";

  const userPhotoURL = user?.photoURL
    ? `//wsrv.nl/?url=${user.photoURL}`
    : undefined;

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: <Text fontWeight={600}>Sesión cerrada</Text>,
        description: "Has cerrado sesión correctamente.",
        status: "success",
        position: "bottom",
      });
    } catch (error) {
      toast({
        title: <Text fontWeight={600}>Error al cerrar sesión</Text>,
        description: error.message || "No se pudo cerrar sesión.",
        status: "error",
        position: "bottom",
      });
    }
  };

  const handleContextMenu = (e, area) => {
    e.preventDefault();
    setSelectedArea(area);
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setContextMenuVisible(true);
  };

  const handleDelete = async () => {
    if (!selectedArea) return;
    try {
      await deleteAreaById(selectedArea.id, user.uid);
      setContextMenuVisible(false);
      onCloseDeleteDialog();
      toast({
        title: <Text fontWeight="600">Área eliminada</Text>,
        description: "El área ha sido eliminada correctamente.",
        status: "success",
        position: "bottom",
      });
    } catch (error) {
      toast({
        title: <Text fontWeight="600">Error al eliminar el área</Text>,
        description: error.message,
        status: "error",
        position: "bottom",
      });
    }
  };

  const handleConfirmLogout = () => {
    handleLogout();
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

  if (loading || !user || loadingAreas) {
    return (
      <VStack p={4} w="100%" h="100vh" spacing={4} align="start">
        <Center w="100%" h="80px">
          <Spinner size="lg" color={themeOptions.focusColor} />
        </Center>
        <Skeleton h="20px" w="80%" borderRadius={themeOptions.borderRadius} />
        <Skeleton h="20px" w="70%" borderRadius={themeOptions.borderRadius} />
        <Skeleton h="20px" w="60%" borderRadius={themeOptions.borderRadius} />
        <Divider my={4} />
        <Skeleton h="30px" w="90%" borderRadius={themeOptions.borderRadius} />
        <VStack w="100%" spacing={2}>
          {[...Array(5)].map((_, i) => (
            <Skeleton
              key={i}
              h="40px"
              w="100%"
              borderRadius={themeOptions.borderRadius}
            />
          ))}
        </VStack>
        <Spacer />
        <Skeleton h="40px" w="100%" borderRadius={themeOptions.borderRadius} />
        <Skeleton h="40px" w="100%" borderRadius={themeOptions.borderRadius} />
      </VStack>
    );
  }

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
      <VStack align="stretch" spacing={1}>
        <Link p={2} w="100%" href="/" display="flex" justifyContent="center">
          <Image src={HabituoLogo} h="26px" alt="Logotipo de Habituo App" />
        </Link>
        <Popover placement="right-start">
          <PopoverTrigger>
            <Button
              px={2}
              py={6}
              w="100%"
              justifyContent="flex-start"
              color={colorMode === "light" ? "#000000" : "#ffffff"}
              _focusVisible="none"
              aria-label="Perfil de usuario"
            >
              <Flex align="center" gap={2} overflow="hidden">
                <Avatar src={userPhotoURL} name={userName} size="sm" />
                <VStack alignItems="flex-start" spacing={0} overflow="hidden">
                  <Text fontSize="sm" fontWeight={600} isTruncated>
                    {userName}
                  </Text>
                  <Text fontSize="xs" fontWeight={400} isTruncated>
                    {user?.email}
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
                  onClick={onOpenLogoutConfirmation}
                >
                  Cerrar sesión
                </Button>
              </VStack>
            </PopoverBody>
          </PopoverContent>
        </Popover>
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
      <VStack align="stretch" spacing={1}>
        <HStack justifyContent="space-between">
          <Text
            fontSize="xs"
            fontWeight={600}
            textTransform="uppercase"
            color={colorMode === "light" ? "gray.400" : "gray.600"}
          >
            Hábitos
          </Text>
          <Tooltip
            label="Añadir hábito"
            placement="top"
            bg={colorMode === "light" ? "black" : "white"}
            borderRadius={themeOptions.borderRadius}
            hasArrow
          >
            <IconButton size="xs" onClick={onOpenCreateHabitModal}>
              <LuIcons.LuPlus size="16px" />
            </IconButton>
          </Tooltip>
        </HStack>
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
        <ModalHabit
          isOpen={isOpenCreateHabitModal}
          onClose={onCloseCreateHabitModal}
        />
      </VStack>
      <VStack align="stretch" spacing={1}>
        <HStack alignItems="center" justifyContent="space-between">
          <Text
            fontSize="xs"
            fontWeight={600}
            textTransform="uppercase"
            color={colorMode === "light" ? "gray.400" : "gray.600"}
          >
            Áreas
          </Text>
          <Tooltip
            label="Añadir área"
            placement="top"
            bg={colorMode === "light" ? "black" : "white"}
            borderRadius={themeOptions.borderRadius}
            hasArrow
          >
            <IconButton size="xs" onClick={onOpenCreateModal}>
              <LuIcons.LuPlus size="16px" />
            </IconButton>
          </Tooltip>
        </HStack>
        <VStack
          maxH="350px"
          overflow="auto"
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
          {areas.length === 0 && !loadingAreas ? (
            <Text fontSize="sm" py={2} textAlign="left">
              No tienes áreas creadas.
            </Text>
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
                              ? "gray.100"
                              : "gray.900"
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
          <ModalArea
            isOpen={isCreateModalOpen}
            onClose={() => {
              setSelectedArea(null);
              onCloseCreateModal();
            }}
            selectedArea={selectedArea}
          />
          <ConfirmationModal
            isOpen={isLogoutConfirmationOpen}
            onClose={onCloseLogoutConfirmation}
            title="¿Quieres cerrar la sesión?"
            description="Siempre que cierras sesión podrás volver cuando quieras y no perderás ningún progreso."
            onConfirm={handleConfirmLogout}
            confirmButtonText="Sí, cerrar sesión"
          />
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
      <VStack align="stretch" spacing={1}>
        <HStack alignItems="center" justifyContent="flex-start">
          <Text
            fontSize="xs"
            fontWeight={600}
            textTransform="uppercase"
            color={colorMode === "light" ? "gray.400" : "gray.600"}
          >
            Ajustes generales
          </Text>
        </HStack>
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
          {user && (
            <ModalWithTabs
              isOpen={isProfileModalOpen}
              onClose={onCloseProfileModal}
              userData={user}
              user={user}
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
              colorMode === "light" ? "black" : "white"
            }
            onClick={() => navigate("/")}
            leftIcon={<LuIcons.LuArrowLeft size="16px" />}
            _focusVisible="none"
          >
            Volver a la web
          </Button>
        </VStack>
      </VStack>
      <Text
        position="absolute"
        bottom={1}
        left="50%"
        transform="translateX(-50%)"
        textAlign="center"
        fontSize="xs"
        userSelect="none"
        color={colorMode === "light" ? "gray.400" : "#ffffff50"}
      >
        v0.0.1 - Habituo App
      </Text>
    </VStack>
  );
};

export default LeftColumn;
