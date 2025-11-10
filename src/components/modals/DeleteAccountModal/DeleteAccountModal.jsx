import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAuth,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
  GoogleAuthProvider,
  reauthenticateWithPopup,
} from "firebase/auth";
import { getFirestore, doc, deleteDoc } from "firebase/firestore";
import {
  Text,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  useColorMode,
  useToast,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  VStack,
  Icon,
} from "@chakra-ui/react";
import { useTheme } from "../../../context/ThemeContext/ThemeContext";
import * as LuIcons from "react-icons/lu";
import PropTypes from "prop-types";

/**
 * A modal component for handling the irreversible deletion of a user's account.
 * It requires re-authentication using the original sign-in method (Email/Password or Google)
 * before deleting the user record from Firebase Auth and the corresponding document in Firestore.
 *
 * @param {object} props - Component props.
 * @param {boolean} props.isDisabled - Flag to disable the "Delete Account" button, typically based on component state outside.
 * @returns {JSX.Element} The Delete Account Modal component.
 */
const DeleteAccountModal = ({ isDisabled }) => {
  const { themeOptions } = useTheme();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode } = useColorMode();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  /**
   * Main handler for the account deletion process.
   * It first checks the user's sign-in provider, re-authenticates the user,
   * then deletes the Firestore document and finally the Firebase Auth user.
   */
  const handleDeleteAccount = async () => {
    setLoading(true);
    setAuthError("");
    const auth = getAuth();
    const db = getFirestore();
    const user = auth.currentUser;

    if (!user) {
      setLoading(false);
      // User is already logged out or session expired, navigate to home/login.
      navigate("/");
      return;
    }

    try {
      // 1. Re-authentication step: Firebase requires recent sign-in before deletion.
      if (
        user.providerData.some((provider) => provider.providerId === "password")
      ) {
        // Handle Email/Password re-authentication
        if (!email || !password) {
          setAuthError("Por favor, introduce tu correo y contraseña.");
          setLoading(false);
          return;
        }
        const credential = EmailAuthProvider.credential(user.email, password);
        await reauthenticateWithCredential(user, credential);
      } else if (
        user.providerData.some(
          (provider) => provider.providerId === "google.com"
        )
      ) {
        // Handle Google re-authentication
        const provider = new GoogleAuthProvider();
        await reauthenticateWithPopup(user, provider);
      } else {
        // Handle other or unknown providers
        toast({
          title: <Text fontWeight={600}>Error de autenticación</Text>,
          description: "No se pudo determinar el método de autenticación.",
          status: "error",
          position: "bottom",
        });
        setLoading(false);
        return;
      }

      // 2. Deletion step (Executed only after successful re-authentication)

      // Delete user document from Firestore first
      await deleteDoc(doc(db, "users", user.uid));

      // Delete user from Firebase Authentication
      await deleteUser(user);

      // 3. Success Feedback
      onClose();
      toast({
        title: <Text fontWeight={600}>Cuenta eliminada</Text>,
        description: "Tu cuenta ha sido eliminada correctamente.",
        status: "success",
        position: "bottom",
      });
      // Navigate to the home page or login screen after deletion
      navigate("/");
    } catch (error) {
      // 4. Error Handling
      console.error("Error deleting account:", error);
      if (error.code === "auth/wrong-password") {
        setAuthError("Contraseña incorrecta.");
      } else if (error.code === "auth/user-not-found") {
        setAuthError("Correo electrónico no encontrado.");
      } else if (error.code === "auth/popup-closed-by-user") {
        // User closed the Google pop-up without completing re-authentication
        setAuthError("Autenticación cancelada por el usuario.");
      } else {
        setAuthError("Error al verificar la cuenta.");
        toast({
          title: <Text fontWeight={600}>Error al eliminar la cuenta</Text>,
          description: "No se pudo eliminar la cuenta. Inténtalo de nuevo.",
          status: "error",
          position: "bottom",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Determine if Email/Password inputs should be shown in the modal body.
   * This is true if the user's primary sign-in provider is 'password'.
   */
  const showPasswordInput = getAuth().currentUser?.providerData.some(
    (provider) => provider.providerId === "password"
  );

  return (
    <>
      {/* Button to open the modal */}
      <Button
        leftIcon={<Icon as={LuIcons.LuTrash2} />}
        colorScheme="red"
        variant="link"
        onClick={onOpen}
        isDisabled={isDisabled}
      >
        Eliminar cuenta
      </Button>

      {/* Account Deletion Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay backdropFilter="blur(10px) hue-rotate(90deg)" />
        <ModalContent
          borderRadius={themeOptions.borderRadius}
          bg={colorMode === "light" ? "white" : "gray.800"}
        >
          <ModalHeader px={4} pt={4} pb={2} fontSize="lg" fontWeight={600}>
            ¿Seguro que quieres eliminar tu cuenta?
          </ModalHeader>
          <ModalBody px={4} fontSize="md">
            <Text>
              Esta acción es **irreversible** y no se puede deshacer. Perderás
              permanentemente todos tus datos y tu progreso.
            </Text>

            {/* Conditional form for Email/Password re-authentication */}
            {showPasswordInput && (
              <VStack mt={4} spacing={4}>
                {/* Email Input (although email is generally retrieved from Firebase,
                    it's included here possibly for consistency/user confirmation) */}
                <FormControl isInvalid={!!authError}>
                  <FormLabel m={0} htmlFor="email">
                    Correo electrónico
                  </FormLabel>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    size="md"
                    variant="outline"
                    borderRadius={themeOptions.borderRadius}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setAuthError("");
                    }}
                    _focusVisible={{}}
                  />
                </FormControl>
                {/* Password Input for re-authentication */}
                <FormControl isInvalid={!!authError}>
                  <FormLabel m={0} htmlFor="password">
                    Contraseña
                  </FormLabel>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    size="md"
                    variant="outline"
                    borderRadius={themeOptions.borderRadius}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setAuthError("");
                    }}
                    _focusVisible={{}}
                  />
                  <FormErrorMessage>{authError}</FormErrorMessage>
                </FormControl>
              </VStack>
            )}

            {/* Conditional text for Google re-authentication */}
            {!showPasswordInput && (
              <Text mt={4} fontWeight={600}>
                Para confirmar la eliminación, necesitarás **autenticarte de
                nuevo con Google**.
              </Text>
            )}
          </ModalBody>
          <ModalFooter p={4}>
            {/* Cancel Button */}
            <Button onClick={onClose} isDisabled={loading}>
              No, cancelar
            </Button>
            {/* Delete/Confirm Button */}
            <Button
              colorScheme="red"
              onClick={handleDeleteAccount}
              isLoading={loading}
              ml={3}
            >
              Sí, eliminar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

// --- PropTypes Definition ---
DeleteAccountModal.propTypes = {
  /** Flag to disable the main trigger button for the modal (e.g., if another action is pending). (Required) */
  isDisabled: PropTypes.bool.isRequired,
};

export default DeleteAccountModal;
