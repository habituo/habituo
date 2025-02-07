import React from "react";
import logo from "../assets/images/habituo-logo.svg";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { UserProfileSection, LogInSection, ThemePanel } from "../routes/index";
import { PiMagicWandLight } from "react-icons/pi";
import {
  Box,
  Flex,
  Link,
  Image,
  HStack,
  IconButton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
} from "@chakra-ui/react";
import * as LuIcons from "react-icons/lu";

/**
 * Navbar component that provides navigation links and user authentication controls.
 * Includes a theme settings popover and authentication options.
 */
const Navbar = () => {
  const { user } = useAuth(); // Get authentication state
  const { themeOptions, updateTheme } = useTheme(); // Access theme update function

  return (
    <>
      <Box
        px={4}
        py={4}
        position="sticky"
        top={0}
        zIndex={10}
        backdropFilter="blur(100px)"
      >
        <Flex
          alignItems="center"
          justifyContent="space-between"
          maxW="7xl"
          mx="auto"
        >
          {/* Logo section */}
          <Box>
            <Link href="/">
              <Image src={logo} alt="Logo" w="145px" objectFit="contain" />
            </Link>
          </Box>

          {/* Navigation links - visible only on medium screens and larger */}
          <HStack as="nav" spacing={6} display={{ base: "none", md: "flex" }}>
            <Link
              href="/"
              fontSize="md"
              _hover={{ color: useTheme.focusColor }}
            >
              Inicio
            </Link>
            <Link
              href="/dashboard"
              fontSize="md"
              _hover={{ color: useTheme.focusColor }}
            >
              Tablero
            </Link>
          </HStack>

          {/* Right-side buttons section */}
          <Flex alignItems="center" gap={2}>
            <HStack spacing={0}>
              {/* Theme settings button inside a popover */}
              <Popover>
                <PopoverTrigger>
                  <IconButton
                    w="36px"
                    h="36px"
                    bg="transparent"
                    border="none"
                    fontSize="xl"
                    variant="outline"
                    size="sm"
                  >
                    <PiMagicWandLight />
                  </IconButton>
                </PopoverTrigger>
                <PopoverContent
                  borderRadius="base"
                  boxShadow="0px 8px 16px color-mix(in srgb, var(--chakra-colors-gray-900) 10%, transparent), 0px 0px 1px color-mix(in srgb, var(--chakra-colors-gray-900) 30%, transparent)"
                  outline="none"
                  border="none"
                >
                  <PopoverArrow boxShadow="inherit" />
                  <PopoverBody>
                    <ThemePanel onUpdateTheme={updateTheme} />
                  </PopoverBody>
                </PopoverContent>
              </Popover>

              {/* Mobile menu - visible only on small screens */}
              <Box display={{ base: "block", md: "none" }}>
                <Menu>
                  {({ isOpen }) => (
                    <>
                      <MenuButton
                        as={IconButton}
                        aria-label="Menu"
                        icon={isOpen ? <LuIcons.LuX /> : <LuIcons.LuMenu />}
                        bg="transparent"
                        border="none"
                        borderRadius={themeOptions.borderRadius}
                        fontSize="xl"
                        variant="outline"
                        size="sm"
                      />
                      <MenuList borderRadius={themeOptions.borderRadius}>
                        <MenuItem>Inicio</MenuItem>
                        <MenuItem>Tablero</MenuItem>
                      </MenuList>
                    </>
                  )}
                </Menu>
              </Box>
            </HStack>

            {/* Authentication section: Shows profile if logged in, login button otherwise */}
            {user ? (
              <UserProfileSection />
            ) : (
              <Button size="sm" h="36px" userSelect="none" onClick={() => (window.location.href = "/login")}>
                Iniciar sesión
              </Button>
            )}
          </Flex>
        </Flex>
      </Box>
    </>
  );
};

export default Navbar;
