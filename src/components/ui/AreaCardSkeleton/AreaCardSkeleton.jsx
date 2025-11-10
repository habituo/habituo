import {
  LinkBox,
  HStack,
  Skeleton,
  SkeletonCircle,
  useColorMode,
} from "@chakra-ui/react";
import { useTheme } from "../../../context/ThemeContext/ThemeContext";

/**
 * Renders a skeleton loader for the AreaCard component when data is not yet available.
 * This component is extracted to reduce the complexity of the main AreaCard component.
 */
const AreaCardSkeleton = () => {
  const { themeOptions } = useTheme();
  const { colorMode } = useColorMode();

  return (
    <LinkBox
      as="article"
      p={3}
      pb={1}
      borderWidth="2px"
      borderRadius={themeOptions.borderRadius}
      w="100%"
      minH="119px"
      maxH="min-content"
      userSelect="none"
      bg={colorMode === "light" ? "white" : "black"}
      data-testid="area-card-skeleton"
    >
      <Skeleton w="40%" h="18px" />
      <Skeleton
        w="25px"
        h="25px"
        position="absolute"
        top={3}
        right={3}
        borderRadius="md"
      />
      <HStack my={4} alignItems="center">
        <SkeletonCircle size="6" />
        <Skeleton w="40%" h="26px" />
      </HStack>
      <Skeleton w="45%" h="12px" />
    </LinkBox>
  );
};

export default AreaCardSkeleton;
