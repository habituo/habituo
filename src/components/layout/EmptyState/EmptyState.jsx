import { useCallback } from "react";
import {
  VStack,
  Stack,
  Skeleton,
  Text,
  Button,
  useDisclosure,
  useColorMode,
} from "@chakra-ui/react";
import { AreaModal, HabitModal } from "../../../exports";
import { useTheme } from "../../../context/ThemeContext/ThemeContext";
import * as LuIcons from "react-icons/lu";
import PropTypes from "prop-types";

/**
 * EmptyState component
 *
 * This component displays a placeholder UI when there are no areas or habits yet.
 * It encourages the user to take the first step by creating one.
 * The displayed modal (AreaModal or HabitModal) depends on the `type` prop.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {"areas" | "habits"} props.type - Determines whether the component refers to areas or habits.
 * @returns {JSX.Element} The rendered EmptyState component.
 */
function EmptyState({ type }) {
  /** Access theme configuration from custom ThemeContext */
  const { themeOptions } = useTheme();

  /** Access Chakra UI's current color mode (light/dark) */
  const { colorMode } = useColorMode();

  /** Chakra UI disclosure hook for managing the AreaModal open/close state */
  const areaModal = useDisclosure();

  /** Chakra UI disclosure hook for managing the HabitModal open/close state */
  const habitModal = useDisclosure();

  /** Determine whether this EmptyState is for "areas" or "habits" */
  const isArea = type === "areas";

  /** Text that changes depending on the type */
  const buttonText = isArea ? " área" : " hábito";

  /**
   * Handles the "Add" button click.
   * Opens the corresponding modal depending on the component type.
   *
   * useCallback ensures this function reference remains stable unless dependencies change.
   */
  const handleButtonClick = useCallback(() => {
    isArea ? areaModal.onOpen() : habitModal.onOpen();
  }, [isArea, areaModal, habitModal]);

  return (
    <VStack
      w="100%"
      h="calc(100vh - (58px + 2rem))"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      spacing={4}
    >
      {/**
       * Placeholder skeletons that simulate content loading.
       * Provide a subtle visual balance when the view is empty.
       */}
      <Stack mb={2} borderRadius={themeOptions.borderRadius}>
        {new Array(3).fill(null).map((_, i) => (
          <Skeleton
            key={_}
            w="200px"
            h="40px"
            borderRadius={themeOptions.borderRadius}
          />
        ))}
      </Stack>

      {/** Motivational heading */}
      <Text as="h2" fontSize="xl" fontWeight={600}>
        Da el paso y construye tu mejor versión
      </Text>

      {/** Motivational paragraph text */}
      <Text as="p" fontSize="sm" maxW={600}>
        Los hábitos son como los escalones de una escalera: al dar el primer
        paso, el resto se va sumando uno a uno.
      </Text>

      {/**
       * Button that opens either AreaModal or HabitModal.
       * The background and hover styles adapt to the current color mode.
       */}
      <Button
        ps={3}
        mt={2}
        leftIcon={<LuIcons.LuPlus size="16px" />}
        iconSpacing={1}
        onClick={handleButtonClick}
        aria-label={`Añadir${buttonText}`}
        bg={colorMode === "light" ? "gray.200" : "gray.800"}
        _hover={{ bg: colorMode === "light" ? "gray.300" : "gray.700" }}
      >
        Añadir{buttonText}
      </Button>

      {/**
       * Conditionally render the corresponding modal component
       * depending on whether we're in "areas" or "habits" mode.
       */}
      {isArea ? (
        <AreaModal isOpen={areaModal.isOpen} onClose={areaModal.onClose} />
      ) : (
        <HabitModal isOpen={habitModal.isOpen} onClose={habitModal.onClose} />
      )}
    </VStack>
  );
}

/**
 * Prop type validation for EmptyState
 */
EmptyState.propTypes = {
  /** Defines whether the empty state is for "areas" or "habits" */
  type: PropTypes.oneOf(["areas", "habits"]).isRequired,
};

export default EmptyState;
