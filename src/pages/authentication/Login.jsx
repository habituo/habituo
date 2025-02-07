import React, { useState } from "react";
import { signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { auth, googleProvider } from "../../hooks/firebase";
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
} from "@chakra-ui/react";
import { useTheme } from "../../context/ThemeContext";
import { LuEye, LuEyeOff } from "react-icons/lu";
import { FaGoogle } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/images/habituo-logo.svg";

const Login = () => {
  const { themeOptions } = useTheme();
  const { user } = useAuth();
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  if (user) {
    window.location.href = "/dashboard";
    return null;
  }

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const validateFields = () => {
    const newErrors = {};
    if (
      !credentials?.email ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email)
    ) {
      newErrors.email = "Por favor, introduce un correo válido.";
    }
    if (!credentials?.password) {
      newErrors.password = "La contraseña no puede estar vacía.";
    }
    return newErrors;
  };

  const handleLogin = async () => {
    setIsSubmitted(true);
    const newErrors = validateFields();
    setErrors(newErrors);
    if (Object.keys(newErrors).length) return;

    try {
      await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );
      Cookies.set("userSession", credentials.email, {
        expires: rememberMe ? 30 : 1,
      });
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Error en login:", error);
      setErrors({ email: "Correo o contraseña incorrectos." });
    }
  };

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      window.location.href = "/dashboard";
    } catch {
      alert("Ha fallado la conexión con Google.");
    }
  };

  return (
    <Container
      as="main"
      fontFamily={themeOptions.fontFamily}
      userSelect="none"
      display="flex"
      justifyContent="center"
      alignItems="center"
      minH="100vh"
    >
      <Flex
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap={6}
        w={{ base: "auto", md: "500px" }}
      >
        <Link href="/">
          <Image src={logo} alt="Logo" h="28px" objectFit="contain" />
        </Link>
        <Box textAlign="center">
          <Heading size="xl" fontFamily={themeOptions.fontFamily}>
            Bienvenido/a
          </Heading>
          <Text>Inicia sesión usando tus credenciales</Text>
        </Box>
        <FormControl isInvalid={isSubmitted && errors.email}>
          <FormLabel>Correo electrónico</FormLabel>
          <Input
            type="email"
            name="email"
            size="sm"
            h="2.5rem"
            variant="outline"
            value={credentials.email}
            borderRadius={themeOptions.borderRadius}
            onChange={handleChange}
            _focusVisible={{
              borderColor: `var(--chakra-colors-${themeOptions.focusColor}-500)`,
            }}
          />
          <FormErrorMessage>{errors.email}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={isSubmitted && errors.password}>
          <FormLabel>Contraseña</FormLabel>
          <InputGroup>
            <Input
              type={showPassword ? "text" : "password"}
              name="password"
              size="sm"
              h="2.5rem"
              variant="outline"
              value={credentials.password}
              onChange={handleChange}
              borderRadius={themeOptions.borderRadius}
              _focusVisible={{
                borderColor: `var(--chakra-colors-${themeOptions.focusColor}-500)`,
              }}
            />
            <InputRightElement>
              <IconButton
                bg="transparent"
                aria-label="Toggle password visibility"
                icon={showPassword ? <LuEyeOff /> : <LuEye />}
                fontSize="xl"
                onClick={() => setShowPassword(!showPassword)}
                _hover={{ bg: "transparent" }}
              />
            </InputRightElement>
          </InputGroup>
          <FormErrorMessage>{errors.password}</FormErrorMessage>
        </FormControl>
        <HStack justify="space-between" w="100%">
          <Checkbox
            colorScheme={themeOptions.focusColor}
            isChecked={rememberMe}
            onChange={() => setRememberMe(!rememberMe)}
          >
            Recordarme
          </Checkbox>
          <Link href="/recover-password">Recuperar contraseña</Link>
        </HStack>
        <VStack w="100%" alignItems="stretch" gap={4}>
          <Button
            colorScheme={themeOptions.focusColor}
            borderRadius={themeOptions.borderRadius}
            onClick={handleLogin}
          >
            Iniciar sesión
          </Button>
          <Button
            onClick={signInWithGoogle}
            borderRadius={themeOptions.borderRadius}
            leftIcon={<FaGoogle />}
          >
            Iniciar sesión con Google
          </Button>
        </VStack>
        <HStack>
          <Text>¿No tienes cuenta?</Text>
          <Link href="/register">Regístrate</Link>
        </HStack>
      </Flex>
    </Container>
  );
};

export default Login;
