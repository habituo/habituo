import React, { useEffect, useState } from "react";
import {
  Text,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  FormControl,
  FormErrorMessage,
  Input,
  SimpleGrid,
  Box,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  useToast,
  useColorMode,
} from "@chakra-ui/react";
import * as LuIcons from "react-icons/lu";
import { addArea, updateAreaById } from "../hooks/database";
import { serverTimestamp } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const ModalArea = ({ isOpen, onClose, selectedArea }) => {
  // Basic experience states
  const { themeOptions } = useTheme();
  const { colorMode } = useColorMode();
  const { user } = useAuth();
  const toast = useToast();

  const [areaName, setAreaName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("LuFolder");
  const [error, setError] = useState("");
  const [visibleIcons, setVisibleIcons] = useState(30);
  const [searchIcon, setSearchIcon] = useState("");
  const isEditing = !!selectedArea;

  // Validate the name on real time
  const validateName = (value) => {
    if (!value.trim()) {
      setError("El nombre del área no puede estar vacío.");
      return false;
    }
    if (!/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ ]+$/.test(value)) {
      setError("Solo se permiten letras, números y espacios.");
      return false;
    }
    setError("");
    return true;
  };

  // Lazy load icons
  const loadMoreIcons = () => {
    setVisibleIcons((prev) => prev + 30);
  };

  const filteredIcons = Object.keys(LuIcons).filter((iconName) =>
    iconName.toLowerCase().includes(searchIcon.toLowerCase())
  );

  const handleSave = async () => {
    if (!validateName(areaName) || !user) return;

    try {
      if (isEditing) {
        await updateAreaById(selectedArea.id, {
          name: areaName,
          icon: selectedIcon,
        });
        toast({
          title: <Text fontWeight="600">Área actualizada</Text>,
          description: `El área "${areaName}" se actualizó correctamente.`,
          status: "success",
          position: "bottom",
          isClosable: true,
        });
      } else {
        await addArea({
          name: areaName,
          icon: selectedIcon,
          registeredAt: serverTimestamp(),
        });
        toast({
          title: <Text fontWeight="600">Área creada</Text>,
          description: `Se ha creado el área "${areaName}" correctamente.`,
          status: "success",
          position: "bottom",
          isClosable: true,
        });
      }

      setAreaName("");
      setSelectedIcon("LuFolder");
      onClose();
    } catch (error) {
      toast({
        title: (
          <Text fontWeight="600">
            Error al {isEditing ? "actualizar" : "crear"}
          </Text>
        ),
        description: `No se pudo ${
          isEditing ? "actualizar" : "agregar"
        } el área. Inténtalo de nuevo.`,
        status: "error",
        isClosable: true,
        position: "bottom",
      });
    }
  };

  useEffect(() => {
    if (selectedArea) {
      setAreaName(selectedArea.name);
      setSelectedIcon(selectedArea.icon || "LuFolder");
    } else {
      setAreaName("");
      setSelectedIcon("LuFolder");
    }
  }, [selectedArea]);

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent
          borderRadius={themeOptions.borderRadius}
          bg={colorMode === "light" ? "rgb(245, 245, 245)" : "rgb(23, 23, 23)"}
        >
          <ModalHeader p={4}>
            {isEditing ? "Editar " : "Crear "} área
          </ModalHeader>
          <ModalCloseButton
            top={2}
            right={2}
            borderRadius={themeOptions.borderRadius}
          />
          <ModalBody px={4}>
            <HStack alignItems="flex-start">
              <FormControl isInvalid={error}>
                <Input
                  type="text"
                  variant="outline"
                  size="sm"
                  h="2.5rem"
                  placeholder="Nombre del área"
                  value={areaName}
                  borderRadius={themeOptions.borderRadius}
                  _focusVisible={{
                    borderColor: `var(--chakra-colors-${themeOptions.focusColor}-500)`,
                  }}
                  onChange={(e) => {
                    setAreaName(e.target.value);
                    validateName(e.target.value);
                  }}
                />
                <FormErrorMessage>{error}</FormErrorMessage>
              </FormControl>
              <Popover id="habit-icon" placement="bottom-start">
                <PopoverTrigger>
                  <Button>{React.createElement(LuIcons[selectedIcon])}</Button>
                </PopoverTrigger>
                <PopoverContent
                  p={2}
                  borderRadius={themeOptions.borderRadius}
                  bg={
                    colorMode === "light"
                      ? "rgb(245, 245, 245)"
                      : "rgb(23, 23, 23)"
                  }
                >
                  <Input
                    placeholder="Buscar icono..."
                    value={searchIcon}
                    size="sm"
                    h="2.5rem"
                    borderRadius={themeOptions.borderRadius}
                    _focusVisible="none"
                    onChange={(e) => {
                      setSearchIcon(e.target.value);
                      setVisibleIcons(30);
                    }}
                  />
                  <SimpleGrid
                    columns={5}
                    spacing={1}
                    mt={2}
                    maxH="200px"
                    overflowY="auto"
                    overflowX="hidden"
                    userSelect="none"
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
                    {filteredIcons.slice(0, visibleIcons).map((iconName) => (
                      <Box
                        key={iconName}
                        as={Button}
                        onClick={() => setSelectedIcon(iconName)}
                        p={2}
                        textAlign="center"
                        borderRadius={themeOptions.borderRadius}
                        _hover={{
                          bg:
                            colorMode === "light"
                              ? `${themeOptions.focusColor}.100`
                              : `${themeOptions.focusColor}.700`,
                        }}
                        transition=".1s all linear"
                      >
                        {React.createElement(LuIcons[iconName], { size: 20 })}
                      </Box>
                    ))}
                  </SimpleGrid>
                  {filteredIcons.length > visibleIcons && (
                    <Button size="sm" mt={2} onClick={loadMoreIcons}>
                      Cargar más
                    </Button>
                  )}
                </PopoverContent>
              </Popover>
            </HStack>
          </ModalBody>
          <ModalFooter p={4}>
            <Button onClick={onClose} mr={3}>
              Cancelar
            </Button>
            <Button
              colorScheme={themeOptions.focusColor}
              onClick={handleSave}
              isDisabled={error !== "" || areaName.trim() === ""}
            >
              {isEditing ? "Actualizar" : "Crear"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ModalArea;
