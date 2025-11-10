import {
  Container,
  VStack,
  Heading,
  Text,
  Button,
  Link,
} from "@chakra-ui/react";
import FadeInWhenVisible from "../../animations/FadeInWhenVisible/FadeInWhenVisible";

/**
 * HeroSection component
 * Renders the main hero section of the landing page with heading, description and CTA button
 */
const HeroSection = () => {
  return (
    /**
     * Wrap the section in a fade-in animation component
     */
    <FadeInWhenVisible>
      {/**
       * Container provides max-width, padding and semantic main tag
       */}
      <Container
        as="main"
        maxW="5xl"
        py={{ base: 16, md: 20, lg: 24, xl: 32 }}
        fontFamily="Outfit"
      >
        {/**
         * VStack stacks children vertically with spacing and alignment
         */}
        <VStack align="flex-start" spacing={{ base: 6, md: 8 }}>
          {/**
           * Heading for the hero section, responsive font sizes
           * Highlights a part of text in orange
           */}
          <Heading
            as="h1"
            fontSize={{ base: "7xl", md: "8xl", lg: "9xl" }}
            fontWeight={700}
            lineHeight="0.9"
            fontFamily="Outfit"
          >
            Deja de soñar, empieza a{" "}
            <Text as="span" color="var(--chakra-colors-orange-500)">
              construir
            </Text>
            .
          </Heading>

          {/**
           * Description text with responsive font sizes and max width
           * Highlights the app name in bold
           */}
          <Text
            fontSize={{ base: "lg", md: "xl", lg: "2xl" }}
            fontWeight={400}
            maxW={{ base: "90%", md: "60%" }}
          >
            Tu plataforma para hábitos que te impulsan al éxito. Construye tu
            mejor versión con{" "}
            <Text as="span" fontWeight={600}>
              Habituo App
            </Text>
            .
          </Text>

          {/**
           * CTA button linking to register page
           * Uses hover and active states for animation feedback
           */}
          <Button
            as={Link}
            href="/register"
            size="lg"
            colorScheme="orange"
            borderRadius="full"
            transition="all 0.2s ease-in-out"
            _hover={{
              transform: "translateY(-2px)",
              boxShadow: "lg",
              textDecoration: "none",
            }}
            _active={{ transform: "translateY(0)", boxShadow: "md" }}
          >
            Probar Habituo gratis
          </Button>
        </VStack>
      </Container>
    </FadeInWhenVisible>
  );
};

export default HeroSection;
