import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import lightLogo from "../../../assets/images/light_habituo-logo.svg";
import darkLogo from "../../../assets/images/dark_habituo-logo.svg";
import { useAuthUser } from "../../../context/AuthUserContext/AuthUserContext";
import { UserProfileSection } from "../../../exports";
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
  Container,
} from "@chakra-ui/react";
import * as LuIcons from "react-icons/lu";

/**
 * Navbar component
 * Renders the main navigation bar with:
 * - Logo (light/dark mode)
 * - Navigation links
 * - Theme toggle button
 * - User login/profile section
 * - Responsive drawer menu for mobile
 */
const Navbar = () => {
  /** Get current authenticated user from context */
  const { user } = useAuthUser();

  /** Get current theme mode and toggle function from Chakra UI */
  const { colorMode, toggleColorMode } = useColorMode();

  /** Manage drawer state for mobile menu */
  const { isOpen, onOpen, onClose } = useDisclosure();

  /** React Router navigate function */
  const navigate = useNavigate();

  /** Determine if the current mode is light */
  const isLight = colorMode === "light";

  /**
   * Open drawer handler wrapped in useCallback for performance
   * Ensures the function is memoized and not recreated on every render
   */
  const handleDrawerOpen = useCallback(() => {
    onOpen();
  }, [onOpen]);

  /**
   * Navigation handler for drawer links
   * Closes the drawer after navigating
   */
  const handleNavigate = useCallback(
    (path) => {
      navigate(path);
      onClose();
    },
    [navigate, onClose]
  );

  const handleLoginClick = () => navigate("/login");

  return (
    <>
      {/** Main Navbar container with sticky positioning and responsive max width */}
      <Container
        p={4}
        maxW={{ base: "full", md: "5xl" }}
        position="sticky"
        top={0}
        fontFamily="Outfit"
        zIndex={10}
      >
        {/** Flex container for main horizontal layout */}
        <Flex
          p={4}
          pl={6}
          mx="auto"
          alignItems="center"
          justifyContent="space-between"
          bg={useColorModeValue("white", "black")}
          borderRadius="full"
        >
          {/** Logo linking to homepage */}
          <Link href="/" aria-label="Volver a la página de inicio de Habituo">
            <Image
              src={isLight ? lightLogo : darkLogo}
              alt="Logotipo de Habituo App"
              w={120}
              objectFit="contain"
            />
          </Link>

          {/** Desktop navigation links */}
          <HStack as="nav" spacing={6} display={{ base: "none", md: "flex" }}>
            <Link
              href="/dashboard"
              fontSize="lg"
              fontWeight={600}
              _hover={{ color: "var(--chakra-colors-orange-500)" }}
              aria-label="Ir al Tablero"
            >
              Tablero
            </Link>
            <Link
              href="https://docs-habituo.vercel.app/"
              fontSize="lg"
              fontWeight={600}
              _hover={{ color: "var(--chakra-colors-orange-500)" }}
              rel="noopener noreferrer"
              aria-label="Ver la Documentación"
              isExternal
            >
              Documentación
            </Link>
            <Link
              href="/about"
              fontSize="lg"
              fontWeight={600}
              _hover={{ color: "var(--chakra-colors-orange-500)" }}
              aria-label="Ir a Acerca de"
            >
              Acerca de
            </Link>
            <Link
              href="/contact"
              fontSize="lg"
              fontWeight={600}
              _hover={{ color: "var(--chakra-colors-orange-500)" }}
              aria-label="Ir a Contacto"
            >
              Contacto
            </Link>
          </HStack>

          {/** Right section: theme toggle and user/login button */}
          <Flex alignItems="center" gap={2} _focusVisible={{}}>
            <Box display={{ base: "block", md: "none" }}>
              <IconButton
                variant="ghost"
                fontSize="lg"
                aria-label="Cambiar modo claro/oscuro"
                icon={
                  colorMode === "light" ? <LuIcons.LuMoon /> : <LuIcons.LuSun />
                }
                onClick={toggleColorMode}
                borderRadius="full"
                _focusVisible={{}}
              />
              <IconButton
                aria-label="Abrir menú de navegación"
                icon={<LuIcons.LuMenu />}
                onClick={handleDrawerOpen}
                borderRadius="full"
                fontSize="xl"
                variant="ghost"
                size="md"
                _focusVisible={{}}
              />
            </Box>

            {/** Desktop right section */}
            <HStack spacing={3} display={{ base: "none", md: "flex" }}>
              {/** Theme toggle button */}
              <IconButton
                variant="ghost"
                fontSize="lg"
                aria-label="Cambiar modo claro/oscuro"
                icon={
                  colorMode === "light" ? <LuIcons.LuMoon /> : <LuIcons.LuSun />
                }
                onClick={toggleColorMode}
                borderRadius="full"
                _focusVisible={{}}
              />
              {/** User profile or login button */}
              {user ? (
                <UserProfileSection />
              ) : (
                <Button
                  data-testid="login-btn"
                  px={5}
                  py={4}
                  size="lg"
                  variant="solid"
                  colorScheme="orange"
                  onClick={handleLoginClick}
                  borderRadius="full"
                  _focusVisible={{}}
                >
                  Iniciar sesión
                </Button>
              )}
            </HStack>
          </Flex>
        </Flex>
      </Container>

      {/** Drawer component for mobile navigation */}
      <Drawer onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent
          bg={useColorModeValue("white", "black")}
          borderRadius="0"
        >
          <DrawerCloseButton borderRadius="full" _focusVisible={{}} />
          <DrawerBody p={4}>
            <VStack
              h="100%"
              pt={6}
              alignItems="center"
              justifyContent="center"
              spacing={16}
            >
              {/** Drawer logo */}
              <Box>
                <Link
                  href="/"
                  onClick={() => onClose()} // close drawer on logo click
                  aria-label="Volver a la página de inicio de Habituo"
                >
                  <Image
                    src={isLight ? lightLogo : darkLogo}
                    alt="Logotipo de Habituo - Tu tracker de hábitos"
                    w="200px"
                    objectFit="contain"
                  />
                </Link>
              </Box>

              {/** Drawer navigation links */}
              <Stack
                spacing={4}
                fontSize="2xl"
                textAlign="center"
                direction="column"
                justifyContent="center"
                alignItems="center"
              >
                <Link
                  href="/dashboard"
                  fontWeight={600}
                  _hover={{ color: "var(--chakra-colors-orange-500)" }}
                  aria-label="Ir al Tablero"
                >
                  Tablero
                </Link>
                <Link
                  href="https://docs-habituo.vercel.app/"
                  fontWeight={600}
                  _hover={{ color: "var(--chakra-colors-orange-500)" }}
                  rel="noopener noreferrer"
                  aria-label="Ver la Documentación"
                  isExternal
                >
                  Documentación
                </Link>
                <Link
                  href="/about"
                  fontWeight={600}
                  _hover={{ color: "var(--chakra-colors-orange-500)" }}
                  aria-label="Ir a Acerca de"
                >
                  Acerca de
                </Link>
                <Link
                  href="/contact"
                  fontWeight={600}
                  _hover={{ color: "var(--chakra-colors-orange-500)" }}
                  aria-label="Ir a Contacto"
                >
                  Contacto
                </Link>

                {/** User profile or login button inside drawer */}
                <Box mt={8}>
                  {user ? (
                    <UserProfileSection />
                  ) : (
                    <Button
                      size="lg"
                      variant="solid"
                      colorScheme="orange"
                      onClick={() => handleNavigate("/login")}
                      borderRadius="full"
                      _focusVisible={{}}
                    >
                      Iniciar sesión
                    </Button>
                  )}
                </Box>
              </Stack>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default Navbar;
