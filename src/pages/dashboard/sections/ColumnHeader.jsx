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
  MenuOptionGroup,
  MenuItemOption,
  useDisclosure,
  MenuDivider,
  useColorMode,
} from "@chakra-ui/react";
import DatePicker from "react-datepicker";
import { useTheme } from "../../../context/ThemeContext";
import { FiPlus } from "react-icons/fi";
import { GrStatusGood } from "react-icons/gr";
import { MdMoodBad } from "react-icons/md";
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
        <Text as="h2" fontSize="lg" fontWeight="600">
          {props.title}
        </Text>
        <HStack spacing={0}>
          {props.page === "all-areas" ? (
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
                    colorMode === "light" ? "var(--menu-bg)" : "rgb(23, 23, 23)"
                  }
                >
                  <MenuOptionGroup defaultValue="grid" type="radio">
                    <MenuItemOption
                      value="grid"
                      onClick={() => handleViewChange("grid")}
                      bg={
                        colorMode === "light"
                          ? "var(--menu-bg)"
                          : "rgb(23, 23, 23)"
                      }
                      _hover={{
                        bg:
                          colorMode === "light"
                            ? "rgb(237 242 247)"
                            : "rgba(255, 255, 255, 0.06)",
                      }}
                    >
                      Tablero
                    </MenuItemOption>
                    <MenuItemOption
                      value="list"
                      onClick={() => handleViewChange("list")}
                      bg={
                        colorMode === "light"
                          ? "var(--menu-bg)"
                          : "rgb(23, 23, 23)"
                      }
                      _hover={{
                        bg:
                          colorMode === "light"
                            ? "rgb(237 242 247)"
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
                    colorMode === "light" ? "var(--menu-bg)" : "rgb(23, 23, 23)"
                  }
                >
                  <MenuOptionGroup
                    title="Alfabéticamente"
                    defaultValue="asc"
                    type="radio"
                  >
                    <MenuItemOption
                      value="asc"
                      onClick={() => handleChange("asc")}
                      bg={
                        colorMode === "light"
                          ? "var(--menu-bg)"
                          : "rgb(23, 23, 23)"
                      }
                      _hover={{
                        bg:
                          colorMode === "light"
                            ? "rgb(237 242 247)"
                            : "rgba(255, 255, 255, 0.06)",
                      }}
                    >
                      Ascendente
                    </MenuItemOption>
                    <MenuItemOption
                      value="desc"
                      onClick={() => handleChange("desc")}
                      bg={
                        colorMode === "light"
                          ? "var(--menu-bg)"
                          : "rgb(23, 23, 23)"
                      }
                      _hover={{
                        bg:
                          colorMode === "light"
                            ? "rgb(237 242 247)"
                            : "rgba(255, 255, 255, 0.06)",
                      }}
                    >
                      Descendente
                    </MenuItemOption>
                  </MenuOptionGroup>
                  <MenuDivider />
                  <MenuOptionGroup title="Fecha de creación" type="radio">
                    <MenuItemOption
                      value="last-creation"
                      onClick={() => handleChange("last-creation")}
                      bg={
                        colorMode === "light"
                          ? "var(--menu-bg)"
                          : "rgb(23, 23, 23)"
                      }
                      _hover={{
                        bg:
                          colorMode === "light"
                            ? "rgb(237 242 247)"
                            : "rgba(255, 255, 255, 0.06)",
                      }}
                    >
                      Antiguos primeros
                    </MenuItemOption>
                    <MenuItemOption
                      value="new-creation"
                      onClick={() => handleChange("new-creation")}
                      bg={
                        colorMode === "light"
                          ? "var(--menu-bg)"
                          : "rgb(23, 23, 23)"
                      }
                      _hover={{
                        bg:
                          colorMode === "light"
                            ? "rgb(237 242 247)"
                            : "rgba(255, 255, 255, 0.06)",
                      }}
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
                Añadir áreas
              </Button>
              <ModalCreateArea isOpen={isOpen} onClose={onClose} />
            </>
          ) : (
            <>
              {/*<Popover placement="bottom">
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
                  w="auto"
                  h="auto"
                  borderRadius={themeOptions.borderRadius}
                  border="none"
                  bg={colorMode === "light" ? "white" : "black"}
                >
                  <Box
                    sx={{
                      ".react-datepicker": {
                        backgroundColor:
                          colorMode === "light" ? "white" : "black",
                        borderRadius: themeOptions.borderRadius,
                        fontFamily: themeOptions.fontFamily,
                        border: "none",
                      },
                      ".react-datepicker__header": {
                        color: colorMode === "light" ? "black" : "white",
                        backgroundColor:
                          colorMode === "light" ? "white" : "black",
                        borderTopRadius: themeOptions.borderRadius,
                        borderBottom:
                          "1px solid var(--chakra-colors-chakra-border-color)",
                      },
                      ".react-datepicker__current-month, .react-datepicker__day-name":
                        {
                          color: colorMode === "light" ? "black" : "white",
                          fontWeight: "600",
                        },
                      ".react-datepicker__day": {
                        fontWeight: "600",
                        color: colorMode === "light" ? "gray.900" : "gray.300",
                        transition: ".1s all linear",
                        borderRadius: themeOptions.borderRadius,
                        _hover: {
                          backgroundColor: `var(--chakra-colors-${themeOptions.focusColor}-300) !important`,
                          color: "white",
                          borderRadius: themeOptions.borderRadius,
                        },
                      },
                      ".react-datepicker__day--selected": {
                        backgroundColor: `var(--chakra-colors-${themeOptions.focusColor}-500)`,
                        color: "white",
                        borderRadius: themeOptions.borderRadius,
                      },
                      ".react-datepicker__day--outside-month": {
                        color: "gray.400",
                      },
                    }}
                  >
                    <DatePicker
                      selected={selectedDate}
                      onChange={handleDateChange}
                      inline
                    />
                  </Box>
                </PopoverContent>
              </Popover>*/}
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
                    colorMode === "light" ? "var(--menu-bg)" : "rgb(23, 23, 23)"
                  }
                >
                  <MenuOptionGroup defaultValue="grid" type="radio">
                    <MenuItemOption
                      value="grid"
                      onClick={() => handleViewChange("grid")}
                      bg={
                        colorMode === "light"
                          ? "var(--menu-bg)"
                          : "rgb(23, 23, 23)"
                      }
                      _hover={{
                        bg:
                          colorMode === "light"
                            ? "rgb(237 242 247)"
                            : "rgba(255, 255, 255, 0.06)",
                      }}
                    >
                      Tablero
                    </MenuItemOption>
                    <MenuItemOption
                      value="list"
                      onClick={() => handleViewChange("list")}
                      bg={
                        colorMode === "light"
                          ? "var(--menu-bg)"
                          : "rgb(23, 23, 23)"
                      }
                      _hover={{
                        bg:
                          colorMode === "light"
                            ? "rgb(237 242 247)"
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
                    colorMode === "light" ? "var(--menu-bg)" : "rgb(23, 23, 23)"
                  }
                >
                  <MenuOptionGroup
                    title="Alfabéticamente"
                    defaultValue="asc"
                    type="radio"
                  >
                    <MenuItemOption
                      value="asc"
                      onClick={() => handleChange("asc")}
                      bg={
                        colorMode === "light"
                          ? "var(--menu-bg)"
                          : "rgb(23, 23, 23)"
                      }
                      _hover={{
                        bg:
                          colorMode === "light"
                            ? "rgb(237 242 247)"
                            : "rgba(255, 255, 255, 0.06)",
                      }}
                    >
                      Ascendente
                    </MenuItemOption>
                    <MenuItemOption
                      value="desc"
                      onClick={() => handleChange("desc")}
                      bg={
                        colorMode === "light"
                          ? "var(--menu-bg)"
                          : "rgb(23, 23, 23)"
                      }
                      _hover={{
                        bg:
                          colorMode === "light"
                            ? "rgb(237 242 247)"
                            : "rgba(255, 255, 255, 0.06)",
                      }}
                    >
                      Descendente
                    </MenuItemOption>
                  </MenuOptionGroup>
                  <MenuDivider />
                  <MenuOptionGroup title="Fecha de creación" type="radio">
                    <MenuItemOption
                      value="last-creation"
                      onClick={() => handleChange("last-creation")}
                      bg={
                        colorMode === "light"
                          ? "var(--menu-bg)"
                          : "rgb(23, 23, 23)"
                      }
                      _hover={{
                        bg:
                          colorMode === "light"
                            ? "rgb(237 242 247)"
                            : "rgba(255, 255, 255, 0.06)",
                      }}
                    >
                      Antiguos primeros
                    </MenuItemOption>
                    <MenuItemOption
                      value="new-creation"
                      onClick={() => handleChange("new-creation")}
                      bg={
                        colorMode === "light"
                          ? "var(--menu-bg)"
                          : "rgb(23, 23, 23)"
                      }
                      _hover={{
                        bg:
                          colorMode === "light"
                            ? "rgb(237 242 247)"
                            : "rgba(255, 255, 255, 0.06)",
                      }}
                    >
                      Recientes primero
                    </MenuItemOption>
                  </MenuOptionGroup>
                </MenuList>
              </Menu>
              <Menu>
                <MenuButton
                  ps={3}
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
          )}
        </HStack>
      </Flex>
    </Box>
  );
};

export default ColumnHeader;
