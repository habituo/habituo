import React from "react";
import {
  Container,
  HStack,
  VStack,
  Heading,
  Text,
  Image,
  useColorMode,
} from "@chakra-ui/react";
import FadeInWhenVisible from "../../animations/FadeInWhenVisible/FadeInWhenVisible";

/**
 * Reusable section component for Home page
 * @param {string} title - Section heading
 * @param {string|JSX} description - Section description (can include <span> with styles)
 * @param {string} imageSrc - Image URL or imported asset
 * @param {string} imageAlt - Alt text for image
 * @param {boolean} reverse - If true, image is on left, text on right
 * @param {string} textAlign - Alignment of the text ('left', 'center', 'right')
 */
const FeatureSection = ({
  title,
  description,
  imageSrc,
  imageAlt,
  reverse = false,
  textAlign = "center",
}) => {
  const { colorMode } = useColorMode();
  const isLight = colorMode === "light";

  return (
    <FadeInWhenVisible>
      <Container as="section" maxW="5xl" py={20} fontFamily="Outfit">
        <HStack
          data-testid="feature-container"
          flexDirection={{
            base: "column",
            lg: reverse ? "row-reverse" : "row",
          }}
          spacing={{ base: 10, lg: 16 }}
        >
          {/* Text block */}
          <VStack
            data-testid="feature-text-block"
            w={{ base: "100%", lg: "50%" }}
            alignItems="center"
            maxW={{ base: "xl", lg: "none" }}
            spacing={{ base: 6, lg: 8 }}
            textAlign={{ base: "center", lg: textAlign }}
            data-text-align={textAlign}
          >
            <Heading
              as="h2"
              fontSize={{ base: "4xl", md: "6xl" }}
              fontWeight={700}
              lineHeight="1"
              fontFamily="Outfit"
            >
              {title}
            </Heading>
            <Text
              data-testid="feature-description"
              fontWeight={500}
              fontSize="xl"
              lineHeight="1.4"
              color={isLight ? "gray.600" : "gray.400"}
            >
              {description}
            </Text>
          </VStack>

          {/* Image block */}
          <VStack
            data-testid="feature-image-block"
            w={{ base: "100%", lg: "50%" }}
            maxW={{ base: "2xl", lg: "none" }}
          >
            <Image src={imageSrc} alt={imageAlt} objectFit="contain" />
          </VStack>
        </HStack>
      </Container>
    </FadeInWhenVisible>
  );
};

export default FeatureSection;
