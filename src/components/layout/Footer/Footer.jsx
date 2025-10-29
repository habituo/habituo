import lightLogo from "../../../assets/images/light_habituo-logo.svg";
import darkLogo from "../../../assets/images/dark_habituo-logo.svg";
import {
  Flex,
  Image,
  VStack,
  Grid,
  Text,
  Link,
  useColorMode,
  useColorModeValue,
  Container,
} from "@chakra-ui/react";

/**
 * Footer component
 * Renders the website footer with:
 * - Logo and copyright
 * - Service status badge
 * - Product, Support, and Legal sections
 * - Responsive layout for mobile and desktop
 */
const Footer = () => {
  /** Get current theme mode */
  const { colorMode } = useColorMode();
  const isLight = colorMode === "light"; // determine if theme is light

  return (
    <Container
      as="footer"
      p={4}
      maxW={{ base: "full", md: "5xl" }}
      fontFamily="Outfit"
      zIndex={10}
    >
      {/** Main footer container with responsive Flex layout */}
      <Flex
        p={6}
        direction={{ base: "column", md: "row" }}
        justify={{ base: "center", md: "space-between" }}
        align={{ base: "center", md: "flex-start" }}
        textAlign={{ base: "center", md: "left" }}
        bg={useColorModeValue("white", "black")}
        borderRadius="3xl"
        gap={6}
      >
        {/** Left section: Logo, copyright, and status badge */}
        <VStack
          alignItems="flex-start"
          spacing={{ base: 1, md: 2 }}
          order={{ base: 2, md: 0 }}
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

          {/** Copyright text with dynamic year */}
          <Text
            data-testid="footer-copyright"
            fontSize="sm"
            color={isLight ? "gray.500" : "gray.200"}
          >
            ©{new Date().getFullYear()} Habituo App. Todos los derechos
            reservados.
          </Text>

          {/** Service status badge iframe */}
          <iframe
            title="Estado actual de los servicios"
            src="https://habituo-status.betteruptime.com/badge?theme=dark"
            width="250"
            height="30"
          />
        </VStack>

        {/** Middle/Right section: Links in a responsive Grid layout */}
        <Grid
          w={{ base: "100%", md: "auto" }}
          templateColumns={{
            base: "repeat(2, 1fr)",
            md: "repeat(3, auto)",
          }}
          gap={{ base: 6, md: 10 }}
          alignItems="flex-start"
          justifyContent="flex-start"
        >
          {/** Product section */}
          <VStack gridRow={1} gridColumn={1} align="flex-start" spacing={1}>
            <Text fontSize="xl" fontWeight={600} mb={2}>
              Producto
            </Text>
            <Link
              href="/about"
              fontSize="lg"
              fontWeight={500}
              _hover={{ color: "var(--chakra-colors-orange-500)" }}
              aria-label="Ir a Acerca de"
            >
              Acerca de
            </Link>
            <Link
              href="/dashboard"
              fontSize="lg"
              fontWeight={500}
              _hover={{ color: "var(--chakra-colors-orange-500)" }}
              aria-label="Ir al Tablero"
            >
              Tablero
            </Link>
            <Text
              color={isLight ? "gray.500" : "gray.200"}
              fontSize="lg"
              fontWeight={500}
              aria-label="Ir al Precios"
            >
              Precios
            </Text>
          </VStack>

          {/** Support section */}
          <VStack gridRow={1} gridColumn={2} align="flex-start" spacing={1}>
            <Text fontSize="xl" fontWeight={600} mb={2}>
              Soporte
            </Text>
            <Link
              href="https://docs-habituo.vercel.app/"
              fontSize="lg"
              fontWeight={500}
              _hover={{ color: "var(--chakra-colors-orange-500)" }}
              rel="noopener noreferrer"
              aria-label="Ver la documentación"
              isExternal
            >
              Documentación
            </Link>
            <Link
              href="/contact"
              fontSize="lg"
              fontWeight={500}
              _hover={{ color: "var(--chakra-colors-orange-500)" }}
              rel="noopener noreferrer"
              aria-label="Ponerse en contacto con Habituo"
            >
              Contacto
            </Link>
            <Link
              href="https://habituo-status.betteruptime.com/"
              fontSize="lg"
              fontWeight={500}
              _hover={{ color: "var(--chakra-colors-orange-500)" }}
              rel="noopener noreferrer"
              aria-label="Ver el estado de los servidores"
              isExternal
            >
              Estado
            </Link>
          </VStack>

          {/** Legal section */}
          <VStack
            gridRow={{ base: 2, md: 1 }}
            gridColumn={{ base: 1, md: 3 }}
            gridColumnEnd={2}
            align="flex-start"
            spacing={1}
          >
            <Text fontSize="xl" fontWeight={600} mb={2}>
              Legal
            </Text>
            <Link
              textAlign="left"
              href="/policy"
              fontSize="lg"
              fontWeight={500}
              _hover={{ color: "var(--chakra-colors-orange-500)" }}
              aria-label="Ver Política de privacidad"
            >
              Política de privacidad
            </Link>
            <Link
              href="/terms"
              fontSize="lg"
              fontWeight={500}
              _hover={{ color: "var(--chakra-colors-orange-500)" }}
              aria-label="Ver Términos de Uso"
            >
              Términos de uso
            </Link>
          </VStack>
        </Grid>
      </Flex>
    </Container>
  );
};

export default Footer;
