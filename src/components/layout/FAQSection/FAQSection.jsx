import {
  Container,
  Heading,
  Text,
  HStack,
  VStack,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  useColorMode,
} from "@chakra-ui/react";
import PropTypes from "prop-types";
import FadeInWhenVisible from "../../animations/FadeInWhenVisible/FadeInWhenVisible";

/**
 * FAQSection component displays two lists of frequently asked questions
 * using accordions and adapts its colors based on the current color mode.
 *
 * @param {Object} props
 * @param {Array} props.faqItems1 - First array of FAQ items (id, question, answer)
 * @param {Array} props.faqItems2 - Second array of FAQ items (id, question, answer)
 */
function FAQSection({ faqItems1, faqItems2 }) {
  // Get the current color mode (light or dark)
  const { colorMode } = useColorMode();
  const isLight = colorMode === "light";

  /**
   * Helper function to render an Accordion with a list of FAQ items.
   *
   * @param {Array} items - Array of FAQ objects
   * @returns {JSX.Element} Accordion element with FAQ items
   */
  const renderAccordion = (items) => (
    <Accordion w="100%" allowToggle>
      {items.map((item) => (
        <AccordionItem
          key={item.id}
          bg={isLight ? "white" : "black"}
          borderRadius="2xl"
          mb={4}
        >
          <h3>
            <AccordionButton
              py={4}
              px={5}
              borderRadius="2xl"
              _expanded={{
                bg: isLight ? "black" : "white",
                color: isLight ? "white" : "black",
              }}
              _hover={{
                bg: isLight ? "black" : "white",
                color: isLight ? "white" : "black",
              }}
            >
              <Box
                as="span"
                flex="1"
                textAlign="left"
                fontSize="lg"
                fontWeight={600}
                fontFamily="Outfit"
              >
                {item.question}
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h3>
          <AccordionPanel
            pb={4}
            px={5}
            fontSize="md"
            color={isLight ? "gray.700" : "gray.300"}
            lineHeight="tall"
            fontFamily="Outfit"
          >
            {item.answer}
          </AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  );

  return (
    /** FadeInWhenVisible wraps the section for entry animation */
    <FadeInWhenVisible>
      <Container as="section" maxW="5xl" py={20} fontFamily="Outfit">
        {/* Main heading */}
        <Heading
          as="h2"
          mb={4}
          fontSize={{ base: "4xl", md: "6xl" }}
          fontWeight={700}
          fontFamily="Outfit"
        >
          Preguntas frecuentes
        </Heading>

        {/* Introductory text */}
        <Text
          maxW="60%"
          mb={8}
          fontSize="xl"
          color={isLight ? "gray.600" : "gray.400"}
        >
          ¿Tienes dudas sobre cómo funciona{" "}
          <Text
            as="span"
            fontWeight={600}
            color="var(--chakra-colors-orange-500)"
          >
            Habituo
          </Text>
          ? Aquí resolvemos las preguntas más comunes.
        </Text>

        {/* Two columns with FAQ accordions */}
        <HStack
          flexDirection={{ base: "column", md: "row" }}
          spacing={6}
          align="flex-start"
        >
          {/* Left accordion */}
          <VStack w="50%">{renderAccordion(faqItems1)}</VStack>

          {/* Right accordion */}
          <VStack w="50%">{renderAccordion(faqItems2)}</VStack>
        </HStack>
      </Container>
    </FadeInWhenVisible>
  );
}

/** PropTypes validation for the FAQSection component */
FAQSection.propTypes = {
  faqItems1: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      question: PropTypes.string.isRequired,
      answer: PropTypes.string.isRequired,
    })
  ).isRequired,
  faqItems2: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      question: PropTypes.string.isRequired,
      answer: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default FAQSection;
