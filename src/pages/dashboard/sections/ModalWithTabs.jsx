import React, { useState, useEffect } from "react";
import { useAuthUser } from "../../../context/AuthUserContext";
import {
  Text,
  Avatar,
  VStack,
  HStack,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  Menu,
  MenuButton,
  MenuList,
  MenuItemOption,
  MenuOptionGroup,
  Button,
  Grid,
  GridItem,
  Box,
  Tooltip,
  useColorMode,
  Input,
  FormLabel,
  Badge,
  useToast,
  Icon,
  FormControl,
  SimpleGrid,
  Switch,
  Link,
  Spinner,
  Center,
  ModalHeader,
  useDisclosure,
} from "@chakra-ui/react";
import * as LuIcons from "react-icons/lu";
import DeleteAccountButton from "./DeleteAccount";
import { updateUserData } from "../../../hooks/database";
import { TbBrandPatreon } from "react-icons/tb";
import { FaGoogle } from "react-icons/fa";
import { useTheme } from "../../../context/ThemeContext";
import { ConfirmationModal } from "../../../routes";

const ModalWithTabs = ({ isOpen, onClose }) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { themeOptions } = useTheme();
  const {
    user,
    loading: authLoading,
    logout,
    sendEmailVerificationLink,
  } = useAuthUser();
  const toast = useToast();
  const [isSending, setIsSending] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedValue, setSelectedValue] = useState("monday");
  const [selectedLang, setSelectedLang] = useState("esp");
  const [name, setName] = useState("");
  const [isNameValid, setIsNameValid] = useState(true);
  const [isNameChanged, setIsNameChanged] = useState(false);
  const [birthDay, setBirthDay] = useState("");
  const [isBirthDayChanged, setIsBirthDayChanged] = useState(false);
  const [currentNameInDB, setCurrentNameInDB] = useState("");
  const [currentBirthDayInDB, setCurrentBirthDayInDB] = useState("");
  const {
    isOpen: isLogoutConfirmationOpen,
    onOpen: onOpenLogoutConfirmation,
    onClose: onCloseLogoutConfirmation,
  } = useDisclosure();

  useEffect(() => {
    if (user && !authLoading) {
      const initialName =
        user?.name || user?.displayName || user?.email?.split("@")[0] || "";
      setName(initialName);
      setCurrentNameInDB(initialName);

      const initialBirthday = user?.birthday_date || "";
      setBirthDay(initialBirthday);
      setCurrentBirthDayInDB(initialBirthday);

      setSelectedValue(user?.preferences?.startOfWeek || "monday");
      setSelectedLang(user?.preferences?.language || "esp");
    }
  }, [user, authLoading]);

  const showToastError = (title, error) => {
    toast({
      title: <Text fontWeight={600}>{title}</Text>,
      description: error.message || "Ha ocurrido un error inesperado.",
      status: "error",
      position: "bottom",
    });
  };

  const handleTabChange = (index) => {
    setActiveTab(index);
  };

  const handleSavePreferences = async (prefKey, value) => {
    if (!user?.uid) {
      showToastError(
        "Error al guardar preferencias",
        new Error("Usuario no autenticado.")
      );
      return;
    }
    try {
      const updatedPreferences = {
        ...user.preferences,
        [prefKey]: value,
      };

      await updateUserData(user.uid, { preferences: updatedPreferences });
      toast({
        title: <Text fontWeight={600}>Preferencias actualizadas</Text>,
        description: `Tu preferencia ha sido guardada.`,
        status: "success",
        position: "bottom",
      });
    } catch (error) {
      showToastError("Error al guardar preferencias", error);
    }
  };

  const handleDayChange = (value) => {
    setSelectedValue(value);
    handleSavePreferences("startOfWeek", value);
  };

  const handleLangChange = (value) => {
    setSelectedLang(value);
    handleSavePreferences("language", value);
  };

  const valueToLabel = {
    monday: "Lunes",
    sunday: "Domingo",
  };

  const langToLabel = {
    esp: "Español",
    eng: "Inglés",
  };

  const handleChangeName = (e) => {
    const newName = e.target.value;
    setName(newName);

    const isValid = /^[a-zA-Z0-9\s]*$/.test(newName);
    setIsNameValid(isValid);
    setIsNameChanged(isValid && newName !== currentNameInDB);
  };

  const handleSaveName = async () => {
    if (!user?.uid) {
      showToastError(
        "Error al actualizar el nombre",
        new Error("Usuario no autenticado.")
      );
      return;
    }
    if (isNameChanged && isNameValid) {
      try {
        await updateUserData(user.uid, { name: name });
        toast({
          title: <Text fontWeight={600}>Nombre actualizado</Text>,
          description: "Tu nombre ha sido guardado.",
          status: "success",
          position: "bottom",
        });
        setCurrentNameInDB(name);
        setIsNameChanged(false);
      } catch (error) {
        showToastError("Error al actualizar el nombre", error);
      }
    } else if (!isNameValid) {
      toast({
        title: <Text fontWeight={600}>Nombre inválido</Text>,
        description: "Solo se permiten letras y números.",
        status: "warning",
        position: "bottom",
      });
    }
  };

  const handleBirthDayChange = (e) => {
    const newBirthDay = e.target.value;
    setBirthDay(newBirthDay);
    setIsBirthDayChanged(newBirthDay !== currentBirthDayInDB);
  };

  const handleSaveBirthDay = async () => {
    if (!user?.uid) {
      showToastError(
        "Error al actualizar la fecha de nacimiento",
        new Error("Usuario no autenticado.")
      );
      return;
    }
    if (isBirthDayChanged) {
      try {
        await updateUserData(user.uid, { birthday_date: birthDay });
        toast({
          title: <Text fontWeight={600}>Fecha de nacimiento actualizada</Text>,
          description: "Tu fecha de nacimiento ha sido guardada.",
          status: "success",
          position: "bottom",
        });
        setCurrentBirthDayInDB(birthDay);
        setIsBirthDayChanged(false);
      } catch (error) {
        showToastError("Error al actualizar la fecha de nacimiento", error);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: <Text fontWeight={600}>Sesión cerrada</Text>,
        description: "Has cerrado sesión correctamente.",
        status: "success",
        position: "bottom",
      });
      onClose();
    } catch (error) {
      toast({
        title: <Text fontWeight={600}>Error al cerrar sesión</Text>,
        description: error.message || "No se pudo cerrar sesión.",
        status: "error",
        position: "bottom",
      });
    }
  };

  const handleConfirmLogout = () => {
    handleLogout();
    onCloseLogoutConfirmation();
  };

  const handleSendVerificationEmail = async () => {
    setIsSending(true);

    const success = await sendEmailVerificationLink();

    if (success) {
      toast({
        title: <Text fontWeight={600}>Correo de verificación enviado</Text>,
        description:
          "Se ha enviado un correo electrónico de verificación a tu dirección. Por favor, revisa tu bandeja de entrada (y spam).",
        status: "success",
        position: "bottom",
      });
    } else {
      toast({
        title: <Text fontWeight={600}>Error al enviar el correo</Text>,
        description:
          "No se pudo enviar el correo de verificación. Por favor, inténtalo de nuevo más tarde.",
        status: "error",
        position: "bottom",
      });
    }
    setIsSending(false);
  };

  const DynamicTabButton = ({
    iconName,
    buttonText,
    onClick,
    isActive,
    themeOptions,
    tabIndex,
  }) => {
    const renderIcon = (iconName) => {
      const IconComponent = LuIcons[iconName];
      if (IconComponent) {
        return <IconComponent size="16px" />;
      }
      return null;
    };

    const textColor = isActive
      ? colorMode === "light"
        ? "#FFFFFF"
        : "#000000"
      : colorMode === "light"
      ? "#000000"
      : "#FFFFFF";
    const bgColor = isActive
      ? colorMode === "light"
        ? "#FFFFFF20"
        : "#00000020"
      : colorMode === "light"
      ? "#00000010"
      : "#FFFFFF10";

    return (
      <Button
        as={Button}
        p={1}
        w="100%"
        display="flex"
        alignItems="center"
        justifyContent="flex-start"
        fontSize="sm"
        fontWeight={400}
        onClick={() => onClick(tabIndex)}
        variant={isActive ? "solid" : "unstyled"}
        colorScheme={isActive ? themeOptions?.focusColor : "blackAlpha"}
        color={textColor}
        _focusVisible="none"
        leftIcon={
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            borderRadius={themeOptions?.borderRadius}
            bg={bgColor}
            color={textColor}
            width="30px"
            height="30px"
          >
            {renderIcon(iconName)}
          </Box>
        }
      >
        {buttonText}
      </Button>
    );
  };

  const DynamicWebButton = ({
    iconName,
    webName,
    webDesc,
    webLink,
    themeOptions,
  }) => {
    const renderIcon = (iconName) => {
      const IconComponent = LuIcons[iconName];
      if (IconComponent) {
        return <IconComponent size={30} />;
      }
      return null;
    };

    return (
      <Link
        p={4}
        position="relative"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap={0}
        border="2px solid var(--chakra-colors-chakra-border-color)"
        borderRadius={themeOptions.borderRadius}
        href={webLink}
        target="_blank"
        bg={colorMode === "light" ? "white" : "black"}
        _hover={{ textDecoration: "none" }}
      >
        <Box
          position="absolute"
          top={-2}
          right={-2}
          w={6}
          h={6}
          bg={colorMode === "light" ? "black" : "white"}
          color={colorMode === "light" ? "white" : "black"}
          borderRadius="50%"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <LuIcons.LuExternalLink size={14} />
        </Box>
        {renderIcon(iconName)}
        <Text fontSize="md" fontWeight="600" textAlign="center">
          {webName}
        </Text>
        <Text
          fontSize="xs"
          fontWeight={400}
          color={colorMode === "light" ? "#00000080" : "#FFFFFF60"}
          textAlign="center"
        >
          {webDesc}
        </Text>
      </Link>
    );
  };

  const currentUserName =
    user?.name || user?.displayName || user?.email?.split("@")[0] || "Usuario";
  const currentUserEmail = user?.email || "N/A";
  const currentUserPhotoURL = user?.photoURL
    ? `//wsrv.nl/?url=${user.photoURL}`
    : undefined;
  const currentAccountType = user?.type_account || "basic";

  let typeAccountColor = "gray";
  if (currentAccountType === "pro") {
    typeAccountColor = "blue";
  } else if (currentAccountType === "insider") {
    typeAccountColor = "yellow";
  }

  const formattedRegistrationDate = user?.createdAt
    ? `${user?.createdAt
        .toDate()
        .toLocaleDateString("es-ES", { day: "2-digit" })} de ${user?.createdAt
        .toDate()
        .toLocaleDateString("es-ES", { month: "long" })
        .replace(/^\w/, (c) => c.toUpperCase())} de ${user?.createdAt
        .toDate()
        .getFullYear()}`
    : "Desconocida";

  if (authLoading || !user) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent
          maxW="500px"
          borderRadius={themeOptions.borderRadius}
          bg={colorMode === "light" ? "white" : "gray.800"}
        >
          <ModalHeader>Cargando perfil...</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Center py={10}>
              <Spinner size="xl" color={themeOptions.focusColor} />
            </Center>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" isCentered>
      <ModalOverlay />
      <ModalContent
        h={630}
        borderRadius={themeOptions.borderRadius}
        bg={colorMode === "light" ? "gray.100" : "gray.900"}
      >
        <ModalCloseButton
          position="absolute"
          right={2}
          top={2}
          borderRadius={themeOptions.borderRadius}
        />
        <ModalBody p={2} fontFamily={themeOptions.fontFamily}>
          <Grid h="100%" templateColumns="1fr 3fr" gap={0}>
            <GridItem
              p={2}
              borderRadius={themeOptions.borderRadius}
              bg={colorMode === "light" ? "white" : "black"}
            >
              <VStack mb={4} align="stretch" spacing={1}>
                <Text
                  fontSize="xs"
                  fontWeight={600}
                  textTransform="uppercase"
                  color={colorMode === "light" ? "gray.400" : "gray.600"}
                >
                  Ajustes de la cuenta
                </Text>
                <VStack align="start" spacing={1}>
                  <DynamicTabButton
                    iconName="LuUserRound"
                    buttonText="Mi perfil"
                    isActive={activeTab === 0}
                    themeOptions={themeOptions}
                    tabIndex={0}
                    onClick={handleTabChange}
                  />
                </VStack>
              </VStack>
              <VStack mb={4} align="stretch" spacing={1}>
                <Text
                  fontSize="xs"
                  fontWeight={600}
                  textTransform="uppercase"
                  color={colorMode === "light" ? "gray.400" : "gray.600"}
                >
                  Configuración
                </Text>
                <VStack align="start" spacing={2}>
                  <DynamicTabButton
                    iconName="LuSettings"
                    buttonText="General"
                    isActive={activeTab === 1}
                    themeOptions={themeOptions}
                    tabIndex={1}
                    onClick={handleTabChange}
                  />
                </VStack>
              </VStack>
              <VStack mb={4} align="stretch" spacing={1}>
                <Text
                  fontSize="xs"
                  fontWeight={600}
                  textTransform="uppercase"
                  color={colorMode === "light" ? "gray.400" : "gray.600"}
                >
                  Soporte
                </Text>
                <VStack align="start" spacing={1}>
                  <DynamicTabButton
                    iconName="LuGlobe"
                    buttonText="Páginas generales"
                    isActive={activeTab === 2}
                    themeOptions={themeOptions}
                    tabIndex={2}
                    onClick={handleTabChange}
                  />
                  {/* <DynamicTabButton
                    iconName="LuHeart"
                    buttonText="Apoyo al proyecto"
                    isActive={activeTab === 3}
                    themeOptions={themeOptions}
                    tabIndex={3}
                    onClick={handleTabChange}
                  />
                  <DynamicTabButton
                    iconName="LuBookText"
                    buttonText="Documentación"
                    isActive={activeTab === 4}
                    themeOptions={themeOptions}
                    tabIndex={4}
                    onClick={handleTabChange}
                  />
                  <DynamicTabButton
                    iconName="LuShieldCheck"
                    buttonText="Política de privacidad"
                    isActive={activeTab === 5}
                    themeOptions={themeOptions}
                    tabIndex={5}
                    onClick={handleTabChange}
                  />
                  <DynamicTabButton
                    iconName="LuNewspaper"
                    buttonText="Términos de uso"
                    isActive={activeTab === 6}
                    themeOptions={themeOptions}
                    tabIndex={6}
                    onClick={handleTabChange}
                  /> */}
                </VStack>
              </VStack>
            </GridItem>
            <GridItem
              px={4}
              py={2}
              borderRadius={themeOptions.borderRadius}
              bg={colorMode === "light" ? "gray.100" : "gray.900"}
            >
              {activeTab === 0 && (
                <VStack h="100%" align="stretch" spacing={4}>
                  <VStack align="stretch" spacing={2}>
                    <Text fontSize="2xl" fontWeight={600}>
                      Mi perfil
                    </Text>
                    <HStack spacing={4}>
                      <Avatar
                        src={currentUserPhotoURL}
                        name={currentUserName}
                        size="xl"
                      >
                        <Badge
                          top={0}
                          right={-2}
                          colorScheme={typeAccountColor}
                          variant="solid"
                          position="absolute"
                          fontWeight={600}
                          borderRadius={themeOptions.borderRadius}
                        >
                          {currentAccountType.charAt(0).toUpperCase() +
                            currentAccountType.slice(1)}
                        </Badge>
                      </Avatar>
                      <VStack align="flex-start" spacing={0}>
                        <FormLabel
                          fontSize="xs"
                          fontWeight={600}
                          textTransform="uppercase"
                          color={
                            colorMode === "light" ? "gray.400" : "gray.600"
                          }
                        >
                          Nombre de usuario
                        </FormLabel>
                        <HStack spacing={1}>
                          <Input
                            type="text"
                            value={name}
                            onChange={handleChangeName}
                            borderRadius={themeOptions.borderRadius}
                            colorScheme={themeOptions.focusColor}
                            _focusVisible="none"
                            isInvalid={!isNameValid}
                            readOnly={!user?.uid}
                          />
                          <IconButton
                            colorScheme={themeOptions.focusColor}
                            onClick={handleSaveName}
                            isDisabled={
                              !isNameChanged || !isNameValid || !user?.uid
                            }
                          >
                            <LuIcons.LuCheck />
                          </IconButton>
                        </HStack>
                      </VStack>
                      <VStack align="flex-start" spacing={0}>
                        <FormLabel
                          fontSize="xs"
                          fontWeight={600}
                          textTransform="uppercase"
                          color={
                            colorMode === "light" ? "gray.400" : "gray.600"
                          }
                        >
                          Fecha de nacimiento
                        </FormLabel>
                        <HStack spacing={1}>
                          <Input
                            type="date"
                            value={birthDay}
                            onChange={handleBirthDayChange}
                            borderRadius={themeOptions.borderRadius}
                            colorScheme={themeOptions.focusColor}
                            _focusVisible="none"
                            readOnly={!user?.uid}
                          />
                          <IconButton
                            colorScheme={themeOptions.focusColor}
                            onClick={handleSaveBirthDay}
                            isDisabled={!isBirthDayChanged || !user?.uid}
                          >
                            <LuIcons.LuCheck />
                          </IconButton>
                        </HStack>
                      </VStack>
                    </HStack>
                  </VStack>
                  <VStack align="stretch" spacing={1}>
                    <FormLabel
                      m={0}
                      fontSize="xs"
                      fontWeight={600}
                      textTransform="uppercase"
                      color={colorMode === "light" ? "gray.400" : "gray.600"}
                    >
                      Datos personales
                    </FormLabel>
                    <VStack align="stretch" spacing={1}>
                      <HStack
                        px={3}
                        py={2}
                        border="2px solid var(--chakra-colors-chakra-border-color)"
                        borderRadius={themeOptions.borderRadius}
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        gap={4}
                        bg={colorMode === "light" ? "white" : "black"}
                      >
                        <Text fontSize="md" fontWeight={600}>
                          Fecha de registro
                        </Text>
                        <Text fontSize="sm" fontWeight={400}>
                          {formattedRegistrationDate}
                        </Text>
                      </HStack>
                    </VStack>
                  </VStack>
                  <VStack align="stretch" spacing={1}>
                    <FormLabel
                      m={0}
                      fontSize="xs"
                      fontWeight={600}
                      textTransform="uppercase"
                      color={colorMode === "light" ? "gray.400" : "gray.600"}
                    >
                      Método de registro
                    </FormLabel>
                    <VStack align="stretch" spacing={0}>
                      <HStack
                        px={3}
                        py={2}
                        border="2px solid var(--chakra-colors-chakra-border-color)"
                        borderRadius={themeOptions.borderRadius}
                        bg={colorMode === "light" ? "white" : "black"}
                      >
                        {user?.providerData?.[0]?.providerId ===
                        "google.com" ? (
                          <>
                            <FaGoogle size="30px" />
                            <Box>
                              <Text fontSize="md" fontWeight={600}>
                                Cuenta de Google
                              </Text>
                              <Text fontSize="sm" fontWeight={400}>
                                {currentUserEmail}
                              </Text>
                            </Box>
                          </>
                        ) : (
                          <>
                            <LuIcons.LuMail size="30px" />
                            <Box flex={1}>
                              <HStack spacing={1} alignItems="center">
                                <Text fontSize="md" fontWeight={600}>
                                  Correo electrónico
                                </Text>
                                {user?.emailVerified && (
                                  <Tooltip
                                    label="Correo verificado"
                                    placement="right"
                                    fontSize="sm"
                                    bg={
                                      colorMode === "light"
                                        ? "#000000"
                                        : "#ffffff"
                                    }
                                    color={
                                      colorMode === "light"
                                        ? "#ffffff"
                                        : "#000000"
                                    }
                                    borderRadius={themeOptions.borderRadius}
                                  >
                                    <Icon
                                      ml={1}
                                      fontSize="1.2em"
                                      as={LuIcons.LuCircleCheck}
                                      color="green.500"
                                    />
                                  </Tooltip>
                                )}
                              </HStack>
                              <Text fontSize="sm" fontWeight={400}>
                                {currentUserEmail}
                              </Text>
                            </Box>
                            {user &&
                              !user.emailVerified &&
                              user.providerData?.[0]?.providerId ===
                                "password" && (
                                <Button
                                  mt={2}
                                  size="sm"
                                  colorScheme={themeOptions.focusColor}
                                  leftIcon={<LuIcons.LuMailOpen />}
                                  onClick={handleSendVerificationEmail}
                                  isLoading={isSending}
                                >
                                  Verificar correo
                                </Button>
                              )}
                          </>
                        )}
                      </HStack>
                    </VStack>
                  </VStack>
                  <VStack align="stretch" spacing={1}>
                    <FormLabel
                      m={0}
                      fontSize="xs"
                      fontWeight={600}
                      textTransform="uppercase"
                      color={colorMode === "light" ? "gray.400" : "gray.600"}
                    >
                      Zona de peligro
                    </FormLabel>
                    <VStack align="stretch" spacing={1}>
                      <HStack
                        px={3}
                        py={2}
                        border="2px solid var(--chakra-colors-chakra-border-color)"
                        borderRadius={themeOptions.borderRadius}
                        display="flex"
                        flexDirection="row"
                        alignItems="center"
                        justifyContent="space-between"
                        gap={4}
                        bg={colorMode === "light" ? "white" : "black"}
                      >
                        <Box maxW="70%">
                          <Text fontSize="md" fontWeight={600}>
                            Cerrar sesión
                          </Text>
                          <Text
                            fontSize="xs"
                            fontWeight={400}
                            color={
                              colorMode === "light" ? "#00000080" : "#FFFFFF60"
                            }
                          >
                            Si deseas cerrar sesión, podrás volver cuando
                            quieras y no perderás el progreso de la cuenta.
                          </Text>
                        </Box>
                        <Button
                          px={4}
                          py={0}
                          colorScheme="red"
                          variant="solid"
                          onClick={onOpenLogoutConfirmation}
                          isDisabled={!user?.uid}
                        >
                          Cerrar sesión
                        </Button>
                      </HStack>
                      <HStack
                        px={3}
                        py={2}
                        border="2px solid var(--chakra-colors-chakra-border-color)"
                        borderRadius={themeOptions.borderRadius}
                        display="flex"
                        flexDirection="row"
                        alignItems="center"
                        justifyContent="space-between"
                        gap={4}
                        bg={colorMode === "light" ? "white" : "black"}
                      >
                        <Box maxW="70%">
                          <Text fontSize="md" fontWeight={600}>
                            Eliminar cuenta
                          </Text>
                          <Text
                            fontSize="xs"
                            fontWeight={400}
                            color={
                              colorMode === "light" ? "#00000080" : "#FFFFFF60"
                            }
                          >
                            Tras eliminar la cuenta se perderá todo el proceso y
                            datos que hay actualmente en ella. No se podrá
                            recuperar la cuenta una vez eliminada.
                          </Text>
                        </Box>
                        <DeleteAccountButton w="1000px" />
                      </HStack>
                    </VStack>
                  </VStack>
                  <ConfirmationModal
                    isOpen={isLogoutConfirmationOpen}
                    onClose={onCloseLogoutConfirmation}
                    title="¿Quieres cerrar la sesión?"
                    description="Siempre que cierras sesión podrás volver cuando quieras y no perderás ningún progreso."
                    onConfirm={handleConfirmLogout}
                    confirmButtonText="Sí, cerrar sesión"
                  />
                </VStack>
              )}
              {activeTab === 1 && (
                <VStack align="stretch" spacing={4}>
                  <Text fontSize="2xl" fontWeight={600}>
                    General
                  </Text>
                  <HStack
                    pb={4}
                    display="flex"
                    justifyContent="space-between"
                    gap={2}
                    borderBottom="2px solid var(--chakra-colors-chakra-border-color)"
                  >
                    <Box maxW="70%">
                      <Text fontSize="md" fontWeight={600}>
                        Modo Día/Noche
                      </Text>
                      <Text
                        fontSize="xs"
                        fontWeight={400}
                        color={
                          colorMode === "light" ? "#00000080" : "#FFFFFF60"
                        }
                      >
                        Cambia el tema de la página al modo oscuro o al modo
                        claro.
                      </Text>
                    </Box>
                    <IconButton
                      fontSize="lg"
                      onChange={toggleColorMode}
                      onClick={toggleColorMode}
                      size="sm"
                      borderRadius={themeOptions.borderRadius}
                      outline="none"
                    >
                      {colorMode === "light" ? (
                        <LuIcons.LuSun />
                      ) : (
                        <LuIcons.LuMoon />
                      )}
                    </IconButton>
                  </HStack>
                  <HStack
                    pb={4}
                    display="flex"
                    justifyContent="space-between"
                    gap={4}
                    borderBottom="2px solid var(--chakra-colors-chakra-border-color)"
                  >
                    <Box>
                      <Text fontSize="md" fontWeight={600}>
                        Primer día de la semana
                      </Text>
                      <Text
                        fontSize="xs"
                        fontWeight={400}
                        color={
                          colorMode === "light" ? "#00000080" : "#FFFFFF60"
                        }
                      >
                        Elige el día en el que comienza la semana.
                      </Text>
                    </Box>
                    <Menu closeOnSelect={true}>
                      <MenuButton
                        as={Button}
                        p={4}
                        textAlign="left"
                        variant="ghost"
                        size="sm"
                        borderWidth={1}
                        borderColor={`var(--chakra-colors-chakra-border-color)`}
                        _focusVisible="none"
                        _hover={{
                          bg: "none",
                          borderColor:
                            colorMode === "light"
                              ? "#CBD5E0"
                              : "rgba(255, 255, 255, 0.24)",
                        }}
                      >
                        {valueToLabel[selectedValue] || "Seleccionar día"}
                      </MenuButton>
                      <MenuList
                        borderRadius={themeOptions.borderRadius}
                        bg={
                          colorMode === "light" ? "var(--menu-bg)" : "gray.900"
                        }
                      >
                        <MenuOptionGroup
                          type="radio"
                          value={selectedValue}
                          onChange={handleDayChange}
                        >
                          <MenuItemOption
                            bg={
                              colorMode === "light"
                                ? "var(--menu-bg)"
                                : "gray.900"
                            }
                            _hover={{
                              bg:
                                colorMode === "light"
                                  ? "rgb(237 242 247)"
                                  : "rgba(255, 255, 255, 0.06)",
                            }}
                            value="monday"
                          >
                            Lunes
                          </MenuItemOption>
                          <MenuItemOption
                            bg={
                              colorMode === "light"
                                ? "var(--menu-bg)"
                                : "gray.900"
                            }
                            _hover={{
                              bg:
                                colorMode === "light"
                                  ? "rgb(237 242 247)"
                                  : "rgba(255, 255, 255, 0.06)",
                            }}
                            value="sunday"
                            disabled
                          >
                            Domingo
                          </MenuItemOption>
                        </MenuOptionGroup>
                      </MenuList>
                    </Menu>
                  </HStack>
                  <HStack
                    pb={4}
                    display="flex"
                    justifyContent="space-between"
                    gap={4}
                    borderBottom="2px solid var(--chakra-colors-chakra-border-color)"
                  >
                    <Box maxW="70%">
                      <Text fontSize="md" fontWeight="600">
                        Idioma global
                      </Text>
                      <Text
                        fontSize="xs"
                        fontWeight={400}
                        color={
                          colorMode === "light" ? "#00000080" : "#FFFFFF60"
                        }
                      >
                        Selecciona el idioma que más se adapte a ti.
                      </Text>
                    </Box>
                    <Menu closeOnSelect={true}>
                      <MenuButton
                        as={Button}
                        p={4}
                        textAlign="left"
                        variant="ghost"
                        size="sm"
                        borderWidth={1}
                        borderColor={`var(--chakra-colors-chakra-border-color)`}
                        _focusVisible="none"
                        _hover={{
                          bg: "none",
                          borderColor:
                            colorMode === "light"
                              ? "#CBD5E0"
                              : "rgba(255, 255, 255, 0.24)",
                        }}
                      >
                        {langToLabel[selectedLang] || "Seleccionar idioma"}
                      </MenuButton>
                      <MenuList
                        borderRadius={themeOptions.borderRadius}
                        bg={
                          colorMode === "light" ? "var(--menu-bg)" : "gray.900"
                        }
                      >
                        <MenuOptionGroup
                          type="radio"
                          value={selectedLang}
                          onChange={handleLangChange}
                        >
                          <MenuItemOption
                            bg={
                              colorMode === "light"
                                ? "var(--menu-bg)"
                                : "gray.900"
                            }
                            _hover={{
                              bg:
                                colorMode === "light"
                                  ? "rgb(237 242 247)"
                                  : "rgba(255, 255, 255, 0.06)",
                            }}
                            value="esp"
                          >
                            Español
                          </MenuItemOption>
                          <MenuItemOption
                            bg={
                              colorMode === "light"
                                ? "var(--menu-bg)"
                                : "gray.900"
                            }
                            _hover={{
                              bg:
                                colorMode === "light"
                                  ? "rgb(237 242 247)"
                                  : "rgba(255, 255, 255, 0.06)",
                            }}
                            value="eng"
                          >
                            Inglés
                          </MenuItemOption>
                        </MenuOptionGroup>
                      </MenuList>
                    </Menu>
                  </HStack>
                  <HStack
                    display="flex"
                    flexDirection="column"
                    alignItems="flex-start"
                    justifyContent="flex-start"
                    gap={4}
                  >
                    <Box>
                      <Text fontSize="md" fontWeight={600}>
                        Notificaciones
                      </Text>
                      <Text
                        fontSize="xs"
                        fontWeight={400}
                        color={
                          colorMode === "light" ? "#00000080" : "#FFFFFF60"
                        }
                      >
                        Modifica las notificaciones para no perderte ninguna
                        novedad.
                      </Text>
                    </Box>
                    <VStack spacing={2}>
                      <Box
                        w="100%"
                        display="flex"
                        alignItems="flex-start"
                        justifyContent="flex-start"
                        gap={0}
                      >
                        <Text w="50%" fontWeight={500} fontSize="15px">
                          Marketing
                        </Text>
                        <Text w="50%" fontWeight={500} fontSize="15px">
                          Sistema
                        </Text>
                      </Box>
                      <Box
                        w="100%"
                        display="flex"
                        alignItems="flex-start"
                        justifyContent="flex-start"
                        gap={0}
                      >
                        <FormControl
                          as={SimpleGrid}
                          columns={2}
                          w="50%"
                          justifyContent="flex-start"
                        >
                          <FormLabel
                            htmlFor="notificationsMarketingEmail"
                            fontWeight={400}
                            fontSize="14px"
                          >
                            Correo electrónico
                          </FormLabel>
                          <Switch
                            id="notificationsMarketingEmail"
                            defaultChecked
                          />
                          <FormLabel
                            htmlFor="notificationsMarketingBrowser"
                            fontWeight={400}
                            fontSize="14px"
                          >
                            Navegador web
                          </FormLabel>
                          <Switch id="notificationsMarketingBrowser" />
                        </FormControl>
                        <FormControl
                          as={SimpleGrid}
                          columns={2}
                          w="50%"
                          justifyContent="flex-start"
                        >
                          <FormLabel
                            htmlFor="notificationsSystemEmail"
                            fontWeight={400}
                            fontSize="14px"
                          >
                            Correo electrónico
                          </FormLabel>
                          <Switch id="notificationsSystemEmail" />
                          <FormLabel
                            htmlFor="notificationsSystemBrowser"
                            fontWeight={400}
                            fontSize="14px"
                          >
                            Navegador web
                          </FormLabel>
                          <Switch
                            id="notificationsSystemBrowser"
                            defaultChecked
                          />
                        </FormControl>
                      </Box>
                    </VStack>
                  </HStack>
                </VStack>
              )}
              {activeTab === 2 && (
                <VStack align="stretch" spacing={4}>
                  <Text fontSize="2xl" fontWeight={600}>
                    Páginas generales
                  </Text>
                  <SimpleGrid columns={{ base: 2, lg: 3 }} gap={4} py={2}>
                    <DynamicWebButton
                      iconName="LuGlobe"
                      webName="Habituo"
                      webDesc="Página principal de habituo"
                      webLink="https://habituo.es"
                      themeOptions={themeOptions}
                    />
                    <Link
                      p={4}
                      position="relative"
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      justifyContent="center"
                      gap={0}
                      border="2px solid var(--chakra-colors-chakra-border-color)"
                      borderRadius={themeOptions.borderRadius}
                      href="http://patreon.com/habituo"
                      target="_blank"
                      bg={colorMode === "light" ? "white" : "black"}
                      _hover={{ textDecoration: "none" }}
                    >
                      <Box
                        position="absolute"
                        top={-2}
                        right={-2}
                        w={6}
                        h={6}
                        bg={colorMode === "light" ? "black" : "white"}
                        color={colorMode === "light" ? "white" : "black"}
                        borderRadius="50%"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <LuIcons.LuExternalLink size={14} />
                      </Box>
                      <TbBrandPatreon size={30} />
                      <Text fontSize="md" fontWeight="600" textAlign="center">
                        Patreon
                      </Text>
                      <Text
                        fontSize="xs"
                        fontWeight={400}
                        color={
                          colorMode === "light" ? "#00000080" : "#FFFFFF60"
                        }
                        textAlign="center"
                      >
                        Página para apoyar al proyecto
                      </Text>
                    </Link>
                    <DynamicWebButton
                      iconName="LuSun"
                      webName="Documentación"
                      webDesc="Documentación general del proyecto"
                      webLink="https://habituo.es/docs"
                      themeOptions={themeOptions}
                    />
                  </SimpleGrid>
                </VStack>
              )}
            </GridItem>
          </Grid>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ModalWithTabs;
