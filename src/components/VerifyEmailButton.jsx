import React from "react";
import { Button, useToast, Text } from "@chakra-ui/react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { sendEmailVerification } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const VerifyEmailButton = () => {
  const { themeOptions } = useTheme();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSendVerificationEmail = async () => {
    if (user) {
      try {
        await sendEmailVerification(user);
        toast({
          title: <Text fontWeight="600">Correo de verificación enviado</Text>,
          description: `Se ha enviado un enlace de verificación a ${user.email}. Por favor, revisa tu bandeja de entrada y sigue las instrucciones.`,
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
        navigate("/email-verified");
      } catch (error) {
        let errorMessage = "Error al enviar el correo de verificación.";
        if (error.code === "auth/too-many-requests") {
          errorMessage =
            "Se han realizado demasiadas solicitudes. Inténtalo de nuevo más tarde.";
        } else if (error.code === "auth/network-request-failed") {
          errorMessage =
            "Error de red. Por favor, verifica tu conexión a internet.";
        }
        toast({
          title: <Text fontWeight="600">Error</Text>,
          description: errorMessage,
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    } else {
      toast({
        title: <Text fontWeight="600">No se encontró usuario</Text>,
        description:
          "No hay un usuario autenticado para enviar el correo de verificación.",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  return (
    <Button
      p={3}
      variant="solid"
      colorScheme={themeOptions.focusColor}
      onClick={handleSendVerificationEmail}
    >
      Verificar correo
    </Button>
  );
};

export default VerifyEmailButton;
