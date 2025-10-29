import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext/ThemeContext";
import { useAuthUser } from "../../context/AuthUserContext/AuthUserContext";
import {
  Skeleton,
  HStack,
  Flex,
  Avatar,
  Text,
  Button,
  VStack,
  useColorMode,
  useToast,
  useDisclosure,
  IconButton,
  Tooltip,
  Divider,
  Spacer,
  Stack,
  MenuButton,
  MenuList,
  MenuItem,
  Menu,
} from "@chakra-ui/react";
import { deleteArea, getAppInfo } from "../../hooks/useDatabase";
import ModalWithTabs from "../modals/UserSettingsModal";
import * as LuIcons from "react-icons/lu";
import {
  CustomThemePanel,
  AreaModal,
  HabitModal,
  ConfirmationModal,
} from "../../exports";

const LeftColumnMenu = ({ areas }) => {
  const { themeOptions } = useTheme();
  const { colorMode } = useColorMode();
  const toast = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const { areaId } = useParams();
  const { user, loading, logout } = useAuthUser();
  const [selectedArea, setSelectedArea] = useState(null);
  const [appInfo, setAppInfo] = useState({ name: "", version: "" });
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
  const {
    isOpen: isAreaModalOpen,
    onOpen: onOpenAreaModal,
    onClose: onCloseAreaModal,
  } = useDisclosure();
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
  const isHomeActive = location.pathname === "/dashboard";
  const isHabitsActive = location.pathname === "/dashboard/habits";
  const isAreasActive = location.pathname === "/dashboard/areas";

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

  useEffect(() => {
    const fetchInfo = async () => {
      const info = await getAppInfo();
      setAppInfo(info);
    };
    fetchInfo();
  }, []);

  const userName =
    user?.name || user?.displayName || user?.email?.split("@")[0] || "Usuario";

  const userPhotoURL = user?.photoURL
    ? `//wsrv.nl/?url=${user.photoURL}`
    : undefined;

  const handleLogout = async () => {
    console.log("Intentando cerrar sesión...");
    try {
      await logout();
      toast({
        title: <Text fontWeight={600}>Sesión cerrada</Text>,
        description: "Has cerrado sesión correctamente.",
        status: "success",
        position: "bottom",
      });
    } catch (error) {
      console.error("Error logout:", error);
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
      await deleteArea(selectedArea.id, user.uid);
      setContextMenuVisible(false);
      onCloseDeleteDialog();
      toast({
        title: <Text fontWeight={600}>Área eliminada</Text>,
        description: "El área ha sido eliminada correctamente.",
        status: "success",
        position: "bottom",
      });
    } catch (error) {
      toast({
        title: <Text fontWeight={600}>Error al eliminar el área</Text>,
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
    onOpenAreaModal();
  };

  const handleEdit = (area) => {
    setSelectedArea(area);
    onOpenAreaModal();
  };

  if (loading || !user) {
    return (
      <VStack p={4} w="100%" h="100vh" spacing={4} align="start">
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
      bg={colorMode === "light" ? "white" : "black"}
    >
      <VStack align="stretch" spacing={2}>
        <Menu>
          <MenuButton
            as={Button}
            px={2}
            h={45}
            w="100%"
            justifyContent="flex-start"
            color={colorMode === "light" ? "black" : "white"}
            _focusVisible={{}}
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
          </MenuButton>
          <MenuList p={0} borderRadius={themeOptions.borderRadius}>
            <MenuItem
              p={2}
              justifyContent="flex-start"
              fontSize="sm"
              icon={<LuIcons.LuUserRound size="16px" />}
              variant="ghost"
              borderRadius={0}
              borderTopRadius={themeOptions.borderRadius}
              _focusVisible={{}}
              onClick={onOpenProfileModal}
            >
              Ver perfil
            </MenuItem>
            <MenuItem
              p={2}
              justifyContent="flex-start"
              fontSize="sm"
              icon={<LuIcons.LuLogOut size="16px" />}
              variant="ghost"
              borderRadius={0}
              borderBottomRadius={themeOptions.borderRadius}
              _focusVisible={{}}
              onClick={onOpenLogoutConfirmation}
            >
              Cerrar sesión
            </MenuItem>
          </MenuList>
        </Menu>
        <Button
          as={Button}
          px={2}
          w="100%"
          display="flex"
          alignItems="center"
          justifyContent="flex-start"
          fontSize="sm"
          onClick={() => navigate("/dashboard")}
          variant={isHomeActive ? "solid" : "unstyled"}
          colorScheme={isHomeActive ? themeOptions.focusColor : "blackAlpha"}
          leftIcon="🏠"
          _focusVisible={{}}
        >
          Inicio
        </Button>
      </VStack>
      <Divider />
      <VStack pb={4} align="stretch" spacing={2} maxH="100vh" overflowY="auto">
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
              <IconButton
                size="xs"
                onClick={onOpenCreateHabitModal}
                _focusVisible={{}}
              >
                <LuIcons.LuPlus size="16px" />
              </IconButton>
            </Tooltip>
          </HStack>
          <VStack spacing={1}>
            <Button
              as={Button}
              p={2}
              w="100%"
              display="flex"
              alignItems="center"
              justifyContent="flex-start"
              fontSize="sm"
              onClick={() => navigate("/dashboard/habits")}
              variant={isHabitsActive ? "solid" : "unstyled"}
              colorScheme={
                isHabitsActive ? themeOptions.focusColor : "blackAlpha"
              }
              leftIcon="📋"
              _focusVisible={{}}
            >
              <Text isTruncated>Todos los hábitos</Text>
            </Button>
          </VStack>
          <HabitModal
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
              <IconButton
                size="xs"
                onClick={onOpenCreateModal}
                _focusVisible={{}}
              >
                <LuIcons.LuPlus size="16px" />
              </IconButton>
            </Tooltip>
          </HStack>
          <VStack maxH="350px" overflowY="auto" overflowX="hidden" spacing={1}>
            <Button
              as={Button}
              p={2}
              w="100%"
              display="flex"
              alignItems="center"
              justifyContent="flex-start"
              fontSize="sm"
              onClick={() => navigate("/dashboard/areas")}
              variant={isAreasActive ? "solid" : "unstyled"}
              colorScheme={
                isAreasActive ? themeOptions.focusColor : "blackAlpha"
              }
              leftIcon="📋"
              _focusVisible={{}}
            >
              <Text isTruncated>Todas las áreas</Text>
            </Button>
            {areas && areas.length === 0 ? (
              <Text fontSize="sm" py={2} textAlign="left" isTruncated>
                No tienes áreas creadas.
              </Text>
            ) : (
              <Stack w="100%" alignItems="stretch" spacing={1}>
                {areas?.map((area) => {
                  return (
                    <div key={area.id}>
                      <Button
                        as={Button}
                        p={2}
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
                        leftIcon={area.icon || "📁"}
                        onContextMenu={(e) => handleContextMenu(e, area)}
                        _focusVisible={{}}
                      >
                        <Text isTruncated>{area.name}</Text>
                      </Button>
                      {isContextMenuVisible &&
                        selectedArea &&
                        selectedArea.id === area.id && (
                          <HStack
                            ref={contextMenuRef}
                            position="absolute"
                            top={contextMenuPosition.y}
                            left={contextMenuPosition.x}
                            bg={colorMode === "light" ? "gray.100" : "gray.900"}
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
                              _focusVisible={{}}
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
                              _focusVisible={{}}
                            >
                              Eliminar
                            </Button>
                          </HStack>
                        )}
                    </div>
                  );
                })}
              </Stack>
            )}
            <AreaModal
              isOpen={isAreaModalOpen}
              onClose={onCloseAreaModal}
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
              title={`¿Deseas eliminar el área: ${selectedArea?.name}?`}
              description="Perderás todos los hábitos que contenga dicho área y sus progresos. Esta acción no se puede deshacer."
              onConfirm={() => {
                handleDelete();
                onCloseDeleteDialog();
              }}
              confirmButtonText="Sí, eliminar"
              cancelButtonText="No, cancelar"
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
              isTruncated
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
              _focusVisible={{}}
            >
              <Text isTruncated>Ajustes generales</Text>
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
          </VStack>
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
        color={colorMode === "light" ? "gray.400" : "gray.600"}
        isTruncated
      >
        {`v${appInfo.version} - ${appInfo.name}`}
      </Text>
    </VStack>
  );
};

export default LeftColumnMenu;
