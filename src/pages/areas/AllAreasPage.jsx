import { useState, useCallback, useMemo, useEffect } from "react";
import { useSearchParams, useOutletContext } from "react-router-dom";
import { useAuthUser } from "../../context/AuthUserContext/AuthUserContext";
import { compareByOrder } from "../../utils/sortingUtils/sortingUtils";
import { deleteArea, getAllHabitsByArea } from "../../hooks/useDatabase";
import {
  ColumnHeader,
  AreaModal,
  AreaCard,
  ConfirmationModal,
  EmptyState,
} from "../../exports";
import {
  Box,
  VStack,
  SimpleGrid,
  Text,
  useDisclosure,
  useColorMode,
  useToast,
} from "@chakra-ui/react";

const AllAreasPage = () => {
  const { colorMode } = useColorMode();
  const { user } = useAuthUser();
  const toast = useToast();
  const [areas, setAreas] = useState([]);
  const { onOpenLeftMenu, onOpenRightMenu, isMobile } = useOutletContext();
  const [, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedArea, setSelectedArea] = useState(null);

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

  const [searchParams] = useSearchParams();
  const orderBy = searchParams.get("order_by") || "name-asc";
  const viewLayout = searchParams.get("layout") || "grid";

  useEffect(() => {
    const fetchAreas = async () => {
      if (!user?.uid) return;
      try {
        const data = await getAllHabitsByArea(user.uid);
        setAreas(data);
      } catch (error) {
        toast({
          title: <Text fontWeight={600}>Error al cargar áreas</Text>,
          description: error.message,
          status: "error",
          position: "bottom",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAreas();
  }, [user?.uid, toast]);

  const areasWithCorrectDates = useMemo(() => {
    if (!Array.isArray(areas)) {
      return [];
    }
    return areas.map((area) => ({
      ...area,
      createdAt: area.createdAt?.toDate
        ? area.createdAt.toDate()
        : area.createdAt,
      updatedAt: area.updatedAt?.toDate
        ? area.updatedAt.toDate()
        : area.updatedAt,
    }));
  }, [areas]);

  const confirmDelete = useCallback(
    (area) => {
      setSelectedArea(area);
      openDeleteModal();
    },
    [openDeleteModal]
  );

  const handleEdit = useCallback(
    (area) => {
      setSelectedArea(area);
      openModalArea();
    },
    [openModalArea]
  );

  const handleDelete = useCallback(async () => {
    if (!selectedArea || !user?.uid) return;

    setIsSaving(true);
    try {
      await deleteArea(selectedArea.id, user.uid);
      closeDeleteModal();
      toast({
        title: <Text fontWeight={600}>Área eliminada</Text>,
        description: `Se eliminó el área "${selectedArea.name}" correctamente.`,
        status: "success",
        position: "bottom",
      });
      setSelectedArea(null);
    } catch (error) {
      toast({
        title: <Text fontWeight={600}>Error al eliminar</Text>,
        description:
          error.message || "No se pudo eliminar el área. Inténtalo de nuevo.",
        status: "error",
        position: "bottom",
      });
    } finally {
      setIsSaving(false);
    }
  }, [selectedArea, user?.uid, closeDeleteModal, toast]);

  const handleCloseDeleteModal = useCallback(() => {
    setSelectedArea(null);
    closeDeleteModal();
  }, [closeDeleteModal]);

  const handleCloseAreaModal = useCallback(
    (shouldRefresh = false) => {
      setSelectedArea(null);
      closeModalArea();
    },
    [closeModalArea]
  );

  const sortedAreas = useMemo(() => {
    if (
      !Array.isArray(areasWithCorrectDates) ||
      areasWithCorrectDates.length === 0
    ) {
      return [];
    }
    return [...areasWithCorrectDates].sort((a, b) =>
      compareByOrder(a, b, orderBy)
    );
  }, [areasWithCorrectDates, orderBy]);

  return (
    <Box
      w="100%"
      minH="100vh"
      maxH="100vh"
      overflowY="scroll"
      bg={colorMode === "light" ? "gray.100" : "gray.900"}
    >
      <ColumnHeader
        page="areas"
        title={isMobile ? "Áreas" : "Todas las áreas"}
        isMobile={isMobile}
        onOpenLeftMenu={onOpenLeftMenu}
        onOpenRightMenu={onOpenRightMenu}
      />
      {areas.length === 0 ? (
        <EmptyState type="areas" />
      ) : (
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
            onClose={handleCloseDeleteModal}
            title={`¿Deseas eliminar el área: ${selectedArea?.name}?`}
            description="Perderás todos los hábitos que contenga dicho área y sus progresos. Esta acción no se puede deshacer."
            onConfirm={handleDelete}
            confirmButtonText={isSaving ? "Eliminando..." : "Sí, eliminar"}
            cancelButtonText="No, cancelar"
            isConfirmButtonLoading={isSaving}
          />
          <AreaModal
            isOpen={isModalAreaOpen}
            onClose={handleCloseAreaModal}
            selectedArea={selectedArea}
          />
        </VStack>
      )}
    </Box>
  );
};

export default AllAreasPage;
