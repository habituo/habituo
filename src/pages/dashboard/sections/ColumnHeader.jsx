import React, { useState, useEffect } from "react";
import {
  Box,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  HStack,
  Flex,
  Text,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuGroup,
  MenuOptionGroup,
  MenuItemOption,
  useDisclosure,
  MenuDivider,
  IconButton,
  useColorMode,
} from "@chakra-ui/react";
import DatePicker from "react-datepicker";
import { useTheme } from "../../../context/ThemeContext";
import { FiPlus } from "react-icons/fi";
import { GrStatusGood } from "react-icons/gr";
import { MdMoodBad } from "react-icons/md";
import { AiOutlineSortAscending } from "react-icons/ai";
import { BsCalendarDate } from "react-icons/bs";
import { useLocation, useNavigate } from "react-router-dom";
import { ModalCreateHabitArea, ModalCreateArea } from "../../../routes/index";
import * as LuIcons from "react-icons/lu";
import "react-datepicker/dist/react-datepicker.css";

const ColumnHeader = (props) => {
  const { themeOptions } = useTheme();
  const { colorMode } = useColorMode();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState("asc");
  const [viewType, setViewType] = useState("grid");
  const location = useLocation();
  const navigate = useNavigate();

  // Function to format date
  const formatDate = (date) => {
    const today = new Date();
    const diffTime = date - today;
    const oneDay = 24 * 60 * 60 * 1000;

    // Compare with actual date, tomorrow or yesterday
    if (diffTime < oneDay && diffTime > -oneDay) {
      return "Hoy";
    }
    if (diffTime < 2 * oneDay && diffTime > oneDay) {
      return "Mañana";
    }
    if (diffTime > -2 * oneDay && diffTime < -oneDay) {
      return "Ayer";
    }

    // Fomat date with "Day of month"
    const options = { weekday: "long", day: "numeric", month: "long" };
    return date.toLocaleDateString("es-ES", options);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    // Update date URL with select_date parameter
    if (date) {
      const formattedDate = date.toISOString().split("T")[0]; // Format YYYY-MM-DD
      window.history.pushState(null, "", `?select_date=${formattedDate}`);
    }
  };

  // Read the select_date parameter on load component
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const dateParam = urlParams.get("select_date");
    if (dateParam) {
      setSelectedDate(new Date(dateParam)); // Set the date by URL
    }
  }, []);

  const handleChange = (value) => {
    setSelectedOrder(value);
    const params = new URLSearchParams(location.search);
    params.set("order_by", value);
    navigate({ search: params.toString() });
  };

  const handleViewChange = (value) => {
    setViewType(value);
    const params = new URLSearchParams(location.search);
    params.set("layout", value);
    navigate({ search: params.toString() });
  };

  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box
      position="sticky"
      top="0"
      p={3}
      borderBottom="1px solid"
      borderColor="var(--chakra-colors-chakra-border-color)"
      userSelect="none"
      bg={colorMode === "light" ? "rgb(245, 245, 245)" : "rgb(23, 23, 23)"}
      zIndex={999}
    >
      <Flex alignItems="center" justifyContent="space-between">
        <Text as="h2" fontSize="lg" fontWeight="bold">
          {props.title}
        </Text>
        <HStack spacing={2}>
          {props.page === "all-habits" ? (
            <>
              <Popover placement="bottom">
                <PopoverTrigger>
                  <Button
                    colorScheme={themeOptions.focusColor}
                    variant="ghost"
                    leftIcon={<BsCalendarDate size="18px" />}
                    iconSpacing={2}
                  >
                    {selectedDate ? formatDate(selectedDate) : "Hoy"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  width="auto"
                  borderRadius={themeOptions.borderRadius}
                >
                  <PopoverArrow />
                  <DatePicker
                    selected={selectedDate}
                    onChange={handleDateChange}
                    inline
                  />
                </PopoverContent>
              </Popover>
              <Menu closeOnSelect={false}>
                <MenuButton
                  as={Button}
                  colorScheme={themeOptions.focusColor}
                  variant="ghost"
                  leftIcon={<AiOutlineSortAscending size="20px" />}
                  iconSpacing={1}
                >
                  Ordenar por
                </MenuButton>
                <MenuList borderRadius={themeOptions.borderRadius}>
                  <MenuOptionGroup defaultValue="asc" type="radio">
                    <MenuItemOption value="asc">Ascendente</MenuItemOption>
                    <MenuItemOption value="desc">Descendente</MenuItemOption>
                    <MenuItemOption value="creationdate">
                      Fecha de creación
                    </MenuItemOption>
                    <MenuItemOption value="type">Tipo</MenuItemOption>
                    <MenuItemOption value="state">Estado</MenuItemOption>
                  </MenuOptionGroup>
                </MenuList>
              </Menu>
              <Menu>
                <MenuButton
                  as={Button}
                  colorScheme={themeOptions.focusColor}
                  iconSpacing={1}
                  leftIcon={<FiPlus size="20px" />}
                >
                  Añadir hábitos
                </MenuButton>
                <MenuList borderRadius={themeOptions.borderRadius}>
                  <MenuItem>
                    <GrStatusGood />
                    <Text ps={2}>Buenos hábitos</Text>
                  </MenuItem>
                  <MenuItem>
                    <MdMoodBad />
                    <Text ps={2}>Malos hábitos</Text>
                  </MenuItem>
                </MenuList>
              </Menu>
            </>
          ) : props.page === "all-areas" ? (
            <>
              <Menu closeOnSelect={false}>
                <MenuButton
                  as={Button}
                  colorScheme={themeOptions.focusColor}
                  variant="ghost"
                  leftIcon={<AiOutlineSortAscending size="20px" />}
                  iconSpacing={1}
                >
                  Ordenar por
                </MenuButton>
                <MenuList borderRadius={themeOptions.borderRadius}>
                  <MenuOptionGroup defaultValue="asc" type="radio">
                    <MenuItemOption
                      value="asc"
                      onClick={() => handleChange("asc")}
                    >
                      Ascendente
                    </MenuItemOption>
                    <MenuItemOption
                      value="desc"
                      onClick={() => handleChange("desc")}
                    >
                      Descendente
                    </MenuItemOption>
                    <MenuItemOption
                      value="creationdate"
                      onClick={() => handleChange("create")}
                    >
                      Fecha de creación
                    </MenuItemOption>
                  </MenuOptionGroup>
                </MenuList>
              </Menu>
              <Button
                ps={2}
                as={Button}
                colorScheme={themeOptions.focusColor}
                iconSpacing={1}
                leftIcon={<FiPlus size="20px" />}
                onClick={onOpen}
              >
                Añadir áreas
              </Button>
              <ModalCreateArea isOpen={isOpen} onClose={onClose} />
            </>
          ) : (
            <>
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
                    colorMode === "light"
                      ? "rgb(245, 245, 245)"
                      : "rgb(23, 23, 23)"
                  }
                >
                  <MenuOptionGroup defaultValue="grid" type="radio">
                    <MenuItemOption
                      value="grid"
                      onClick={() => handleViewChange("grid")}
                      bg={colorMode === "light" ? "rgb(245, 245, 245)" : "rgb(23, 23, 23)"}
                      _hover={{ bg: colorMode === "light" ? "rgb(255, 255, 255)" : "rgb(0, 0, 0)" }}
                    >
                      Tablero
                    </MenuItemOption>
                    <MenuItemOption
                      value="list"
                      onClick={() => handleViewChange("list")}
                      bg={colorMode === "light" ? "rgb(245, 245, 245)" : "rgb(23, 23, 23)"}
                      _hover={{ bg: colorMode === "light" ? "rgb(255, 255, 255)" : "rgb(0, 0, 0)" }}
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
                <MenuList borderRadius={themeOptions.borderRadius} bg={colorMode === "light" ? "rgb(245, 245, 245)" : "rgb(23, 23, 23)"}>
                  <MenuOptionGroup
                    title="Alfabéticamente"
                    defaultValue="asc"
                    type="radio"
                  >
                    <MenuItemOption
                      value="asc"
                      onClick={() => handleChange("asc")}
                      bg={colorMode === "light" ? "rgb(245, 245, 245)" : "rgb(23, 23, 23)"}
                      _hover={{ bg: colorMode === "light" ? "rgb(255, 255, 255)" : "rgb(0, 0, 0)" }}
                    >
                      Ascendente
                    </MenuItemOption>
                    <MenuItemOption
                      value="desc"
                      onClick={() => handleChange("desc")}
                      bg={colorMode === "light" ? "rgb(245, 245, 245)" : "rgb(23, 23, 23)"}
                      _hover={{ bg: colorMode === "light" ? "rgb(255, 255, 255)" : "rgb(0, 0, 0)" }}
                    >
                      Descendente
                    </MenuItemOption>
                  </MenuOptionGroup>
                  <MenuDivider />
                  <MenuOptionGroup
                    title="Fecha de creación"
                    defaultValue="asc"
                    type="radio"
                  >
                    <MenuItemOption
                      value="last-creation"
                      onClick={() => handleChange("last-creation")}
                      bg={colorMode === "light" ? "rgb(245, 245, 245)" : "rgb(23, 23, 23)"}
                      _hover={{ bg: colorMode === "light" ? "rgb(255, 255, 255)" : "rgb(0, 0, 0)" }}
                    >
                      Antiguos primeros
                    </MenuItemOption>
                    <MenuItemOption
                      value="new-creation"
                      onClick={() => handleChange("new-creation")}
                      bg={colorMode === "light" ? "rgb(245, 245, 245)" : "rgb(23, 23, 23)"}
                      _hover={{ bg: colorMode === "light" ? "rgb(255, 255, 255)" : "rgb(0, 0, 0)" }}
                    >
                      Recientes primero
                    </MenuItemOption>
                  </MenuOptionGroup>
                </MenuList>
              </Menu>
              <Button
                ps={2}
                as={Button}
                colorScheme={themeOptions.focusColor}
                iconSpacing={1}
                leftIcon={<FiPlus size="20px" />}
                onClick={onOpen}
              >
                Añadir hábito
              </Button>
              <ModalCreateHabitArea isOpen={isOpen} onClose={onClose} />
            </>
          )}
        </HStack>
      </Flex>
    </Box>
  );
};

export default ColumnHeader;
