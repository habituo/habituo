import React, { useState } from "react";
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
import { useTheme } from "../../context/ThemeContext";
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
  VStack,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  Button,
  Link,
  Avatar,
} from "@chakra-ui/react";
import { LuEye, LuEyeOff } from "react-icons/lu";
import { FaGoogle } from "react-icons/fa";
import logo from "../../assets/images/habituo-logo.svg";

const Register = () => {
  const { themeOptions } = useTheme();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleClick = () => setShowPassword(!showPassword);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "El nombre es obligatorio.";
    if (!formData.email)
      newErrors.email = "El correo electrónico es obligatorio.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Correo inválido.";
    if (!formData.password)
      newErrors.password = "La contraseña es obligatoria.";
    else if (formData.password.length < 8)
      newErrors.password = "Mínimo 8 caracteres.";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Las contraseñas no coinciden.";
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
    const defaultAreas = ["Mañanas", "Tardes", "Noches"].map((name) => ({
      name,
      icon: `Lu${name}`,
    }));
    defaultAreas.forEach((area) =>
      batch.set(doc(areasRef, area.name), {
        ...area,
        registeredAt: serverTimestamp(),
      })
    );
    await batch.commit();
  };

  const registerWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const userId = result.user.uid;
      if (!(await getDoc(doc(db, "users", userId))).exists()) {
        await createUserDocument(
          userId,
          result.user.displayName || "Usuario",
          result.user.email
        );
        await createDefaultAreas(userId);
      }
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Error con Google:", error);
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
      window.location.href = "/dashboard";
    } catch (error) {
      setErrors({
        email:
          error.code === "auth/email-already-in-use"
            ? "El correo ya está en uso."
            : "Error al registrar.",
      });
    }
  };

  if (user) return null;

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
          <Text>Regístrate usando tus credenciales</Text>
        </Box>
        {["name", "email"].map((field) => (
          <FormControl key={field} isInvalid={isSubmitted && errors[field]}>
            <FormLabel>
              {field === "name" ? "Nombre completo" : "Correo electrónico"}
            </FormLabel>
            <Input
              type={field}
              name={field}
              size="sm"
              h="2.5rem"
              variant="outline"
              value={formData[field]}
              borderRadius={themeOptions.borderRadius}
              onChange={handleInputChange}
              _focusVisible={{
                borderColor: `var(--chakra-colors-${themeOptions.focusColor}-500)`,
              }}
            />
            <FormErrorMessage>{errors[field]}</FormErrorMessage>
          </FormControl>
        ))}
        {[
          ["password", "Contraseña"],
          ["confirmPassword", "Repetir contraseña"],
        ].map(([id, label]) => (
          <FormControl key={id} isInvalid={isSubmitted && errors[id]}>
            <FormLabel>{label}</FormLabel>
            <InputGroup>
              <Input
                type={showPassword ? "text" : "password"}
                name={id}
                value={formData[id]}
                variant="outline"
                size="sm"
                h="2.5rem"
                onChange={handleInputChange}
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
                  onClick={handleClick}
                />
              </InputRightElement>
            </InputGroup>
            <FormErrorMessage>{errors[id]}</FormErrorMessage>
          </FormControl>
        ))}
        <VStack w="100%" alignItems="stretch" gap={4}>
          <Button
            colorScheme={themeOptions.focusColor}
            borderRadius={themeOptions.borderRadius}
            onClick={handleRegister}
          >
            Registrarme
          </Button>
          <Button
            onClick={registerWithGoogle}
            borderRadius={themeOptions.borderRadius}
            leftIcon={<FaGoogle />}
          >
            Registrarme con Google
          </Button>
        </VStack>
        <HStack>
          <Text>¿Ya tienes cuenta?</Text>
          <Link href="/login">Inicia sesión</Link>
        </HStack>
      </Flex>
    </Container>
  );
};

export default Register;
