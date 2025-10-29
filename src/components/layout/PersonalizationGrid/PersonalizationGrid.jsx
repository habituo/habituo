import {
  Container,
  Grid,
  GridItem,
  Box,
  Text,
  Heading,
  Image,
  HStack,
  useColorMode,
} from "@chakra-ui/react";
import FadeInWhenVisible from "../../../components/animations/FadeInWhenVisible/FadeInWhenVisible";
import customDashboard from "../../../assets/images/illustrations/custom-panel.png";
import viewsSection from "../../../assets/images/views.svg";
import barchartSection from "../../../assets/images/barchart.svg";
import statsSection from "../../../assets/images/stats.svg";
import calendarSection from "../../../assets/images/calendar.svg";
import habitsSection from "../../../assets/images/habits.svg";
import areasSection from "../../../assets/images/areas.svg";
import chronoSection from "../../../assets/images/chrono.svg";

/**
 * Personalization section component
 * Displays different features and customization options for the dashboard
 * Wrapped in a FadeInWhenVisible animation for smooth entrance
 */
const PersonalizationGrid = () => {
  const { colorMode } = useColorMode();
  const isLight = colorMode === "light";

  return (
    <FadeInWhenVisible>
      <Container
        as="section"
        maxW={{ base: "full", md: "5xl" }}
        py={20}
        fontFamily="Outfit"
      >
        {/* Section header */}
        <Box mb={8}>
          <Heading
            as="h2"
            fontSize={{ base: "4xl", md: "5xl", lg: "7xl" }}
            fontWeight={700}
            fontFamily="Outfit"
          >
            Personalización
          </Heading>
          <Text
            color={isLight ? "gray.600" : "gray.400"}
            fontWeight={500}
            fontSize={{ base: "xl", md: "2xl", lg: "2xl" }}
          >
            Personaliza Habituo a tu manera.
          </Text>
        </Box>

        {/* Grid container for cards */}
        <Grid
          templateRows={{ base: "repeat(5, auto)", md: "repeat(3, 1fr)" }}
          templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(3, 1fr)" }}
          gap={6}
        >
          {/* Card: Custom Dashboard */}
          <GridItem
            data-testid="card-custom-dashboard"
            px={8}
            py={{ base: 8, md: 14 }}
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            gap={6}
            rowSpan={{ base: "auto", md: 2 }}
            colSpan={1}
            border="2px solid var(--chakra-colors-chakra-border-color)"
            borderRadius="3xl"
            bg={isLight ? "gray.200" : "gray.800"}
            overflow="hidden"
          >
            <Image
              w="100%"
              src={customDashboard}
              borderRadius="2xl"
              alt="Customizable Dashboard"
              boxShadow="rgba(149, 157, 165, 0.2) 0px 8px 24px"
            />
            <Box>
              <Text fontWeight={600} fontSize="3xl">
                Tu estilo
              </Text>
              <Text
                fontWeight={500}
                fontSize="xl"
                lineHeight="1.1"
                color={isLight ? "gray.600" : "gray.400"}
              >
                Tu panel de control es el centro de tu progreso.
              </Text>
            </Box>
          </GridItem>

          {/* Card: Custom Views */}
          <GridItem
            p={8}
            display="flex"
            flexDirection={{ base: "column", md: "row" }}
            alignItems={{ base: "flex-start", md: "center" }}
            justifyContent="center"
            gap={6}
            rowSpan={1}
            colSpan={{ base: "auto", md: 2 }}
            border="2px solid var(--chakra-colors-chakra-border-color)"
            borderRadius="3xl"
            bg={isLight ? "gray.200" : "gray.800"}
          >
            <Image
              w={{ base: "150px", md: "300px" }}
              src={viewsSection}
              borderRadius="3xl"
              alt="Custom Views"
              boxShadow="rgba(149, 157, 165, 0.2) 0px 8px 24px"
            />
            <Box>
              <Text mb={2} fontWeight={600} fontSize="3xl" lineHeight={1.1}>
                Vistas personalizadas
              </Text>
              <Text
                fontWeight={500}
                fontSize="xl"
                lineHeight="1.1"
                color={isLight ? "gray.600" : "gray.400"}
              >
                Visualiza tus áreas y hábitos como prefieras.
              </Text>
            </Box>
          </GridItem>

          {/* Card: Statistics */}
          <GridItem
            p={8}
            display="flex"
            flexDirection="column"
            alignItems="flex-start"
            justifyContent="center"
            gap={4}
            rowSpan={1}
            colSpan={{ base: "auto", md: 2 }}
            border="2px solid var(--chakra-colors-chakra-border-color)"
            borderRadius="3xl"
            bg={isLight ? "gray.200" : "gray.800"}
            overflowX="hidden"
          >
            <HStack
              alignItems="center"
              justifyContent={{ base: "flex-start", md: "center" }}
              spacing={4}
            >
              <Image
                h={{ base: "150px", sm: "200px" }}
                src={barchartSection}
                borderRadius="2xl"
                alt="Progress Bar Chart"
                boxShadow="rgba(149, 157, 165, 0.2) 0px 8px 24px"
              />
              <Image
                h={{ base: "150px", sm: "200px" }}
                src={statsSection}
                borderRadius="2xl"
                alt="Statistics Panel"
                boxShadow="rgba(149, 157, 165, 0.2) 0px 8px 24px"
              />
              <Image
                h={{ base: "150px", sm: "200px" }}
                src={calendarSection}
                borderRadius="2xl"
                alt="Habits Calendar"
                boxShadow="rgba(149, 157, 165, 0.2) 0px 8px 24px"
                display={{ base: "none", sm: "block" }}
              />
            </HStack>
            <Box>
              <Text fontWeight={600} fontSize="3xl">
                Estadísticas
              </Text>
              <Text
                fontWeight={500}
                fontSize="xl"
                lineHeight="1.1"
                color={isLight ? "gray.600" : "gray.400"}
              >
                Sigue tu progreso con un calendario y gráficos.
              </Text>
            </Box>
          </GridItem>

          {/* Card: Areas & Habits */}
          <GridItem
            p={8}
            display="flex"
            flexDirection="column"
            alignItems="flex-start"
            justifyContent="center"
            gap={6}
            rowSpan={1}
            colSpan={{ base: "auto", md: 2 }}
            border="2px solid var(--chakra-colors-chakra-border-color)"
            borderRadius="3xl"
            bg={isLight ? "gray.200" : "gray.800"}
            overflow="hidden"
          >
            <HStack alignItems="center" justifyContent="flex-start" spacing={4}>
              <Image
                h={{ base: "150px", sm: "200px", lg: "180px" }}
                src={habitsSection}
                borderRadius="2xl"
                alt="Habits Management"
                boxShadow="rgba(149, 157, 165, 0.2) 0px 8px 24px"
                zIndex={1}
              />
              <Image
                h={{ base: "150px", sm: "200px", lg: "180px" }}
                src={areasSection}
                borderRadius="2xl"
                alt="Areas Management"
                boxShadow="rgba(149, 157, 165, 0.2) 0px 8px 24px"
                zIndex={2}
              />
            </HStack>
            <Box>
              <Text fontWeight={600} fontSize="3xl">
                Áreas y hábitos
              </Text>
              <Text
                fontWeight={500}
                fontSize="xl"
                lineHeight="1.1"
                color={isLight ? "gray.600" : "gray.400"}
              >
                Crea y modifica áreas y hábitos a tu gusto.
              </Text>
            </Box>
          </GridItem>

          {/* Card: Timer */}
          <GridItem
            p={8}
            display="flex"
            flexDirection="column"
            alignItems={{ base: "flex-start", md: "center" }}
            justifyContent="center"
            gap={6}
            rowSpan={1}
            colSpan={1}
            border="2px solid var(--chakra-colors-chakra-border-color)"
            borderRadius="3xl"
            bg={isLight ? "gray.200" : "gray.800"}
            overflow="hidden"
          >
            <Image
              h={{ base: "150px", md: "180px" }}
              src={chronoSection}
              borderRadius="2xl"
              alt="Timer"
              boxShadow="rgba(149, 157, 165, 0.2) 0px 8px 24px"
              zIndex={2}
            />
            <Box>
              <Text fontWeight={600} fontSize="3xl">
                Temporizador
              </Text>
              <Text
                fontWeight={500}
                fontSize="xl"
                lineHeight="1.1"
                color={isLight ? "gray.600" : "gray.400"}
              >
                Controla tu tiempo cuando lo necesites.
              </Text>
            </Box>
          </GridItem>
        </Grid>
      </Container>
    </FadeInWhenVisible>
  );
};

export default PersonalizationGrid;
