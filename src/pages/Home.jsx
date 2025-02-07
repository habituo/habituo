import React from "react";
import {
  ChakraProvider,
  Container,
  HStack,
  VStack,
  Heading,
  Text,
  Image,
} from "@chakra-ui/react";
import { useTheme } from "../context/ThemeContext";
import customTheme from "../theme/theme";
import { Navbar, Footer } from "../routes/index";
import macMockup from "../assets/images/mac-mockup.webp";
import customThemeIMG from "../assets/images/custom-theme.webp";

const Home = () => {
  const { themeOptions, updateTheme } = useTheme();

  return (
    <ChakraProvider
      theme={customTheme(
        themeOptions.focusColor,
        themeOptions.fontFamily,
        themeOptions.borderRadius
      )}
    >
      <Navbar onUpdateTheme={updateTheme} />

      <Container as="main" maxW="7xl" py={{ base: 50, md: 50, lg: 200 }}>
        <HStack
          flexDirection={{ base: "column", lg: "row" }}
          gap={{ base: 20, lg: 10, xl: 0 }}
        >
          <VStack
            align={{ base: "start", lg: "center" }}
            w={{ base: "100%", lg: "50%" }}
            maxW={{ base: "3xl" }}
            spacing={5}
          >
            <Heading
              as="h1"
              size="3xl"
              textAlign={{ base: "center", lg: "left" }}
              fontFamily={themeOptions.fontFamily}
            >
              El mejor tracker de hábitos para alcanzar tus metas
            </Heading>
            <Text
              as="p"
              fontSize="md"
              textAlign={{ base: "center", lg: "left" }}
            >
              Convierte tus objetivos en hábitos duraderos. Con{" "}
              <Text as="span" fontWeight="bold">
                Habituo
              </Text>
              , diseña tu rutina ideal, ajusta recordatorios y haz un
              seguimiento detallado de tu progreso con métricas visuales y
              análisis inteligentes.
            </Text>
          </VStack>
          <VStack w={{ base: "100%", lg: "50%" }} maxW={{ base: "3xl" }}>
            <Image
              src={macMockup}
              filter="drop-shadow(0px 10px 50px rgba(0, 0, 0, 0.5))"
              alt="Mockup de la interfaz de Habituo en una Mac"
            />
          </VStack>
        </HStack>
      </Container>

      <Container as="main" maxW="7xl" py={{ base: 50, md: 100, lg: 200 }}>
        <HStack
          flexDirection={{ base: "column", lg: "row" }}
          gap={{ base: 10, xl: 0 }}
        >
          <VStack
            w={{ base: "100%", lg: "60%" }}
            maxW={{ base: "3xl" }}
            align={{ base: "center", lg: "start" }}
            spacing={5}
          >
            <Heading
              as="h2"
              size="2xl"
              textAlign={{ base: "center", lg: "left" }}
              fontFamily={themeOptions.fontFamily}
            >
              Un dashboard a tu estilo
            </Heading>
            <Text
              as="p"
              fontSize="md"
              maxW="600px"
              textAlign={{ base: "center", lg: "left" }}
            >
              Tu dashboard es el centro de tu progreso. Personaliza la vista
              para que te resulte intuitiva y eficiente, dándote el control
              total sobre cómo gestionas tus hábitos diarios. Ya sea con un
              estilo minimalista o con un toque de color vibrante,{" "}
              <Text as="span" fontWeight="bold">
                Habituo
              </Text>{" "}
              se adapta a ti.
            </Text>
          </VStack>
          <VStack w={{ base: "100%", lg: "40%" }} maxW={{ base: "3xl" }}>
            <Image
              w={{ base: "400px", lg: "auto" }}
              src={customThemeIMG}
              alt="Ejemplo de personalización del tema en Habituo"
            />
          </VStack>
        </HStack>
      </Container>

      <Footer onUpdateTheme={updateTheme} />
    </ChakraProvider>
  );
};

export default Home;
