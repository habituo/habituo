import React from "react";
import PropTypes from "prop-types";
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

const HabitCardOptions = React.memo(
  ({ habit, handleComplete, handleSkip, handleEdit, confirmDelete }) => {
    const { themeOptions } = useTheme();
    const { colorMode } = useColorMode();

    const stopPropagation = (e, callback, item) => {
      e.stopPropagation();
      callback(item);
    };

    return (
      <Menu>
        <Tooltip
          label="Opciones"
          aria-label={`Opciones del Hábito ${habit.name}`}
          borderRadius={themeOptions.borderRadius}
          bg={colorMode === "light" ? "black" : "white"}
          color={colorMode === "light" ? "white" : "black"}
          _focusVisible={{}}
        >
          <MenuButton
            as={IconButton}
            aria-label={`Más opciones para ${habit.name}`}
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
            onClick={(e) => e.stopPropagation()} // Stop propagation only on MenuButton click
          />
        </Tooltip>
        <MenuList
          m={0}
          p={0}
          minW="auto"
          borderRadius={themeOptions.borderRadius}
          bg={colorMode === "light" ? "var(--menu-bg)" : "gray.900"}
          onClick={(e) => e.stopPropagation()} // Stop propagation on MenuList (to prevent card click)
        >
          <MenuItem
            icon={<LuIcons.LuCheck size={16} />}
            borderTopRadius={themeOptions.borderRadius}
            bg={colorMode === "light" ? "var(--menu-bg)" : "gray.900"}
            _hover={{
              bg:
                colorMode === "light"
                  ? "rgb(237, 242, 247)"
                  : "rgba(255, 255, 255, 0.06)",
            }}
            onClick={(e) => stopPropagation(e, handleComplete, habit)}
          >
            Completar
          </MenuItem>
          <MenuItem
            icon={<LuIcons.LuArrowRight size={16} />}
            bg={colorMode === "light" ? "var(--menu-bg)" : "gray.900"}
            _hover={{
              bg:
                colorMode === "light"
                  ? "rgb(237, 242, 247)"
                  : "rgba(255, 255, 255, 0.06)",
            }}
            onClick={(e) => stopPropagation(e, handleSkip, habit)}
          >
            Saltar
          </MenuItem>
          <MenuItem
            icon={<LuIcons.LuPenLine size={16} />}
            bg={colorMode === "light" ? "var(--menu-bg)" : "gray.900"}
            _hover={{
              bg:
                colorMode === "light"
                  ? "rgb(237, 242, 247)"
                  : "rgba(255, 255, 255, 0.06)",
            }}
            onClick={(e) => stopPropagation(e, handleEdit, habit)}
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
            onClick={(e) => stopPropagation(e, confirmDelete, habit)}
          >
            Eliminar
          </MenuItem>
        </MenuList>
      </Menu>
    );
  }
);

HabitCardOptions.propTypes = {
  habit: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  handleComplete: PropTypes.func.isRequired,
  handleSkip: PropTypes.func.isRequired,
  handleEdit: PropTypes.func.isRequired,
  confirmDelete: PropTypes.func.isRequired,
};

export default HabitCardOptions;
