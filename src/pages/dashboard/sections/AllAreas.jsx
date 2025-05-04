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
import { useAuth } from "../../../context/AuthContext";
import { useTheme } from "../../../context/ThemeContext";

const AllAreas = () => {
  const { colorMode } = useColorMode();
  const { themeOptions } = useTheme();
  const { user } = useAuth();
  const toast = useToast();
  const [areas, setAreas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
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
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchAreas = async () => {
      setIsLoading(true);
      try {
        const areasData = await getAreasWithHabitCounts();
        setAreas(areasData);
      } catch (error) {
        console.error("Error fetching areas with habit counts:", error);
        setAreas([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAreas();
  }, [user]);

  const confirmDelete = (area) => {
    setAreaToDelete(area);
    openDeleteModal();
  };

  const handleEdit = (area) => {
    setSelectedArea(area);
    openModalArea();
  };

  const handleDelete = async () => {
    if (!areaToDelete) return;

    try {
      await deleteAreaById(areaToDelete.id);
      setAreas((prevAreas) =>
        prevAreas.filter((a) => a.id !== areaToDelete.id)
      );
      closeDeleteModal();

      toast({
        title: <Text fontWeight="600">Área eliminada</Text>,
        description: `Se eliminó el área "${areaToDelete.name}" correctamente.`,
        status: "success",
        position: "bottom",
      });
    } catch (error) {
      toast({
        title: <Text fontWeight="600">Error al eliminar</Text>,
        description: "No se pudo eliminar el área. Inténtalo de nuevo.",
        status: "error",
        position: "bottom",
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
      maxH="100vh"
      overflowY="scroll"
      sx={{
        "&::-webkit-scrollbar": {
          width: "6px",
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
      bg={colorMode === "light" ? "rgb(245, 245, 245)" : "rgb(23, 23, 23)"}
    >
      <ColumnHeader page="all-areas" title="Todas las áreas" />
      {isLoading ? (
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
          <Text
            as="h3"
            fontSize="md"
          >
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
