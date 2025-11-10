import { useState, useCallback, useEffect, useRef } from "react";
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
import { LuEye, LuEyeOff } from "react-icons/lu";
import { FaGoogle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/images/habituo-logo.svg";

import { useAuth } from "../../hooks/useAuth";
import { useAuthUser } from "../../context/AuthUserContext/AuthUserContext";

const LoginPage = () => {
  const { user, loading, authError } = useAuthUser();
  const { login, loginWithGoogle } = useAuth();
  const toast = useToast();
  const { colorMode } = useColorMode();
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const emailInputRef = useRef(null);

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (authError) {
      toast({
        title: <Text fontWeight={600}>Error de Autenticación</Text>,
        description: authError,
        status: "error",
        position: "bottom",
      });
    }
  }, [authError, toast]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  }, []);

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

  const handleLogin = useCallback(
    async (e) => {
      e.preventDefault();
      const newErrors = validateFields();
      setFormErrors(newErrors);

      if (Object.keys(newErrors).length > 0) {
        return;
      }

      setIsSubmitting(true);
      try {
        await login(credentials.email, credentials.password, rememberMe);
        toast({
          title: <Text fontWeight={600}>Inicio de sesión exitoso</Text>,
          description: "Has iniciado sesión correctamente.",
          status: "success",
          position: "bottom",
        });
      } catch (err) {
        toast({
          title: <Text fontWeight={600}>Error en inicio de sesión</Text>,
          description: err.message,
          status: "error",
          position: "bottom",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [credentials, validateFields, login, rememberMe, toast]
  );

  const handleGoogleLogin = useCallback(async () => {
    setIsSubmitting(true);
    try {
      await loginWithGoogle(rememberMe);
      toast({
        title: <Text fontWeight={600}>Inicio de sesión con Google</Text>,
        description: "Has iniciado sesión con Google correctamente.",
        status: "success",
        position: "bottom",
      });
    } catch (err) {
      toast({
        title: <Text fontWeight={600}>Error en inicio de sesión</Text>,
        description: err.message,
        status: "error",
        position: "bottom",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [rememberMe, loginWithGoogle, toast]);

  if (loading) {
    return (
      <Container
        as="main"
        fontFamily="Outfit"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minH="100vh"
        gap={4}
      >
        <Spinner
          emptyColor="gray.200"
          color="var(--chakra-colors-orange-500)"
          size="lg"
        />
        <Text size="lg">Cargando...</Text>
      </Container>
    );
  }

  return (
    <Container
      as="main"
      fontFamily="Outfit"
      display="flex"
      justifyContent="center"
      alignItems="center"
      minH="100vh"
      p={4}
    >
      <Flex
        as="form"
        onSubmit={handleLogin}
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
          <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight={600} mb={1}>
            Bienvenido/a de nuevo
          </Text>
          <Text fontSize={{ base: "md", md: "lg" }} fontWeight={400}>
            Inicia sesión para continuar
          </Text>
        </Box>
        <FormControl isInvalid={!!formErrors.email}>
          <FormLabel htmlFor="email-login">Correo electrónico</FormLabel>
          <Input
            ref={emailInputRef}
            id="email-login"
            type="email"
            name="email"
            size="lg"
            value={credentials.email}
            borderRadius="xl"
            onChange={handleChange}
            _focusVisible={{}}
          />
          <FormErrorMessage>{formErrors.email}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={!!formErrors.password}>
          <FormLabel htmlFor="password-login">Contraseña</FormLabel>
          <InputGroup size="lg">
            <Input
              id="password-login"
              type={showPassword ? "text" : "password"}
              name="password"
              value={credentials.password}
              onChange={handleChange}
              borderRadius="xl"
              _focusVisible={{}}
            />
            <InputRightElement width="3rem">
              <IconButton
                h="2.5rem"
                size="md"
                borderRadius="xl"
                onClick={() => setShowPassword((prev) => !prev)}
                icon={showPassword ? <LuEyeOff /> : <LuEye />}
                aria-label={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
                variant="ghost"
                _focusVisible={{}}
              />
            </InputRightElement>
          </InputGroup>
          <FormErrorMessage>{formErrors.password}</FormErrorMessage>
        </FormControl>
        <HStack justify="space-between" w="100%" mt={2}>
          <Checkbox
            colorScheme="orange"
            isChecked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            _focusVisible={{}}
          >
            Recordarme
          </Checkbox>
          <Link
            href="/recover-password"
            color="var(--chakra-colors-orange-500)"
            fontWeight={500}
            _focusVisible={{}}
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </HStack>
        <VStack w="100%" alignItems="stretch" gap={3}>
          <Button
            colorScheme="orange"
            borderRadius="xl"
            onClick={handleLogin}
            _focusVisible={{}}
            isLoading={isSubmitting}
            loadingText="Iniciando sesión..."
            isDisabled={loading}
            size="lg"
          >
            Iniciar sesión
          </Button>
          <Button
            onClick={handleGoogleLogin}
            borderRadius="xl"
            leftIcon={<FaGoogle />}
            _focusVisible={{}}
            isLoading={isSubmitting}
            loadingText="Con Google..."
            isDisabled={loading}
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
            color="var(--chakra-colors-orange-500)"
            _focusVisible={{}}
          >
            Regístrate aquí
          </Link>
        </HStack>
      </Flex>
    </Container>
  );
};

export default LoginPage;
