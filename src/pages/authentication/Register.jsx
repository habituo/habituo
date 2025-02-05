import React, { useState } from "react";
import gLogo from "../../assets/images/icons/g-icon.webp";
import logo from "../../assets/images/habituo-logo.svg";
import { signInWithPopup, createUserWithEmailAndPassword } from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  writeBatch,
  collection,
} from "firebase/firestore";
import { auth, googleProvider, db } from "../../hooks/firebase";
import { useNavigate } from "react-router-dom";
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
  Link,
  Avatar,
} from "@chakra-ui/react";
import { useTheme } from "../../theme/ThemeContext";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useAuth } from "../../hooks/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  const { themeOptions, updateTheme } = useTheme();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleClick = () => setShowPassword(!showPassword);

  const validateForm = () => {
    const newErrors = {};

    // Validate name
    if (!formData.name) {
      newErrors.name = "El nombre es obligatorio.";
    } else if (formData.name.length > 20) {
      newErrors.name = "El nombre no puede tener más de 20 caracteres.";
    }

    // Validate email
    if (!formData.email) {
      newErrors.email = "El correo electrónico es obligatorio.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "El correo electrónico no es válido.";
    } else if (formData.email && !formData.password) {
      newErrors.password = "La contraseña es obligatoria.";
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = "La contraseña es obligatoria.";
    } else if (formData.password.length < 8) {
      newErrors.password = "La contraseña debe tener al menos 8 caracteres.";
    } else if (
      !/[a-z]/.test(formData.password) ||
      !/[A-Z]/.test(formData.password)
    ) {
      newErrors.password = "La contraseña debe tener mayúsculas y minúsculas.";
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = "La contraseña debe tener al menos un número.";
    } else if (!/[!@#$%^&*]/.test(formData.password)) {
      newErrors.password =
        "La contraseña debe tener al menos un carácter especial (!@#$%^&*).";
    }

    // Validate password confirm
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createUserDocument = async (userId, name, email) => {
    await setDoc(doc(db, "users", userId), {
      name,
      email,
      registeredAt: serverTimestamp(),
    });
  };

  const createDefaultAreas = async (userId) => {
    const batch = writeBatch(db);
    const areasRef = collection(db, "users", userId, "areas");

    const defaultAreas = [
      { name: "Mañanas", icon: "LuSun" },
      { name: "Tardes", icon: "LuCloudSun" },
      { name: "Noches", icon: "LuMoon" },
    ];
  
    defaultAreas.forEach((area) => {
      const areaDoc = doc(areasRef, area.name);
      batch.set(areaDoc, { 
        name: area.name, 
        icon: area.icon, 
        registeredAt: serverTimestamp(),
      });
    });

    await batch.commit();
  };

  const registerWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const userId = result.user.uid;
      const userDoc = doc(db, "users", userId);
      const userSnapshot = await getDoc(userDoc);

      if (!userSnapshot.exists()) {
        await createUserDocument(
          userId,
          result.user.displayName || "Usuario",
          result.user.email
        );
        await createDefaultAreas(userId);
      }

      navigate("/dashboard/all-habits");
    } catch (error) {
      throw new Error("Error al registrar con Google:", error);
    }
  };

  const handleRegister = async () => {
    setIsSubmitted(true);
    if (!validateForm()) return;

    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      await createUserDocument(result.user.uid, formData.name, formData.email);
      await createDefaultAreas(result.user.uid);
      navigate("/dashboard/all-habits");
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        setErrors({ email: "El correo ya está en uso." });
      } else {
        setErrors({
          general: "Ocurrió un error al registrar. Inténtalo de nuevo.",
        });
      }
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

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
            <Text textAlign="center">Regístrate usando tus credenciales</Text>
          </Box>

          {/* Form */}
          <FormControl
            display="flex"
            flexDirection="column"
            gap={6}
            isInvalid={isSubmitted && !!errors.email}
          >
            <Box w="100%">
              <FormLabel>Nombre completo</FormLabel>
              <Input
                id="name"
                type="text"
                variant="outline"
                size="sm"
                h="2.5rem"
                value={formData.name}
                borderRadius={themeOptions.borderRadius}
                _focus={{ borderColor: themeOptions.focusColor }}
                _focusVisible={{ borderColor: themeOptions.focusColor }}
                onChange={handleInputChange}
                isInvalid={!!errors.name}
              />
              {errors.name && (
                <FormErrorMessage>{errors.name}</FormErrorMessage>
              )}
            </Box>
            <Box w="100%">
              <FormLabel>Correo electrónico</FormLabel>
              <Input
                id="email"
                type="email"
                variant="outline"
                size="sm"
                h="2.5rem"
                value={formData.email}
                borderRadius={themeOptions.borderRadius}
                _focus={{ borderColor: themeOptions.focusColor }}
                _focusVisible={{ borderColor: themeOptions.focusColor }}
                onChange={handleInputChange}
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
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  variant="outline"
                  size="sm"
                  h="2.5rem"
                  onChange={handleInputChange}
                  borderRadius={themeOptions.borderRadius}
                  _focus={{ borderColor: themeOptions.focusColor }}
                  _focusVisible={{ borderColor: themeOptions.focusColor }}
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
            <Box w="100%">
              <FormLabel>Repetir contraseña</FormLabel>
              <InputGroup>
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  variant="outline"
                  size="sm"
                  h="2.5rem"
                  onChange={handleInputChange}
                  borderRadius={themeOptions.borderRadius}
                  _focus={{ borderColor: themeOptions.focusColor }}
                  _focusVisible={{ borderColor: themeOptions.focusColor }}
                  isInvalid={!!errors.confirmPassword}
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
              {errors.confirmPassword && (
                <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
              )}
            </Box>
            <VStack gap={4} alignItems="stretch">
              <Button
                size="md"
                colorScheme={themeOptions.focusColor}
                borderRadius={themeOptions.borderRadius}
                fontSize="sm"
                onClick={handleRegister}
                _focusVisible="none"
              >
                Registrarme
              </Button>
              <Button
                onClick={registerWithGoogle}
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
                Registrarme con Google
              </Button>
            </VStack>
            <HStack alignItems="center" justifyContent="center">
              <Text>¿Ya tienes cuenta?</Text>
              <Link href="/login" _hover={{ color: themeOptions.focusColor }}>
                Inicia sesión
              </Link>
            </HStack>
          </FormControl>
        </Flex>
      </Container>
    );
  } else {
    navigate("/dashboard");
  }
};

export default Register;
