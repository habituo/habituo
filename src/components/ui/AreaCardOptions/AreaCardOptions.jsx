import {
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  useColorMode,
} from "@chakra-ui/react";
import * as LuIcons from "react-icons/lu";
import { useTheme } from "../../../context/ThemeContext/ThemeContext";
import PropTypes from "prop-types";

/**
 * Renders the options menu (Edit and Delete) for an AreaCard.
 *
 * @param {object} area - The area object.
 * @param {function} handleEdit - Callback for editing the area.
 * @param {function} confirmDelete - Callback for confirming deletion of the area.
 */
const AreaCardOptions = ({ area, handleEdit, confirmDelete }) => {
  const { themeOptions } = useTheme();
  const { colorMode } = useColorMode();

  return (
    <Menu>
      <Tooltip
        label="Opciones"
        aria-label={`Options for area ${area.name}`}
        borderRadius={themeOptions.borderRadius}
        bg={colorMode === "light" ? "black" : "white"}
        color={colorMode === "light" ? "white" : "black"}
      >
        <MenuButton
          as={IconButton}
          aria-label={`More options for area ${area.name}`}
          icon={<LuIcons.LuEllipsisVertical />}
          position="absolute"
          right={1}
          top={1}
          fontSize="lg"
          bg="transparent"
          size="sm"
          borderRadius={themeOptions.borderRadius}
          _hover={{
            bg: colorMode === "light" ? "gray.100" : "whiteAlpha.200",
          }}
          _active={{
            bg: colorMode === "light" ? "gray.200" : "whiteAlpha.300",
          }}
        />
      </Tooltip>
      <MenuList
        m={0}
        p={0}
        minW="auto"
        borderRadius={themeOptions.borderRadius}
        bg={colorMode === "light" ? "var(--menu-bg)" : "gray.900"}
      >
        <MenuItem
          icon={<LuIcons.LuPenLine size={16} />}
          borderTopRadius={themeOptions.borderRadius}
          bg={colorMode === "light" ? "var(--menu-bg)" : "gray.900"}
          _hover={{
            bg:
              colorMode === "light"
                ? "rgb(237, 242, 247)"
                : "rgba(255, 255, 255, 0.06)",
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleEdit(area);
          }}
        >
          Editar
        </MenuItem>
        <MenuItem
          icon={<LuIcons.LuTrash size={16} />}
          borderBottomRadius={themeOptions.borderRadius}
          bg={colorMode === "light" ? "var(--menu-bg)" : "gray.900"}
          _hover={{
            bg:
              colorMode === "light"
                ? "rgb(237, 242, 247)"
                : "rgba(255, 255, 255, 0.06)",
          }}
          onClick={(e) => {
            e.stopPropagation();
            confirmDelete(area);
          }}
        >
          Eliminar
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

AreaCardOptions.propTypes = {
  area: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  handleEdit: PropTypes.func.isRequired,
  confirmDelete: PropTypes.func.isRequired,
};

export default AreaCardOptions;
