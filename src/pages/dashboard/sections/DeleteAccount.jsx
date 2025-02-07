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
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@chakra-ui/react";
import { useTheme } from "../../../context/ThemeContext";

const DeleteAccountButton = () => {
  const { themeOptions } = useTheme();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleDeleteAccount = async () => {
    setLoading(true);
    const auth = getAuth();
    const db = getFirestore();
    const user = auth.currentUser;

    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // 🔍 Verify how to user login
      if (
        user.providerData.some((provider) => provider.providerId === "password")
      ) {
        const email = prompt("Introduce tu correo para confirmar:");
        const password = prompt("Introduce tu contraseña:");
        if (!email || !password) throw new Error("Autenticación cancelada");

        const credential = EmailAuthProvider.credential(email, password);
        await reauthenticateWithCredential(user, credential);
      } else if (
        user.providerData.some(
          (provider) => provider.providerId === "google.com"
        )
      ) {
        const provider = new GoogleAuthProvider();
        await reauthenticateWithPopup(user, provider);
      } else {
        throw new Error("No se pudo determinar el método de autenticación");
      }

      // 🗑️ Delete the account on Firestore
      await deleteDoc(doc(db, "users", user.uid));

      // 🗑️ Delete the account on Firebase Authentication
      await deleteUser(user);

      onClose(); // Close the modal after the deleting
      navigate("/");
    } catch (error) {
      throw new Error("Error deleting the account:", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Button to open the modal */}
      <Button
        px={6}
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
        <ModalContent px={5} py={4} borderRadius={themeOptions.borderRadius}>
          <ModalHeader p={0}>
            ¿Seguro que quieres eliminar tu cuenta?
          </ModalHeader>
          <ModalBody px={0} py={2}>
            Esta acción no se puede deshacer. Perderás todos tus datos.
          </ModalBody>
          <ModalFooter p={0}>
            <Button variant="ghost" onClick={onClose} isDisabled={loading}>
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
