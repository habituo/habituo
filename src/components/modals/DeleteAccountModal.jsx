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
import { useTheme } from "../../context/ThemeContext/ThemeContext";
import * as LuIcons from "react-icons/lu";

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

    try {
      if (user.providerData.some((provider) => provider.providerId === "password")) {
        if (!email || !password) {
          setAuthError("Por favor, introduce tu correo y contraseña.");
          setLoading(false);
          return;
        }
        const credential = EmailAuthProvider.credential(user.email, password);
        await reauthenticateWithCredential(user, credential);
      } else if (user.providerData.some((provider) => provider.providerId === "google.com")) {
        const provider = new GoogleAuthProvider();
        await reauthenticateWithPopup(user, provider);
      } else {
        toast({
          title: "Error de autenticación",
          description: "No se pudo determinar el método de autenticación.",
          status: "error",
          position: "bottom",
        });
        setLoading(false);
        return;
      }

      await deleteDoc(doc(db, "users", user.uid));
      await deleteUser(user);
      onClose();
      toast({
        title: "Cuenta eliminada",
        description: "Tu cuenta ha sido eliminada correctamente.",
        status: "success",
        position: "bottom",
      });
      navigate("/");
    } catch (error) {
      if (error.code === "auth/wrong-password") {
        setAuthError("Contraseña incorrecta.");
      } else if (error.code === "auth/user-not-found") {
        setAuthError("Correo electrónico no encontrado.");
      } else {
        setAuthError("Error al verificar la cuenta.");
        toast({
          title: "Error al eliminar la cuenta",
          description: "No se pudo eliminar la cuenta. Inténtalo de nuevo.",
          status: "error",
          position: "bottom",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const showPasswordInput = getAuth().currentUser?.providerData.some(
    (provider) => provider.providerId === "password"
  );

  return (
    <>
      <Button
      as={Button}
        leftIcon={<Icon as={LuIcons.LuTrash2} />}
        colorScheme="red"
        variant="solid"
        onClick={onOpen}
        isDisabled={isDisabled}
      >
        Eliminar cuenta
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay backdropFilter="blur(10px) hue-rotate(90deg)" />
        <ModalContent borderRadius={themeOptions.borderRadius} bg={colorMode === "light" ? "white" : "gray.800"}>
          <ModalHeader px={4} pt={4} pb={2} fontSize="lg" fontWeight={600}>
            ¿Seguro que quieres eliminar tu cuenta?
          </ModalHeader>
          <ModalBody px={4} fontSize="md">
            <Text>
              Esta acción es irreversible y no se puede deshacer. Perderás permanentemente todos tus datos y tu progreso.
            </Text>
            {showPasswordInput && (
              <VStack mt={4} spacing={4}>
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
            {!showPasswordInput && (
              <Text mt={4} fontWeight={600}>
                Para confirmar la eliminación, necesitarás autenticarte de nuevo con Google.
              </Text>
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

export default DeleteAccountModal;
