import { useState, useEffect, useCallback } from "react";
import { useAuthUser } from "../../context/AuthUserContext/AuthUserContext";
import {
  Text,
  Avatar,
  VStack,
  HStack,
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
  Box,
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
  InputGroup,
} from "@chakra-ui/react";
import * as LuIcons from "react-icons/lu";
import DeleteAccountButton from "./DeleteAccountModal";
import { updateUserData } from "../../hooks/useDatabase";
import { TbBrandPatreon } from "react-icons/tb";
import { FaGoogle } from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext/ThemeContext";
import { ConfirmationModal } from "../../exports";
import { isAfter } from "date-fns";

const TabButton = ({
  icon,
  text,
  onClick,
  isActive,
  themeOptions,
  colorMode,
}) => {
  return (
    <Button
      as={Button}
      px={2}
      w="100%"
      display="flex"
      alignItems="center"
      justifyContent="flex-start"
      fontSize="sm"
      onClick={onClick}
      variant={isActive ? "solid" : "unstyled"}
      colorScheme={isActive ? themeOptions.focusColor : "blackAlpha"}
      leftIcon={icon}
      _focusVisible={{}}
    >
      {text}
    </Button>
  );
};

const UserSettingsModal = ({ isOpen, onClose }) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { themeOptions } = useTheme();
  const {
    user,
    loading: authLoading,
    logout,
    sendEmailVerificationLink,
    refreshUser,
  } = useAuthUser();
  const toast = useToast();
  const [isSending, setIsSending] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [isSaving, setIsSaving] = useState(false);

  const [userData, setUserData] = useState({
    name: "",
    birthDay: "",
    startOfWeek: "monday",
    language: "esp",
  });

  const [originalUserData, setOriginalUserData] = useState({});

  const {
    isOpen: isLogoutConfirmationOpen,
    onOpen: onOpenLogoutConfirmation,
    onClose: onCloseLogoutConfirmation,
  } = useDisclosure();

  useEffect(() => {
    if (user && !authLoading) {
      const initialData = {
        name:
          user?.name || user?.displayName || user?.email?.split("@")[0] || "",
        birthDay: user?.birthday_date || "",
        startOfWeek: user?.preferences?.startOfWeek || "monday",
        language: user?.preferences?.language || "esp",
      };
      setUserData(initialData);
      setOriginalUserData(initialData);
    }
  }, [user, authLoading, refreshUser]);

  const showToast = useCallback(
    (title, description, status) => {
      toast({
        title: <Text fontWeight={600}>{title}</Text>,
        description: description,
        status: status,
        position: "bottom",
        isClosable: true,
      });
    },
    [toast]
  );

  const handleSaveUserData = useCallback(
    async (field, value) => {
      if (!user?.uid) {
        showToast("Error", "Usuario no autenticado.", "error");
        return;
      }
      setIsSaving(true);
      try {
        const dataToUpdate = {};
        if (field === "name") {
          dataToUpdate.name = value;
        } else if (field === "birthDay") {
          dataToUpdate.birthday_date = value;
        } else {
          dataToUpdate.preferences = {
            ...(user.preferences || {}),
            [field]: value,
          };
        }

        await updateUserData(user.uid, dataToUpdate);
        setOriginalUserData((prev) => ({ ...prev, [field]: value }));
        await refreshUser();
        showToast("¡Guardado!", `Tus cambios han sido guardados.`, "success");
      } catch (error) {
        showToast(
          "Error",
          "No se pudo guardar la información. Inténtalo de nuevo.",
          "error"
        );
      } finally {
        setIsSaving(false);
      }
    },
    [user, refreshUser, showToast]
  );

  const handleLogout = async () => {
    try {
      await logout();
      showToast(
        "Sesión cerrada",
        "Has cerrado sesión correctamente.",
        "success"
      );
      onClose();
    } catch (error) {
      showToast("Error al cerrar sesión", "No se pudo cerrar sesión.", "error");
    }
  };

  const handleSendVerificationEmail = async () => {
    setIsSending(true);
    const success = await sendEmailVerificationLink();
    if (success) {
      showToast(
        "Correo de verificación enviado",
        "Se ha enviado un correo electrónico de verificación. Por favor, revisa tu bandeja de entrada (y spam).",
        "success"
      );
    } else {
      showToast(
        "Error al enviar el correo",
        "No se pudo enviar el correo de verificación. Inténtalo de nuevo más tarde.",
        "error"
      );
    }
    setIsSending(false);
  };

  const isNameValid = userData.name.trim().length > 0;

  const isBirthDayChanged = userData.birthDay !== originalUserData.birthDay;
  const isBirthDayValid =
    userData.birthDay === "" ||
    !isAfter(new Date(userData.birthDay), new Date());

  const currentUserName =
    user?.name || user?.displayName || user?.email?.split("@")[0] || "Usuario";
  const currentUserEmail = user?.email || "N/A";
  const currentUserPhotoURL = user?.photoURL
    ? `//wsrv.nl/?url=${user.photoURL}`
    : undefined;
  const currentAccountType = user?.type_account || "basic";

  const typeAccountColor =
    currentAccountType === "pro"
      ? "blue"
      : currentAccountType === "insider"
      ? "yellow"
      : "gray";

  const formattedRegistrationDate = user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "2-digit",
      })
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

  const isEmailVerified = user.emailVerified;
  const isGoogleProvider = user.providerData.some(
    (p) => p.providerId === "google.com"
  );

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size={{ base: "full", md: "xxl" }}
      >
        <ModalOverlay backdropFilter="blur(10px) hue-rotate(90deg)" />
        <ModalContent
          maxW="900px"
          borderRadius={themeOptions.borderRadius}
          bg={colorMode === "light" ? "gray.50" : "gray.900"}
        >
          <ModalCloseButton
            position="absolute"
            borderRadius={themeOptions.borderRadius}
          />
          <ModalHeader px={4} pt={3} pb={0}>
            Ajustes de usuario
          </ModalHeader>
          <ModalBody p={2} fontFamily={themeOptions.fontFamily}>
            <Grid templateColumns={{ base: "1fr", md: "250px 1fr" }} gap={2}>
              <Grid
                templateRows="auto 1fr auto"
                gap={4}
                p={4}
                borderRadius={themeOptions.borderRadius}
                bg={colorMode === "light" ? "white" : "black"}
              >
                <VStack spacing={2} align="center">
                  <Avatar
                    size="lg"
                    name={currentUserName}
                    src={currentUserPhotoURL}
                    border={`2px solid var(--chakra-colors-chakra-border-color)`}
                  />
                  <Text fontSize="lg" fontWeight={600} textAlign="center">
                    {currentUserName}
                  </Text>
                  <Badge
                    colorScheme={typeAccountColor}
                    textTransform="capitalize"
                    px={2}
                    py={1}
                    borderRadius="full"
                  >
                    {currentAccountType}
                  </Badge>
                </VStack>
                <VStack spacing={2} align="stretch">
                  <TabButton
                    icon="👤"
                    text="Perfil"
                    onClick={() => setActiveTab("profile")}
                    isActive={activeTab === "profile"}
                    themeOptions={themeOptions}
                    colorMode={colorMode}
                  />
                  <TabButton
                    icon="⭐"
                    text="Preferencias"
                    onClick={() => setActiveTab("preferences")}
                    isActive={activeTab === "preferences"}
                    themeOptions={themeOptions}
                    colorMode={colorMode}
                  />
                  <TabButton
                    icon="🔐"
                    text="Acceso"
                    onClick={() => setActiveTab("access")}
                    isActive={activeTab === "access"}
                    themeOptions={themeOptions}
                    colorMode={colorMode}
                  />
                  <TabButton
                    icon="🔗"
                    text="Enlaces"
                    onClick={() => setActiveTab("links")}
                    isActive={activeTab === "links"}
                    themeOptions={themeOptions}
                    colorMode={colorMode}
                  />
                </VStack>
                <VStack spacing={2} align="stretch">
                  <Button
                    as={Button}
                    onClick={onOpenLogoutConfirmation}
                    leftIcon={<LuIcons.LuLogOut />}
                    variant="outline"
                    colorScheme="red"
                  >
                    Cerrar sesión
                  </Button>
                  <DeleteAccountButton user={user} />
                </VStack>
              </Grid>
              <Box
                p={4}
                border="2px dashed var(--chakra-colors-chakra-border-color)"
                borderRadius={themeOptions.borderRadius}
              >
                {activeTab === "profile" && (
                  <VStack spacing={4} align="stretch">
                    <HStack justifyContent="space-between" alignItems="center">
                      <Text fontWeight={500} fontSize="lg">
                        Información del perfil
                      </Text>
                      {isSaving && <Spinner size="sm" />}
                    </HStack>
                    <FormControl>
                      <InputGroup flexDirection="column" size="md">
                        <FormLabel fontSize="sm">Nombre</FormLabel>
                        <Input
                          type="text"
                          value={userData.name}
                          variant="outline"
                          onChange={(e) => {
                            setUserData({ ...userData, name: e.target.value });
                          }}
                          onBlur={() =>
                            handleSaveUserData("name", userData.name)
                          }
                          isInvalid={!isNameValid}
                          borderRadius={themeOptions.borderRadius}
                          _focusVisible={{}}
                        />
                        <Text
                          fontSize="xs"
                          color="red.500"
                          mt={1}
                          hidden={isNameValid}
                        >
                          Solo se permiten letras y números.
                        </Text>
                      </InputGroup>
                    </FormControl>
                    <FormControl>
                      <InputGroup flexDirection="column" size="md">
                        <FormLabel fontSize="sm">Fecha de nacimiento</FormLabel>
                        <Input
                          type="date"
                          value={userData.birthDay}
                          variant="outline"
                          onChange={(e) => {
                            setUserData({
                              ...userData,
                              birthDay: e.target.value,
                            });
                          }}
                          onBlur={() =>
                            handleSaveUserData("birthDay", userData.birthDay)
                          }
                          isInvalid={isBirthDayChanged && !isBirthDayValid}
                          borderRadius={themeOptions.borderRadius}
                          _focusVisible={{}}
                        />
                        <Text
                          fontSize="xs"
                          color="red.500"
                          mt={1}
                          hidden={isBirthDayValid}
                        >
                          La fecha no puede ser en el futuro.
                        </Text>
                      </InputGroup>
                    </FormControl>
                    <HStack>
                      <Text fontSize="sm" fontWeight={600}>
                        Miembro desde:
                      </Text>
                      <Text fontSize="sm">{formattedRegistrationDate}</Text>
                    </HStack>
                  </VStack>
                )}

                {activeTab === "preferences" && (
                  <VStack spacing={4} align="stretch">
                    <HStack justifyContent="space-between" alignItems="center">
                      <Text fontWeight={500} fontSize="lg">
                        Preferencias de aplicación
                      </Text>
                      {isSaving && <Spinner size="sm" />}
                    </HStack>
                    <FormControl
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <FormLabel mb={0}>Modo oscuro</FormLabel>
                      <Switch
                        id="dark-mode"
                        isChecked={colorMode === "dark"}
                        onChange={toggleColorMode}
                        colorScheme={themeOptions.focusColor}
                      />
                    </FormControl>
                    <HStack justifyContent="space-between" alignItems="center">
                      <Text fontSize="sm" fontWeight={500}>
                        Inicio de semana
                      </Text>
                      <Menu>
                        <MenuButton as={Button} size="sm">
                          {userData.startOfWeek === "monday"
                            ? "Lunes"
                            : "Domingo"}
                        </MenuButton>
                        <MenuList zIndex={9999}>
                          <MenuOptionGroup
                            value={userData.startOfWeek}
                            type="radio"
                            onChange={(value) =>
                              handleSaveUserData("startOfWeek", value)
                            }
                          >
                            <MenuItemOption value="monday">
                              Lunes
                            </MenuItemOption>
                            <MenuItemOption value="sunday">
                              Domingo
                            </MenuItemOption>
                          </MenuOptionGroup>
                        </MenuList>
                      </Menu>
                    </HStack>
                    <HStack justifyContent="space-between" alignItems="center">
                      <Text fontSize="sm" fontWeight={500}>
                        Idioma
                      </Text>
                      <Menu>
                        <MenuButton as={Button} size="sm">
                          {userData.language === "esp" ? "Español" : "Inglés"}
                        </MenuButton>
                        <MenuList zIndex={9999}>
                          <MenuOptionGroup
                            value={userData.language}
                            type="radio"
                            onChange={(value) =>
                              handleSaveUserData("language", value)
                            }
                          >
                            <MenuItemOption value="esp">Español</MenuItemOption>
                            <MenuItemOption value="eng" isDisabled>
                              Inglés
                            </MenuItemOption>
                          </MenuOptionGroup>
                        </MenuList>
                      </Menu>
                    </HStack>
                  </VStack>
                )}

                {activeTab === "access" && (
                  <VStack spacing={4} align="stretch">
                    <HStack justifyContent="space-between" alignItems="center">
                      <Text fontWeight={500} fontSize="lg">
                        Acceso y seguridad
                      </Text>
                      {isSaving && <Spinner size="sm" />}
                    </HStack>
                    <Box position="relative">
                      <Text fontSize="sm" fontWeight={500}>
                        Correo electrónico
                      </Text>
                      <Text fontSize="sm">{currentUserEmail}</Text>
                      {!isEmailVerified && !isGoogleProvider && (
                        <VStack align="flex-start" mt={4} spacing={2}>
                          <Badge colorScheme="red" variant="subtle">
                            Correo no verificado
                          </Badge>
                          <Button
                            onClick={handleSendVerificationEmail}
                            isLoading={isSending}
                            loadingText="Enviando..."
                            size="sm"
                          >
                            Reenviar correo de verificación
                          </Button>
                        </VStack>
                      )}
                      {isGoogleProvider && (
                        <HStack mt={2}>
                          <Icon as={FaGoogle} />
                          <Text fontSize="sm">Conectado con Google</Text>
                        </HStack>
                      )}
                    </Box>
                  </VStack>
                )}

                {activeTab === "links" && (
                  <VStack spacing={4} align="stretch">
                    <HStack justifyContent="space-between" alignItems="center">
                      <Text fontWeight={500} fontSize="lg">
                        Enlaces útiles
                      </Text>
                      {isSaving && <Spinner size="sm" />}
                    </HStack>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <Link
                        p={4}
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center"
                        gap={1}
                        border="2px solid var(--chakra-colors-chakra-border-color)"
                        borderRadius={themeOptions.borderRadius}
                        href="https://habituo.vercel.app/"
                        target="_blank"
                        bg={colorMode === "light" ? "white" : "black"}
                        _hover={{ textDecoration: "none" }}
                      >
                        <Icon as={LuIcons.LuEarth} boxSize={8} />
                        <Text fontSize="md" fontWeight={600} textAlign="center">
                          Habituo App
                        </Text>
                        <Text
                          fontSize="xs"
                          fontWeight={400}
                          color={
                            colorMode === "light" ? "#00000080" : "#FFFFFF60"
                          }
                          textAlign="center"
                        >
                          Web principal
                        </Text>
                      </Link>
                      <Link
                        p={4}
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center"
                        gap={1}
                        border="2px solid var(--chakra-colors-chakra-border-color)"
                        borderRadius={themeOptions.borderRadius}
                        href="https://patreon.com/habituo"
                        target="_blank"
                        bg={colorMode === "light" ? "white" : "black"}
                        _hover={{ textDecoration: "none" }}
                      >
                        <Icon as={TbBrandPatreon} boxSize={8} />
                        <Text fontSize="md" fontWeight={600} textAlign="center">
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
                          Apoya el desarrollo
                        </Text>
                      </Link>
                      <Link
                        p={4}
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center"
                        gap={1}
                        border="2px solid var(--chakra-colors-chakra-border-color)"
                        borderRadius={themeOptions.borderRadius}
                        href="https://docs-habituo.vercel.app"
                        target="_blank"
                        bg={colorMode === "light" ? "white" : "black"}
                        _hover={{ textDecoration: "none" }}
                      >
                        <Icon as={LuIcons.LuNotebookText} boxSize={8} />
                        <Text fontSize="md" fontWeight={600} textAlign="center">
                          Documentación
                        </Text>
                        <Text
                          fontSize="xs"
                          fontWeight={400}
                          color={
                            colorMode === "light" ? "#00000080" : "#FFFFFF60"
                          }
                          textAlign="center"
                        >
                          Apoya el desarrollo
                        </Text>
                      </Link>
                    </SimpleGrid>
                  </VStack>
                )}
              </Box>
            </Grid>
          </ModalBody>
        </ModalContent>
      </Modal>
      <ConfirmationModal
        isOpen={isLogoutConfirmationOpen}
        onClose={onCloseLogoutConfirmation}
        title="Cerrar sesión"
        description="¿Seguro que quieres cerrar sesión? No perderás el progreso obtenido y podrás volver cuando quieras."
        confirmButtonText="Sí, cerrar sesión"
        cancelButtonText="No, cancelar"
        onConfirm={handleLogout}
      />
    </>
  );
};

export default UserSettingsModal;
