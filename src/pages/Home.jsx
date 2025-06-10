import {
  Link,
  Container,
  HStack,
  VStack,
  Text,
  Image,
  Button,
  SimpleGrid,
  Box,
  useColorMode,
  Heading,
  AccordionIcon,
  AccordionPanel,
  AccordionButton,
  AccordionItem,
  Accordion,
} from "@chakra-ui/react";
import { Navbar, Footer, CookiesBanner } from "../routes/index";
import dataAnalysis from "../assets/images/illustrations/data-analysis.svg";
import customDashboard from "../assets/images/illustrations/custom-dashboard.svg";
import areasSection from "../assets/images/areas.svg";
import habitsSection from "../assets/images/habits.svg";
import calendarSection from "../assets/images/calendar.svg";
import statsSection from "../assets/images/stats.svg";
import barchartSection from "../assets/images/barchart.svg";
import chronoSection from "../assets/images/chrono.svg";
import viewsSection from "../assets/images/views.svg";
import allAreasSection from "../assets/images/all-areas.svg";
import allHabitsSection from "../assets/images/all-habits.svg";
import { useTheme } from "../context/ThemeContext";

const FeatureCard = ({ title, description, children, ...rest }) => {
  const { colorMode } = useColorMode();
  const { themeOptions } = useTheme();
  const isLight = colorMode === "light" ? true : false;

  return (
    <VStack
      pt={{ base: 14, lg: 20 }}
      pb={10}
      px={4}
      borderRadius={themeOptions.borderRadius}
      bg={isLight ? "gray.100" : "gray.900"}
      spacing={5}
      flexDirection="column"
      justifyContent="flex-end"
      textAlign="center"
      {...rest}
    >
      {children}
      <Heading
        as="h3"
        fontSize={{ base: "xl", sm: "2xl", lg: "3xl" }}
        fontWeight={600}
        color={colorMode === "light" ? "black" : "white"}
        fontFamily={themeOptions.fontFamily}
      >
        {title}
      </Heading>
      <Text
        maxW="90%"
        textAlign="center"
        fontSize={{ base: "md", sm: "lg", lg: "xl" }}
        fontWeight={400}
        color={isLight ? "gray.600" : "gray.400"}
        fontFamily={themeOptions.fontFamily}
      >
        {description}
      </Text>
    </VStack>
  );
};

const Home = () => {
  const { colorMode } = useColorMode();
  const { themeOptions } = useTheme();
  const isLight = colorMode === "light" ? true : false;
  const textColor = isLight ? `var(--chakra-colors-${themeOptions.focusColor}-500)` : `var(--chakra-colors-${themeOptions.focusColor}-200)`;

  const faqItems = [
    {
      question: "¿Qué es Habituo y cómo me ayuda a construir hábitos?",
      answer:
        "Habituo es una plataforma diseñada para ayudarte a construir y mantener hábitos saludables. Te permite establecer metas, registrar tu progreso diario, visualizar tu consistencia a través de gráficos y recibir recordatorios para mantenerte en el camino. Al hacer visible tu avance, te mantiene motivado y facilita la creación de rutinas duraderas.",
    },
    {
      question: "¿Puedo personalizar mis hábitos en Habituo?",
      answer:
        "¡Absolutamente! Habituo te ofrece total flexibilidad. Puedes crear hábitos para cualquier área de tu vida (salud, finanzas, desarrollo personal, etc.), establecer la frecuencia (diaria, semanal, etc.), el objetivo (ej. 'beber 8 vasos de agua'), y el tipo de seguimiento que prefieras (cuantitativo, binario).",
    },
    {
      question: "¿Es Habituo gratuito?",
      answer:
        "Sí, Habituo ofrece una versión gratuita con funcionalidades esenciales para que puedas empezar a construir tus hábitos hoy mismo. También puede haber planes premium con características avanzadas para aquellos que buscan un seguimiento más profundo y herramientas adicionales. ¡Puedes probarlo gratis sin compromiso!",
    },
    {
      question: "¿Necesito conocimientos técnicos para usar Habituo?",
      answer:
        "Para nada. Habituo está diseñado pensando en la simplicidad y la facilidad de uso. Su interfaz intuitiva te permite crear y seguir hábitos con solo unos pocos clics, sin necesidad de conocimientos técnicos. Si sabes usar una aplicación móvil o una página web básica, ya estás listo para usar Habituo.",
    },
    {
      question: "¿Puedo usar Habituo en diferentes dispositivos?",
      answer:
        "Habituo es una aplicación web, lo que significa que puedes acceder a ella desde cualquier dispositivo con un navegador de internet (ordenador, tablet, smartphone). Tu progreso se sincroniza en la nube, así que siempre tendrás tus datos actualizados, estés donde estés.",
    },
  ];

  return (
    <>
      <Navbar />

      <Container
        as="main"
        maxW="7xl"
        py={{ base: 16, md: 20, lg: 24 }}
        bg={isLight ? "gray.100" : "gray.900"}
      >
        <VStack spacing={{ base: 6, md: 8, lg: 10 }}>
          <Heading
            as="h1"
            maxW={{ base: "100%", md: "800px", lg: "1000px" }}
            fontSize={{ base: "4xl", md: "6xl", lg: "7xl" }}
            fontWeight={900}
            lineHeight={{ base: "1.1", md: "1.1", lg: "1.1" }}
            textAlign="center"
            color={colorMode === "light" ? "black" : "white"}
            fontFamily={themeOptions.fontFamily}
          >
            Deja de soñar, empieza a{" "}
            <Text as="span" color={textColor}>
              construir
            </Text>
          </Heading>
          <Text
            fontSize={{ base: "lg", md: "xl", lg: "2xl" }}
            fontWeight={400}
            textAlign="center"
            maxW={{ base: "90%", md: "600px", lg: "700px" }}
            color={isLight ? "gray.600" : "gray.300"}
            fontFamily={themeOptions.fontFamily}
          >
            Tu plataforma para hábitos que te impulsan al éxito. Construye tu
            mejor versión con{" "}
            <Text as="span" fontWeight={600}>
              Habituo
            </Text>
            .
          </Text>
          <Button
            as={Link}
            href="/register"
            p={{ base: 6, lg: 8 }}
            fontSize={{ base: "lg", lg: "xl" }}
            variant="solid"
            fontFamily={themeOptions.fontFamily}
            colorScheme={themeOptions.focusColor}
            fontWeight={600}
            borderRadius={themeOptions.borderRadius}
            _focusVisible="none"
            _hover={{
              textDecoration: "none",
              transform: "translateY(-2px)",
              boxShadow: "lg",
            }}
            _active={{
              transform: "translateY(0)",
              boxShadow: "md",
            }}
            transition="all 0.2s ease-in-out"
            aria-label="Probar Habituo gratis"
          >
            Probar Habituo gratis
          </Button>
        </VStack>
      </Container>

      <Container as="section" maxW="7xl" py={{ base: 10, md: 16, lg: 20 }}>
        <HStack
          flexDirection={{ base: "column", lg: "row" }}
          spacing={{ base: 10, lg: 16 }}
        >
          <VStack
            w={{ base: "100%", lg: "50%" }}
            alignItems={{ base: "center", lg: "flex-start" }}
            maxW={{ base: "xl", lg: "none" }}
            spacing={{ base: 6, lg: 8 }}
            textAlign={{ base: "center", lg: "left" }}
          >
            <Heading
              as="h2"
              fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
              fontWeight={600}
              lineHeight="shorter"
              color={isLight ? "black" : "white"}
              fontFamily={themeOptions.fontFamily}
            >
              El mejor tracker de hábitos para alcanzar tus metas
            </Heading>
            <Text
              fontSize={{ base: "md", md: "lg", lg: "xl" }}
              fontWeight={400}
              lineHeight="tall"
              color={isLight ? "gray.600" : "gray.300"}
              fontFamily={themeOptions.fontFamily}
            >
              Convierte tus objetivos en hábitos duraderos. Con{" "}
              <Text as="span" fontWeight={600} color={textColor}>
                Habituo
              </Text>
              , diseña tu rutina ideal, ajusta recordatorios y haz un
              seguimiento detallado de tu progreso con métricas visuales y
              análisis inteligentes.
            </Text>
          </VStack>
          <VStack
            w={{ base: "100%", lg: "50%" }}
            maxW={{ base: "2xl", lg: "none" }}
          >
            <Image
              src={dataAnalysis}
              alt="Análisis de datos de hábitos"
              objectFit="contain"
            />
          </VStack>
        </HStack>
      </Container>

      <Container as="section" maxW="7xl" py={{ base: 10, md: 16, lg: 20 }}>
        <HStack
          flexDirection={{ base: "column-reverse", lg: "row" }}
          spacing={{ base: 10, lg: 16 }}
        >
          <VStack
            w={{ base: "100%", lg: "50%" }}
            maxW={{ base: "2xl", lg: "none" }}
          >
            <Image
              src={customDashboard}
              alt="Dashboard personalizable"
              objectFit="contain"
            />
          </VStack>
          <VStack
            w={{ base: "100%", lg: "50%" }}
            alignItems={{ base: "center", lg: "flex-end" }}
            maxW={{ base: "xl", lg: "none" }}
            spacing={{ base: 6, lg: 8 }}
            textAlign={{ base: "center", lg: "right" }}
          >
            <Heading
              as="h2"
              fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
              fontWeight={600}
              lineHeight="shorter"
              color={isLight ? "black" : "white"}
              fontFamily={themeOptions.fontFamily}
            >
              Un dashboard a tu estilo
            </Heading>
            <Text
              fontSize={{ base: "md", md: "lg", lg: "xl" }}
              fontWeight={400}
              lineHeight="tall"
              color={isLight ? "gray.600" : "gray.300"}
              fontFamily={themeOptions.fontFamily}
            >
              Tu dashboard es el centro de tu progreso. Personaliza la vista
              para que te resulte intuitiva y eficiente, dándote el control
              total sobre cómo gestionas tus hábitos diarios. Ya sea con un
              estilo minimalista o con un toque de color vibrante,{" "}
              <Text as="span" fontWeight={600} color={textColor}>
                Habituo
              </Text>{" "}
              se adapta a ti.
            </Text>
          </VStack>
        </HStack>
      </Container>

      <Container as="section" maxW="full" py={{ base: 10, lg: 20 }}>
        <VStack
          px={{ base: 5, lg: 10 }}
          py={{ base: 10, lg: 20 }}
          spacing={{ base: 10, lg: 20 }}
          bg={isLight ? "gray.50" : "gray.900"}
          borderRadius={themeOptions.borderRadius}
        >
          <VStack w="100%" maxW="3xl" spacing={4}>
            <Heading
              as="h2"
              fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
              fontWeight={600}
              lineHeight="shorter"
              textAlign="center"
              color={isLight ? "black" : "white"}
              fontFamily={themeOptions.fontFamily}
            >
              Mantente activo con tus progresos
            </Heading>
            <Text
              fontSize={{ base: "md", md: "lg", lg: "xl" }}
              fontWeight={400}
              lineHeight="tall"
              textAlign="center"
              color={isLight ? "gray.600" : "gray.300"}
              fontFamily={themeOptions.fontFamily}
            >
              La ciencia ha demostrado que observar cómo avanzas aumenta
              considerablemente tus posibilidades de crear y mantener costumbres
              positivas. Impulsa tu camino con datos reveladores, celebra cada
              logro, por pequeño que sea, y mantén viva la motivación en tu
              búsqueda del éxito.
            </Text>
          </VStack>
          <SimpleGrid w="100%" columns={{ base: 1, md: 2 }} spacing={6}>
            <FeatureCard
              title="Áreas & Hábitos"
              description="Crea y modifica a tu antojo las áreas y hábitos que desees"
              gridColumn={{ base: "span 1", md: "span 2", xl: "span 1" }}
            >
              <HStack mb={5} spacing={-10} alignItems="flex-end">
                <Image
                  w={{ base: "150px", sm: "200px", lg: "220px" }}
                  src={habitsSection}
                  borderRadius="2xl"
                  alt="Gestión de hábitos"
                  transform="rotate(-10deg) translateX(30px) translateY(10px)"
                  boxShadow="rgba(149, 157, 165, 0.2) 0px 8px 24px"
                  zIndex={1}
                />
                <Image
                  w={{ base: "150px", sm: "200px", lg: "220px" }}
                  src={areasSection}
                  borderRadius="2xl"
                  alt="Gestión de áreas"
                  transform="rotate(10deg) translateX(-30px) translateY(-10px)"
                  boxShadow="rgba(149, 157, 165, 0.2) 0px 8px 24px"
                  zIndex={2}
                />
              </HStack>
            </FeatureCard>
            <FeatureCard
              title="Estadísticas"
              description="Visualiza tu progreso con un calendario y datos mostrados en gráficos"
              gridColumn={{ base: "span 1", md: "span 2", xl: "span 1" }}
            >
              <HStack
                py={7}
                alignItems="center"
                justifyContent="center"
                overflowX="hidden"
                maxW="100%"
              >
                <Image
                  h={{ base: "180px", sm: "220px", lg: "250px" }}
                  src={barchartSection}
                  borderRadius="2xl"
                  alt="Gráfico de barras de progreso"
                  boxShadow="rgba(149, 157, 165, 0.2) 0px 8px 24px"
                />
                <Image
                  h={{ base: "180px", sm: "220px", lg: "250px" }}
                  src={statsSection}
                  borderRadius="2xl"
                  alt="Panel de estadísticas"
                  boxShadow="rgba(149, 157, 165, 0.2) 0px 8px 24px"
                  display={{ base: "none", sm: "block" }}
                />
                <Image
                  h={{ base: "180px", sm: "220px", lg: "250px" }}
                  src={calendarSection}
                  borderRadius="2xl"
                  alt="Calendario de hábitos"
                  boxShadow="rgba(149, 157, 165, 0.2) 0px 8px 24px"
                  display={{ base: "none", md: "block" }}
                />
              </HStack>
            </FeatureCard>
            <FeatureCard
              title="Tracker de hábitos avanzado"
              description="Tendrás diferentes vistas para tener una mejor visión acerca de tu actividad"
              gridColumn={{ base: "span 1", md: "span 2", xl: "span 2" }}
            >
              <VStack
                spacing={8}
                alignItems="center"
                justifyContent="center"
                position="relative"
                w="full"
                py={5}
              >
                <HStack spacing={-10} justifyContent="center" zIndex={2}>
                  <Image
                    h={{ base: "150px", sm: "180px", lg: "200px" }}
                    src={viewsSection}
                    alt="Vistas personalizadas"
                    borderRadius="2xl"
                    transform="rotate(-10deg) translateX(20px) translateY(10px)"
                    boxShadow="rgba(149, 157, 165, 0.2) 0px 8px 24px"
                    zIndex={1}
                  />
                  <Image
                    h={{ base: "150px", sm: "180px", lg: "200px" }}
                    src={chronoSection}
                    alt="Temporizador de hábitos"
                    borderRadius="2xl"
                    transform="rotate(10deg) translateX(-20px) translateY(-10px)"
                    boxShadow="rgba(149, 157, 165, 0.2) 0px 8px 24px"
                    zIndex={2}
                  />
                </HStack>
                <Image
                  display={{ base: "none", md: "block" }}
                  h={{ base: "200px", lg: "250px" }}
                  src={allAreasSection}
                  alt="Todas las áreas"
                  position="absolute"
                  bottom={0}
                  right={{ md: "5%", lg: "5%" }}
                  borderRadius="2xl"
                  boxShadow="rgba(149, 157, 165, 0.2) 0px 8px 24px"
                  zIndex={0}
                  transform="rotate(5deg)"
                />
                <Image
                  display={{ base: "none", md: "block" }}
                  h={{ base: "200px", lg: "250px" }}
                  src={allHabitsSection}
                  alt="Todos los hábitos"
                  position="absolute"
                  top={0}
                  left={{ md: "5%", lg: "5%" }}
                  borderRadius="2xl"
                  boxShadow="rgba(149, 157, 165, 0.2) 0px 8px 24px"
                  zIndex={0}
                  transform="rotate(-5deg)"
                />
              </VStack>
            </FeatureCard>
          </SimpleGrid>
        </VStack>
      </Container>

      <Container as="section" maxW="7xl" py={{ base: 10, md: 16, lg: 20 }}>
        <HStack
          flexDirection={{ base: "column", lg: "row" }}
          spacing={{ base: 10, lg: 16 }}
          alignItems={{ base: "center", lg: "flex-start" }}
        >
          <VStack
            w={{ base: "100%", lg: "50%" }}
            alignItems={{ base: "center", lg: "flex-start" }}
            maxW={{ base: "xl", lg: "none" }}
            spacing={{ base: 6, lg: 8 }}
            textAlign={{ base: "center", lg: "left" }}
          >
            <Heading
              as="h2"
              fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
              fontWeight={600}
              lineHeight="shorter"
              color={isLight ? "black" : "white"}
              fontFamily={themeOptions.fontFamily}
            >
              Preguntas frecuentes
            </Heading>
            <Text
              fontSize={{ base: "md", md: "lg", lg: "xl" }}
              fontWeight={400}
              lineHeight="tall"
              color={isLight ? "gray.600" : "gray.300"}
              fontFamily={themeOptions.fontFamily}
            >
              ¿Tienes dudas sobre cómo funciona{" "}
              <Text as="span" fontWeight={600} color={textColor}>
                Habituo
              </Text>
              ? Aquí resolvemos las preguntas más comunes para que empieces a
              construir tus hábitos sin demoras.
            </Text>
          </VStack>
          <VStack
            w={{ base: "100%", lg: "50%" }}
            maxW={{ base: "full", lg: "none" }}
            spacing={4}
            mt={{ base: 10, lg: 0 }}
          >
            <Accordion allowToggle width="100%" px={0}>
              {faqItems.map((item, index) => (
                <AccordionItem
                  key={index}
                  bg={isLight ? "white" : "black"}
                  borderRadius={themeOptions.borderRadius}
                  mb={3}
                >
                  <h2>
                    <AccordionButton
                      _expanded={{
                        bg: isLight ? "black" : "white",
                        color: isLight ? "white" : "black",
                      }}
                      py={4}
                      px={5}
                      borderRadius={themeOptions.borderRadius}
                      _hover={{
                        bg: isLight ? "black" : "white",
                        color: isLight ? "white" : "black",
                      }}
                    >
                      <Box
                        as="span"
                        flex="1"
                        textAlign="left"
                        fontSize={{ base: "md", md: "lg" }}
                        fontWeight={600}
                        fontFamily={themeOptions.fontFamily}
                      >
                        {item.question}
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel
                    pb={4}
                    px={5}
                    fontSize={{ base: "sm", md: "md" }}
                    color={isLight ? "gray.700" : "gray.300"}
                    lineHeight="tall"
                    fontFamily={themeOptions.fontFamily}
                  >
                    {item.answer}
                  </AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
          </VStack>
        </HStack>
      </Container>

      <Footer />
      <CookiesBanner />
    </>
  );
};

export default Home;
