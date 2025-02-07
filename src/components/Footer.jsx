import React from "react";
import logo from "../assets/images/habituo-logo.svg";
import {
  Box,
  Flex,
  Image,
  VStack,
  Grid,
  Text,
  Link,
  Divider,
} from "@chakra-ui/react";
import { useTheme } from "../context/ThemeContext";

const Footer = () => {
  const { themeOptions } = useTheme(); // Access theme update function

  return (
    <Box as="footer" pt={10} px={4}>
      <Flex
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        align={{ base: "center", md: "flex-start" }}
        maxW="7xl"
        mx="auto"
        my={{base: 10, lg: 16}}
      >
        {/* Logo Section */}
        <Box>
          <Link href="/">
            <Image
              src={logo}
              alt="Hbituo - Logo del tracker de hábitos"
              w="145px"
              objectFit="contain"
              mb={{base: 10, lg: 0}}
            />
          </Link>
        </Box>

        {/* Navigation Links Section */}
        <Grid
          templateColumns={{
            base: "repeat(0, minmax(0px, 1fr))",
            md: "repeat(3, minmax(0px, 1fr))",
          }}
          gap={10}
          w="full"
          maxW="600px"
        >
          
          {/* Access Links */}
          <VStack align={{base: "center", md: "start"}} spacing={4}>
            <Text fontSize="md" fontWeight="bold">
              Accesos
            </Text>
            <Link href="/" _hover={{ color: `${themeOptions.focusColor}.500` }}>
              Inicio
            </Link>
            <Link href="#" _hover={{ color: `${themeOptions.focusColor}.500` }}>
              Acerca de
            </Link>
            <Link
              href="/dashboard"
              _hover={{ color: `${themeOptions.focusColor}.500` }}
            >
              Tablero
            </Link>
          </VStack>

          {/* Support Links */}
          <VStack align={{base: "center", md: "start"}} spacing={4}>
            <Text fontSize="md" fontWeight="bold">
              Soporte
            </Text>
            <Link
              href="https://github.com/habituo/"
              target="_blank"
              _hover={{ color: `${themeOptions.focusColor}.500` }}
            >
              Código
            </Link>
            <Link
              href="https://github.com/habituo/habituo/issues/new"
              target="_blank"
              _hover={{ color: `${themeOptions.focusColor}.500` }}
            >
              Reportar bug
            </Link>
            <Link
              href="mailto:nataliorabasconavarro@gmail.com"
              target="_blank"
              _hover={{ color: `${themeOptions.focusColor}.500` }}
            >
              Contacto
            </Link>
          </VStack>

          {/* Product Links */}
          <VStack align={{base: "center", md: "start"}} textAlign="center" spacing={4}>
            <Text fontSize="md" fontWeight="bold">
              Temas legales
            </Text>
            <Link href="#" _hover={{ color: `${themeOptions.focusColor}.500` }}>
              Política de privacidad
            </Link>
            <Link href="#" _hover={{ color: `${themeOptions.focusColor}.500` }}>
              Política de cookies
            </Link>
            <Link href="#" _hover={{ color: `${themeOptions.focusColor}.500` }}>
              Aviso legal
            </Link>
          </VStack>
        </Grid>
      </Flex>

      {/* Divider Line */}
      <Divider />

      {/* Copyright Section */}
      <Flex
        direction={{ base: "column", md: "row" }}
        justify="center"
        align="center"
        py={4}
      >
        <Text fontSize="sm" color="gray.500" role="contentinfo">
          ©{new Date().getFullYear()} Todos los derechos reservados.
        </Text>
      </Flex>
    </Box>
  );
};

export default Footer;
