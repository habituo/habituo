import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  getAreasWithHabitCounts,
  deleteAreaById,
} from "../../../hooks/database";
import {
  ColumnHeader,
  ModalArea,
  AreaCard,
  ConfirmationModal,
} from "../../../routes/index";
import {
  Grid,
  VStack,
  Box,
  Text,
  Stack,
  Skeleton,
  Button,
  useDisclosure,
  useColorMode,
  useToast,
} from "@chakra-ui/react";
import { useTheme } from "../../../context/ThemeContext";
import { FaPlus } from "react-icons/fa6";
import { useAuth } from "../../../context/AuthContext";

const AllAreas = () => {
  // Basic experience states
  const { themeOptions } = useTheme();
  const { colorMode } = useColorMode();
  const { user } = useAuth();
  const toast = useToast();

  // Areas and Habits states
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);
  const [areaToDelete, setAreaToDelete] = useState(null);
  const [searchParams] = useSearchParams();
  const {
    isOpen: isDeleteOpen,
    onOpen: openDeleteModal,
    onClose: closeDeleteModal,
  } = useDisclosure();
  const {
    isOpen: isModalAreaOpen,
    onOpen: openModalArea,
    onClose: closeModalArea,
  } = useDisclosure();

  useEffect(() => {
    /**
     * @async
     * @function fetchAreas
     * @desc Fetches areas along with their habit counts and updates the state.
     */
    const fetchAreas = async () => {
      try {
        const areasData = await getAreasWithHabitCounts();
        setAreas(areasData);
      } catch (error) {
        throw new Error("Error fetching areas:", error);
      }
    };

    fetchAreas();

    /** @desc Runs when the `user` dependency changes */
  }, [user]);

  /**
   * @function confirmDelete
   * @desc Opens the confirmation modal and sets the area to be deleted.
   * @param {Object} area - The area selected for deletion.
   */
  const confirmDelete = (area) => {
    setAreaToDelete(area);
    openDeleteModal();
  };

  /**
   * @function handleEdit
   * @desc Sets the selected area for editing and opens the edit modal.
   * @param {Object} area - The area selected for editing.
   */
  const handleEdit = (area) => {
    setSelectedArea(area);
    openModalArea();
  };

  /**
   * @async
   * @function handleDelete
   * @desc Deletes the selected area using its ID and updates the state.
   */
  const handleDelete = async () => {
    if (!areaToDelete) return;

    try {
      await deleteAreaById(areaToDelete.id);
      setAreas((prevAreas) =>
        prevAreas.filter((a) => a.id !== areaToDelete.id)
      );
      closeDeleteModal();

      // Show success toast notification
      toast({
        title: <Text fontWeight="600">Área eliminada</Text>,
        description: `Se eliminó el área "${areaToDelete.name}" correctamente.`,
        status: "success",
        position: "bottom",
        isClosable: true,
      });
    } catch (error) {
      // Show error toast notification in case of failure
      toast({
        title: <Text fontWeight="600">Error al eliminar</Text>,
        description: "No se pudo eliminar el área. Inténtalo de nuevo.",
        status: "error",
        position: "bottom",
        isClosable: true,
      });
    }
  };

  // Get order by URL
  const orderBy = searchParams.get("order_by") || "asc";
  const viewLayout = searchParams.get("layout") || "grid";

  const sortFunctions = {
    asc: (a, b) => a.name.localeCompare(b.name),
    desc: (a, b) => b.name.localeCompare(a.name),
    "last-creation": (a, b) =>
      (a.registeredAt?.getTime() || 0) - (b.registeredAt?.getTime() || 0),
    "new-creation": (a, b) =>
      (b.registeredAt?.getTime() || 0) - (a.registeredAt?.getTime() || 0),
  };

  const compareFunction = sortFunctions[orderBy] || (() => 0);

  // Get areas list
  const sortedAreas = [...areas].sort(compareFunction);

  const layoutConfig = {
    grid: {
      display: "grid",
      templateColumns: { base: "repeat(1, 1fr)", md: "repeat(3, 1fr)" },
      gap: 3,
      minH: "auto",
      maxH: "auto",
      overflowY: "none",
    },
    list: {
      display: "flex",
      flexDirection: "column",
      gap: 3,
      minH: "calc(100vh - 90px)",
      maxH: "calc(100vh - 90px)",
      overflowY: "scroll",
    },
  };

  const currentLayoutConfig = layoutConfig[viewLayout] || layoutConfig.grid;

  // Show content based on areas load
  const renderContent = () => {
    if (areas.length > 0) {
      return (
        <>
          <Grid
            as={currentLayoutConfig.display === "flex" ? "div" : "div"}
            display={currentLayoutConfig.display}
            templateColumns={currentLayoutConfig.templateColumns}
            flexDirection={currentLayoutConfig.flexDirection}
            gap={currentLayoutConfig.gap}
            w="100%"
            minH={currentLayoutConfig.minH}
            maxH={currentLayoutConfig.maxH}
            userSelect="none"
            overflowY={currentLayoutConfig.overflowY}
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
            {sortedAreas.map((area) => (
              <AreaCard
                key={area.id}
                area={area}
                handleEdit={handleEdit}
                confirmDelete={confirmDelete}
              />
            ))}
          </Grid>
          <ConfirmationModal
            isOpen={isDeleteOpen}
            onClose={closeDeleteModal}
            title={`¿Deseas eliminar el área: ${areaToDelete?.name}?`}
            description="Perderás todos los hábitos que contenga dicho área y sus progresos. Esta acción no se puede deshacer."
            onConfirm={handleDelete}
            confirmButtonText="Sí, eliminar"
            cancelButtonText="No, cancelar"
          />
          <ModalArea
            isOpen={isModalAreaOpen}
            onClose={() => {
              setSelectedArea(null);
              closeModalArea();
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
            onClick={openModalArea}
          >
            Añadir una área
          </Button>
          <ModalArea isOpen={isModalAreaOpen} onClose={closeModalArea} />
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
