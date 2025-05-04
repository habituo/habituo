import React from "react";
import logo from "../assets/images/habituo-logo.svg";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { UserProfileSection } from "../routes/index";
import {
  Box,
  Flex,
  Link,
  Image,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  useDisclosure,
  Stack,
  VStack,
} from "@chakra-ui/react";
import * as LuIcons from "react-icons/lu";

const Navbar = () => {
  const { user } = useAuth();
  const { themeOptions } = useTheme();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleClick = () => {
    onOpen();
  };

  return (
    <>
      <Box
        px={4}
        py={4}
        position="sticky"
        top={0}
        zIndex={10}
        borderBottomWidth={1}
        bg="#ffffff"
      >
        <Flex
          alignItems="center"
          justifyContent="space-between"
          maxW="7xl"
          mx="auto"
        >
          <Box>
            <Link href="/">
              <Image src={logo} alt="Logo" w="145px" objectFit="contain" />
            </Link>
          </Box>

          <HStack as="nav" spacing={6} display={{ base: "none", md: "flex" }}>
            <Link
              href="/dashboard"
              fontSize="lg"
              fontWeight={400}
              _hover={{ color: "#ff8e3c" }}
            >
              Tablero
            </Link>
            <Link
              href="/dashboard"
              fontSize="lg"
              fontWeight={400}
              _hover={{ color: "#ff8e3c" }}
            >
              Documentación
            </Link>
            <Link
              href="/dashboard"
              fontSize="lg"
              fontWeight={400}
              _hover={{ color: "#ff8e3c" }}
            >
              Acerca de
            </Link>
            <Link
              href="/dashboard"
              fontSize="lg"
              fontWeight={400}
              _hover={{ color: "#ff8e3c" }}
            >
              Contacto
            </Link>
          </HStack>

          <Flex alignItems="center" gap={2}>
            <HStack spacing={0}>
              <Box display={{ base: "block", lg: "none" }}>
                <Button onClick={() => handleClick()} key="full" m={4}>
                  Open Drawer
                </Button>
                <Menu>
                  {({ isOpen }) => (
                    <>
                      <MenuButton
                        as={IconButton}
                        aria-label="Menu"
                        icon={isOpen ? <LuIcons.LuX /> : <LuIcons.LuMenu />}
                        bg="transparent"
                        border="none"
                        borderRadius="3xl"
                        fontSize="xl"
                        variant="outline"
                        size="sm"
                      />
                      <MenuList borderRadius="3xl">
                        <MenuItem>Inicio</MenuItem>
                        <MenuItem>Tablero</MenuItem>
                      </MenuList>
                    </>
                  )}
                </Menu>
              </Box>
            </HStack>

            {user ? (
              <UserProfileSection />
            ) : (
              <HStack display={{ base: "none", lg: "flex" }}>
                <Button
                  px={5}
                  py={4}
                  size="xl"
                  variant="outline"
                  colorScheme="orange"
                  onClick={() => (window.location.href = "/register")}
                  borderRadius={themeOptions.borderRadius}
                  _focusVisible="none"
                >
                  Crear una cuenta
                </Button>
                <Button
                  px={5}
                  py={4}
                  size="xl"
                  variant="solid"
                  colorScheme="orange"
                  onClick={() => (window.location.href = "/login")}
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
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerBody p={4}>
            <VStack h="100%" pt={6} alignItems="center" justifyContent="center" gap={12}>
              <Box>
                <Link href="/">
                  <Image src={logo} alt="Logotipo de Habituo App" w="200px" objectFit="contain" />
                </Link>
              </Box>
              <Stack spacing={6} fontSize="2xl" textAlign="center">
                <Link href="/dashboard" _hover={{color: "#ff8e3c"}}>Tablero</Link>
                <Link href="/dashboard" _hover={{color: "#ff8e3c"}}>Documentación</Link>
                <Link href="#about-us" _hover={{color: "#ff8e3c"}}>Acerca de</Link>
                <Link href="#contact" _hover={{color: "#ff8e3c"}}>Contacto</Link>
              </Stack>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default Navbar;
