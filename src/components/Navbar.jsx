import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import lightLogo from "../assets/images/light_habituo-logo.svg";
import darkLogo from "../assets/images/dark_habituo-logo.svg";
import { useAuthUser } from "../context/AuthUserContext";
import { useTheme } from "../context/ThemeContext";
import { UserProfileSection } from "../routes/index";
import {
  Box,
  Flex,
  Link,
  Image,
  HStack,
  IconButton,
  Button,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerBody,
  Stack,
  VStack,
  useDisclosure,
  useColorModeValue,
  useColorMode,
} from "@chakra-ui/react";
import { LuMenu } from "react-icons/lu";

const Navbar = () => {
  const { user } = useAuthUser();
  const { themeOptions } = useTheme();
  const { colorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const bgColor = useColorModeValue("white", "gray.800");
  const isLight = colorMode === "light" ? true : false;
  const textColor = isLight
    ? `var(--chakra-colors-${themeOptions.focusColor}-500)`
    : `var(--chakra-colors-${themeOptions.focusColor}-200)`;

  const handleDrawerOpen = useCallback(() => {
    onOpen();
  }, [onOpen]);

  const handleNavigate = useCallback(
    (path) => {
      navigate(path);
      onClose();
    },
    [navigate, onClose]
  );

  return (
    <>
      <Box
        px={4}
        py={4}
        position="sticky"
        top={0}
        zIndex={10}
        borderColor={useColorModeValue("gray.200", "gray.700")}
        bg={bgColor}
        boxShadow="sm"
      >
        <Flex
          alignItems="center"
          justifyContent="space-between"
          maxW="7xl"
          mx="auto"
        >
          <Box>
            <Link href="/" aria-label="Volver a la página de inicio de Habituo">
              <Image
                src={isLight ? lightLogo : darkLogo}
                alt="Logotipo de Habituo App"
                w={{ base: "120px", md: "145px" }}
                objectFit="contain"
              />
            </Link>
          </Box>
          <HStack
            as="nav"
            spacing={6}
            display={{ base: "none", md: "flex" }}
            fontFamily={themeOptions.fontFamily}
          >
            <Link
              href="/dashboard"
              _hover={{ color: textColor }}
              aria-label="Ir al Tablero"
            >
              Tablero
            </Link>
            <Link
              href="https://docs-habituo.vercel.app/"
              _hover={{ color: textColor }}
              rel="noopener noreferrer"
              aria-label="Ver la Documentación"
              isExternal
            >
              Documentación
            </Link>
            <Link
              href="/about"
              _hover={{ color: textColor }}
              aria-label="Ir a Acerca de"
            >
              Acerca de
            </Link>
            <Link
              href="/contact"
              _hover={{ color: textColor }}
              aria-label="Ir a Contacto"
            >
              Contacto
            </Link>
          </HStack>
          <Flex alignItems="center" gap={2} _focusVisible="none">
            <Box display={{ base: "block", md: "none" }}>
              <IconButton
                aria-label="Abrir menú de navegación"
                icon={<LuMenu />}
                onClick={handleDrawerOpen}
                bg="transparent"
                border="none"
                borderRadius={themeOptions.borderRadius}
                fontSize="xl"
                variant="ghost"
                size="md"
                _focusVisible="none"
              />
            </Box>

            {user ? (
              <UserProfileSection />
            ) : (
              <HStack spacing={3} display={{ base: "none", md: "flex" }}>
                <Button
                  px={5}
                  py={4}
                  size="md"
                  variant="outline"
                  colorScheme={themeOptions.focusColor}
                  onClick={() => navigate("/register")}
                  borderRadius={themeOptions.borderRadius}
                  _focusVisible="none"
                >
                  Crear una cuenta
                </Button>
                <Button
                  px={5}
                  py={4}
                  size="md"
                  variant="solid"
                  colorScheme={themeOptions.focusColor}
                  onClick={() => navigate("/login")}
                  borderRadius={themeOptions.borderRadius}
                  _focusVisible="none"
                >
                  Iniciar sesión
                </Button>
              </HStack>
            )}
          </Flex>
        </Flex>
      </Box>

      <Drawer onClose={onClose} isOpen={isOpen} size="full">
        <DrawerOverlay />
        <DrawerContent bg={bgColor} borderRadius="0">
          <DrawerCloseButton
            top={4}
            right={4}
            fontSize="xl"
            borderRadius={themeOptions.borderRadius}
            _focusVisible="none"
          />
          <DrawerBody p={4}>
            <VStack
              h="100%"
              pt={6}
              alignItems="center"
              justifyContent="center"
              gap={8}
            >
              <Box mb={8}>
                <Link
                  href="/"
                  onClick={() => onClose()}
                  aria-label="Volver a la página de inicio de Habituo"
                >
                  <Image
                    src={isLight ? lightLogo : darkLogo}
                    alt="Logotipo de Habituo - Tu tracker de hábitos"
                    w="180px"
                    objectFit="contain"
                  />
                </Link>
              </Box>
              <Stack
                spacing={6}
                fontSize="2xl"
                textAlign="center"
                direction="column"
              >
                <Link
                  href="/dashboard"
                  _hover={{ color: textColor }}
                  aria-label="Ir al Tablero"
                >
                  Tablero
                </Link>
                <Link
                  href="https://docs-habituo.vercel.app/"
                  _hover={{ color: textColor }}
                  rel="noopener noreferrer"
                  aria-label="Ver la Documentación"
                  isExternal
                >
                  Documentación
                </Link>
                <Link
                  href="/about"
                  _hover={{ color: textColor }}
                  aria-label="Ir a Acerca de"
                >
                  Acerca de
                </Link>
                <Link
                  href="/contact"
                  _hover={{ color: textColor }}
                  aria-label="Ir a Contacto"
                >
                  Contacto
                </Link>

                {!user && (
                  <>
                    <Button
                      mt={4}
                      px={5}
                      py={4}
                      size="lg"
                      variant="outline"
                      colorScheme={themeOptions.focusColor}
                      onClick={() => handleNavigate("/register")}
                      borderRadius={themeOptions.borderRadius}
                      _focusVisible="none"
                    >
                      Crear una cuenta
                    </Button>
                    <Button
                      px={5}
                      py={4}
                      size="lg"
                      variant="solid"
                      colorScheme={themeOptions.focusColor}
                      onClick={() => handleNavigate("/login")}
                      borderRadius={themeOptions.borderRadius}
                      _focusVisible="none"
                    >
                      Iniciar sesión
                    </Button>
                  </>
                )}
              </Stack>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default Navbar;
