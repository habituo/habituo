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
  NoDataPage,
} from "../../../routes/index";
import {
  SimpleGrid,
  Box,
  Text,
  useDisclosure,
  useColorMode,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { useAuth } from "../../../context/AuthContext";

const AllAreas = () => {
  // Basic experience states
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

  const orderBy = searchParams.get("order_by") || "asc";
  const viewLayout = searchParams.get("layout") || "grid";

  const sortedAreas = [...areas].sort((a, b) => {
    if (orderBy === "asc") return a.name.localeCompare(b.name);
    if (orderBy === "desc") return b.name.localeCompare(a.name);
    return 0;
  });

  return (
    <Box
      w="100%"
      minH="100vh"
      bg={colorMode === "light" ? "rgb(245, 245, 245)" : "rgb(23, 23, 23)"}
    >
      <ColumnHeader page="all-areas" title="Todas las áreas" />
      {areas.length > 0 ? (
        <VStack p={4} align="stretch">
          <SimpleGrid
            columns={{
              base: 1,
              md: viewLayout === "grid" ? 2 : 1,
              lg: viewLayout === "grid" ? 3 : 1,
            }}
            spacing={4}
          >
            {sortedAreas.map((area) => (
              <AreaCard
                key={area.id}
                area={area}
                handleEdit={handleEdit}
                confirmDelete={confirmDelete}
              />
            ))}
          </SimpleGrid>
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
        </VStack>
      ) : (
        <NoDataPage type="areas" />
      )}
    </Box>
  );
};

export default AllAreas;
