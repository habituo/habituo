import { VStack, Skeleton, Divider, Spacer } from "@chakra-ui/react";
import { useTheme } from "../../../context/ThemeContext/ThemeContext";

const SidebarSkeleton = () => {
  const { themeOptions } = useTheme();

  return (
    <VStack p={4} w="100%" h="100vh" spacing={4} align="start">
      <Skeleton h="20px" w="80%" borderRadius={themeOptions.borderRadius} />
      <Skeleton h="20px" w="70%" borderRadius={themeOptions.borderRadius} />
      <Skeleton h="20px" w="60%" borderRadius={themeOptions.borderRadius} />

      <Divider my={4} />

      <Skeleton h="30px" w="90%" borderRadius={themeOptions.borderRadius} />
      <VStack w="100%" spacing={2}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton
            key={`skeleton-${i}`}
            h="40px"
            w="100%"
            borderRadius={themeOptions.borderRadius}
          />
        ))}
      </VStack>

      <Spacer />

      <Skeleton h="40px" w="100%" borderRadius={themeOptions.borderRadius} />
      <Skeleton h="40px" w="100%" borderRadius={themeOptions.borderRadius} />
    </VStack>
  );
};

export default SidebarSkeleton;
