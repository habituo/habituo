import React, { useEffect, useState, useCallback, useRef } from "react";
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
  InputGroup,
  InputRightElement,
  SimpleGrid,
  Box,
  Popover,
  PopoverTrigger,
  PopoverContent,
  useToast,
  useColorMode,
  Icon,
} from "@chakra-ui/react";
import * as LuIcons from "react-icons/lu";
import { FaSearch, FaTimes } from "react-icons/fa";
import { addArea, updateAreaById } from "../hooks/database";
import { serverTimestamp } from "firebase/firestore";
import { useAuthUser } from "../context/AuthUserContext";
import { useTheme } from "../context/ThemeContext";

const ModalArea = ({ isOpen, onClose, selectedArea }) => {
  const { themeOptions } = useTheme();
  const { colorMode } = useColorMode();
  const { user } = useAuthUser();
  const toast = useToast();
  const [areaName, setAreaName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("LuFolder");
  const [nameError, setNameError] = useState("");
  const [visibleIcons, setVisibleIcons] = useState(30);
  const [searchIcon, setSearchIcon] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const isEditing = !!selectedArea;
  const initialFocusRef = useRef(null);

  const validateName = useCallback((value) => {
    if (!value.trim()) {
      return "El nombre del área no puede estar vacío.";
    }
    if (value.trim().length < 3) {
      return "El nombre debe tener al menos 3 caracteres.";
    }
    if (value.trim().length > 50) {
      return "El nombre no puede exceder los 50 caracteres.";
    }
    if (!/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
      return "Solo se permiten letras, números y espacios.";
    }
    return "";
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (isEditing) {
        setAreaName(selectedArea.name || "");
        setSelectedIcon(selectedArea.icon || "LuFolder");
      } else {
        setAreaName("");
        setSelectedIcon("LuFolder");
      }
      setNameError("");
      setSearchIcon("");
      setVisibleIcons(30);
    }
  }, [isOpen, isEditing, selectedArea]);

  const handleAreaNameChange = useCallback(
    (e) => {
      const value = e.target.value;
      setAreaName(value);
      setNameError(validateName(value));
    },
    [validateName]
  );

  const loadMoreIcons = useCallback(() => {
    setVisibleIcons((prev) => prev + 30);
  }, []);

  const filteredIcons = React.useMemo(() => {
    return Object.keys(LuIcons).filter((iconName) =>
      iconName.toLowerCase().includes(searchIcon.toLowerCase())
    );
  }, [searchIcon]);

  const handleSave = useCallback(async () => {
    const currentNameError = validateName(areaName);
    if (!user?.uid || currentNameError) {
      setNameError(currentNameError || "Usuario no autenticado.");
      return;
    }

    setIsSaving(true);
    try {
      if (isEditing) {
        await updateAreaById(selectedArea.id, user.uid, {
          name: areaName,
          icon: selectedIcon,
        });
        toast({
          title: <Text fontWeight={600}>Área actualizada</Text>,
          description: `El área "${areaName}" se actualizó correctamente.`,
          status: "success",
          position: "bottom",
        });
      } else {
        await addArea(user.uid, {
          name: areaName,
          icon: selectedIcon,
          registeredAt: serverTimestamp(),
          habitCount: 0,
        });
        toast({
          title: <Text fontWeight={600}>Área creada</Text>,
          description: `Se ha creado el área "${areaName}" correctamente.`,
          status: "success",
          position: "bottom",
        });
      }

      setAreaName("");
      setSelectedIcon("LuFolder");
      setNameError("");
      setIsSaving(false);
      onClose(true);
    } catch (error) {
      toast({
        title: (
          <Text fontWeight={600}>
            Error al {isEditing ? "actualizar" : "crear"}
          </Text>
        ),
        description: `No se pudo ${
          isEditing ? "actualizar" : "agregar"
        } el área. Inténtalo de nuevo.`,
        status: "error",
        position: "bottom",
      });
      setIsSaving(false);
    }
  }, [
    user,
    areaName,
    selectedIcon,
    isEditing,
    selectedArea,
    validateName,
    onClose,
    toast,
  ]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => onClose(false)}
      isCentered
      initialFocusRef={initialFocusRef}
    >
      <ModalOverlay />
      <ModalContent
        borderRadius={themeOptions.borderRadius}
        bg={colorMode === "light" ? "gray.100" : "gray.900"}
        color={colorMode === "light" ? "gray.800" : "gray.100"}
      >
        <ModalHeader p={4} pb={2}>
          {isEditing ? "Editar " : "Crear "} área
        </ModalHeader>
        <ModalCloseButton
          top={2}
          right={2}
          borderRadius={themeOptions.borderRadius}
          _focusVisible="none"
        />
        <ModalBody px={4} py={0}>
          <HStack alignItems="flex-start" spacing={3}>
            <FormControl isInvalid={!!nameError}>
              <Input
                ref={initialFocusRef}
                type="text"
                variant="outline"
                size="md"
                h="2.5rem"
                placeholder="Nombre del área (ej. Trabajo, Salud)"
                value={areaName}
                borderRadius={themeOptions.borderRadius}
                _focusVisible="none"
                onChange={handleAreaNameChange}
              />
              <FormErrorMessage>{nameError}</FormErrorMessage>
            </FormControl>
            <Popover placement="bottom-start" closeOnBlur={true}>
              <PopoverTrigger>
                <Button
                  size="md"
                  h="2.75rem"
                  minW="2.75rem"
                  borderRadius={themeOptions.borderRadius}
                  _focusVisible="none"
                  aria-label="Seleccionar icono"
                >
                  {React.createElement(LuIcons[selectedIcon], { size: 20 })}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                p={2}
                borderRadius={themeOptions.borderRadius}
                bg={colorMode === "light" ? "white" : "gray.700"}
                border="1px solid"
                borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                boxShadow="lg"
                zIndex="popover"
              >
                <InputGroup mb={2}>
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
                  <InputRightElement>
                    {searchIcon ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSearchIcon("")}
                        aria-label="Limpiar búsqueda"
                        _focusVisible="none"
                      >
                        <FaTimes />
                      </Button>
                    ) : (
                      <Icon as={FaSearch} color="gray.500" />
                    )}
                  </InputRightElement>
                </InputGroup>
                <SimpleGrid
                  columns={5}
                  spacing={1}
                  mt={0}
                  maxH="250px"
                  overflowY="auto"
                  overflowX="hidden"
                  userSelect="none"
                  sx={{
                    "&::-webkit-scrollbar": {
                      width: "8px",
                      borderRadius: "8px",
                    },
                    "&::-webkit-scrollbar-thumb": {
                      bg: colorMode === "light" ? "gray.300" : "gray.600",
                      borderRadius: "8px",
                    },
                    "&::-webkit-scrollbar-track": { bg: "transparent" },
                  }}
                >
                  {filteredIcons.length > 0 ? (
                    filteredIcons.slice(0, visibleIcons).map((iconName) => {
                      const IconComponent = LuIcons[iconName];
                      if (!IconComponent) return null;

                      return (
                        <Box
                          key={iconName}
                          as={Button}
                          onClick={() => setSelectedIcon(iconName)}
                          p={2}
                          textAlign="center"
                          borderRadius={themeOptions.borderRadius}
                          variant={
                            selectedIcon === iconName ? "solid" : "ghost"
                          }
                          colorScheme={
                            selectedIcon === iconName
                              ? themeOptions.focusColor
                              : "gray"
                          }
                          _hover={{
                            bg:
                              colorMode === "light"
                                ? `${themeOptions.focusColor}.100`
                                : `${themeOptions.focusColor}.700`,
                          }}
                          _focusVisible="none"
                          transition=".1s all linear"
                          aria-label={`Seleccionar icono ${iconName}`}
                        >
                          {React.createElement(IconComponent, { size: 20 })}
                        </Box>
                      );
                    })
                  ) : (
                    <Text p={2} colSpan={5} textAlign="center" color="gray.500">
                      No se encontraron iconos.
                    </Text>
                  )}
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
          <Button mr={3} onClick={() => onClose(false)} isDisabled={isSaving}>
            Cancelar
          </Button>
          <Button
            colorScheme={themeOptions.focusColor}
            onClick={handleSave}
            isDisabled={!!nameError || areaName.trim() === "" || isSaving}
            loadingText={isEditing ? "Actualizando..." : "Creando..."}
            borderRadius={themeOptions.borderRadius}
          >
            {isEditing ? "Actualizar" : "Crear"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ModalArea;
