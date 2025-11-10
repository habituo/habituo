import {
  VStack,
  HStack,
  Text,
  IconButton,
  Tooltip,
  Divider,
} from "@chakra-ui/react";
import PropTypes from "prop-types";

const SidebarSection = ({
  title,
  tooltip,
  icon,
  onIconClick,
  colorMode,
  themeOptions,
  children,
  showDivider = true,
}) => {
  return (
    <VStack align="stretch" spacing={1} w="100%">
      <HStack alignItems="center" justifyContent="space-between">
        <Text
          fontSize="xs"
          fontWeight={600}
          textTransform="uppercase"
          color={colorMode === "light" ? "gray.400" : "gray.600"}
        >
          {title}
        </Text>

        {icon && (
          <Tooltip
            label={tooltip}
            placement="top"
            bg={colorMode === "light" ? "black" : "white"}
            color={colorMode === "light" ? "white" : "black"}
            borderRadius={themeOptions?.borderRadius || "md"}
            hasArrow
          >
            <IconButton
              size="xs"
              onClick={onIconClick}
              aria-label={tooltip || "Acción"}
              icon={icon}
              variant="ghost"
              _focusVisible={{}}
            />
          </Tooltip>
        )}
      </HStack>

      <VStack align="stretch" spacing={1}>
        {children}
      </VStack>

      {showDivider && <Divider />}
    </VStack>
  );
};

SidebarSection.propTypes = {
  title: PropTypes.string.isRequired,
  tooltip: PropTypes.string,
  icon: PropTypes.node,
  onIconClick: PropTypes.func,
  colorMode: PropTypes.string,
  themeOptions: PropTypes.object,
  children: PropTypes.node.isRequired,
  showDivider: PropTypes.bool,
};

export default SidebarSection;
