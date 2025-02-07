import React, { useState } from "react";
import {
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  Input,
  SimpleGrid,
  Box,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  FormLabel,
} from "@chakra-ui/react";
import * as LuIcons from "react-icons/lu";
import { db } from "../../../hooks/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../../../context/AuthContext";
import { useTheme } from "../../../context/ThemeContext";

const ModalCreateArea = ({ isOpen, onClose }) => {
  const [areaName, setAreaName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("LuFolder");
  const { user } = useAuth();
  const { themeOptions } = useTheme();

  const handleSave = async () => {
    if (areaName.trim() === "" || !user) return;

    try {
      // Referencia a la colección de áreas del usuario
      const areasRef = collection(db, `users/${user.uid}/areas`);

      // Guardar área en Firestore
      await addDoc(areasRef, {
        name: areaName,
        icon: selectedIcon,
        registeredAt: serverTimestamp(),
      });

      setAreaName("");
      setSelectedIcon("LuFolder");
      onClose();
    } catch (error) {
      console.error("Error al guardar el área:", error);
    }
  };

  return (
    <>
      {/* Modal que se activa desde cualquier botón */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent borderRadius={themeOptions.borderRadius}>
          <ModalHeader>Crear nueva área</ModalHeader>
          <ModalCloseButton borderRadius={themeOptions.borderRadius} />
          <ModalBody>
            <HStack alignItems="center">
                <Input
                  type="text"
                  variant="outline"
                  size="sm"
                  h="2.5rem"
                  placeholder="Nombre del área"
                  value={areaName}
                  borderRadius={themeOptions.borderRadius}
                  _focus={{ borderColor: themeOptions.focusColor }}
                  _focusVisible={{ borderColor: themeOptions.focusColor }}
                  onChange={(e) => setAreaName(e.target.value)}
                />
              <Popover>
                <PopoverTrigger>
                  <Button>
                    {React.createElement(LuIcons[selectedIcon])}
                  </Button>
                </PopoverTrigger>
                <PopoverContent w="fit-content">
                  <PopoverArrow />
                  <PopoverBody
                    maxH="300px"
                    overflowY="scroll"
                    overflowX="hidden"
                    borderRadius={themeOptions.borderRadius}
                  >
                    <SimpleGrid columns={6} spacing={1}>
                      {Object.keys(LuIcons).map((iconName) => {
                        const IconComponent = LuIcons[iconName];
                        return (
                          <Box
                            key={iconName}
                            as="button"
                            p={2}
                            borderRadius={themeOptions.borderRadius}
                            border="1px solid"
                            borderColor={
                              selectedIcon === iconName
                                ? themeOptions.focusColor
                                : "gray.200"
                            }
                            onClick={() => {
                              setSelectedIcon(iconName);
                            }}
                            _hover={{ borderColor: themeOptions.focusColor }}
                          >
                            <IconComponent size="20px" />
                          </Box>
                        );
                      })}
                    </SimpleGrid>
                  </PopoverBody>
                </PopoverContent>
              </Popover>
            </HStack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose} mr={3}>
              Cancelar
            </Button>
            <Button colorScheme={themeOptions.focusColor} onClick={handleSave}>
              Guardar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ModalCreateArea;
