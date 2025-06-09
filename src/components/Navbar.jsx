import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/images/habituo-logo.svg";
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
} from "@chakra-ui/react";
import { LuMenu } from "react-icons/lu";

const Navbar = () => {
  const { user } = useAuthUser();
  const { themeOptions } = useTheme();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const bgColor = useColorModeValue("white", "gray.800");
  const linkHoverColor = themeOptions.focusColor || "#ff8e3c";

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

  const NavLink = ({ children, to }) => (
    <Link
      href={to}
      fontSize={{ base: "xl", md: "lg" }}
      fontWeight={400}
      _hover={{ color: linkHoverColor, textDecoration: "none" }}
      py={{ base: 2, md: 0 }}
      onClick={(e) => {
        if (to.startsWith("/") || to.startsWith("#")) {
          e.preventDefault();
          handleNavigate(to);
        }
      }}
    >
      {children}
    </Link>
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
                src={logo}
                alt="Logotipo de Habituo App"
                w={{ base: "120px", md: "145px" }}
                objectFit="contain"
              />
            </Link>
          </Box>
          <HStack as="nav" spacing={6} display={{ base: "none", md: "flex" }} fontFamily={themeOptions.fontFamily}>
            <NavLink to="/dashboard">Tablero</NavLink>
            <NavLink to="/documentation">Documentación</NavLink>
            <NavLink to="/about">Acerca de</NavLink>
            <NavLink to="/contact">Contacto</NavLink>
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
                  colorScheme={
                    themeOptions.focusColor.replace(".500", "") || "orange"
                  }
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
                  colorScheme={
                    themeOptions.focusColor.replace(".500", "") || "orange"
                  }
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
                    src={logo}
                    alt="Logotipo de Habituo App"
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
                <NavLink to="/dashboard">Tablero</NavLink>
                <NavLink to="/documentation">Documentación</NavLink>
                <NavLink to="/about">Acerca de</NavLink>
                <NavLink to="/contact">Contacto</NavLink>

                {!user && (
                  <>
                    <Button
                      mt={4}
                      px={5}
                      py={4}
                      size="lg"
                      variant="outline"
                      colorScheme={
                        themeOptions.focusColor.replace(".500", "") || "orange"
                      }
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
                      colorScheme={
                        themeOptions.focusColor.replace(".500", "") || "orange"
                      }
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
