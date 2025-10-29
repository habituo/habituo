import {
  Box,
  Container,
  Heading,
  Text,
  Grid,
  GridItem,
  Flex,
} from "@chakra-ui/react";
import FadeInWhenVisible from "../../animations/FadeInWhenVisible/FadeInWhenVisible";

/**
 * Component that displays the "Complete the Week" section
 *
 * @param {boolean} isLight - Determines if the theme is light or dark
 */
const CompleteWeek = ({ isLight = true }) => {
  return (
    <FadeInWhenVisible>
      <Container
        as="section"
        maxW={{ base: "full", md: "5xl" }}
        py={20}
        fontFamily="Outfit"
      >
        {/* Title and description */}
        <Box mb={8}>
          <Heading
            as="h2"
            fontSize={{ base: "4xl", md: "6xl", lg: "7xl" }}
            fontWeight={700}
            fontFamily="Outfit"
          >
            Completa la semana
          </Heading>
          <Text
            color={isLight ? "gray.600" : "gray.400"}
            fontWeight={500}
            fontSize={{ base: "lg", md: "xl", lg: "2xl" }}
          >
            Consigue resultados completando las metas.
          </Text>
        </Box>

        <Grid
          templateRows={{ base: "repeat(3, auto)", md: "repeat(2, 1fr)" }}
          templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(3, 1fr)" }}
          gap={6}
        >
          {/* Streak of days */}
          <GridItem
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
          >
            <Box
              w="100%"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Box
                w="180px"
                h="180px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                border="8px solid black"
                borderRadius="full"
              >
                <Text
                  textAlign="center"
                  fontWeight={800}
                  fontSize="6xl"
                  lineHeight="none"
                >
                  4
                </Text>
              </Box>
            </Box>
            <Text
              textAlign="center"
              fontWeight={600}
              fontSize="4xl"
              lineHeight="1.2"
            >
              Aumenta la racha de días
            </Text>
          </GridItem>

          {/* Days of week */}
          <GridItem
            p={8}
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            gap={4}
            rowSpan={1}
            colSpan={{ base: 1, md: 2 }}
            border="2px solid var(--chakra-colors-chakra-border-color)"
            borderRadius="3xl"
            bg={isLight ? "gray.200" : "gray.800"}
          >
            <Flex flexDirection="row" flexWrap="wrap" gap={4}>
              {[
                "Lunes",
                "Martes",
                "Miércoles",
                "Jueves",
                "Viernes",
                "Sábado",
                "Domingo",
              ].map((day) => (
                <Box
                  key={day}
                  px={6}
                  py={2}
                  fontSize="2xl"
                  fontWeight={500}
                  lineHeight="1.4"
                  bg={
                    day === "Martes" || day === "Domingo"
                      ? "var(--chakra-colors-orange-500)"
                      : isLight
                      ? "gray.300"
                      : "gray.700"
                  }
                  border={
                    day === "Martes" || day === "Domingo"
                      ? "2px solid var(--chakra-colors-orange-500)"
                      : "2px solid var(--chakra-colors-chakra-border-color)"
                  }
                  borderRadius="full"
                >
                  {day}
                </Box>
              ))}
            </Flex>
          </GridItem>

          {/* Question about remaining days */}
          <GridItem
            p={8}
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            gap={4}
            rowSpan={1}
            colSpan={{ base: 1, md: 2 }}
            border="2px solid var(--chakra-colors-chakra-border-color)"
            borderRadius="3xl"
            bg={isLight ? "gray.200" : "gray.800"}
          >
            <Text
              fontWeight={600}
              fontSize="4xl"
              lineHeight="1.4"
              color={isLight ? "gray.800" : "gray.300"}
            >
              ¿Cuantos días te quedan para{" "}
              <Text as="span" color={isLight ? "black" : "white"}>
                completar los hábitos
              </Text>
              ?
            </Text>
          </GridItem>
        </Grid>
      </Container>
    </FadeInWhenVisible>
  );
};

export default CompleteWeek;
