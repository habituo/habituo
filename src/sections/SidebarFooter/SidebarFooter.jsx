import { VStack, Text, useColorMode } from "@chakra-ui/react";
import PropTypes from "prop-types";

const SidebarFooter = ({ version, appName }) => {
  const { colorMode } = useColorMode();

  return (
    <VStack
      spacing={2}
      w="100%"
      align="stretch"
      mt="auto"
      p={2}
      pb={1}
      borderTopWidth="1px"
      borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
    >
      <Text
        textAlign="center"
        fontSize="xs"
        userSelect="none"
        color={colorMode === "light" ? "gray.400" : "gray.600"}
        noOfLines={1}
      >
        {`v${version || "—"} - ${appName || "Habituo App"}`}
      </Text>
    </VStack>
  );
};

SidebarFooter.propTypes = {
  version: PropTypes.string,
  appName: PropTypes.string,
};

export default SidebarFooter;
