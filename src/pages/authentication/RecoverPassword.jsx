import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/images/habituo-logo.svg";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../hooks/firebase";
import { useAuth } from "../../context/AuthContext";
import {
  Box,
  Container,
  Flex,
  Image,
  Heading,
  Text,
  FormControl,
  FormLabel,
  FormErrorMessage,
  HStack,
  Input,
  Button,
  Link,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { useTheme } from "../../context/ThemeContext";

const RecoverPassword = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { themeOptions, updateTheme } = useTheme();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState({ email: "" });

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handlePasswordReset = async () => {
    setIsSubmitted(true);
    setMessage("");
    setError("");
    setErrors({ email: "" });

    if (!validateEmail(email)) {
      setErrors((prev) => ({
        ...prev,
        email: "Por favor, introduce un correo válido.",
      }));
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage(
        "Se ha enviado un enlace de recuperación a tu correo. Por favor, revisa tu bandeja de entrada."
      );
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        setError("No se encontró una cuenta con este correo.");
      } else {
        setError("Ocurrió un error inesperado. Inténtalo más tarde.");
      }
      throw new Error("Error to send the recover email:", err);
    }
  };

  if (!user) {
    return (
      <Container
        w="100%"
        maxW="md"
        minH="100vh"
        as="main"
        onUpdateTheme={updateTheme}
        fontFamily={themeOptions.fontFamily}
        userSelect="none"
      >
        <Flex
          h="100vh"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          gap={6}
        >
          {/* Logo */}
          <Box>
            <Link href="/">
              <Image src={logo} alt="Logo" h="28px" objectFit="contain" />
            </Link>
          </Box>

          {/* Heading */}
          <Box>
            <Heading
              size="xl"
              textAlign="center"
              fontFamily={themeOptions.fontFamily}
            >
              Recupera tu contraseña
            </Heading>
            <Text textAlign="center">
              Introduce tu correo electrónico y te enviaremos un enlace para
              restablecer tu contraseña.
            </Text>
          </Box>
          {/* Form */}
          <FormControl
            display="flex"
            flexDirection="column"
            gap={6}
            isInvalid={isSubmitted && !!errors.email}
          >
            <Box w="100%">
              <FormLabel>Correo electrónico</FormLabel>
              <Input
                id="email"
                type="email"
                variant="outline"
                size="sm"
                h="2.5rem"
                value={email}
                borderRadius={themeOptions.borderRadius}
                _focus={{ borderColor: themeOptions.focusColor }}
                _focusVisible={{ borderColor: themeOptions.focusColor }}
                onChange={(e) => setEmail(e.target.value)}
                isInvalid={!!errors.email}
              />
              {errors.email && (
                <FormErrorMessage>{errors.email}</FormErrorMessage>
              )}
            </Box>
          </FormControl>

          {message ? (
            <Alert status="success" borderRadius={themeOptions.borderRadius}>
              <AlertIcon />
              {message}
            </Alert>
          ) : (
            <Button
              size="md"
              colorScheme={themeOptions.focusColor}
              borderRadius={themeOptions.borderRadius}
              fontSize="sm"
              onClick={handlePasswordReset}
              _focusVisible="none"
            >
              Mandar recuperación
            </Button>
          )}

          {/* Error Message */}
          {error && (
            <Alert
              status="error"
              mt={4}
              borderRadius={themeOptions.borderRadius}
            >
              <AlertIcon />
              {error}
            </Alert>
          )}

          <HStack alignItems="center" justifyContent="center">
            <Text>¿Ya tienes cuenta?</Text>
            <Link href="/login" _hover={{ color: themeOptions.focusColor }}>
              Inicia sesión
            </Link>
          </HStack>
        </Flex>
      </Container>
    );
  } else {
    navigate("/dashboard");
  }
};

export default RecoverPassword;
