import {
  HStack,
  Icon,
  SimpleGrid,
  Spinner,
  Text,
  Link,
  VStack,
  Tooltip,
} from "@chakra-ui/react";
import * as LuIcons from "react-icons/lu";
import { TbBrandPatreon } from "react-icons/tb";
import PropTypes from "prop-types";

/**
 * Content for the 'Links' tab in the User Settings Modal.
 * It displays a grid of useful external links related to the application.
 *
 * @param {object} props - Component properties.
 * @param {object} props.themeOptions - Theme options object (used for borderRadius).
 * @param {string} props.colorMode - Current color mode state ('light' or 'dark').
 * @param {boolean} props.isSaving - State indicating if data is currently saving (only for display).
 */
const LinksTabContent = ({ themeOptions, colorMode, isSaving }) => (
  <VStack spacing={4} align="stretch">
    <HStack justifyContent="space-between" alignItems="center">
      <Text fontWeight={500} fontSize="lg">
        Enlaces útiles
      </Text>
      {isSaving && <Spinner size="sm" />}
    </HStack>

    {/* Grid of External Links */}
    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
      {/* Habituo App Link  */}
      <Link
        p={4}
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap={1}
        border="2px solid var(--chakra-colors-chakra-border-color)"
        borderRadius={themeOptions.borderRadius}
        href="https://habituo.vercel.app/"
        target="_blank"
        bg={colorMode === "light" ? "white" : "black"}
        _hover={{ textDecoration: "none" }}
      >
        <Icon as={LuIcons.LuEarth} boxSize={8} />
        <Text fontSize="md" fontWeight={600} textAlign="center">
          Habituo App
        </Text>
        <Text
          fontSize="xs"
          fontWeight={400}
          color={colorMode === "light" ? "#00000080" : "#FFFFFF60"}
          textAlign="center"
        >
          Web principal
        </Text>
      </Link>
      <Link
        p={4}
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap={1}
        border="2px solid var(--chakra-colors-chakra-border-color)"
        borderRadius={themeOptions.borderRadius}
        href="https://patreon.com/habituo"
        target="_blank"
        bg={colorMode === "light" ? "white" : "black"}
        _hover={{ textDecoration: "none" }}
      >
        <Icon as={TbBrandPatreon} boxSize={8} />
        <Text fontSize="md" fontWeight={600} textAlign="center">
          Patreon
        </Text>
        <Text
          fontSize="xs"
          fontWeight={400}
          color={colorMode === "light" ? "#00000080" : "#FFFFFF60"}
          textAlign="center"
        >
          Apoya el desarrollo
        </Text>
      </Link>
      <Tooltip placement='top' label='Proximamente' bg={themeOptions.focusColor} borderRadius={themeOptions.borderRadius} hasArrow >
      <Link
        p={4}
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap={1}
        border="2px solid var(--chakra-colors-chakra-border-color)"
        borderRadius={themeOptions.borderRadius}
        href="#"
        bg={colorMode === "light" ? "white" : "black"}
        _hover={{ textDecoration: "none" }}
      >
        <Icon as={LuIcons.LuNotebookText} boxSize={8} />
        <Text fontSize="md" fontWeight={600} textAlign="center">
          Soporte & Ayuda
        </Text>
        <Text
          fontSize="xs"
          fontWeight={400}
          color={colorMode === "light" ? "#00000080" : "#FFFFFF60"}
          textAlign="center"
        >
          Aprende como funciona
        </Text>
      </Link>
      </Tooltip>
    </SimpleGrid>
  </VStack>
);

// --- PropTypes Definition ---
LinksTabContent.propTypes = {
  /** Theme options object, typically used for styling constants like `borderRadius`. (Required) */
  themeOptions: PropTypes.object.isRequired,
  /** The current color mode ('light' or 'dark'), used for conditional styling. (Required) */
  colorMode: PropTypes.oneOf(["light", "dark"]).isRequired,
  /** Indicates if a database saving operation is currently in progress. Only used to display the spinner. (Required) */
  isSaving: PropTypes.bool.isRequired,
};

export default LinksTabContent;
