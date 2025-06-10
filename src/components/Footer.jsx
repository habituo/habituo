import lightLogo from "../assets/images/light_habituo-logo.svg";
import darkLogo from "../assets/images/dark_habituo-logo.svg";
import {
  Box,
  Flex,
  Image,
  VStack,
  Grid,
  Text,
  Link,
  useColorMode,
} from "@chakra-ui/react";
import { useTheme } from "../context/ThemeContext";

const Footer = () => {
  const { themeOptions } = useTheme();
  const { colorMode } = useColorMode();
  const isLight = colorMode === "light" ? true : false;
  const textColor = isLight
    ? `var(--chakra-colors-${themeOptions.focusColor}-500)`
    : `var(--chakra-colors-${themeOptions.focusColor}-200)`;

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
              src={isLight ? lightLogo : darkLogo}
              alt="Logotipo de Habituo - Tu tracker de hábitos"
              w="145px"
              objectFit="contain"
            />
          </Link>
          <Text
            fontSize="sm"
            color={isLight ? "gray.500" : "gray.200"}
            role="contentinfo"
            fontFamily={themeOptions.fontFamily}
          >
            ©{new Date().getFullYear()} Habituo App. Todos los derechos
            reservados.
          </Text>
          <iframe
            title="Estado actual de los servicios"
            src="https://habituo-status.betteruptime.com/badge?theme=dark"
            width="250"
            height="30"
            scrolling="no" />
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
          fontFamily={themeOptions.fontFamily}
        >
          <VStack align={{ base: "center", md: "flex-start" }} spacing={3}>
            <Text fontSize="md" fontWeight={600} mb={2}>
              Producto
            </Text>
            <Link
              href="/about-us"
              _hover={{ color: textColor }}
              aria-label="Ir a Acerca de"
            >
              Acerca de
            </Link>
            <Link
              href="/dashboard"
              _hover={{ color: textColor }}
              aria-label="Ir al Tablero"
            >
              Tablero
            </Link>
            <Text
              color={isLight ? "gray.500" : "gray.200"}
              style={{ userSelect: "none" }}
              aria-label="Ir al Precios"
            >
              Precios
            </Text>
          </VStack>
          <VStack align={{ base: "center", md: "flex-start" }} spacing={3}>
            <Text fontSize="md" fontWeight={600} mb={2}>
              Soporte
            </Text>
            <Link
              href="https://docs-habituo.vercel.app/"
              rel="noopener noreferrer"
              _hover={{ color: textColor }}
              aria-label="Ver la documentación"
              isExternal
            >
              Documentación
            </Link>
            <Link
              href="/contact"
              rel="noopener noreferrer"
              _hover={{ color: textColor }}
              aria-label="Ponerse en contacto con Habituo"
            >
              Contacto
            </Link>
            <Link
              href="https://habituo-status.betteruptime.com/"
              rel="noopener noreferrer"
              _hover={{ color: textColor }}
              aria-label="Ver el estado de los servidores"
              isExternal
            >
              Estado
            </Link>
          </VStack>
          <VStack align={{ base: "center", md: "flex-start" }} spacing={3}>
            <Text fontSize="md" fontWeight={600} mb={2}>
              Legal
            </Text>
            <Link
              href="/policy"
              _hover={{ color: textColor }}
              aria-label="Ver Política de privacidad"
            >
              Política de privacidad
            </Link>
            <Link
              href="/terms"
              _hover={{ color: textColor }}
              aria-label="Ver Términos de Uso"
            >
              Términos de uso
            </Link>
          </VStack>
        </Grid>
      </Flex>
    </Box>
  );
};

export default Footer;
