import React from "react";

import {
  ChakraProvider,
  Container,
  HStack,
  VStack,
  Text,
  Image,
  Button,
  SimpleGrid,
  Box,
} from "@chakra-ui/react";
import { Navbar, Footer } from "../routes/index";
import dataAnalysis from "../assets/images/data-analysis.svg";
import customDashboard from "../assets/images/custom-dashboard.svg";
import areasSection from "../assets/images/areas.svg";
import habitsSection from "../assets/images/habits.svg";
import calendarSection from "../assets/images/calendar.svg";
import statsSection from "../assets/images/stats.svg";
import barchartSection from "../assets/images/barchart.svg";
import chronoSection from "../assets/images/chrono.svg";
import viewsSection from "../assets/images/views.svg";
import allAreasSection from "../assets/images/all-areas.svg";
import allHabitsSection from "../assets/images/all-habits.svg";

const Home = () => {
  return (
    <>
      <Navbar />

      <Container as="main" maxW="7xl" py={{ base: 10, md: 50, lg: 100 }}>
        <VStack spacing={{ base: 8, lg: 10 }}>
          <Text
            as="h1"
            maxW={{ base: "100%", md: "600px", lg: "900px" }}
            fontSize={{ base: "50px", md: "80px", lg: "90px" }}
            fontWeight={900}
            lineHeight={{ base: "50px", md: "80px", lg: "90px" }}
            textAlign="center"
          >
            Deja de soñar, empieza a construir
          </Text>
          <Text
            as="p"
            fontSize={{ base: "18px", lg: "20px" }}
            fontWeight={400}
            textAlign="center"
            maxW={{ base: "100%", md: "500px", lg: "500px" }}
          >
            Tu plataforma para hábitos que te impulsan al éxito. Construye tu
            mejor versión con Habituo.
          </Text>
          <Button
            p={{ base: 6, lg: 8 }}
            fontSize={{ base: "md", lg: "lg" }}
            fontWeight={400}
            variant="solid"
            colorScheme="orange"
            onClick={() => (window.location.href = "/register")}
            borderRadius="3xl"
            _focusVisible="none"
          >
            Probar Habituo gratis
          </Button>
        </VStack>
      </Container>

      <Container as="section" maxW="7xl" py={{ base: 10, lg: 50 }}>
        <HStack flexDirection={{ base: "column", lg: "row" }} spacing={0}>
          <VStack
            w={{ base: "100%", lg: "50%" }}
            alignItems={{ base: "center", lg: "flex-start" }}
            maxW={{ base: "3xl" }}
            spacing={{ base: 5, lg: 10 }}
          >
            <Text
              as="h2"
              fontSize={{ base: "30px", md: "35px", lg: "40px" }}
              fontWeight={600}
              lineHeight={{ base: "30px", md: "35px", lg: "40px" }}
              textAlign={{ base: "center", lg: "left" }}
            >
              El mejor tracker de hábitos para alcanzar tus metas
            </Text>
            <Text
              as="p"
              fontSize={{ base: "14px", md: "16px", lg: "18px" }}
              fontWeight={400}
              lineHeight={{ base: "20px", md: "24px", lg: "26px" }}
              textAlign={{ base: "center", lg: "left" }}
            >
              Convierte tus objetivos en hábitos duraderos. Con{" "}
              <Text as="span" fontWeight={600}>
                Habituo
              </Text>
              , diseña tu rutina ideal, ajusta recordatorios y haz un
              seguimiento detallado de tu progreso con métricas visuales y
              análisis inteligentes.
            </Text>
          </VStack>
          <VStack w={{ base: "100%", lg: "50%" }} maxW={{ base: "3xl" }}>
            <Image src={dataAnalysis}></Image>
          </VStack>
        </HStack>
      </Container>

      <Container as="section" maxW="7xl" py={{ base: 10, lg: 50 }}>
        <HStack
          flexDirection={{ base: "column-reverse", lg: "row" }}
          spacing={0}
        >
          <VStack w={{ base: "100%", lg: "50%" }} maxW={{ base: "3xl" }}>
            <Image src={customDashboard}></Image>
          </VStack>
          <VStack
            w={{ base: "100%", lg: "50%" }}
            alignItems={{ base: "center", lg: "flex-end" }}
            maxW={{ base: "3xl" }}
            spacing={{ base: 5, lg: 10 }}
          >
            <Text
              as="h2"
              fontSize={{ base: "30px", md: "35px", lg: "40px" }}
              fontWeight={600}
              lineHeight={{ base: "30px", md: "35px", lg: "40px" }}
              textAlign={{ base: "center", lg: "right" }}
            >
              Un dashboard a tu estilo
            </Text>
            <Text
              as="p"
              fontSize={{ base: "14px", md: "16px", lg: "18px" }}
              fontWeight={400}
              lineHeight={{ base: "20px", md: "24px", lg: "26px" }}
              textAlign={{ base: "center", lg: "right" }}
            >
              Tu dashboard es el centro de tu progreso. Personaliza la vista
              para que te resulte intuitiva y eficiente, dándote el control
              total sobre cómo gestionas tus hábitos diarios. Ya sea con un
              estilo minimalista o con un toque de color vibrante,{" "}
              <Text as="span" fontWeight="600">
                Habituo
              </Text>{" "}
              se adapta a ti.
            </Text>
          </VStack>
        </HStack>
      </Container>

      <Container
        as="section"
        maxW="100%"
        px={{ base: 5, lg: 10 }}
        py={{ base: 10, lg: 50 }}
      >
        <VStack
          px={{ base: 5, lg: 10 }}
          py={{ base: 10, lg: 20 }}
          spacing={{ base: 10, lg: 20 }}
          bg="transparent"
          backgroundColor="#00000010"
          borderRadius="3xl"
        >
          <VStack w="100%" maxW="3xl" spacing={4}>
            <Text
              as="h2"
              fontSize={{ base: "30px", md: "35px", lg: "40px" }}
              fontWeight={600}
              lineHeight={{ base: "30px", md: "35px", lg: "40px" }}
              textAlign="center"
            >
              Mantente activo con tus progresos
            </Text>
            <Text
              as="p"
              fontSize={{ base: "14px", md: "16px", lg: "18px" }}
              fontWeight={400}
              lineHeight={{ base: "20px", md: "24px", lg: "26px" }}
              textAlign="center"
            >
              La ciencia ha demostrado que observar cómo avanzas aumenta
              considerablemente tus posibilidades de crear y mantener costumbres
              positivas.
              <br />
              Impulsa tu camino con datos reveladores, celebra cada logro, por
              pequeño que sea, y mantén viva la motivación en tu búsqueda del
              éxito.
            </Text>
          </VStack>
          <SimpleGrid
            w={{ base: "100%", lg: "100%", xl: "70%" }}
            columns={{ base: 1, lg: 2 }}
            gap={4}
          >
            <Box
              pt={{ base: 14, lg: 20 }}
              pb={10}
              gridColumnStart={1}
              gridColumnEnd={{ base: 3, lg: 2 }}
              borderRadius="3xl"
              bg="rgb(255, 255, 255)"
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="flex-end"
              gap={5}
            >
              <HStack mb={5}>
                <Image
                  w="200px"
                  src={habitsSection}
                  borderRadius="25px"
                  alt="Hábitos"
                  transform={{
                    base: "rotate(-10deg) translate3d(40px, -20px, 0)",
                    sm: "rotate(-10deg) translateX(30px)",
                    lg: "rotate(-10deg) translateX(50px)",
                  }}
                  boxShadow="rgba(149, 157, 165, 0.2) 0px 8px 24px"
                />
                <Image
                  w="200px"
                  src={areasSection}
                  borderRadius="25px"
                  alt="Áreas"
                  transform={{
                    base: "rotate(10deg) translate3d(-140px, 20px, 0)",
                    sm: "rotate(10deg) translateX(-30px)",
                    lg: "rotate(10deg) translateX(-50px)",
                  }}
                  boxShadow="rgba(149, 157, 165, 0.2) 0px 8px 24px"
                />
              </HStack>
              <Text
                as="h3"
                fontSize={{ base: "22px", sm: "24px", lg: "30px" }}
                lineHeight={{ base: "22px", sm: "24px", lg: "30px" }}
                fontWeight={600}
                color="rgb(0, 0, 0)"
              >
                Áreas & Hábitos
              </Text>
              <Text
                maxW="80%"
                textAlign="center"
                fontSize={{ base: "16px", sm: "18px", lg: "20px" }}
                lineHeight={{ base: "16px", sm: "18px", lg: "20px" }}
                fontWeight={400}
                color="rgba(0, 0, 0, .6)"
              >
                Crea y modifica a tu antojo las áreas y hábitos que desees
              </Text>
            </Box>
            <Box
              pt={13}
              pb={10}
              gridColumnStart={{ base: 1, md: 2 }}
              gridColumnEnd={3}
              borderRadius="3xl"
              bg="rgb(255, 255, 255)"
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="flex-end"
              gap={5}
            >
              <HStack
                py={7}
                alignItems="center"
                justifyContent="center"
                overflowX="hidden"
              >
                <Image
                  h="250px"
                  src={barchartSection}
                  borderRadius="3xl"
                  alt="Gráfico de barras"
                  boxShadow="rgba(149, 157, 165, 0.2) 0px 8px 24px"
                />
                <Image
                  h="250px"
                  src={statsSection}
                  borderRadius="3xl"
                  alt="Estadísticas"
                  boxShadow="rgba(149, 157, 165, 0.2) 0px 8px 24px"
                />
                <Image
                  h="250px"
                  src={calendarSection}
                  borderRadius="3xl"
                  alt="Calendario"
                  boxShadow="rgba(149, 157, 165, 0.2) 0px 8px 24px"
                />
              </HStack>
              <Text
                as="h3"
                fontSize={{ base: "22px", sm: "24px", lg: "30px" }}
                lineHeight={{ base: "22px", sm: "24px", lg: "30px" }}
                fontWeight={600}
                color="rgb(0, 0, 0)"
              >
                Estadísticas
              </Text>
              <Text
                maxW="80%"
                textAlign="center"
                fontSize={{ base: "16px", sm: "18px", lg: "20px" }}
                lineHeight={{ base: "16px", sm: "18px", lg: "20px" }}
                fontWeight={400}
                color="rgba(0, 0, 0, .6)"
              >
                Visualiza tu progreso con un calendario y datos mostrados en
                gráficos
              </Text>
            </Box>
            <HStack
              px={10}
              pt={20}
              pb={10}
              gridColumnStart={1}
              gridColumnEnd={3}
              borderRadius="3xl"
              bg="rgb(255, 255, 255)"
              spacing={20}
              position="relative"
              overflow="hidden"
            >
              <VStack spacing={180} align="start">
                <HStack w="100%" alignItems="start" justifyContent={{base: "center", md: "start"}}>
                  <Image
                    h="200px"
                    src={viewsSection}
                    alt="Vistas personalizadas"
                    borderRadius="25px"
                    transform={{
                      base: "rotate(-10deg) translate3d(0px, -30px, 0)",
                      sm: "rotate(-10deg)",
                      lg: "rotate(-10deg) translateX(40px)",
                    }}
                    boxShadow="rgba(149, 157, 165, 0.2) 0px 8px 24px"
                  />
                  <Image
                    h="200px"
                    src={chronoSection}
                    alt="Temporizador"
                    borderRadius="25px"
                    transform="rotate(10deg) translate(-40px, 20px)"
                    boxShadow="rgba(149, 157, 165, 0.2) 0px 8px 24px"
                  />
                </HStack>
                <Box
                  w={{base: "100%", md: "80%"}}
                  display="flex"
                  flexDirection="column"
                  alignItems="flex-start"
                  justifyContent="flex-start"
                  gap={5}
                  textAlign={{base: "center", md: "left"}}
                >
                  <Text
                    as="h3"
                    fontSize={{base: "22px", sm: "24px", lg: "30px"}}
                lineHeight={{base: "22px", sm: "24px", lg: "30px"}}
                    fontWeight={600}
                    color="rgb(0, 0, 0)"
                  >
                    Tracker de hábitos avanzado
                  </Text>
                  <Text
                    fontSize={{base: "16px", sm: "18px", lg: "20px"}}
                    lineHeight={{base: "16px", sm: "18px", lg: "20px"}}
                    fontWeight={400}
                    color="rgba(0, 0, 0, .6)"
                  >
                    Tendrás diferentes vistas para tener una mejor visión acerca
                    de tu actividad
                  </Text>
                </Box>
              </VStack>
              <Image
                display={{ base: "none", md: "block" }}
                bottom={40}
                right={-20}
                h="300px"
                src={allAreasSection}
                alt="Todas las areas"
                position="absolute"
                borderRadius="25px"
                boxShadow="rgba(149, 157, 165, 0.2) 0px 8px 24px"
              />
              <Image
                display={{ base: "none", md: "block" }}
                bottom={-10}
                right={-10}
                h="300px"
                src={allHabitsSection}
                alt="Todos los hábitos"
                position="absolute"
                borderRadius="25px"
                boxShadow="rgba(149, 157, 165, 0.2) 0px 8px 24px"
              />
            </HStack>
          </SimpleGrid>
        </VStack>
      </Container>

      <Footer />
    </>
  );
};

export default Home;
