import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useTheme } from "../../../context/ThemeContext";
import {
  collection,
  onSnapshot,
  deleteDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { auth, db } from "../../../hooks/firebase";
import { signOut } from "firebase/auth";
import {
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
  useColorMode,
  VStack,
  useToast,
  useDisclosure,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from "@chakra-ui/react";
import ModalWithTabs from "./ModalWithTabs";
import * as LuIcons from "react-icons/lu";
import { FiPlus } from "react-icons/fi";
import {
  CustomThemePanel,
  ModalCreateArea,
  ModalCreateHabitArea,
} from "../../../routes/index";

const LeftColumn = ({ userInfo }) => {
  const [userData, setUserData] = useState(null);
  const { user } = useAuth();
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
    isOpen: isOpenCreateModal,
    onOpen: onOpenCreateModal,
    onClose: onCloseCreateModal,
  } = useDisclosure();
  const {
    isOpen: isOpenCreateHabitModal,
    onOpen: onOpenCreateHabitModal,
    onClose: onCloseCreateHabitModal,
  } = useDisclosure();
  const [selectedArea, setSelectedArea] = useState(null);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });
  const [isContextMenuVisible, setContextMenuVisible] = useState(false); // Para controlar la visibilidad del menú
  const { areaId } = useParams();

  const contextMenuRef = useRef(null); // Referencia para el menú contextual

  const handleContextMenu = (e, area) => {
    e.preventDefault(); // Evita el menú del navegador
    setSelectedArea(area);
    setContextMenuPosition({ x: e.clientX, y: e.clientY }); // Establece la posición del clic derecho
    setContextMenuVisible(true); // Muestra el menú contextual
  };

  const handleDelete = () => {
    if (!selectedArea) return;
    deleteAreaFromFirestore(selectedArea.id);
    setContextMenuVisible(false);
    onCloseDeleteDialog();
  };

  const deleteAreaFromFirestore = async (areaId) => {
    try {
      await deleteDoc(doc(db, "users", user.uid, "areas", areaId));
    } catch (error) {
      console.error("Error al eliminar el área:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Sesión cerrada.",
        description: "Has cerrado sesión exitosamente.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });

      window.location.href = "/";
    } catch (error) {
      toast({
        title: "Error al cerrar sesión.",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  const fetchUserData = async () => {
    const user = auth.currentUser;

    if (user) {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        setUserData(userSnap.data());
      }
    }
  };

  const fetchAreas = async () => {
    try {
      const areasRef = collection(db, "users", userInfo.uid, "areas");

      const unsubscribe = onSnapshot(areasRef, (snapshot) => {
        const areasList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setAreas(areasList);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      setLoading(false);
      throw new Error("Error al obtener las áreas: ", error);
    }
  };

  // Function to edit area selected
  const handleEdit = (area) => {
    setSelectedArea(area);
    console.log("Area: ", area);
    onOpenCreateModal();
  };

  useEffect(() => {
    fetchUserData();
    fetchAreas();
  }, [user]);

  // Detecta clics fuera del menú contextual
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(e.target)
      ) {
        setContextMenuVisible(false); // Cierra el menú contextual si se hace clic fuera
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    // Limpia el event listener cuando el componente se desmonte
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
      px={2}
      py={4}
      w="100%"
      h="100vh"
      bg={colorMode === "light" ? "rgb(245, 245, 245)" : "rgb(23, 23, 23)"}
      fontFamily={themeOptions.fontFamily}
    >
      <Popover align="right">
        <PopoverTrigger>
          <Button
            px={2}
            py={6}
            w="100%"
            bg={
              colorMode === "light" ? "rgb(236, 236, 236)" : "rgb(50, 50, 50)"
            }
            display="flex"
            justifyContent="flex-start"
          >
            <Flex alignItems="center" justifyContent="flex-start" gap={3}>
              <Avatar
                src={`//wsrv.nl/?url=${userInfo.photoURL}`}
                name={userName}
                size="sm"
              />
              <Text fontSize="sm" fontWeight="medium">
                {userName}
              </Text>
            </Flex>
          </Button>
        </PopoverTrigger>
        <PopoverContent w="auto" borderRadius={themeOptions.borderRadius}>
          <PopoverBody p={0}>
            <VStack p={1} alignItems="stretch" gap={1}>
              <Button
                p={4}
                display="flex"
                justifyContent="flex-start"
                size="xs"
                onClick={handleLogout}
              >
                Cerrar sesión
              </Button>
            </VStack>
          </PopoverBody>
        </PopoverContent>
      </Popover>

      <Text
        mt={4}
        fontSize="xs"
        fontWeight="semibold"
        textTransform="uppercase"
        opacity={0.4}
        userSelect="none"
      >
        Hábitos
      </Text>
      <Button
        mt={2}
        as={Button}
        px={3}
        w="100%"
        display="flex"
        justifyContent="flex-start"
        fontSize="sm"
        onClick={() => navigate("/dashboard/all-habits")}
        variant={isHabitsActive ? "solid" : "ghost"}
        colorScheme={isHabitsActive ? themeOptions.focusColor : ""}
        leftIcon={<LuIcons.LuClipboardList size="16px" />}
        _focusVisible="none"
      >
        Todos los hábitos
      </Button>
      <Button
        as={Button}
        px={3}
        w="100%"
        display="flex"
        justifyContent="flex-start"
        fontSize="sm"
        onClick={onOpenCreateHabitModal}
        variant={"ghost"}
        colorScheme={""}
        leftIcon={<LuIcons.LuPlus size="16px" />}
        _focusVisible="none"
      >
        Agregar nuevo
      </Button>
      <ModalCreateHabitArea
        isOpen={isOpenCreateHabitModal}
        onClose={onCloseCreateHabitModal}
      />

      <Text
        mt={4}
        fontSize="xs"
        fontWeight="semibold"
        textTransform="uppercase"
        opacity={0.4}
        userSelect="none"
      >
        Áreas
      </Text>
      <Box
        maxH="350px"
        overflowX="hidden"
        overflowY="scroll"
        sx={{
          "&::-webkit-scrollbar": {
            width: "4px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: `var(--chakra-colors-${themeOptions.focusColor}-200)`,
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor: `var(--chakra-colors-${themeOptions.focusColor}-400)`,
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "transparent",
            borderRadius: "4px",
          },
        }}
      >
        <Button
          as={Button}
          px={3}
          w="100%"
          display="flex"
          justifyContent="flex-start"
          fontSize="sm"
          onClick={() => navigate("/dashboard/all-areas")}
          variant={isAreasActive ? "solid" : "ghost"}
          colorScheme={isAreasActive ? themeOptions.focusColor : ""}
          leftIcon={<LuIcons.LuClipboardList size="16px" />}
          _focusVisible="none"
        >
          Todas las áreas
        </Button>
        {areas.map((area) => {
          const IconComponent = LuIcons[area.icon] || LuIcons.LuFolder;
          return (
            <>
              <Button
                as={Button}
                px={3}
                w="100%"
                display="flex"
                justifyContent="flex-start"
                fontSize="sm"
                onClick={() => navigate(`/dashboard/areas/${area.id}`)}
                variant={areaId === area.id ? "solid" : "ghost"}
                colorScheme={areaId === area.id ? themeOptions.focusColor : ""}
                leftIcon={<IconComponent size="16px" />}
                _focusVisible="none"
                onContextMenu={(e) => handleContextMenu(e, area)}
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
                    bg="#fff"
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
                      bg={
                        colorMode === "light"
                          ? "var(--menu-bg)"
                          : "rgb(23, 23, 23)"
                      }
                      _hover={{
                        bg:
                          colorMode === "light"
                            ? "rgb(237 242 247)"
                            : "rgba(255, 255, 255, 0.06)",
                      }}
                      onClick={() => handleEdit(area)}
                    >
                      Editar
                    </Button>
                    <Button
                      w="100%"
                      size="sm"
                      fontWeight={500}
                      borderRadius={0}
                      borderBottomRadius={themeOptions.borderRadius}
                      bg={
                        colorMode === "light"
                          ? "var(--menu-bg)"
                          : "rgb(23, 23, 23)"
                      }
                      _hover={{
                        bg:
                          colorMode === "light"
                            ? "rgb(237 242 247)"
                            : "rgba(255, 255, 255, 0.06)",
                      }}
                      onClick={onOpenDeleteDialog}
                    >
                      Eliminar
                    </Button>
                  </HStack>
                )}
            </>
          );
        })}

        {/* Dialogo de confirmación */}
        <AlertDialog isOpen={isOpenDeleteDialog} onClose={onCloseDeleteDialog} isCentered>
          <AlertDialogOverlay>
            <AlertDialogContent borderRadius={themeOptions.borderRadius}
          bg={colorMode === "light" ? "rgb(245, 245, 245)" : "rgb(23, 23, 23)"}>
              <AlertDialogHeader p={4}>
                Eliminar área
              </AlertDialogHeader>

              <AlertDialogBody px={4}>
                ¿Estás seguro de que deseas eliminar el área{" "}
                <b style={{fontWeight: '600'}}>{selectedArea?.name}</b>? Esta acción no se puede deshacer.
                <br />
                <br />
                Perderás todos los hábitos que hay en el área, incluyendo sus procesos.
              </AlertDialogBody>

              <AlertDialogFooter p={4}>
                <Button onClick={onCloseDeleteDialog} mr={3}>No</Button>
                <Button colorScheme="red" onClick={handleDelete}>
                  Sí, eliminar
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
        <Button
          as={Button}
          px={3}
          w="100%"
          display="flex"
          justifyContent="flex-start"
          fontSize="sm"
          onClick={onOpenCreateModal}
          variant={"ghost"}
          colorScheme={""}
          leftIcon={<FiPlus size="16px" />}
          _focusVisible="none"
        >
          Agregar nueva
        </Button>
        <ModalCreateArea
          isOpen={isOpenCreateModal}
          onClose={() => {
            setSelectedArea(null);
            onCloseCreateModal();
          }}
          selectedArea={selectedArea}
        />
      </Box>
      <Text
        mt={4}
        fontSize="xs"
        fontWeight="semibold"
        textTransform="uppercase"
        opacity={0.4}
        userSelect="none"
      >
        Ajustes generales
      </Text>
      {userData && <ModalWithTabs userInfo={userInfo} userData={userData} />}
      <CustomThemePanel />
    </Box>
  );
};

export default LeftColumn;
