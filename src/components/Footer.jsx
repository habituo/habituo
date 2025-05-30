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
  const { themeOptions } = useTheme();

  return (
    <Box as="footer" pt={{ base: 8, md: 10 }} px={{ base: 4, md: 8 }}>
      <Flex
        direction={{ base: "column", md: "row" }}
        justify={{ base: "center", md: "space-between" }}
        align={{ base: "center", md: "flex-start" }}
        maxW="7xl"
        mx="auto"
        my={{ base: 8, lg: 10 }}
        textAlign={{ base: "center", md: "left" }}
      >
        <VStack mb={{ base: 10, md: 0 }} alignItems="flex-start" spacing={4}>
          <Link href="/" aria-label="Volver a la página de inicio de Habituo">
            <Image
              src={logo}
              alt="Logotipo de Habituo - Tu tracker de hábitos"
              w="145px"
              objectFit="contain"
            />
          </Link>
          <Text fontSize="sm" color="gray.500" role="contentinfo">
            ©{new Date().getFullYear()} Habituo App. Todos los derechos reservados.
          </Text>
        </VStack>
        <Grid
          templateColumns={{
            base: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
          }}
          gap={{ base: 8, md: 10 }}
          w="full"
          maxW={{ base: "300px", sm: "600px", md: "600px" }}
        >
          <VStack align={{ base: "center", md: "flex-start" }} spacing={3}>
            <Text fontSize="md" fontWeight={600} mb={2}>
              Producto
            </Text>
            <Link
              href="#"
              _hover={{ color: `${themeOptions.focusColor}.500` }}
              aria-label="Ir a Acerca de"
            >
              Acerca de
            </Link>
            <Link
              href="/dashboard"
              _hover={{ color: `${themeOptions.focusColor}.500` }}
              aria-label="Ir al Tablero"
            >
              Tablero
            </Link>
            <Link
              href="#"
              _hover={{ color: `${themeOptions.focusColor}.500` }}
              aria-label="Ir al Precios"
            >
              Precios
            </Link>
          </VStack>
          <VStack align={{ base: "center", md: "flex-start" }} spacing={3}>
            <Text fontSize="md" fontWeight={600} mb={2}>
              Soporte
            </Text>
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              _hover={{ color: `${themeOptions.focusColor}.500` }}
              aria-label="Ver la documentación"
            >
              Documentación
            </Link>
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              _hover={{ color: `${themeOptions.focusColor}.500` }}
              aria-label="Ponerse en contacto con Habituo"
            >
              Contacto
            </Link>
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              _hover={{ color: `${themeOptions.focusColor}.500` }}
              aria-label="Ver el estado de los servidores"
            >
              Estado
            </Link>
          </VStack>
          <VStack align={{ base: "center", md: "flex-start" }} spacing={3}>
            <Text fontSize="md" fontWeight={600} mb={2}>
              Legal
            </Text>
            <Link
              href="/privacy-policy"
              _hover={{ color: `${themeOptions.focusColor}.500` }}
              aria-label="Ver Política de privacidad"
            >
              Política de privacidad
            </Link>
            <Link
              href="/terms-of-service"
              _hover={{ color: `${themeOptions.focusColor}.500` }}
              aria-label="Ver Condiciones de servicio"
            >
              Condiciones de servicio
            </Link>
          </VStack>
        </Grid>
      </Flex>
    </Box>
  );
};

export default Footer;
