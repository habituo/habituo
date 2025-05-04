import React, { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import {
    Button,
  Container,
  Link,
  Text,
  useColorMode,
  useToast,
} from "@chakra-ui/react";
import { sendEmailVerification, getAuth } from "firebase/auth";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const EmailVerified = () => {
  const { themeOptions } = useTheme();
  const { colorMode } = useColorMode();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [isReloading, setIsReloading] = useState(false);

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

  const handleCheckVerificationStatus = async () => {
    if (user) {
      setIsReloading(true);
      try {
        await user.reload();
        if (user.emailVerified) {
          toast({
            title: <Text fontWeight="600">Correo verificado</Text>,
            description: "Tu correo electrónico ha sido verificado.",
            status: "success",
            position: "bottom",
          });
          navigate("/dashboard");
        } else {
          toast({
            title: <Text fontWeight="600">Correo aún no verificado</Text>,
            description:
              "Por favor, haz clic en el enlace de verificación en tu correo.",
            status: "info",
            position: "bottom",
          });
        }
      } catch (error) {
        toast({
          title: <Text fontWeight="600">Error al verificar el estado</Text>,
          description: error.message,
          status: "error",
          position: "bottom",
        });
      } finally {
        setIsReloading(false);
      }
    }
  };

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
      color={colorMode === "light" ? "rgb(0,0,0)" : "rgb(255,255,255)"}
      gap={4}
    >
      <Text as="h1" fontSize="xl" fontWeight={600}>
        Email de verificación enviado
      </Text>
      <Text as="p" fontSize="sm" fontWeight={400}>
        Revisa tu correo, habrás recibido un correo para verificar tu cuenta.
        Revisa en la carpeta de SPAM en caso de no haber recibido nada aún.
      </Text>
      <Text fontSize="sm" fontWeight={400}>
        ¿No has recibido nada?{" "}
        <Link
          fontWeight={600}
          color={themeOptions.focusColor}
          onClick={handleSendVerificationEmail}
        >
          Reenviar correo
        </Link>
      </Text>
      <Button
        isLoading={isReloading}
        onClick={handleCheckVerificationStatus}
        colorScheme={themeOptions.focusColor}
        borderRadius={themeOptions.borderRadius}
      >
        Verificar estado
      </Button>
    </Container>
  );
};

export default EmailVerified;
