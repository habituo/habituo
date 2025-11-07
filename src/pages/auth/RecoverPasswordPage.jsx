import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/images/habituo-logo.svg";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../api/firebase/firebase";
import { useAuthUser } from "../../context/AuthUserContext/AuthUserContext";
import {
  Box,
  Container,
  Flex,
  Image,
  Text,
  FormControl,
  FormLabel,
  FormErrorMessage,
  HStack,
  Input,
  Button,
  Link,
  useToast,
  useColorMode,
} from "@chakra-ui/react";
import { useTheme } from "../../context/ThemeContext/ThemeContext";

const RecoverPasswordPage = () => {
  const { user } = useAuthUser();
  const navigate = useNavigate();
  const { themeOptions } = useTheme();
  const { colorMode } = useColorMode();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({ email: "" });

  const validateEmail = (inputEmail) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!inputEmail.trim()) {
      return "El correo electrónico no puede estar vacío.";
    }
    if (!emailRegex.test(inputEmail)) {
      return "Por favor, introduce un correo electrónico válido.";
    }
    return "";
  };

  const handlePasswordReset = useCallback(async () => {
    setIsSubmitted(true);
    setValidationErrors({ email: "" });

    const emailError = validateEmail(email);
    if (emailError) {
      setValidationErrors((prev) => ({ ...prev, email: emailError }));
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: <Text fontWeight={600}>Correo de recuperación enviado</Text>,
        description:
          "Se ha enviado un enlace para restablecer tu contraseña a tu correo. Por favor, revisa tu bandeja de entrada.",
        status: "success",
        position: "bottom",
      });
      setEmail("");
      setIsSubmitted(false);
    } catch (err) {
      let errorMessage = "Ocurrió un error inesperado. Inténtalo más tarde.";
      switch (err.code) {
        case "auth/user-not-found":
          errorMessage =
            "No se encontró una cuenta con este correo electrónico.";
          break;
        case "auth/invalid-email":
          errorMessage = "La dirección de correo electrónico no es válida.";
          break;
        case "auth/network-request-failed":
          errorMessage =
            "Error de red. Por favor, verifica tu conexión a internet.";
          break;
        case "auth/too-many-requests":
          errorMessage =
            "Demasiadas solicitudes. Inténtalo de nuevo más tarde.";
          break;
        default:
          errorMessage =
            "Error inesperado al enviar el correo de recuperación.";
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
  }, [email, toast]);

  if (user) {
    navigate("/dashboard");
    return null;
  }

  return (
    <Container
      w="100%"
      maxW="md"
      minH="100vh"
      as="main"
      fontFamily="Outfit"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      p={4}
    >
      <Flex
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap={6}
        w={{ base: "100%", sm: "400px", md: "450px" }}
        p={6}
        borderRadius="2xl"
        bg={colorMode === "light" ? "white" : "black"}
      >
        <Link href="/">
          <Image
            src={logo}
            alt="Logotipo de Habituo App"
            h="40px"
            objectFit="contain"
          />
        </Link>
        <Box textAlign="center">
          <Text
            fontSize={{ base: "xl", md: "2xl" }}
            textAlign="center"
            fontFamily="Outfit"
            fontWeight={600}
            mb={1}
          >
            Recuperar contraseña
          </Text>
          <Text fontSize={{ base: "md", md: "lg" }} fontWeight={400}>
            Introduce tu correo electrónico y enviaremos un enlace para
            restablecer tu contraseña
          </Text>
        </Box>
        <Box w="100%">
          <FormControl
            display="flex"
            flexDirection="column"
            gap={4}
            isInvalid={isSubmitted && !!validationErrors.email}
            w="100%"
          >
            <Box w="100%">
              <FormLabel htmlFor="email">Correo electrónico</FormLabel>
              <Input
                id="email"
                type="email"
                size="lg"
                value={email}
                borderRadius="xl"
                _focusVisible={{}}
                onChange={(e) => setEmail(e.target.value)}
              />
              {validationErrors.email && (
                <FormErrorMessage>{validationErrors.email}</FormErrorMessage>
              )}
            </Box>
          </FormControl>
          <Button
            w="100%"
            colorScheme="orange"
            borderRadius="xl"
            onClick={handlePasswordReset}
            _focusVisible={{}}
            isLoading={isLoading}
            loadingText="Enviando..."
            isDisabled={isLoading}
            size="lg"
            mt={4}
          >
            Mandar recuperación
          </Button>
        </Box>

        <HStack alignItems="center" justifyContent="center" mt={4}>
          <Text>¿Ya tienes cuenta?</Text>
          <Link
            href="/login"
            fontWeight={600}
            color="var(--chakra-colors-orange-500)"
          >
            Inicia sesión
          </Link>
        </HStack>
      </Flex>
    </Container>
  );
};

export default RecoverPasswordPage;
