import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import { useAuthUser } from "../../../context/AuthUserContext";
import { subscribeToAreas, deleteAreaById } from "../../../hooks/database";
import {
  ColumnHeader,
  ModalArea,
  AreaCard,
  ConfirmationModal,
  NoDataPage,
} from "../../../routes/index";
import {
  Box,
  VStack,
  Spinner,
  Flex,
  SimpleGrid,
  Text,
  useDisclosure,
  useColorMode,
  useToast,
} from "@chakra-ui/react";

const AllAreas = () => {
  const { colorMode } = useColorMode();
  const { themeOptions } = useTheme();
  const { user, loading: authLoading } = useAuthUser();
  const toast = useToast();
  const [areas, setAreas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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

  const unsubscribeRef = React.useRef(null);

  const refreshAreas = useCallback(() => {
    if (!user) {
      setAreas([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    const unsubscribe = subscribeToAreas(
      user.uid,
      (fetchedAreas) => {
        setAreas(fetchedAreas);
        setIsLoading(false);
      },
      (error) => {
        setAreas([]);
        setIsLoading(false);
        toast({
          title: <Text fontWeight={600}>Error al cargar áreas</Text>,
          description: "No se pudieron cargar las áreas. Intenta de nuevo.",
          status: "error",
          position: "bottom",
        });
      }
    );

    unsubscribeRef.current = unsubscribe;
  }, [user, toast]);

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        refreshAreas();
      } else {
        setAreas([]);
        setIsLoading(false);
      }
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [user, authLoading, refreshAreas]);

  const confirmDelete = useCallback(
    (area) => {
      setAreaToDelete(area);
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
    if (!areaToDelete || !user?.uid) return;

    setIsSaving(true);
    try {
      await deleteAreaById(areaToDelete.id, user.uid);
      refreshAreas();

      closeDeleteModal();
      setAreaToDelete(null);

      toast({
        title: <Text fontWeight={600}>Área eliminada</Text>,
        description: `Se eliminó el área "${areaToDelete.name}" correctamente.`,
        status: "success",
        position: "bottom",
      });
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
  }, [areaToDelete, user?.uid, closeDeleteModal, toast, refreshAreas]);

  const handleCloseModalArea = useCallback(
    (shouldRefresh = false) => {
      setSelectedArea(null);
      closeModalArea();
      if (shouldRefresh) {
        refreshAreas();
      }
    },
    [closeModalArea, refreshAreas]
  );

  const orderBy = searchParams.get("order_by") || "asc";
  const viewLayout = searchParams.get("layout") || "grid";
  const sortedAreas = Array.isArray(areas)
    ? [...areas].sort((a, b) => {
        if (orderBy === "asc") return a.name.localeCompare(b.name);
        if (orderBy === "desc") return b.name.localeCompare(a.name);
        return 0;
      })
    : [];

  return (
    <Box
      w="100%"
      minH="100vh"
      maxH="100vh"
      overflowY="scroll"
      bg={colorMode === "light" ? "gray.100" : "gray.900"}
    >
      <ColumnHeader
        page="all-areas"
        title="Todas las áreas"
        onModalCloseAndRefresh={refreshAreas}
      />
      {authLoading ? (
        <Flex
          justifyContent="center"
          alignItems="center"
          minH="97vh"
          direction="column"
          gap={4}
        >
          <Spinner
            size="lg"
            color={themeOptions.focusColor}
            aria-label="Cargando usuario"
          />
          <Text fontSize="lg">Cargando usuario...</Text>
        </Flex>
      ) : !user?.uid ? (
        <NoDataPage
          type="not-authenticated"
          message="Necesitas iniciar sesión para ver tus áreas."
        />
      ) : isLoading ? (
        <Flex
          justifyContent="center"
          alignItems="center"
          minH="97vh"
          direction="column"
          gap={4}
        >
          <Spinner
            size="xl"
            color={themeOptions.focusColor}
            aria-label="Cargando áreas"
          />
          <Text as="h3" fontSize="md">
            Cargando áreas...
          </Text>
        </Flex>
      ) : areas.length > 0 ? (
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
            confirmButtonText={isSaving ? "Eliminando..." : "Sí, eliminar"}
            cancelButtonText="No, cancelar"
            isConfirmButtonLoading={isSaving}
          />
          <ModalArea
            isOpen={isModalAreaOpen}
            onClose={handleCloseModalArea}
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
