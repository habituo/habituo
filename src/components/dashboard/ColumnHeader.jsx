import React, { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext/ThemeContext";
import useListGrid from "../../hooks/useListGrid";
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
  IconButton,
} from "@chakra-ui/react";
import { HabitModal, AreaModal } from "../../exports";
import * as LuIcons from "react-icons/lu";
import "react-datepicker/dist/react-datepicker.css";

const ColumnHeader = ({
  title,
  page,
  onModalCloseAndRefresh,
  onOpenLeftMenu,
  onOpenRightMenu,
  isMobile,
}) => {
  const { themeOptions } = useTheme();
  const { colorMode } = useColorMode();
  const [, setSearchParams] = useSearchParams();
  const {
    orderBy: selectedOrder,
    viewLayout: viewType,
    handleOrderChange,
    handleLayoutChange,
  } = useListGrid();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleChangeOrder = useCallback(
    (value) => {
      handleOrderChange(value);
      setSearchParams((prev) => {
        const newSearchParams = new URLSearchParams(prev);
        newSearchParams.set("order_by", value);
        return newSearchParams;
      });
    },
    [handleOrderChange, setSearchParams]
  );

  const handleChangeLayout = useCallback(
    (value) => {
      handleLayoutChange(value);
      setSearchParams((prev) => {
        const newSearchParams = new URLSearchParams(prev);
        newSearchParams.set("layout", value);
        return newSearchParams;
      });
    },
    [handleLayoutChange, setSearchParams]
  );

  const handleModalClose = (shouldRefresh) => {
    onClose();
    if (shouldRefresh && onModalCloseAndRefresh) {
      onModalCloseAndRefresh();
    }
  };

  const handleAddButtonClick = () => {
    onOpen();
  };

  const modalComponent = page === "areas" ? AreaModal : HabitModal;
  const buttonText = page === "areas" ? "Añadir áreas" : "Añadir hábitos";

  const orderIcon = useMemo(() => {
    switch (selectedOrder) {
      case "name-asc":
        return <LuIcons.LuArrowDownAZ size="20px" />;
      case "name-desc":
        return <LuIcons.LuArrowUpAZ size="20px" />;
      case "new-creation":
        return <LuIcons.LuArrowUp01 size="20px" />;
      case "last-creation":
        return <LuIcons.LuArrowDown01 size="20px" />;
      default:
        return <LuIcons.LuArrowDownWideNarrow size="20px" />;
    }
  }, [selectedOrder]);

  return (
    <Box
      position="sticky"
      top={0}
      px={isMobile ? 2 : 3}
      py={2}
      pe={isMobile ? 2 : 0}
      borderBottom="2px solid var(--chakra-colors-chakra-border-color)"
      bg={colorMode === "light" ? "white" : "black"}
      zIndex={999}
    >
      <Flex alignItems="center" justifyContent="space-between">
        <HStack spacing={2}>
          {isMobile && (
            <IconButton
              p={0}
              icon={<LuIcons.LuMenu size="24px" />}
              onClick={onOpenLeftMenu}
              variant="ghost"
              aria-label="Abrir menú"
              _focusVisible={{}}
            />
          )}
          <Text
            as="h2"
            fontSize="lg"
            fontWeight={600}
            textAlign={isMobile && "left"}
          >
            {title}
          </Text>
        </HStack>
        <HStack spacing={2}>
          {!isMobile && (
            <Menu closeOnSelect={false}>
              <MenuButton
                as={Button}
                px={isMobile ? 2 : 4}
                colorScheme={themeOptions.focusColor}
                variant="ghost"
                leftIcon={
                  viewType === "list" ? (
                    <LuIcons.LuLayoutList size="20px" />
                  ) : (
                    <LuIcons.LuLayoutGrid size="20px" />
                  )
                }
                iconSpacing={isMobile ? 0 : 1}
                p={isMobile ? 2 : undefined}
              >
                {!isMobile && "Cambiar vista"}
              </MenuButton>
              <MenuList borderRadius={themeOptions.borderRadius}>
                <MenuOptionGroup
                  defaultValue="grid"
                  type="radio"
                  value={viewType}
                >
                  <MenuItemOption
                    value="grid"
                    onClick={() => handleChangeLayout("grid")}
                  >
                    Tablero
                  </MenuItemOption>
                  <MenuItemOption
                    value="list"
                    onClick={() => handleChangeLayout("list")}
                  >
                    Listado
                  </MenuItemOption>
                </MenuOptionGroup>
              </MenuList>
            </Menu>
          )}
          <Menu closeOnSelect={false}>
            <MenuButton
              as={Button}
              colorScheme={themeOptions.focusColor}
              variant="ghost"
              justifyContent="center"
              alignItems="center"
              leftIcon={orderIcon}
              iconSpacing={isMobile ? 0 : 1}
              p={isMobile ? 2 : undefined}
            >
              {!isMobile && "Ordenar por"}
            </MenuButton>
            <MenuList borderRadius={themeOptions.borderRadius}>
              <MenuOptionGroup
                defaultValue="name-asc"
                type="radio"
                value={selectedOrder}
              >
                <MenuItemOption
                  value="name-asc"
                  onClick={() => handleChangeOrder("name-asc")}
                >
                  Ascendente, A-Z
                </MenuItemOption>
                <MenuItemOption
                  value="name-desc"
                  onClick={() => handleChangeOrder("name-desc")}
                >
                  Descendente, Z-A
                </MenuItemOption>
                <MenuItemOption
                  value="last-creation"
                  onClick={() => handleChangeOrder("last-creation")}
                >
                  Antiguos primero
                </MenuItemOption>
                <MenuItemOption
                  value="new-creation"
                  onClick={() => handleChangeOrder("new-creation")}
                >
                  Recientes primero
                </MenuItemOption>
              </MenuOptionGroup>
            </MenuList>
          </Menu>
          <>
            <Button
              px={isMobile ? 2 : 4}
              colorScheme={themeOptions.focusColor}
              iconSpacing={isMobile ? 0 : 1}
              leftIcon={<LuIcons.LuPlus size="20px" />}
              onClick={handleAddButtonClick}
              p={isMobile ? 2 : undefined}
            >
              {!isMobile && buttonText}
            </Button>
            {modalComponent && (
              <Box>
                {React.createElement(modalComponent, {
                  isOpen: isOpen,
                  onClose: handleModalClose,
                })}
              </Box>
            )}
          </>
          {isMobile && (
            <IconButton
              p={0}
              icon={<LuIcons.LuChartColumnBig size="24px" />}
              onClick={onOpenRightMenu}
              variant="ghost"
              aria-label="Abrir menú"
              _focusVisible={{}}
            />
          )}
        </HStack>
      </Flex>
    </Box>
  );
};

export default ColumnHeader;
