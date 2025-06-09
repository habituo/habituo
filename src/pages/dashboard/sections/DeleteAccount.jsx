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
} from "@chakra-ui/react";
import { useTheme } from "../../../context/ThemeContext";

const DeleteAccountButton = () => {
  const { themeOptions } = useTheme();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode } = useColorMode();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const reauthenticateUser = async (user) => {
    if (
      user.providerData.some((provider) => provider.providerId === "password")
    ) {
      if (!email || !password) {
        setAuthError("Por favor, introduce tu correo y contraseña.");
        return false;
      }
      try {
        const credential = EmailAuthProvider.credential(email, password);
        await reauthenticateWithCredential(user, credential);
        return true;
      } catch (error) {
        switch (error.code) {
          case "auth/wrong-password":
            setAuthError("Contraseña incorrecta.");
            break;
          case "auth/user-not-found":
            setAuthError("Correo electrónico no encontrado.");
            break;
          default:
            setAuthError("Error al verificar la cuenta.");
            break;
        }
        return false;
      }
    } else if (
      user.providerData.some((provider) => provider.providerId === "google.com")
    ) {
      try {
        const provider = new GoogleAuthProvider();
        await reauthenticateWithPopup(user, provider);
        return true;
      } catch (error) {
        setAuthError("Error al verificar la cuenta con Google.");
        return false;
      }
    } else {
      toast({
        title: <Text fontWeight={600}>Sin método de autenticación</Text>,
        description:
          "No se pudo determinar el método de autenticación para reautenticar.",
        status: "error",
        position: "bottom",
      });
      return false;
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    setAuthError("");
    const auth = getAuth();
    const db = getFirestore();
    const user = auth.currentUser;

    if (!user) {
      setLoading(false);
      return;
    }

    const reauthenticated = await reauthenticateUser(user);

    if (reauthenticated) {
      try {
        await deleteDoc(doc(db, "users", user.uid));
        await deleteUser(user);
        onClose();
        toast({
          title: <Text fontWeight={600}>Cuenta eliminada</Text>,
          description: "Tu cuenta ha sido eliminada correctamente.",
          status: "success",
          position: "bottom",
        });
        navigate("/");
      } catch (error) {
        toast({
          title: <Text fontWeight={600}>Error al eliminar la cuenta</Text>,
          description: "No se pudo eliminar la cuenta. Inténtalo de nuevo.",
          status: "error",
          position: "bottom",
        });
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        px={4}
        py={0}
        colorScheme="red"
        variant="outline"
        onClick={onOpen}
      >
        Eliminar
      </Button>

      {/* Confirmation modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent
          borderRadius={themeOptions.borderRadius}
          bg={colorMode === "light" ? "gray.100" : "gray.900"}
        >
          <ModalHeader p={4} fontSize="lg" fontWeight={600}>
            ¿Seguro que quieres eliminar tu cuenta?
          </ModalHeader>
          <ModalBody px={4} fontSize="md">
            Esta acción no se puede deshacer. Perderás todos tus datos.
            {getAuth().currentUser?.providerData.some(
              (provider) => provider.providerId === "password"
            ) && (
              <VStack mt={4} spacing={4}>
                <FormControl isInvalid={!!authError}>
                  <FormLabel m={0} htmlFor="email">Correo electrónico</FormLabel>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    size="md"
                    variant="outline"
                    borderRadius={themeOptions.borderRadius}
                    onChange={(e) => setEmail(e.target.value)}
                    _focusVisible="none"
                  />
                </FormControl>
                <FormControl isInvalid={!!authError}>
                  <FormLabel m={0} htmlFor="password">Contraseña</FormLabel>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    size="md"
                    variant="outline"
                    borderRadius={themeOptions.borderRadius}
                    onChange={(e) => setPassword(e.target.value)}
                    _focusVisible="none"
                  />
                  <FormErrorMessage>{authError}</FormErrorMessage>
                </FormControl>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter p={4}>
            <Button onClick={onClose} isDisabled={loading}>
              No, cancelar
            </Button>
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

export default DeleteAccountButton;
