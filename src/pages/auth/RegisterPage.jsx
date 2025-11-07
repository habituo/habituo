import { useState, useEffect, useCallback } from "react";
import { useAuthUser } from "../../context/AuthUserContext/AuthUserContext";
import { useAuth } from "../../hooks/useAuth";
import { createDefaultAreas } from "../../hooks/useDatabase";
import { useNavigate } from "react-router-dom";
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
  Link,
  useToast,
  useColorMode,
  Checkbox,
  Spinner,
} from "@chakra-ui/react";
import { LuEye, LuEyeOff } from "react-icons/lu";
import { FaGoogle } from "react-icons/fa";
import logo from "../../assets/images/habituo-logo.svg";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../api/firebase/firebase";

const RegisterPage = () => {
  const { colorMode } = useColorMode();
  const { user, loading: authLoading, authError } = useAuthUser();
  const { registerEmailPassword, loginWithGoogle } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && user) {
      navigate("/dashboard");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (authError) {
      toast({
        title: <Text fontWeight={600}>Error de autenticación</Text>,
        description: authError,
        status: "error",
        position: "bottom",
      });
    }
  }, [authError, toast]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  }, []);

  const togglePasswordVisibility = useCallback(
    () => setShowPassword((prev) => !prev),
    []
  );
  const { password, confirmPassword } = formData;

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "El nombre es obligatorio.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "El formato del correo es inválido.";
    if (password.length < 8)
      newErrors.password = "La contraseña debe tener al menos 8 caracteres.";
    if (password !== confirmPassword)
      newErrors.confirmPassword = "Las contraseñas no coinciden.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, password, confirmPassword]);

  const handleRegister = useCallback(
    async (e) => {
      e.preventDefault();
      if (!validateForm()) return;

      setIsSubmitting(true);
      try {
        const userCredential = await registerEmailPassword(
          formData.email,
          formData.password,
          formData.name,
          rememberMe
        );

        const uid = userCredential?.user?.uid;

        if (uid) {
          await createDefaultAreas(uid);
        }

        toast({
          title: <Text fontWeight={600}>Registro exitoso</Text>,
          description: "Tu cuenta ha sido creada correctamente.",
          status: "success",
          position: "bottom",
        });
      } catch (err) {
        toast({
          title: <Text fontWeight={600}>Error al registrar</Text>,
          description: err.message,
          status: "error",
          position: "bottom",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, rememberMe, validateForm, registerEmailPassword, toast]
  );

  const handleGoogleRegister = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const userCredential = await loginWithGoogle(rememberMe);
      const uid = userCredential?.user?.uid;

      const isNewUser = userCredential?._tokenResponse?.isNewUser;

      const hasExistingAreas = async (uid) => {
        const areasRef = collection(db, `users/${uid}/areas`);
        const snapshot = await getDocs(areasRef);
        return !snapshot.empty;
      };

      if (uid && (isNewUser || !(await hasExistingAreas(uid)))) {
        await createDefaultAreas(uid);
      }

      toast({
        title: <Text fontWeight={600}>Registro exitoso</Text>,
        description: "Has iniciado sesión con Google.",
        status: "success",
        position: "bottom",
      });
    } catch (err) {
      toast({
        title: <Text fontWeight={600}>Error al registrar</Text>,
        description: err.message,
        status: "error",
        position: "bottom",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [rememberMe, loginWithGoogle, toast]);

  if (authLoading) {
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
        onSubmit={handleRegister}
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap={6}
        w={{ base: "100%", sm: "400px", md: "450px" }}
        p={6}
        borderRadius="2xl"
        bg={colorMode === "light" ? "white" : "black"}
      >
        <Link href="/" _focusVisible={{}}>
          <Image
            src={logo}
            alt="Logotipo de Habituo App"
            h="40px"
            objectFit="contain"
          />
        </Link>
        <Box textAlign="center">
          <Text
            as="h1"
            fontFamily="Outfit"
            fontSize={{ base: "xl", md: "2xl" }}
            fontWeight={600}
            mb={1}
          >
            Bienvenido/a
          </Text>
          <Text fontSize={{ base: "md", md: "lg" }} fontWeight={400}>
            Regístrate usando tus credenciales
          </Text>
        </Box>
        <VStack w="100%" spacing={4}>
          <FormControl isInvalid={!!errors.name}>
            <FormLabel>Nombre completo</FormLabel>
            <Input
              type="text"
              name="name"
              size="lg"
              value={formData.name}
              borderRadius="xl"
              onChange={handleInputChange}
              _focusVisible={{}}
            />
            <FormErrorMessage>{errors.name}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={!!errors.email}>
            <FormLabel>Correo electrónico</FormLabel>
            <Input
              type="email"
              name="email"
              size="lg"
              value={formData.email}
              borderRadius="xl"
              onChange={handleInputChange}
              _focusVisible={{}}
            />
            <FormErrorMessage>{errors.email}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={!!errors.password}>
            <FormLabel>Contraseña</FormLabel>
            <InputGroup size="lg">
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                size="lg"
                onChange={handleInputChange}
                borderRadius="xl"
                _focusVisible={{}}
              />
              <InputRightElement width="3rem">
                <IconButton
                  h="2.5rem"
                  size="md"
                  borderRadius="xl"
                  onClick={togglePasswordVisibility}
                  icon={showPassword ? <LuEyeOff /> : <LuEye />}
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                  variant="ghost"
                  _focusVisible={{}}
                />
              </InputRightElement>
            </InputGroup>
            <FormErrorMessage>{errors.password}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={!!errors.confirmPassword}>
            <FormLabel>Repetir contraseña</FormLabel>
            <InputGroup size="lg">
              <Input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                size="lg"
                onChange={handleInputChange}
                borderRadius="xl"
                _focusVisible={{}}
              />
              <InputRightElement width="3rem">
                <IconButton
                  h="2.5rem"
                  size="md"
                  borderRadius="xl"
                  onClick={togglePasswordVisibility}
                  icon={showPassword ? <LuEyeOff /> : <LuEye />}
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                  variant="ghost"
                  _focusVisible={{}}
                />
              </InputRightElement>
            </InputGroup>
            <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
          </FormControl>
        </VStack>
        <HStack justify="flex-start" w="100%">
          <Checkbox
            colorScheme="orange"
            isChecked={rememberMe}
            onChange={() => setRememberMe(!rememberMe)}
            _focusVisible={{}}
          >
            Recordarme
          </Checkbox>
        </HStack>
        <VStack w="100%" alignItems="stretch" gap={4}>
          <Button
            colorScheme="orange"
            borderRadius="xl"
            onClick={handleRegister}
            isLoading={isSubmitting || authLoading}
            loadingText="Registrando..."
            _focusVisible={{}}
            size="lg"
          >
            Registrarme
          </Button>
          <Button
            onClick={handleGoogleRegister}
            borderRadius="xl"
            leftIcon={<FaGoogle />}
            isLoading={isSubmitting || authLoading}
            loadingText="Conectando con Google..."
            _focusVisible={{}}
            size="lg"
          >
            Registrarme con Google
          </Button>
        </VStack>
        <HStack>
          <Text>¿Ya tienes cuenta?</Text>
          <Link
            href="/login"
            fontWeight={600}
            color="var(--chakra-colors-orange-500)"
            _focusVisible={{}}
          >
            Iniciar sesión
          </Link>
        </HStack>
      </Flex>
    </Container>
  );
};

export default RegisterPage;
