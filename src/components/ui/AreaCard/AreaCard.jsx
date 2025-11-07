import React, { useMemo } from "react";
import PropTypes from "prop-types";
import {
  LinkBox,
  Box,
  HStack,
  Text,
  LinkOverlay,
  useColorMode,
} from "@chakra-ui/react";
import { useTheme } from "../../../context/ThemeContext/ThemeContext";
import { AreaCardOptions, AreaCardSkeleton } from "../../../exports";
import { formatRegisteredDate } from "../../../utils/formatters/formatters";

const AreaCard = React.memo(({ area, handleEdit, confirmDelete }) => {
  const { themeOptions } = useTheme();
  const { colorMode } = useColorMode();

  const areaCreatedAtDate = useMemo(() => {
    // We can simplify this logic now that the formatter handles the 'toDate()' check
    if (area?.createdAt && typeof area.createdAt.toDate === "function") {
      return area.createdAt.toDate();
    }
    return area?.createdAt || null;
  }, [area?.createdAt]);

  // Use the extracted Skeleton component for loading state
  if (!area) {
    return <AreaCardSkeleton />;
  }

  return (
    <LinkBox
      key={area.id}
      p={3}
      display="flex"
      flexDirection="column"
      alignItems="flex-start"
      gap={2}
      borderWidth="2px"
      borderRadius={themeOptions.borderRadius}
      w="100%"
      maxH="min-content"
      userSelect="none"
      cursor="pointer"
      transition=".1s all linear"
      bg={colorMode === "light" ? "white" : "black"}
      _hover={{
        bg:
          colorMode === "light"
            ? `var(--chakra-colors-${themeOptions.focusColor}-50)`
            : "var(--chakra-colors-blackAlpha-600)",
        borderColor: `var(--chakra-colors-${themeOptions.focusColor}-500)`,
      }}
      aria-label={`Área: ${area.name}`}
      data-testid={`area-card-${area.id}`}
    >
      {/* Date/Time Section */}
      <Box
        as="time"
        fontSize="sm"
        color={colorMode === "light" ? "gray.400" : "gray.600"}
        dateTime={
          areaCreatedAtDate ? areaCreatedAtDate.toISOString() : undefined
        }
      >
        {/* Using the external utility function */}
        {formatRegisteredDate(areaCreatedAtDate)}
      </Box>
      {/* Title and Link Section */}
      <HStack alignItems="center">
        <Text
          fontFamily={themeOptions.fontFamily}
          fontSize="xl"
          fontWeight={600}
        >
          {area?.icon}{" "}
          <LinkOverlay href={`/dashboard/areas/${area.id}`}>
            {area.name}
          </LinkOverlay>
        </Text>
      </HStack>

      {/* Habit Count Section */}
      <Text fontSize="sm" fontWeight={400} opacity={0.8}>
        {area.habitCount || 0} {area.habitCount === 1 ? "hábito" : "hábitos"}
      </Text>

      {/* Options Menu (Extracted Component) */}
      <AreaCardOptions
        area={area}
        handleEdit={handleEdit}
        confirmDelete={confirmDelete}
      />
    </LinkBox>
  );
});

AreaCard.propTypes = {
  area: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    icon: PropTypes.node,
    habitCount: PropTypes.number,
    // PropTypes.instanceOf(Date) or PropTypes.object are often used here.
    createdAt: PropTypes.oneOfType([
      PropTypes.instanceOf(Date),
      // Firebase Timestamp objects are complex, but checking for object
      // is usually sufficient. For stricter validation, you might define
      // a custom validator, but `PropTypes.object` satisfies the SonarQube warning.
      PropTypes.object,
    ]),
  }),
  handleEdit: PropTypes.func.isRequired,
  confirmDelete: PropTypes.func.isRequired,
};

// Definition defaultProps to `area` like null
AreaCard.defaultProps = {
  area: null,
};

export default AreaCard;
