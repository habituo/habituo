import { useState, useEffect, useCallback } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useAuthUser } from "../../context/AuthUserContext";
import { useNavigate } from "react-router-dom";
import { sendEmailVerification, getAuth } from "firebase/auth";
import {
  Button,
  Container,
  Link,
  Text,
  VStack,
  Box,
  useColorMode,
  useToast,
} from "@chakra-ui/react";

const EmailVerified = () => {
  const { themeOptions } = useTheme();
  const { colorMode } = useColorMode();
  const { user } = useAuthUser();
  const toast = useToast();
  const navigate = useNavigate();
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  const handleSendVerificationEmail = useCallback(async () => {
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

    setIsSendingVerification(true);
    try {
      await sendEmailVerification(user);

      toast({
        title: <Text fontWeight={600}>Correo de verificación enviado</Text>,
        description: `Se ha enviado un nuevo enlace de verificación a ${user.email}. Por favor, revisa tu bandeja de entrada y sigue las instrucciones.`,
        status: "success",
        position: "bottom",
      });
    } catch (error) {
      let errorMessage = "Error al enviar el correo de verificación.";
      switch (error.code) {
        case "auth/too-many-requests":
          errorMessage =
            "Demasiadas solicitudes. Inténtalo de nuevo más tarde.";
          break;
        case "auth/network-request-failed":
          errorMessage =
            "Error de red. Por favor, verifica tu conexión a internet.";
          break;
        case "auth/invalid-credential":
          errorMessage = "Credenciales inválidas.";
          break;
        case "auth/user-disabled":
          errorMessage = "Esta cuenta ha sido deshabilitada.";
          break;
        default:
          errorMessage =
            "Ocurrió un error inesperado al enviar el correo de verificación.";
      }
      toast({
        title: <Text fontWeight={600}>Error</Text>,
        description: errorMessage,
        status: "error",
        position: "bottom",
      });
    } finally {
      setIsSendingVerification(false);
    }
  }, [user, toast]);

  const handleCheckVerificationStatus = useCallback(async () => {
    if (!user) {
      toast({
        title: <Text fontWeight={600}>Error</Text>,
        description: "No hay un usuario autenticado para verificar el estado.",
        status: "warning",
        position: "bottom",
      });
      return;
    }

    setIsCheckingStatus(true);
    try {
      await user.reload();

      const auth = getAuth();
      if (auth.currentUser && auth.currentUser.emailVerified) {
        toast({
          title: <Text fontWeight={600}>Correo verificado</Text>,
          description:
            "¡Tu correo electrónico ha sido verificado correctamente!",
          status: "success",
          position: "bottom",
        });
        navigate("/dashboard");
      } else {
        toast({
          title: <Text fontWeight={600}>Correo aún no verificado</Text>,
          description:
            "Por favor, haz clic en el enlace de verificación en tu correo.",
          status: "info",
          position: "bottom",
        });
      }
    } catch (error) {
      toast({
        title: <Text fontWeight={600}>Error al verificar el estado</Text>,
        description: error.message || "Ocurrió un error inesperado.",
        status: "error",
        position: "bottom",
      });
    } finally {
      setIsCheckingStatus(false);
    }
  }, [user, toast, navigate]);

  useEffect(() => {
    if (user && user.emailVerified && !isCheckingStatus) {
      const timer = setTimeout(() => {
        toast({
          title: <Text fontWeight={600}>Correo ya verificado</Text>,
          description: "Redirigiendo al dashboard...",
          status: "info",
          position: "bottom",
        });
        navigate("/dashboard");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [user, isCheckingStatus, navigate, toast]);

  return (
    <Container
      as="main"
      fontFamily={themeOptions.fontFamily}
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minH="100vh"
      textAlign="center"
      color={colorMode === "light" ? "black" : "white"}
      gap={4}
    >
      <VStack spacing={6}>
        <Text as="h1" fontSize={{ base: "xl", md: "2xl" }} fontWeight={600}>
          ¡Casi listo! Verifica tu correo electrónico 📧
        </Text>
        <Text fontSize={{ base: "md", md: "lg" }} fontWeight={400}>
          Hemos enviado un enlace de verificación a **
          {user?.email || "tu correo"}.** Por favor, revisa tu bandeja de
          entrada y sigue las instrucciones. Si no lo encuentras, revisa tu
          carpeta de *SPAM*.
        </Text>
        <Box>
          <Text fontSize="sm" fontWeight={400} mb={2}>
            ¿No has recibido nada?{" "}
            <Link
              fontWeight={600}
              color={themeOptions.focusColor}
              onClick={handleSendVerificationEmail}
              isDisabled={isSendingVerification}
            >
              Reenviar correo
            </Link>
          </Text>
          <Button
            isLoading={isCheckingStatus}
            loadingText="Verificando..."
            onClick={handleCheckVerificationStatus}
            colorScheme={themeOptions.focusColor}
            borderRadius={themeOptions.borderRadius}
            size="md"
            mt={4}
          >
            Ya verifiqué mi correo
          </Button>
        </Box>

        <Link
          mt={8}
          color="gray.500"
          fontSize="sm"
          onClick={() => navigate("/login")}
        >
          Volver al inicio de sesión
        </Link>
      </VStack>
    </Container>
  );
};

export default EmailVerified;
