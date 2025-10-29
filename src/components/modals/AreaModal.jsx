import { useEffect, useState, useCallback, useRef } from "react";
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
  useToast,
  useColorMode,
  FormLabel,
} from "@chakra-ui/react";
import { useAuthUser } from "../../context/AuthUserContext/AuthUserContext";
import { useTheme } from "../../context/ThemeContext/ThemeContext";
import { createArea, updateArea } from "../../hooks/useDatabase";
import { EmojiSelector } from "../../exports";

const useAreaForm = (selectedArea) => {
  const { user } = useAuthUser();
  const toast = useToast();
  const [areaName, setAreaName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("📁");
  const [nameError, setNameError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const isEditing = !!selectedArea;

  const validateName = useCallback((value) => {
    if (!value.trim()) {
      return "El nombre del área no puede estar vacío.";
    }
    if (value.trim().length < 3) {
      return "El nombre debe tener al menos 3 caracteres.";
    }
    if (value.trim().length > 30) {
      return "El nombre no puede exceder los 30 caracteres.";
    }
    if (!/^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ]+$/.test(value)) {
      return "Solo se permiten letras, números y espacios.";
    }
    return "";
  }, []);

  const handleAreaNameChange = useCallback(
    (e) => {
      const value = e.target.value;
      setAreaName(value);
      setNameError(validateName(value));
    },
    [validateName]
  );

  const handleSave = useCallback(
    async (onClose) => {
      const currentNameError = validateName(areaName);
      if (!user?.uid || currentNameError) {
        setNameError(currentNameError || "Usuario no autenticado.");
        return;
      }

      setIsSaving(true);
      try {
        if (isEditing) {
          await updateArea(user.uid, selectedArea.id, {
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
          await createArea(user.uid, {
            name: areaName,
            icon: selectedIcon,
          });
          toast({
            title: <Text fontWeight={600}>Área creada</Text>,
            description: `Se ha creado el área "${areaName}" correctamente.`,
            status: "success",
            position: "bottom",
          });
        }

        onClose(true);
      } catch (error) {
        toast({
          title: (
            <Text fontWeight={600}>
              Error al {isEditing ? "actualizar" : "crear"}
            </Text>
          ),
          description:
            error.message ||
            `No se pudo ${
              isEditing ? "actualizar" : "agregar"
            } el área. Inténtalo de nuevo.`,
          status: "error",
          position: "bottom",
        });
      } finally {
        setIsSaving(false);
      }
    },
    [user, areaName, selectedIcon, isEditing, selectedArea, validateName, toast]
  );

  useEffect(() => {
    if (selectedArea) {
      setAreaName(selectedArea.name || "");
      setSelectedIcon(selectedArea.icon || "📁");
    } else {
      setAreaName("");
      setSelectedIcon("📁");
    }
    setNameError("");
  }, [selectedArea]);

  return {
    areaName,
    setAreaName,
    selectedIcon,
    setSelectedIcon,
    nameError,
    handleAreaNameChange,
    isSaving,
    handleSave,
    isEditing,
    validateName,
  };
};

const AreaModal = ({ isOpen, onClose, selectedArea }) => {
  const { themeOptions } = useTheme();
  const { colorMode } = useColorMode();
  const initialFocusRef = useRef(null);

  const {
    areaName,
    selectedIcon,
    setSelectedIcon,
    nameError,
    handleAreaNameChange,
    isSaving,
    handleSave,
    isEditing,
  } = useAreaForm(selectedArea);

  return (
    <Modal
      size="xl"
      isOpen={isOpen}
      onClose={() => onClose(false)}
      initialFocusRef={initialFocusRef}
    >
      <ModalOverlay backdropFilter="blur(10px) hue-rotate(90deg)" />
      <ModalContent
        borderRadius={themeOptions.borderRadius}
        color={colorMode === "light" ? "gray.800" : "gray.100"}
      >
        <ModalHeader
          borderBottom="1px solid"
          borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
        >
          {isEditing ? "Editar " : "Crear "} área
        </ModalHeader>
        <ModalCloseButton
          top={4}
          right={4}
          borderRadius={themeOptions.borderRadius}
          _focusVisible={{}}
        />
        <ModalBody
          py={4}
          borderBottom="1px solid"
          borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
        >
          <HStack w="100%" align="start" spacing={4}>
            <FormControl w="90%" isRequired isInvalid={!!nameError}>
              <FormLabel>Nombre del área</FormLabel>
              <Input
                ref={initialFocusRef}
                type="text"
                name="name"
                placeholder="Ej. Trabajo, Salud"
                value={areaName}
                onChange={handleAreaNameChange}
                maxLength={30}
                borderRadius={themeOptions.borderRadius}
                _focusVisible={{}}
              />
              <FormErrorMessage>{nameError}</FormErrorMessage>
            </FormControl>
            <FormControl w="10%">
              <FormLabel userSelect="none" color="transparent">
                .
              </FormLabel>
              <EmojiSelector
                selectedEmoji={selectedIcon}
                onSelect={setSelectedIcon}
                borderRadius={themeOptions.borderRadius}
                themeOptions={themeOptions}
              />
            </FormControl>
          </HStack>
        </ModalBody>
        <ModalFooter p={4}>
          <Button mr={3} onClick={() => onClose(false)} isDisabled={isSaving}>
            Cancelar
          </Button>
          <Button
            colorScheme={themeOptions.focusColor}
            onClick={() => handleSave(onClose)}
            isDisabled={!!nameError || areaName.trim() === "" || isSaving}
            isLoading={isSaving}
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

export default AreaModal;
