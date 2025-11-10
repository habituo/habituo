import { useState, useEffect, useCallback } from "react";
import { useAuthUser } from "../../../context/AuthUserContext/AuthUserContext";
import {
  Text,
  Avatar,
  VStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  Button,
  Grid,
  Box,
  useColorMode,
  Badge,
  useToast,
  Icon,
  Spinner,
  Center,
  ModalHeader,
  useDisclosure,
} from "@chakra-ui/react";
import * as LuIcons from "react-icons/lu";
import { updateUserData } from "../../../hooks/useDatabase";
import { useTheme } from "../../../context/ThemeContext/ThemeContext";
import {
  AccessTabContent,
  ConfirmationModal,
  DeleteAccountModal,
  LinksTabContent,
  PreferencesTabContent,
  ProfileTabContent,
} from "../../../exports";
import { isAfter } from "date-fns";
import PropTypes from "prop-types";

/**
 * Auxiliary component for the side navigation buttons in the settings modal.
 *
 * @param {object} props - Component props.
 * @param {React.ReactNode} props.icon - Icon or text to display next to the button text.
 * @param {string} props.text - The main text of the button.
 * @param {function} props.onClick - Handler function when the button is clicked.
 * @param {boolean} props.isActive - Flag indicating if the current tab is active.
 * @param {object} props.themeOptions - Theme options object from useTheme context.
 * @returns {JSX.Element} The Tab Button component.
 */
const TabButton = ({ icon, text, onClick, isActive, themeOptions }) => {
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

// PropTypes for TabButton
TabButton.propTypes = {
  icon: PropTypes.node.isRequired,
  text: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  isActive: PropTypes.bool.isRequired,
  themeOptions: PropTypes.object.isRequired,
};

/**
 * Main component for user profile and application settings management.
 * It allows users to view and update profile info, preferences, and manage access/logout.
 *
 * @param {object} props - Component props.
 * @param {boolean} props.isOpen - Controls the visibility of the modal.
 * @param {function} props.onClose - Function to be called when the modal is dismissed.
 * @returns {JSX.Element} The User Settings Modal component.
 */
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

  // State for user data being edited in the form
  const [userData, setUserData] = useState({
    name: "",
    birthDay: "",
    startOfWeek: "monday",
    language: "esp",
  });

  // State to hold the original data for comparison and cancellation (not implemented here, but useful)
  const [originalUserData, setOriginalUserData] = useState({});

  // Disclosure for the logout confirmation modal
  const {
    isOpen: isLogoutConfirmationOpen,
    onOpen: onOpenLogoutConfirmation,
    onClose: onCloseLogoutConfirmation,
  } = useDisclosure();

  /**
   * Effect to initialize the form data when the user object is available or refreshed.
   */
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
      setOriginalUserData(initialData); // Store original data for comparison
    }
  }, [user, authLoading, refreshUser]);

  /**
   * Memoized function to display Chakra toasts.
   */
  const showToast = useCallback(
    (title, description, status) => {
      toast({
        title: <Text fontWeight={600}>{title}</Text>,
        description: description,
        status: status,
        position: "bottom",
      });
    },
    [toast]
  );

  /**
   * Handler to save individual user data fields (name, birthday, or preferences) to Firestore.
   * It is typically called on `onBlur` for input fields or `onChange` for menu selections/switches.
   * * @param {string} field - The field name being updated ('name', 'birthDay', 'startOfWeek', 'language').
   * @param {any} value - The new value for the field.
   */
  const handleSaveUserData = useCallback(
    async (field, value) => {
      if (!user?.uid) {
        showToast("Error", "Usuario no autenticado.", "error");
        return;
      }
      setIsSaving(true);
      try {
        const dataToUpdate = {};

        // Map the internal field names to the Firestore document structure
        if (field === "name") {
          dataToUpdate.name = value;
        } else if (field === "birthDay") {
          dataToUpdate.birthday_date = value;
        } else {
          // Handle preferences fields (nested under the 'preferences' object)
          dataToUpdate.preferences = {
            ...user.preferences, // Preserve existing preferences
            [field]: value,
          };
        }

        await updateUserData(user.uid, dataToUpdate);

        // Update original data and trigger user refresh to reflect changes
        setOriginalUserData((prev) => ({ ...prev, [field]: value }));
        await refreshUser();
        showToast("¡Guardado!", `Tus cambios han sido guardados.`, "success");
      } catch (error) {
        showToast(
          "No se pudo guardar",
          `Inténtalo de nuevo. ${error}`,
          "error"
        );
      } finally {
        setIsSaving(false);
      }
    },
    [user, refreshUser, showToast]
  );

  /**
   * Handles the user logout process.
   */
  const handleLogout = async () => {
    try {
      await logout();
      showToast(
        "Sesión cerrada",
        "Has cerrado sesión correctamente.",
        "success"
      );
      onClose(); // Close settings modal after logout
    } catch (error) {
      showToast(
        "Error al cerrar sesión",
        `No se pudo cerrar sesión. ${error}`,
        "error"
      );
    }
  };

  /**
   * Handles sending the email verification link to the user.
   */
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
  // Check if birthday is empty or not in the future
  const isBirthDayValid =
    userData.birthDay === "" ||
    !isAfter(new Date(userData.birthDay), new Date());

  // Derived user information for display
  const currentUserName =
    user?.name || user?.displayName || user?.email?.split("@")[0] || "Usuario";
  const currentUserEmail = user?.email || "N/A";
  const currentUserPhotoURL = user?.photoURL
    ? `//wsrv.nl/?url=${user.photoURL}`
    : undefined;
  const currentAccountType = user?.type_account || "basic";

  let typeAccountColor;

  if (currentAccountType === "pro") {
    typeAccountColor = "blue";
  } else if (currentAccountType === "insider") {
    typeAccountColor = "yellow";
  } else {
    typeAccountColor = "gray";
  }

  const formattedRegistrationDate = user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "2-digit",
      })
    : "Desconocida";

  // Check providers for 'access' tab logic
  const isEmailVerified = user?.emailVerified || false;
  const isGoogleProvider = user?.providerData.some(
    (p) => p.providerId === "google.com"
  );

  /**
   * Función para guardar solo los campos de perfil (name, birthDay) en Firestore.
   * Se llama al presionar el botón 'Guardar Cambios'.
   */
  const handleSaveAllUserData = useCallback(async () => {
    // 1. Validar
    if (!isNameValid || !isBirthDayValid) {
      showToast(
        "Error de validación",
        "Revisa los campos con errores.",
        "error"
      );
      return;
    }

    if (!user?.uid) {
      showToast("Error", "Usuario no autenticado.", "error");
      return;
    }

    setIsSaving(true);
    try {
      const dataToUpdate = {
        name: userData.name,
        birthday_date: userData.birthDay,
      };

      // 2. Guardar en Firestore usando la función importada
      await updateUserData(user.uid, dataToUpdate);

      // 3. Éxito: Actualizar el estado original (originalUserData) al nuevo estado guardado (userData)
      setOriginalUserData({ ...userData });

      await refreshUser();
      showToast("¡Guardado!", `Tu perfil ha sido actualizado.`, "success");
    } catch (error) {
      showToast(
        "No se pudo guardar",
        `Inténtalo de nuevo. ${error.message}`,
        "error"
      );
    } finally {
      setIsSaving(false);
    }
  }, [userData, isNameValid, isBirthDayValid, user, refreshUser, showToast]);

  /**
   * Función para cancelar la edición y revertir al estado original.
   */
  const handleCancelEdit = useCallback(() => {
    setUserData(originalUserData);
    showToast("Edición cancelada", "Los cambios no se han guardado.", "info");
  }, [originalUserData, showToast]);

  // --- Loading State Renderer ---
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
              {/* Left Panel: Navigation and Profile Summary */}
              <Grid
                templateRows="auto 1fr auto"
                gap={4}
                p={4}
                borderRadius={themeOptions.borderRadius}
                bg={colorMode === "light" ? "white" : "black"}
              >
                {/* Profile Avatar and Info */}
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

                {/* Navigation */}
                <VStack spacing={12} align="stretch">
                  {/* Navigation Tabs */}
                  <VStack spacing={2} align="stretch">
                    <TabButton
                      icon={<Icon as={LuIcons.LuUser} />} // Replaced emoji with LuIcon
                      text="Perfil"
                      onClick={() => setActiveTab("profile")}
                      isActive={activeTab === "profile"}
                      themeOptions={themeOptions}
                      colorMode={colorMode}
                    />
                    <TabButton
                      icon={<Icon as={LuIcons.LuSettings} />} // Replaced emoji with LuIcon
                      text="Preferencias"
                      onClick={() => setActiveTab("preferences")}
                      isActive={activeTab === "preferences"}
                      themeOptions={themeOptions}
                      colorMode={colorMode}
                    />
                    <TabButton
                      icon={<Icon as={LuIcons.LuLock} />} // Replaced emoji with LuIcon
                      text="Acceso"
                      onClick={() => setActiveTab("access")}
                      isActive={activeTab === "access"}
                      themeOptions={themeOptions}
                      colorMode={colorMode}
                    />
                    <TabButton
                      icon={<Icon as={LuIcons.LuLink} />} // Replaced emoji with LuIcon
                      text="Enlaces"
                      onClick={() => setActiveTab("links")}
                      isActive={activeTab === "links"}
                      themeOptions={themeOptions}
                      colorMode={colorMode}
                    />
                  </VStack>

                  {/* Actions: Logout and Delete Account */}
                  <VStack spacing={4} align="stretch">
                    <Button
                      onClick={onOpenLogoutConfirmation}
                      leftIcon={<LuIcons.LuLogOut />}
                      colorScheme="red"
                    >
                      Cerrar sesión
                    </Button>
                    {/* Delete Account Button (uses its own modal) */}
                    <DeleteAccountModal isDisabled={false} />
                  </VStack>
                </VStack>
              </Grid>

              {/* Right Panel: Tab Content */}
              <Box
                p={4}
                border="2px dashed var(--chakra-colors-chakra-border-color)"
                borderRadius={themeOptions.borderRadius}
              >
                {/* --- Profile Tab Content --- */}
                {activeTab === "profile" && (
                  <ProfileTabContent
                    userData={userData}
                    initialUserData={originalUserData}
                    setUserData={setUserData}
                    handleSaveAllUserData={handleSaveAllUserData}
                    handleCancelEdit={handleCancelEdit}
                    isSaving={isSaving}
                    themeOptions={themeOptions}
                    formattedRegistrationDate={formattedRegistrationDate}
                    isNameValid={isNameValid}
                    isBirthDayValid={isBirthDayValid}
                  />
                )}

                {activeTab === "preferences" && (
                  <PreferencesTabContent
                    userData={userData}
                    handleSaveUserData={handleSaveUserData}
                    isSaving={isSaving}
                    themeOptions={themeOptions}
                    colorMode={colorMode}
                    toggleColorMode={toggleColorMode}
                  />
                )}

                {activeTab === "access" && (
                  <AccessTabContent
                    isSaving={isSaving}
                    currentUserEmail={currentUserEmail}
                    isEmailVerified={isEmailVerified}
                    isGoogleProvider={isGoogleProvider}
                    handleSendVerificationEmail={handleSendVerificationEmail}
                    isSending={isSending}
                  />
                )}

                {activeTab === "links" && (
                  <LinksTabContent
                    isSaving={isSaving}
                    themeOptions={themeOptions}
                    colorMode={colorMode}
                  />
                )}
              </Box>
            </Grid>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Logout Confirmation Modal */}
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

// --- PropTypes Definition for UserSettingsModal ---
UserSettingsModal.propTypes = {
  /** Flag to control the visibility of the modal. (Required) */
  isOpen: PropTypes.bool.isRequired,
  /** Callback function to close the modal. (Required) */
  onClose: PropTypes.func.isRequired,
};

export default UserSettingsModal;
