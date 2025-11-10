import { VStack, Stack, Button, HStack, Text } from "@chakra-ui/react";
import { AreaModal, ConfirmationModal } from "../../../exports";
import { useLocation } from "react-router-dom";
import { useState } from "react";
import PropTypes from "prop-types";

const AreasList = ({
  areas,
  themeOptions,
  colorMode,
  selectedArea,
  setSelectedArea,
  isContextMenuVisible,
  setContextMenuVisible,
  contextMenuRef,
  handleDelete,
  navigate,
  openModal,
  closeModal,
  isOpen,
}) => {
  const location = useLocation();
  const isAllAreasActive = location.pathname === "/dashboard/areas";
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });

  return (
    <VStack
      maxH="350px"
      overflowY="auto"
      overflowX="hidden"
      spacing={1}
      align="stretch"
    >
      <Button
        as={Button}
        p={2}
        w="100%"
        display="flex"
        alignItems="center"
        justifyContent="flex-start"
        fontSize="sm"
        onClick={() => {
          navigate("/dashboard/areas");
          setSelectedArea(null);
        }}
        variant={isAllAreasActive ? "solid" : "unstyled"}
        colorScheme={isAllAreasActive ? themeOptions.focusColor : "blackAlpha"}
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
          {areas.map((area) => {
            const isActive =
              location.pathname === `/dashboard/areas/${area.id}`;
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
                  onClick={() => {
                    navigate(`/dashboard/areas/${area.id}`);
                    setSelectedArea(area.id);
                  }}
                  variant={isActive ? "solid" : "unstyled"}
                  colorScheme={
                    isActive ? themeOptions.focusColor : "blackAlpha"
                  }
                  leftIcon={area.icon || "📁"}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setSelectedArea(area);
                    setContextMenuVisible(true);
                    setContextMenuPosition({ x: e.clientX, y: e.clientY });
                  }}
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
                      top={`${contextMenuPosition.y}px`}
                      left={`${contextMenuPosition.x}px`}
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
                        onClick={() => openModal("area")}
                        _focusVisible={{}}
                      >
                        Editar área
                      </Button>
                      <Button
                        w="100%"
                        size="sm"
                        fontWeight={500}
                        borderRadius={0}
                        borderBottomRadius={themeOptions.borderRadius}
                        onClick={() => openModal("delete")}
                        _focusVisible={{}}
                      >
                        Eliminar área
                      </Button>
                    </HStack>
                  )}
              </div>
            );
          })}
        </Stack>
      )}

      <AreaModal
        isOpen={isOpen("area")}
        onClose={() => closeModal("area")}
        selectedArea={selectedArea}
      />

      <ConfirmationModal
        isOpen={isOpen("delete")}
        onClose={() => closeModal("delete")}
        title={`¿Deseas eliminar el área: ${selectedArea?.icon || "📁"} ${
          selectedArea?.name || ""
        }?`}
        description="Perderás todos los hábitos que contenga dicho área y sus progresos. Esta acción no se puede deshacer."
        onConfirm={() => {
          handleDelete();
          closeModal("delete");
        }}
        confirmButtonText="Sí, eliminar"
        cancelButtonText="No, cancelar"
      />
    </VStack>
  );
};

AreasList.propTypes = {
  areas: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      icon: PropTypes.string,
    })
  ).isRequired,
  themeOptions: PropTypes.object.isRequired,
  colorMode: PropTypes.oneOf(["light", "dark"]).isRequired,
  selectedArea: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.string,
  ]),
  setSelectedArea: PropTypes.func.isRequired,
  isContextMenuVisible: PropTypes.bool.isRequired,
  setContextMenuVisible: PropTypes.func.isRequired,
  contextMenuRef: PropTypes.object.isRequired,
  handleDelete: PropTypes.func.isRequired,
  navigate: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  isOpen: PropTypes.func.isRequired,
};

export default AreasList;
