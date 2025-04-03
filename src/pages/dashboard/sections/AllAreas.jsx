import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { ColumnHeader, ModalCreateArea } from "../../../routes/index";
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
  useDisclosure,
  Heading,
  useColorMode,
  Tooltip,
  Menu,
  MenuItem,
  MenuList,
  MenuButton,
  IconButton,
  SkeletonCircle,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useToast,
} from "@chakra-ui/react";
import { useTheme } from "../../../context/ThemeContext";
import { FaPlus } from "react-icons/fa6";
import { getAreas } from "../../../hooks/database";
import { useAuth } from "../../../context/AuthContext";
import * as LuIcons from "react-icons/lu";
import { deleteDoc, doc, getDocs, collection } from "firebase/firestore";
import { db } from "../../../hooks/firebase";

const AllAreas = () => {
  const { themeOptions } = useTheme();
  const { colorMode } = useColorMode();
  const [isLoaded, setIsLoaded] = useState(false);
  const [areas, setAreas] = useState([]);
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [areaToDelete, setAreaToDelete] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null);
  const cancelRef = useRef();

  useEffect(() => {
    if (!user) return;

    const unsubscribe = getAreas(async (areasList) => {
      const updatedAreas = await Promise.all(
        areasList.map(async (area) => {
          const date = area.registeredAt ? area.registeredAt.toDate() : null;
          const habitsRef = collection(
            db,
            `users/${user.uid}/areas/${area.id}/habits`
          );
          const habitsSnapshot = await getDocs(habitsRef);
          const habitCount = habitsSnapshot.size;

          return {
            id: area.id,
            name: area.name,
            icon: area.icon || "LuFolder",
            registeredAt: date,
            habitCount,
          };
        })
      );

      setAreas(updatedAreas);
      setIsLoaded(true);
    });

    return () => unsubscribe();
  }, [user]);

  // Get order by URL
  const orderBy = searchParams.get("order_by") || "asc";
  const viewLayout = searchParams.get("layout") || "grid";

  // Get areas list
  const sortedAreas = [...areas].sort((a, b) => {
    if (orderBy === "asc") return a.name.localeCompare(b.name);
    if (orderBy === "desc") return b.name.localeCompare(a.name);
    if (orderBy === "last-creation")
      return (
        (a.registeredAt?.getTime() || 0) - (b.registeredAt?.getTime() || 0)
      );
    if (orderBy === "new-creation")
      return (
        (b.registeredAt?.getTime() || 0) - (a.registeredAt?.getTime() || 0)
      );
    return 0;
  });

  // Open confirmation modal
  const confirmDelete = (area) => {
    setAreaToDelete(area);
    setIsDeleteOpen(true);
  };

  // Function to edit area selected
  const handleEdit = (area) => {
    setSelectedArea(area);
    onOpen();
  };

  // Function to delete area selected
  const handleDelete = async () => {
    if (!areaToDelete) return;

    try {
      await deleteDoc(doc(db, `users/${user.uid}/areas/${areaToDelete.id}`));
      setAreas((prevAreas) =>
        prevAreas.filter((a) => a.id !== areaToDelete.id)
      );
      setIsDeleteOpen(false);
      toast({
        title: <Text fontWeight="600">Área eliminada</Text>,
        description: `Se eliminó el área "${areaToDelete.name}" correctamente.`,
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "bottom-center",
        containerStyle: { borderRadius: themeOptions.borderRadius },
      });
    } catch (error) {
      toast({
        title: <Text fontWeight="600">Error al eliminar</Text>,
        description: "No se pudo eliminar el área. Inténtalo de nuevo.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom-center",
        containerStyle: { borderRadius: themeOptions.borderRadius },
      });
    }
  };

  // Show content based on areas load
  const renderContent = () => {
    if (areas.length > 0) {
      return (
        <>
          <Grid
            templateColumns={{
              base: "repeat(1, 1fr)",
              md: viewLayout === "grid" ? "repeat(3, 1fr)" : "repeat(1, 1fr)",
            }}
            gap={3}
            w="100%"
            minH={viewLayout === "grid" ? "auto" : "calc(100vh - 90px)"}
            maxH={viewLayout === "grid" ? "auto" : "calc(100vh - 90px)"}
            userSelect="none"
            overflowY={viewLayout === "grid" ? "none" : "scroll"}
            sx={{
              "&::-webkit-scrollbar": {
                width: "8px",
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
            {isLoaded ? (
              sortedAreas.map((area) => {
                const IconComponent = LuIcons[area.icon] || LuIcons.LuFolder;
                return (
                  <LinkBox
                    as="article"
                    key={area.id}
                    p={3}
                    display="flex"
                    flexDirection="column"
                    alignItems="flex-start"
                    gap={2}
                    borderWidth="2px"
                    borderRadius={themeOptions.borderRadius}
                    w="100%"
                    maxH="min-content"
                    userSelect="none"
                    cursor="pointer"
                    transition=".1s all linear"
                    bg={
                      colorMode === "light"
                        ? "rgb(255, 255, 255)"
                        : "rgb(0, 0, 0)"
                    }
                    _hover={{
                      bg:
                        colorMode === "light"
                          ? `var(--chakra-colors-${themeOptions.focusColor}-50)`
                          : "var(--chakra-colors-blackAlpha-600)",
                      borderColor: `var(--chakra-colors-${themeOptions.focusColor}-500)`,
                    }}
                  >
                    <Box as="time" fontSize="sm" opacity={0.8}>
                      {area.registeredAt
                        ? `${area.registeredAt.toLocaleDateString("es-ES", {
                            day: "2-digit",
                          })} de ${area.registeredAt
                            .toLocaleDateString("es-ES", { month: "long" })
                            .replace(/^\w/, (c) =>
                              c.toUpperCase()
                            )} de ${area.registeredAt.getFullYear()}`
                        : "Sin fecha de creación"}
                    </Box>
                    <HStack alignItems="center">
                      <IconComponent size="20px" />
                      <Heading
                        fontFamily={themeOptions.fontFamily}
                        fontSize="xl"
                        fontWeight="600"
                      >
                        <LinkOverlay href={`/dashboard/areas/${area.id}`}>
                          {area.name}
                        </LinkOverlay>
                      </Heading>
                    </HStack>
                    <Text fontSize="sm" fontWeight="400" opacity={0.8}>
                      {area.habitCount}{" "}
                      {area.habitCount === 1 ? "hábito" : "hábitos"}
                    </Text>
                    <Tooltip
                      label="Opciones"
                      aria-label="Tooltip"
                      borderRadius={themeOptions.borderRadius}
                      bg={
                        colorMode === "light"
                          ? "rgb(255, 255, 255)"
                          : "rgb(0, 0, 0)"
                      }
                      color={
                        colorMode === "light"
                          ? "rgb(0, 0, 0)"
                          : "rgb(255, 255, 255)"
                      }
                    >
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          aria-label="Options"
                          icon={<LuIcons.LuEllipsisVertical />}
                          position="absolute"
                          right={1}
                          top={1}
                          fontSize="lg"
                          bg="transparent"
                          size="sm"
                          borderRadius={themeOptions.borderRadius}
                        />
                        <MenuList
                          m={0}
                          p={0}
                          minW="auto"
                          borderRadius={themeOptions.borderRadius}
                          bg={
                            colorMode === "light"
                              ? "var(--menu-bg)"
                              : "rgb(23, 23, 23)"
                          }
                        >
                          <MenuItem
                            icon={<LuIcons.LuPenLine size={16} />}
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
                          </MenuItem>
                          <MenuItem
                            icon={<LuIcons.LuTrash size={16} />}
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
                            onClick={() => confirmDelete(area)}
                          >
                            Eliminar
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </Tooltip>
                  </LinkBox>
                );
              })
            ) : (
              <LinkBox
                as="article"
                p={3}
                pb={1}
                borderWidth="2px"
                borderRadius={themeOptions.borderRadius}
                w="100%"
                maxH="min-content"
                userSelect="none"
                bg={
                  colorMode === "light" ? "rgb(255, 255, 255)" : "rgb(0, 0, 0)"
                }
              >
                <Skeleton w="40%" height="10px" />
                <HStack my={2}>
                  <SkeletonCircle size="6" />
                  <Skeleton w="50%" height="20px" />
                </HStack>
              </LinkBox>
            )}
          </Grid>
          <AlertDialog
            isOpen={isDeleteOpen}
            leastDestructiveRef={cancelRef}
            onClose={() => setIsDeleteOpen(false)}
          >
            <AlertDialogOverlay>
              <AlertDialogContent
                borderRadius={themeOptions.borderRadius}
                bg={
                  colorMode === "light"
                    ? "rgb(245, 245, 245)"
                    : "rgb(23, 23, 23)"
                }
              >
                <AlertDialogHeader p={4} fontSize="lg" fontWeight="600">
                  ¿Deseas eliminar el área: {areaToDelete?.name}?
                </AlertDialogHeader>
                <AlertDialogBody px={4}>
                  <Text fontSize="md">
                    Perderás todos los hábitos que contenga dicho área y sus
                    progresos. Esta acción no se puede deshacer.</Text>
                </AlertDialogBody>
                <AlertDialogFooter p={4}>
                  <Button
                    ref={cancelRef}
                    onClick={() => setIsDeleteOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button colorScheme="red" onClick={handleDelete} ml={3}>
                    Eliminar
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialogOverlay>
          </AlertDialog>
          <ModalCreateArea
            isOpen={isOpen}
            onClose={() => {
              setSelectedArea(null);
              onClose();
            }}
            selectedArea={selectedArea}
          />
        </>
      );
    } else {
      return (
        <VStack
          w="100%"
          h={`calc(100vh - 90px)`}
          alignItems="center"
          justifyContent="center"
          userSelect="none"
        >
          <Stack mb={2} borderRadius={themeOptions.borderRadius}>
            <Skeleton
              w="200px"
              h="40px"
              borderRadius={themeOptions.borderRadius}
            />
            <Skeleton
              w="200px"
              h="40px"
              borderRadius={themeOptions.borderRadius}
            />
            <Skeleton
              w="200px"
              h="40px"
              borderRadius={themeOptions.borderRadius}
            />
          </Stack>
          <Text as="h2" fontSize="xl" fontWeight="600">
            Da el paso y construye tu mejor versión
          </Text>
          <Text as="h2" fontSize="sm" maxW="600px" textAlign="center">
            Los hábitos son como los escalones de una escalera: al dar el primer
            paso, el resto se va sumando uno a uno.
          </Text>
          <Button
            ps={3}
            mt={2}
            colorScheme={themeOptions.focusColor}
            variant="ghost"
            leftIcon={<FaPlus size="16px" />}
            iconSpacing={1}
            onClick={onOpen}
          >
            Añadir una área
          </Button>
          <ModalCreateArea isOpen={isOpen} onClose={onClose} />
        </VStack>
      );
    }
  };

  return (
    <Box
      w="100%"
      minH="100vh"
      bg={colorMode === "light" ? "rgb(245, 245, 245)" : "rgb(23, 23, 23)"}
    >
      <ColumnHeader page="all-areas" title="Todas las áreas" />
      <Box p={3}>{renderContent()}</Box>
    </Box>
  );
};

export default AllAreas;
