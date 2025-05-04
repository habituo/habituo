import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useListGridConfig from "../../../hooks/useListGridConfig";
import {
  Box,
  HStack,
  Flex,
  Text,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuOptionGroup,
  MenuItemOption,
  useDisclosure,
  useColorMode,
} from "@chakra-ui/react";
import { useTheme } from "../../../context/ThemeContext";
import { FiPlus } from "react-icons/fi";
import { ModalHabit, ModalArea } from "../../../routes/index";
import * as LuIcons from "react-icons/lu";
import "react-datepicker/dist/react-datepicker.css";

const ColumnHeader = ({ title, page }) => {
  const { themeOptions } = useTheme();
  const { colorMode } = useColorMode();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    orderBy: selectedOrder,
    viewLayout: viewType,
    handleOrderChange,
    handleLayoutChange,
  } = useListGridConfig();

  const handleChangeOrder = (value) => {
    handleOrderChange(value);
    setSearchParams((prev) => {
      prev.set("order_by", value);
      return prev;
    });
  };

  const handleChangeLayout = (value) => {
    handleLayoutChange(value);
    setSearchParams((prev) => {
      prev.set("layout", value);
      return prev;
    });
  };

  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleAddButtonClick = () => {
    onOpen();
  };

  return (
    <Box
      position="sticky"
      top={0}
      p={3}
      minH="7vh"
      borderBottom="2px solid var(--chakra-colors-chakra-border-color)"
      userSelect="none"
      zIndex={999}
    >
      <Flex alignItems="center" justifyContent="space-between">
        <Text as="h2" fontSize="lg" fontWeight="600">
          {title}
        </Text>
        <HStack spacing={2}>
          <Menu closeOnSelect={false}>
            <MenuButton
              as={Button}
              colorScheme={themeOptions.focusColor}
              variant="ghost"
              leftIcon={
                viewType === "list" ? (
                  <LuIcons.LuLayoutList size="20px" />
                ) : (
                  <LuIcons.LuLayoutGrid size="20px" />
                )
              }
              iconSpacing={1}
            >
              Cambiar vista
            </MenuButton>
            <MenuList
              borderRadius={themeOptions.borderRadius}
              bg={
                colorMode === "light" ? "rgb(245, 245, 245)" : "rgb(23, 23, 23)"
              }
            >
              <MenuOptionGroup defaultValue="grid" type="radio">
                <MenuItemOption
                  value="grid"
                  onClick={() => handleChangeLayout("grid")}
                  bg={
                    colorMode === "light"
                      ? "rgb(245, 245, 245)"
                      : "rgb(23, 23, 23)"
                  }
                  _hover={{
                    bg:
                      colorMode === "light"
                        ? "rgb(237, 242, 247)"
                        : "rgba(255, 255, 255, 0.06)",
                  }}
                >
                  Tablero
                </MenuItemOption>
                <MenuItemOption
                  value="list"
                  onClick={() => handleChangeLayout("list")}
                  bg={
                    colorMode === "light"
                      ? "rgb(245, 245, 245)"
                      : "rgb(23, 23, 23)"
                  }
                  _hover={{
                    bg:
                      colorMode === "light"
                        ? "rgb(237, 242, 247)"
                        : "rgba(255, 255, 255, 0.06)",
                  }}
                >
                  Listado
                </MenuItemOption>
              </MenuOptionGroup>
            </MenuList>
          </Menu>

          <Menu closeOnSelect={false}>
            <MenuButton
              as={Button}
              colorScheme={themeOptions.focusColor}
              variant="ghost"
              leftIcon={
                selectedOrder === "asc" ? (
                  <LuIcons.LuArrowDownAZ size="20px" />
                ) : selectedOrder === "desc" ? (
                  <LuIcons.LuArrowUpAZ size="20px" />
                ) : selectedOrder === "new-creation" ? (
                  <LuIcons.LuArrowUp01 size="20px" />
                ) : selectedOrder === "last-creation" ? (
                  <LuIcons.LuArrowDown01 size="20px" />
                ) : (
                  <LuIcons.LuArrowDownWideNarrow size="20px" />
                )
              }
              iconSpacing={1}
            >
              Ordenar por
            </MenuButton>
            <MenuList
              borderRadius={themeOptions.borderRadius}
              bg={
                colorMode === "light" ? "rgb(245, 245, 245)" : "rgb(23, 23, 23)"
              }
            >
              <MenuOptionGroup defaultValue="asc" type="radio">
                <MenuItemOption
                  value="asc"
                  onClick={() => handleChangeOrder("asc")}
                  bg={
                    colorMode === "light"
                      ? "rgb(245, 245, 245)"
                      : "rgb(23, 23, 23)"
                  }
                  _hover={{
                    bg:
                      colorMode === "light"
                        ? "rgb(237, 242, 247)"
                        : "rgba(255, 255, 255, 0.06)",
                  }}
                >
                  Ascendente, A-Z
                </MenuItemOption>
                <MenuItemOption
                  value="desc"
                  onClick={() => handleChangeOrder("desc")}
                  bg={
                    colorMode === "light"
                      ? "rgb(245, 245, 245)"
                      : "rgb(23, 23, 23)"
                  }
                  _hover={{
                    bg:
                      colorMode === "light"
                        ? "rgb(237, 242, 247)"
                        : "rgba(255, 255, 255, 0.06)",
                  }}
                >
                  Descendente, Z-A
                </MenuItemOption>
                <MenuItemOption
                  value="last-creation"
                  onClick={() => handleChangeOrder("last-creation")}
                  bg={
                    colorMode === "light"
                      ? "rgb(245, 245, 245)"
                      : "rgb(23, 23, 23)"
                  }
                  _hover={{
                    bg:
                      colorMode === "light"
                        ? "rgb(237, 242, 247)"
                        : "rgba(255, 255, 255, 0.06)",
                  }}
                >
                  Antiguos primero
                </MenuItemOption>
                <MenuItemOption
                  value="new-creation"
                  onClick={() => handleChangeOrder("new-creation")}
                  bg={
                    colorMode === "light"
                      ? "rgb(245, 245, 245)"
                      : "rgb(23, 23, 23)"
                  }
                  _hover={{
                    bg:
                      colorMode === "light"
                        ? "rgb(237, 242, 247)"
                        : "rgba(255, 255, 255, 0.06)",
                  }}
                >
                  Recientes primero
                </MenuItemOption>
              </MenuOptionGroup>
            </MenuList>
          </Menu>

          {page === "all-areas" ? (
            <>
              <Button
                ps={2}
                colorScheme={themeOptions.focusColor}
                iconSpacing={1}
                leftIcon={<FiPlus size="20px" />}
                onClick={handleAddButtonClick}
              >
                Añadir áreas
              </Button>
              <ModalArea isOpen={isOpen} onClose={onClose} />
            </>
          ) : (
            <>
              <Button
                ps={2}
                colorScheme={themeOptions.focusColor}
                iconSpacing={1}
                leftIcon={<FiPlus size="20px" />}
                onClick={handleAddButtonClick}
              >
                Añadir hábitos
              </Button>
              <ModalHabit isOpen={isOpen} onClose={onClose} />
            </>
          )}
        </HStack>
      </Flex>
    </Box>
  );
};

export default ColumnHeader;
