import React, { useState } from "react";
import gLogo from "../../assets/images/icons/g-icon.webp";
import logo from "../../assets/images/habituo-logo.svg";
import { signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { auth, googleProvider } from "../../hooks/firebase";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
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
  VStack,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  Button,
  Checkbox,
  Link,
  Avatar,
} from "@chakra-ui/react";
import { useTheme } from "../../theme/ThemeContext";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useAuth } from "../../hooks/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { themeOptions, updateTheme } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [rememberMe, setRememberMe] = useState(true); 

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    setIsSubmitted(true);

    const newErrors = { email: "", password: "" };

    if (!validateEmail(email)) {
      newErrors.email = "Por favor, introduce un correo válido.";
    }

    if (!password) {
      newErrors.password = "La contraseña no puede estar vacía.";
    }

    setErrors(newErrors);

    if (newErrors.email || newErrors.password) return;

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      if (rememberMe) {
        // Guardamos la sesión en una cookie con duración de 30 días si la opción está marcada
        Cookies.set("userSession", email, { expires: 30 });
      } else {
        // Si no se marca, eliminamos la cookie (no se guarda sesión)
        Cookies.set("userSession", email, { expires: 1 });
      }
      navigate("/dashboard");
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        setErrors((prev) => ({
          ...prev,
          email: "No se encontró una cuenta con este correo.",
        }));
      } else if (error.code === "auth/wrong-password") {
        setErrors((prev) => ({
          ...prev,
          password: "La contraseña es incorrecta.",
        }));
      } else if (error.code === "auth/invalid-credential") {
        setErrors((prev) => ({
          ...prev,
          password2: "El correo o la contraseña son incorrectos.",
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          email: "Ocurrió un error inesperado. Inténtalo más tarde.",
        }));
      }
    }
  };

  const handleRememberMeChange = () => {
    setRememberMe(!rememberMe);
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      navigate("/dashboard");
    } catch (error) {}
  };

  const handleClick = () => setShowPassword(!showPassword);
  const { user } = useAuth();

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
              Bienvenido/a
            </Heading>
            <Text textAlign="center">
              Inicia sesión usando tus credenciales
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
                type="email"
                variant="outline"
                size="sm"
                h="2.5rem"
                onChange={(e) => setEmail(e.target.value)}
                borderRadius={themeOptions.borderRadius}
                _focus={{ borderColor: `var(--chakra-colors-${themeOptions.focusColor}-500)` }}
                _focusVisible={{ borderColor: `var(--chakra-colors-${themeOptions.focusColor}-500)` }}
                isInvalid={!!errors.email}
              />
              {errors.email && (
                <FormErrorMessage>{errors.email}</FormErrorMessage>
              )}
            </Box>
            <Box w="100%">
              <FormLabel>Contraseña</FormLabel>
              <InputGroup>
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  variant="outline"
                  size="sm"
                  h="2.5rem"
                  onChange={(e) => setPassword(e.target.value)}
                  borderRadius={themeOptions.borderRadius}
                  _focus={{ borderColor: `var(--chakra-colors-${themeOptions.focusColor}-500)` }}
                  _focusVisible={{ borderColor: `var(--chakra-colors-${themeOptions.focusColor}-500)` }}
                  isInvalid={!!errors.password}
                />
                <InputRightElement>
                  <IconButton
                    aria-label={
                      showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                    w="36px"
                    h="36px"
                    bg="transparent"
                    border="none"
                    fontSize="md"
                    variant="outline"
                    size="sm"
                    borderRadius={themeOptions.borderRadius}
                    _focusVisible="none"
                    icon={
                      showPassword ? (
                        <AiOutlineEyeInvisible />
                      ) : (
                        <AiOutlineEye />
                      )
                    }
                    onClick={handleClick}
                  />
                </InputRightElement>
              </InputGroup>
              {errors.password && (
                <FormErrorMessage>{errors.password}</FormErrorMessage>
              )}
            </Box>
            <HStack alignItems="center" justifyContent="space-between">
              <Checkbox colorScheme={themeOptions.focusColor} onChange={handleRememberMeChange} checked={rememberMe} defaultChecked>
                Recordarme
              </Checkbox>
              <Link
                href="/recover-password"
                _hover={{ color: `var(--chakra-colors-${themeOptions.focusColor}-500)` }}
              >
                Recuperar contraseña
              </Link>
            </HStack>
            <VStack gap={4} alignItems="stretch">
              <Button
                size="md"
                colorScheme={themeOptions.focusColor}
                borderRadius={themeOptions.borderRadius}
                fontSize="sm"
                onClick={handleLogin}
                _focusVisible="none"
              >
                Iniciar sesión
              </Button>
              <Button
                onClick={signInWithGoogle}
                size="md"
                fontSize="sm"
                bg="transparent"
                borderWidth="1px"
                borderColor="var(--chakra-colors-gray-200)"
                borderRadius={themeOptions.borderRadius}
                _focusVisible="none"
                leftIcon={
                  <Avatar
                    src={gLogo}
                    size="xs"
                    w="20px"
                    h="20px"
                    bg="transparent"
                  />
                }
              >
                Iniciar sesión con Google
              </Button>
            </VStack>
            <HStack alignItems="center" justifyContent="center">
              <Text>¿No tienes cuenta?</Text>
              <Link
                href="/register"
                _hover={{ color: `var(--chakra-colors-${themeOptions.focusColor}-500)` }}
              >
                Regístrate
              </Link>
            </HStack>
          </FormControl>
        </Flex>
      </Container>
    );
  } else {
    return <>{navigate("/dashboard")}</>;
  }
};

export default Login;
