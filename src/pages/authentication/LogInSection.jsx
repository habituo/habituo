import React, { useState } from "react";
import Cookies from "js-cookie";
import {
  HStack,
  Flex,
  Link,
  Image,
  Avatar,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Input,
  VStack,
  Text,
  Button,
  Box,
  useDisclosure,
  IconButton,
  InputGroup,
  InputRightElement,
  FormErrorMessage,
  Checkbox,
  FormControl,
} from "@chakra-ui/react";
import logo from "../../assets/images/habituo-logo.svg";
import gLogo from "../../assets/images/icons/g-icon.webp";
import { signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { auth, googleProvider } from "../../hooks/firebase";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

const LogInSection = () => {
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true); 

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
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
      console.error("Error al iniciar sesión:", error);
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
          password: "El correo o la contraseña son incorrectos.",
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          email: "Ocurrió un error inesperado. Inténtalo más tarde.",
        }));
      }
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      navigate("/dashboard");
    } catch (error) {
      throw new Error("Error al iniciar sesión con Google:", error);
    }
  };

  const { themeOptions } = useTheme();

  const handleClick = () => setShowPassword(!showPassword);

  const handleRememberMeChange = () => {
    setRememberMe(!rememberMe);
  };

  return (
    <Box>
      <Button
        size="sm"
        h="36px"
        variant="ghost"
        border="1px solid var(--chakra-colors-chakra-border-color)"
        paddingInline="0.875rem"
        onClick={onOpen}
        userSelect="none"
      >
        Iniciar sesión
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />

        <ModalContent userSelect="none">
          <ModalHeader
            px="1.5rem"
            pt="1.5rem"
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <Link href="/">
              <Image src={logo} alt="Logo" w="145px" objectFit="contain" />
            </Link>
          </ModalHeader>
          <Box pt="1rem" px="1.5rem">
            <Text fontSize="lg" fontWeight="600">
              Iniciar sesión
            </Text>
            <Text fontSize="sm">
              Utiliza tu dirección de correo electrónico o cuenta de Google para
              iniciar sesión.
            </Text>
          </Box>
          <ModalCloseButton />
          <ModalBody p="1.5rem">
            <VStack spacing={6} align="stretch">
              {/* Form to login */}
              <FormControl isInvalid={!!errors.email}>
                <VStack as="form" spacing={4} w="100%">
                  <Box w="100%">
                    <Input
                      type="email"
                      variant="outline"
                      size="sm"
                      h="2.5rem"
                      placeholder="Correo electrónico"
                      onChange={(e) => setEmail(e.target.value)}
                      borderRadius={themeOptions.borderRadius}
                      _focus={{ borderColor: themeOptions.focusColor }}
                      _focusVisible={{ borderColor: themeOptions.focusColor }}
                      isInvalid={!!errors.email}
                    />
                    {errors.email && (
                      <FormErrorMessage>{errors.email}</FormErrorMessage>
                    )}
                  </Box>
                  <Box w="100%">
                    <InputGroup>
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        variant="outline"
                        size="sm"
                        h="2.5rem"
                        placeholder="Contraseña"
                        onChange={(e) => setPassword(e.target.value)}
                        borderRadius={themeOptions.borderRadius}
                        _focus={{ borderColor: themeOptions.focusColor }}
                        _focusVisible={{ borderColor: themeOptions.focusColor }}
                        isInvalid={!!errors.password}
                      />
                      <InputRightElement>
                        <IconButton
                          aria-label={
                            showPassword
                              ? "Ocultar contraseña"
                              : "Mostrar contraseña"
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
                  <Box
                    px={2}
                    w="100%"
                    display="flex"
                    justifyContent="space-between"
                  >
                    <Checkbox
                      size="sm"
                      colorScheme={themeOptions.focusColor}
                      onChange={handleRememberMeChange}
                      checked={rememberMe}
                      defaultChecked
                    >
                      Recordarme
                    </Checkbox>
                    <Link
                      fontSize="sm"
                      href="/recover-password"
                      _hover={{ color: themeOptions.focusColor }}
                    >
                      Recuperar contraseña
                    </Link>
                  </Box>
                  <Button
                    colorScheme={themeOptions.focusColor}
                    variant="solid"
                    size="sm"
                    w="100%"
                    h="2.5rem"
                    fontWeight="500"
                    onClick={handleLogin}
                  >
                    Iniciar sesión
                  </Button>
                </VStack>
              </FormControl>

              {/* Separate with "o" */}
              <FormControl isInvalid={!!errors.password}>
                <Flex align="center" w="100%">
                  <Box h="1px" bg="var(--chakra-colors-gray-200)" flex="1" />
                  <Text
                    px={2}
                    color="var(--chakra-colors-gray-400)"
                    fontSize="sm"
                  >
                    O
                  </Text>
                  <Box h="1px" bg="var(--chakra-colors-gray-200)" flex="1" />
                </Flex>
              </FormControl>

              {/* Google Button */}
              <Button
                onClick={signInWithGoogle}
                size="md"
                w="100%"
                fontSize="sm"
                fontWeight="500"
                bg="transparent"
                borderWidth="1px"
                borderColor="var(--chakra-colors-gray-200)"
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
                Continuar con Google
              </Button>

              <HStack alignItems="center" justifyContent="center">
                <Text fontSize="sm">¿No tienes cuenta?</Text>
                <Link
                  fontSize="sm"
                  href="/register"
                  _hover={{ color: themeOptions.focusColor }}
                >
                  Regístrate
                </Link>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default LogInSection;
