import PropTypes from "prop-types";
import { LinkBox, HStack, Skeleton, SkeletonCircle } from "@chakra-ui/react";

const HabitCardSkeleton = ({ themeOptions, colorMode }) => (
  <LinkBox
    as="article"
    p={3}
    pb={1}
    borderWidth={2}
    borderRadius={themeOptions.borderRadius}
    w="100%"
    minH={119}
    maxH="min-content"
    userSelect="none"
    bg={colorMode === "light" ? "white" : "black"}
    data-testid="habit-card-skeleton"
  >
    <Skeleton w="40%" h={18} />
    <Skeleton
      w={25}
      h={25}
      position="absolute"
      top={3}
      right={3}
      borderRadius="md"
    />
    <HStack my={4} alignItems="center">
      <SkeletonCircle size={6} />
      <Skeleton w="40%" h={26} />
    </HStack>
    <Skeleton w="45%" h={12} />
  </LinkBox>
);

HabitCardSkeleton.propTypes = {
  themeOptions: PropTypes.object.isRequired,
  colorMode: PropTypes.string.isRequired,
};

export default HabitCardSkeleton;
