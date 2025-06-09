import { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useAuthUser } from "../../context/AuthUserContext";
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
import { createDefaultAreas } from "../../hooks/database";

const Register = () => {
  const { themeOptions } = useTheme();
  const { colorMode } = useColorMode();
  const {
    user,
    loading: authLoading,
    registerEmailPassword,
    registerWithGooglePopup,
    authError,
  } = useAuthUser();
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
    if (authError && isSubmitting) {
      toast({
        title: <Text fontWeight={600}>Error de autenticación</Text>,
        description: authError,
        status: "error",
        position: "bottom",
      });
      setIsSubmitting(false);
    }
  }, [authError, isSubmitting, toast]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors((prevErrors) => ({ ...prevErrors, [e.target.name]: "" }));
    }
  };

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "El nombre es obligatorio.";
    } else if (!/^[a-zA-Z0-9\s]+$/.test(formData.name)) {
      newErrors.name =
        "El nombre solo puede contener letras, números y espacios.";
    }
    if (!formData.email.trim()) {
      newErrors.email = "El correo electrónico es obligatorio.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "El formato del correo electrónico es inválido.";
    }
    if (!formData.password) {
      newErrors.password = "La contraseña es obligatoria.";
    } else if (formData.password.length < 8) {
      newErrors.password = "La contraseña debe tener al menos 8 caracteres.";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegisterWithGoogle = async () => {
    setIsSubmitting(true);
    setErrors({});

    try {
      const result = await registerWithGooglePopup(rememberMe);

      if (result && result.user) {
        await createDefaultAreas(result.user.uid);
      }

      toast({
        title: <Text fontWeight={600}>Registro exitoso</Text>,
        description: "Has iniciado sesión con Google.",
        status: "success",
        position: "bottom",
      });
    } catch (error) {
      if (!authError) {
        toast({
          title: <Text fontWeight={600}>Error al registrar con Google</Text>,
          description:
            "Hubo un problema al iniciar sesión con Google. Por favor, inténtalo de nuevo.",
          status: "error",
          position: "bottom",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await registerEmailPassword(
        formData.email,
        formData.password,
        formData.name,
        rememberMe
      );

      if (result && result.user) {
        await createDefaultAreas(result.user.uid);
      }

      toast({
        title: <Text fontWeight={600}>Registro exitoso</Text>,
        description: "Tu cuenta ha sido creada correctamente.",
        status: "success",
        position: "bottom",
      });
    } catch (error) {
      if (!authError) {
        toast({
          title: <Text fontWeight={600}>Error al registrar</Text>,
          description:
            "Ha ocurrido un error inesperado al registrarte. Por favor, inténtalo de nuevo.",
          status: "error",
          position: "bottom",
        });
      }
      setErrors({ ...errors, general: authError || "Error al registrar." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
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
        as="form"
        onSubmit={handleRegister}
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
        <Link href="/" _focusVisible="none">
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
            fontFamily={themeOptions.fontFamily}
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
          {["name", "email"].map((field) => (
            <FormControl isInvalid={!!errors.name}>
              <FormLabel>
                {field === "name" ? "Nombre completo" : "Correo electrónico"}
              </FormLabel>
              <Input
                type={field}
                name={field}
                size="lg"
                variant="outline"
                value={formData[field]}
                borderRadius={themeOptions.borderRadius}
                onChange={handleInputChange}
                _focusVisible="none"
              />
              <FormErrorMessage>{errors[field]}</FormErrorMessage>
            </FormControl>
          ))}
          {[
            ["password", "Contraseña"],
            ["confirmPassword", "Repetir contraseña"],
          ].map(([id, label]) => (
            <FormControl isInvalid={!!errors.password}>
              <FormLabel>{label}</FormLabel>
              <InputGroup size="lg">
                <Input
                  type={showPassword ? "text" : "password"}
                  name={id}
                  value={formData[id]}
                  size="lg"
                  variant="outline"
                  onChange={handleInputChange}
                  borderRadius={themeOptions.borderRadius}
                  _focusVisible="none"
                />
                <InputRightElement>
                  <IconButton
                    aria-label={
                      showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                    icon={showPassword ? <LuEyeOff /> : <LuEye />}
                    borderRadius={themeOptions.borderRadius}
                    h="1.75rem"
                    size="sm"
                    onClick={togglePasswordVisibility}
                  />
                </InputRightElement>
              </InputGroup>
              <FormErrorMessage>{errors[id]}</FormErrorMessage>
            </FormControl>
          ))}
        </VStack>
        <HStack justify="flex-start" w="100%">
          <Checkbox
            colorScheme={themeOptions.focusColor}
            isChecked={rememberMe}
            onChange={() => setRememberMe(!rememberMe)}
            _focusVisible="none"
          >
            Recordarme
          </Checkbox>
        </HStack>
        <VStack w="100%" alignItems="stretch" gap={4}>
          <Button
            colorScheme={themeOptions.focusColor}
            borderRadius={themeOptions.borderRadius}
            onClick={handleRegister}
            isLoading={isSubmitting}
            loadingText="Registrando..."
            _focusVisible="none"
            size="lg"
          >
            Registrarme
          </Button>
          <Button
            onClick={handleRegisterWithGoogle}
            borderRadius={themeOptions.borderRadius}
            leftIcon={<FaGoogle />}
            isLoading={isSubmitting}
            loadingText="Conectando con Google..."
            _focusVisible="none"
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
            color={themeOptions.focusColor}
            _focusVisible="none"
          >
            Iniciar sesión
          </Link>
        </HStack>
      </Flex>
    </Container>
  );
};

export default Register;
