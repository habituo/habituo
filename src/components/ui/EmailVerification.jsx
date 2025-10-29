import { useState } from "react";
import { Button, useToast, Text } from "@chakra-ui/react";
import { useTheme } from "../../context/ThemeContext/ThemeContext";
import { useAuthUser } from "../../context/AuthUserContext/AuthUserContext";
import { sendEmailVerification } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const EmailVerification = () => {
  const { themeOptions } = useTheme();
  const { user } = useAuthUser();
  const toast = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSendVerificationEmail = async () => {
    if (!user || !user.email) {
      toast({
        title: <Text fontWeight={600}>Error</Text>,
        description:
          "No hay un usuario autenticado o su correo no está disponible.",
        status: "warning",
        position: "bottom",
      });
      return;
    }

    setIsLoading(true);
    try {
      await sendEmailVerification(user);
      toast({
        title: <Text fontWeight={600}>Correo de verificación enviado</Text>,
        description: `Se ha enviado un enlace de verificación a ${user.email}. Por favor, revisa tu bandeja de entrada y sigue las instrucciones.`,
        status: "success",
        position: "bottom",
      });
      navigate("/email-verified");
    } catch (error) {
      let errorMessage = "Error al enviar el correo de verificación.";
      switch (error.code) {
        case "auth/too-many-requests":
          errorMessage =
            "Demasiadas solicitudes. Inténtalo de nuevo más tarde.";
          break;
        case "auth/network-request-failed":
          errorMessage = "Error de red. Verifica tu conexión a internet.";
          break;
        case "auth/invalid-credential":
          errorMessage = "Credenciales inválidas.";
          break;
        default:
          errorMessage =
            "Error inesperado al enviar el correo de verificación.";
      }
      toast({
        title: <Text fontWeight={600}>Error</Text>,
        description: errorMessage,
        status: "error",
        position: "bottom",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      p={3}
      variant="solid"
      colorScheme={themeOptions.focusColor}
      onClick={handleSendVerificationEmail}
      isLoading={isLoading}
      loadingText="Enviando..."
      isDisabled={isLoading || user?.emailVerified}
    >
      {user?.emailVerified ? "Correo verificado" : "Verificar correo"}
    </Button>
  );
};

export default EmailVerification;
