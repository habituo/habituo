import React, { useState, useCallback, useEffect, useRef } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, googleProvider } from "../../hooks/firebase";
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
  VStack,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  Button,
  Checkbox,
  Link,
  useToast,
  Spinner,
  useColorMode,
} from "@chakra-ui/react";
import { useTheme } from "../../context/ThemeContext";
import { LuEye, LuEyeOff } from "react-icons/lu";
import { FaGoogle } from "react-icons/fa";
import { useAuthUser } from "../../context/AuthUserContext";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/images/habituo-logo.svg";

const Login = () => {
  const { themeOptions } = useTheme();
  const { user, loading, login, loginWithGoogle } = useAuthUser();
  const toast = useToast();
  const { colorMode } = useColorMode();
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const emailInputRef = useRef(null);

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setCredentials((prev) => ({ ...prev, [name]: value }));

      if (isFormSubmitted) {
        setFormErrors((prev) => ({ ...prev, [name]: "" }));
      }
    },
    [isFormSubmitted]
  );

  const validateFields = useCallback(() => {
    const newErrors = {};
    if (!credentials.email.trim()) {
      newErrors.email = "El correo electrónico no puede estar vacío.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email)) {
      newErrors.email = "Por favor, introduce un correo electrónico válido.";
    }
    if (!credentials.password) {
      newErrors.password = "La contraseña no puede estar vacía.";
    } else if (credentials.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres.";
    }
    return newErrors;
  }, [credentials]);

  const handleLogin = useCallback(async () => {
    setIsFormSubmitted(true);
    const newErrors = validateFields();
    setFormErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      await login(credentials.email, credentials.password, rememberMe);
      toast({
        title: <Text fontWeight={600}>Inicio de sesión exitoso</Text>,
        description: "Has iniciado sesión correctamente.",
        status: "success",
        position: "bottom",
      });
    } catch (err) {
      let errorMessage = "Ocurrió un error inesperado. Inténtalo de nuevo.";

      switch (err.code) {
        case "auth/invalid-email":
        case "auth/user-not-found":
        case "auth/wrong-password":
          errorMessage = "Correo electrónico o contraseña incorrectos.";
          setFormErrors((prev) => ({
            ...prev,
            email: errorMessage,
            password: errorMessage,
          }));
          break;
        case "auth/user-disabled":
          errorMessage =
            "Tu cuenta ha sido deshabilitada. Contacta al soporte.";
          setFormErrors((prev) => ({ ...prev, email: errorMessage }));
          break;
        case "auth/too-many-requests":
          errorMessage =
            "Demasiados intentos de inicio de sesión fallidos. Inténtalo de nuevo más tarde.";
          setFormErrors((prev) => ({ ...prev, email: errorMessage }));
          break;
        case "auth/network-request-failed":
          errorMessage =
            "Problema de red. Por favor, verifica tu conexión a internet.";
          break;
        default:
          errorMessage =
            "Error al iniciar sesión. Por favor, inténtalo de nuevo.";
      }

      toast({
        title: <Text fontWeight={600}>Error en inicio de sesión</Text>,
        description: "Correo o contraseña incorrectos.",
        status: "error",
        position: "bottom",
      });
    }
  }, [
    credentials,
    rememberMe,
    login,
    validateFields,
    toast,
    setIsFormSubmitted,
  ]);

  const handleGoogleLogin = useCallback(async () => {
    try {
      await loginWithGoogle(rememberMe);
      toast({
        title: <Text fontWeight={600}>Inicio de sesión con Google</Text>,
        description: "Has iniciado sesión con Google correctamente.",
        status: "success",
        position: "bottom",
      });
    } catch (err) {
      let errorMessage =
        "Hubo un problema al iniciar sesión con Google. Inténtalo de nuevo.";

      switch (err.code) {
        case "auth/popup-closed-by-user":
          errorMessage =
            "La ventana de Google fue cerrada. Por favor, inténtalo de nuevo.";
          break;
        case "auth/cancelled-popup-request":
          errorMessage =
            "Ya hay una solicitud de ventana emergente en progreso. Inténtalo de nuevo.";
          break;
        case "auth/account-exists-with-different-credential":
          errorMessage =
            "Ya tienes una cuenta con este correo electrónico usando otro método de inicio de sesión.";
          break;
        case "auth/network-request-failed":
          errorMessage =
            "Problema de red. Por favor, verifica tu conexión a internet.";
          break;
        default:
          errorMessage = "Error inesperado al iniciar sesión con Google.";
      }

      toast({
        title: <Text fontWeight={600}>Error con Google</Text>,
        description: "Hubo un problema al iniciar sesión con Google.",
        status: "error",
        position: "bottom",
      });
    }
  }, [rememberMe, loginWithGoogle, toast]);

  if (loading) {
    return (
      <Container
        as="main"
        fontFamily={themeOptions.fontFamily}
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minH="100vh"
        gap={4}
      >
        <Spinner
          thickness="4px"
          emptyColor="gray.200"
          color={themeOptions.focusColor}
          size="lg"
        />
        <Text size="lg">Cargando...</Text>
      </Container>
    );
  }

  return (
    <Container
      as="main"
      fontFamily={themeOptions.fontFamily}
      display="flex"
      justifyContent="center"
      alignItems="center"
      minH="100vh"
      p={4}
    >
      <Flex
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap={6}
        w={{ base: "100%", sm: "400px", md: "450px" }}
        p={6}
        borderRadius={themeOptions.borderRadius}
        boxShadow="md"
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
          <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight={600} mb={1}>
            Bienvenido/a de nuevo
          </Text>
          <Text fontSize={{ base: "md", md: "lg" }} fontWeight={400}>
            Inicia sesión para continuar
          </Text>
        </Box>
        <FormControl isInvalid={isFormSubmitted && formErrors.email}>
          <FormLabel htmlFor="email-login">Correo electrónico</FormLabel>
          <Input
            ref={emailInputRef}
            id="email-login"
            type="email"
            name="email"
            size="lg"
            variant="outline"
            value={credentials.email}
            borderRadius={themeOptions.borderRadius}
            onChange={handleChange}
            _focusVisible="none"
          />
          <FormErrorMessage>{formErrors.email}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={isFormSubmitted && formErrors.password}>
          <FormLabel htmlFor="password-login">Contraseña</FormLabel>
          <InputGroup size="lg">
            <Input
              id="password-login"
              type={showPassword ? "text" : "password"}
              name="password"
              variant="outline"
              value={credentials.password}
              onChange={handleChange}
              borderRadius={themeOptions.borderRadius}
              _focusVisible="none"
            />
            <InputRightElement width="4.5rem">
              <IconButton
                h="1.75rem"
                size="sm"
                onClick={() => setShowPassword((prev) => !prev)}
                icon={showPassword ? <LuEyeOff /> : <LuEye />}
                aria-label={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
                variant="ghost"
                _focusVisible="none"
              />
            </InputRightElement>
          </InputGroup>
          <FormErrorMessage>{formErrors.password}</FormErrorMessage>
        </FormControl>
        <HStack justify="space-between" w="100%" mt={2}>
          <Checkbox
            colorScheme={
              themeOptions.focusColor.replace(".500", "") || "orange"
            }
            isChecked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            _focusVisible="none"
          >
            Recordarme
          </Checkbox>
          <Link
            href="/recover-password"
            color={themeOptions.focusColor}
            fontWeight={500}
            _focusVisible="none"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </HStack>
        <VStack w="100%" alignItems="stretch" gap={3}>
          <Button
            colorScheme={
              themeOptions.focusColor.replace(".500", "") || "orange"
            }
            borderRadius={themeOptions.borderRadius}
            onClick={handleLogin}
            _focusVisible="none"
            isLoading={loading}
            loadingText="Iniciando sesión..."
            isDisabled={loading}
            size="lg"
          >
            Iniciar sesión
          </Button>
          <Button
            onClick={handleGoogleLogin}
            borderRadius={themeOptions.borderRadius}
            leftIcon={<FaGoogle />}
            _focusVisible="none"
            isLoading={loading}
            loadingText="Con Google..."
            isDisabled={loading}
            variant="outline"
            size="lg"
          >
            Iniciar sesión con Google
          </Button>
        </VStack>
        <HStack pt={2}>
          <Text color="gray.500">¿No tienes una cuenta?</Text>
          <Link
            href="/register"
            fontWeight={600}
            color={themeOptions.focusColor}
            _focusVisible="none"
          >
            Regístrate aquí
          </Link>
        </HStack>
      </Flex>
    </Container>
  );
};

export default Login;
