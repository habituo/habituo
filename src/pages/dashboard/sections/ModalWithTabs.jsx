import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Text,
  Avatar,
  VStack,
  HStack,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  Menu,
  MenuButton,
  MenuList,
  MenuItemOption,
  MenuOptionGroup,
  Button,
  Grid,
  GridItem,
  Box,
  Tooltip,
  useColorMode,
  Input,
  FormLabel,
  Image,
  Badge,
  useToast,
  Icon,
  FormControl,
  SimpleGrid,
  Switch,
  Link,
} from "@chakra-ui/react";
import { useTheme } from "../../../context/ThemeContext";
import gLogo from "../../../assets/images/icons/g-icon.webp";
import mailLogo from "../../../assets/images/icons/mail.svg";
import * as LuIcons from "react-icons/lu";
import DeleteAccountButton from "./DeleteAccount";
import { getAuth } from "firebase/auth";
import { updateUserData, logoutUser } from "../../../hooks/database";
import { TbBrandPatreon } from "react-icons/tb";

// ModalWithTabs component: Displays a modal with tabs for account settings and general settings.
const ModalWithTabs = ({ isOpen, onClose, userInfo, userData }) => {
  const [activeTab, setActiveTab] = useState(0);
  const { colorMode, toggleColorMode } = useColorMode();
  const { themeOptions } = useTheme();
  const [selectedValue, setSelectedValue] = useState("monday");
  const [selectedLang, setSelectedLang] = useState("esp");
  const [name, setName] = useState(userData?.name || "");
  const [isNameValid, setIsNameValid] = useState(true);
  const [isNameChanged, setIsNameChanged] = useState(false);
  const [currentNameInDB, setCurrentNameInDB] = useState(userData?.name || "");
  const [birthDay, setBirthDay] = useState(userData?.birthday_date || "");
  const [isBirthDayChanged, setIsBirthDayChanged] = useState(false);
  const [currentBirthDayInDB, setCurrentBirthDayInDB] = useState(
    userData?.birthday_date || ""
  );

  const auth = getAuth();
  const user = auth.currentUser;
  const toast = useToast();

  /**
   * Handles the tab change event when a user clicks on a tab in a UI component.
   * @function handleTabChange
   * @param {number} index - The index of the tab that was clicked. This index typically corresponds to the position of the tab in the tab list (e.g., 0 for the first tab, 1 for the second, etc.).
   * @returns {void} This function updates the component's state.
   */
  const handleTabChange = (index) => {
    setActiveTab(index);
  };

  /**
   * Handles the change event when a user selects a new first day of the week from a select input.
   * @function handleDayChange
   * @param {string} value - The value of the selected first day of the week (e.g., 'monday', 'sunday'). This value should correspond to one of the keys in the `valueToLabel` object or a similar data structure.
   * @returns {void} This function updates the component's state.
   */
  const handleDayChange = (value) => {
    setSelectedValue(value);
  };

  /**
   * Handles the change event when a user selects a new language from a select input.
   * @function handleLangChange
   * @param {string} value - The code of the selected language (e.g., 'esp' for Spanish, 'eng' for English).
   * @returns {void} This function updates the component's state.
   */
  const handleLangChange = (value) => {
    setSelectedLang(value);
  };

  /**
   * An object mapping the values used for the first day of the week in a select input to their human-readable labels in Spanish.
   * @constant {object} valueToLabel
   * @property {string} monday - The label for Monday ('Lunes').
   * @property {string} sunday - The label for Sunday ('Domingo').
   */
  const valueToLabel = {
    monday: "Lunes",
    sunday: "Domingo",
  };

  /**
   * An object mapping language codes to their human-readable labels in Spanish.
   * @constant {object} langToLabel
   * @property {string} esp - The label for Spanish ('Español').
   * @property {string} eng - The label for English ('Inglés').
   */
  const langToLabel = {
    esp: "Español",
    eng: "Inglés",
  };

  /**
   * Handles the change event of the name input field.
   * @function handleChangeName
   * @param {React.ChangeEvent<HTMLInputElement>} e - The change event object from the input field.
   * @returns {void} This function updates the component's state variables (`name`, `isNameValid`, `isNameChanged`).
   */
  const handleChangeName = (e) => {
    const newName = e.target.value;
    setName(newName);

    const isValid = /^[a-zA-Z0-9\s]*$/.test(newName);

    setIsNameValid(isValid);
    setIsNameChanged(isValid && newName !== currentNameInDB);
  };

  /**
   * Handles the process of saving the user's name to the database.
   * @async
   * @function handleSaveName
   * @returns {void} This function does not directly return a value but triggers the saving process and displays notifications based on the outcome and input validity.
   */
  const handleSaveName = async () => {
    if (user?.uid && isNameChanged && isNameValid) {
      try {
        await updateUserData(user.uid, { name: name });
        toast({
          title: <Text fontWeight="600">Nombre actualizado</Text>,
          description: "Tu nombre ha sido guardado.",
          status: "success",
          position: "bottom",
        });
        setCurrentNameInDB(name);
        setIsNameChanged(false);
      } catch (error) {
        toast({
          title: <Text fontWeight="600">Error al actualizar el nombre</Text>,
          description: error.message,
          status: "error",
          position: "bottom",
        });
      }
    } else if (!isNameValid) {
      toast({
        title: "Nombre inválido",
        description: "Solo se permiten letras y números.",
        status: "warning",
        position: "bottom",
      });
    }
  };

  /**
   * Handles the change event of the birthday input field.
   * @function handleBirthDayChange
   * @param {React.ChangeEvent<HTMLInputElement>} e - The change event object from the input field.
   * The `e.target.value` contains the newly selected birthday date string (typically in 'YYYY-MM-DD' format).
   * @returns {void} This function updates the component's state variables.
   */
  const handleBirthDayChange = (e) => {
    const newBirthDay = e.target.value;
    setBirthDay(newBirthDay);
    setIsBirthDayChanged(newBirthDay && newBirthDay !== currentBirthDayInDB);
  };

  /**
   * Handles the process of saving the user's birthday to the database.
   * @async
   * @function handleSaveBirthDay
   * @returns {void} This function does not directly return a value but triggers the saving process and displays notifications based on the outcome.
   */
  const handleSaveBirthDay = async () => {
    if (user?.uid && isBirthDayChanged) {
      try {
        await updateUserData(user.uid, { birthday_date: birthDay });
        toast({
          title: <Text fontWeight="600">Fecha de nacimiento actualizada</Text>,
          description: "Tu fecha de nacimiento ha sido guardada.",
          status: "success",
          position: "bottom",
        });
        setIsBirthDayChanged(false);
      } catch (error) {
        toast({
          title: (
            <Text fontWeight="600">
              Error al actualizar la fecha de nacimiento
            </Text>
          ),
          description: error.message,
          status: "error",
          position: "bottom",
        });
      }
    }
  };

  /**
   * Handles the user logout process.
   * @async
   * @function handleLogout
   * @returns {void} This function does not directly return a value but triggers the logout process.
   */
  const handleLogout = async () => {
    logoutUser(toast);
  };

  /**
   * A dynamic tab button component that renders an icon and text.
   * @param {object} props - The component's props.
   * @param {string} props.iconName - The name of the Lucide icon to render (e.g., 'LuHome').
   * @param {string} props.buttonText - The text to display on the button.
   * @param {function} props.onClick - The function to call when the button is clicked.
   * @param {boolean} props.isActive - A boolean indicating whether the tab is currently active.
   * @param {object} props.themeOptions - An object containing theme-related options, such as `borderRadius` and `focusColor`.
   * @param {number} props.tabIndex - The index of the tab, which will be passed to the `onClick` function.
   * @returns {JSX.Element} The dynamic tab button component.
   */
  const DynamicTabButton = ({
    iconName,
    buttonText,
    onClick,
    isActive,
    themeOptions,
    tabIndex,
  }) => {
    const renderIcon = (iconName) => {
      const IconComponent = LuIcons[iconName];
      if (IconComponent) {
        return <IconComponent size="16px" />;
      }
      return null;
    };

    const textColor = isActive
      ? colorMode === "light"
        ? "#FFFFFF"
        : "#000000"
      : colorMode === "light"
      ? "#000000"
      : "#FFFFFF";
    const bgColor = isActive
      ? colorMode === "light"
        ? "#FFFFFF20"
        : "#00000020"
      : colorMode === "light"
      ? "#00000010"
      : "#FFFFFF10";

    return (
      <Button
        px={1.5}
        fontSize="sm"
        fontWeight={400}
        display="flex"
        justifyContent="flex-start"
        onClick={() => onClick(tabIndex)}
        width="100%"
        variant={isActive ? "solid" : "ghost"}
        colorScheme={isActive ? themeOptions?.focusColor : ""}
        color={textColor}
        _focusVisible="none"
        leftIcon={
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            borderRadius={themeOptions?.borderRadius}
            bg={bgColor}
            color={textColor}
            width="30px"
            height="30px"
          >
            {renderIcon(iconName)}
          </Box>
        }
      >
        {buttonText}
      </Button>
    );
  };

  /**
   * A dynamic web button component that renders an icon, name, and description, linking to an external website.
   * @param {object} props - The component's props.
   * @param {string} props.iconName - The name of the Lucide icon to render (e.g., 'LuGlobe').
   * @param {string} props.webName - The name of the website or link.
   * @param {string} props.webDesc - A short description of the website or link.
   * @param {string} props.webLink - The URL to navigate to when the button is clicked.
   * @param {object} props.themeOptions - An object containing theme-related options, such as `borderRadius`.
   * @returns {JSX.Element} The dynamic web button component (a Chakra UI `Link`).
   */
  const DynamicWebButton = ({
    iconName,
    webName,
    webDesc,
    webLink,
    themeOptions,
  }) => {
    const renderIcon = (iconName) => {
      const IconComponent = LuIcons[iconName];
      if (IconComponent) {
        return <IconComponent size={30} />;
      }
      return null;
    };

    return (
      <Link
        p={4}
        position="relative"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap={0}
        borderWidth="1px"
        borderColor="var(--chakra-colors-chakra-border-color)"
        borderRadius={themeOptions.borderRadius}
        href={webLink}
        target="_blank"
      >
        <Box
          position="absolute"
          top={-2}
          right={-2}
          w={6}
          h={6}
          bg={colorMode === "light" ? "rgb(230, 230, 230)" : "rgb(10, 10, 10)"}
          borderRadius="50%"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <LuIcons.LuExternalLink size={14} />
        </Box>
        {renderIcon(iconName)}
        <Text fontSize="md" fontWeight="600" textAlign="center">
          {webName}
        </Text>
        <Text
          fontSize="xs"
          fontWeight={400}
          color={colorMode === "light" ? "#00000080" : "#FFFFFF60"}
          textAlign="center"
        >
          {webDesc}
        </Text>
      </Link>
    );
  };

  /**
   * Determines the username to display in the user interface.
   * It prioritizes different properties to fetch the username:
   * 1. `userInfo.displayName` (if available, typically from the authentication provider).
   * 2. `userData.name` (if `displayName` is not available, potentially a user-set name from the database).
   * 3. The part of the `userInfo.email` before the "@" symbol (as a fallback if neither `displayName` nor `userData.name` is present).
   * @let userName
   * @type {string}
   * @default ""
   */
  let userName = "";
  if (userInfo?.displayName) {
    userName = userInfo.displayName;
  } else if (userData?.name) {
    userName = userData.name;
  } else if (userInfo?.email) {
    userName = userInfo.email.split("@")[0];
  }

  /**
   * Determines the color associated with the user's account type.
   * It checks the `userData.typeAccount` property and assigns a specific color.
   * @let typeAccountColor
   * @type {string}
   * @default ""
   */
  let typeAccountColor = "";
  if (userData && userData.typeAccount) {
    if (userData.typeAccount === "basic") {
      typeAccountColor = "gray";
    } else if (userData.typeAccount === "pro") {
      typeAccountColor = "blue";
    } else if (userData.typeAccount === "insider") {
      typeAccountColor = "yellow";
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" isCentered>
      <ModalOverlay />
      <ModalContent
        h={588}
        borderRadius={themeOptions.borderRadius}
        bg={colorMode === "light" ? "rgb(245, 245, 245)" : "rgb(23, 23, 23)"}
      >
        <ModalCloseButton
          position="absolute"
          right={2}
          top={2}
          borderRadius={themeOptions.borderRadius}
        />
        <ModalBody p={4} fontFamily={themeOptions.fontFamily}>
          <Grid p={0} h="100%" templateColumns="1fr 3fr" gap={0}>
            <GridItem
              pr={4}
              h="auto"
              borderRight="1px"
              borderColor="var(--chakra-colors-chakra-border-color)"
              bg={
                colorMode === "light" ? "rgb(245, 245, 245)" : "rgb(23, 23, 23)"
              }
            >
              <Text
                mb={1}
                fontSize="xs"
                fontWeight={600}
                textTransform="uppercase"
                color={colorMode === "light" ? "#00000050" : "#FFFFFF50"}
              >
                Ajustes de la cuenta
              </Text>
              <VStack align="start" spacing={0}>
                <DynamicTabButton
                  iconName="LuUserRound"
                  buttonText="Mi perfil"
                  isActive={activeTab === 0}
                  themeOptions={themeOptions}
                  tabIndex={0}
                  onClick={handleTabChange}
                />
              </VStack>
              <Text
                mt={4}
                mb={1}
                fontSize="xs"
                fontWeight={600}
                textTransform="uppercase"
                color={colorMode === "light" ? "#00000050" : "#FFFFFF50"}
              >
                Configuración
              </Text>
              <VStack align="start" spacing={2}>
                <DynamicTabButton
                  iconName="LuSettings"
                  buttonText="General"
                  isActive={activeTab === 1}
                  themeOptions={themeOptions}
                  tabIndex={1}
                  onClick={handleTabChange}
                />
              </VStack>
              <Text
                mt={4}
                mb={1}
                fontSize="xs"
                fontWeight={600}
                textTransform="uppercase"
                color={colorMode === "light" ? "#00000050" : "#FFFFFF50"}
              >
                Soporte
              </Text>
              <VStack align="start" spacing={2}>
                <DynamicTabButton
                  iconName="LuGlobe"
                  buttonText="Páginas generales"
                  isActive={activeTab === 2}
                  themeOptions={themeOptions}
                  tabIndex={2}
                  onClick={handleTabChange}
                />
                <DynamicTabButton
                  iconName="LuHeart"
                  buttonText="Apoyo al proyecto"
                  isActive={activeTab === 3}
                  themeOptions={themeOptions}
                  tabIndex={3}
                  onClick={handleTabChange}
                />
                <DynamicTabButton
                  iconName="LuBookText"
                  buttonText="Documentación"
                  isActive={activeTab === 4}
                  themeOptions={themeOptions}
                  tabIndex={4}
                  onClick={handleTabChange}
                />
                <DynamicTabButton
                  iconName="LuShieldCheck"
                  buttonText="Política de privacidad"
                  isActive={activeTab === 5}
                  themeOptions={themeOptions}
                  tabIndex={5}
                  onClick={handleTabChange}
                />
                <DynamicTabButton
                  iconName="LuNewspaper"
                  buttonText="Términos de uso"
                  isActive={activeTab === 6}
                  themeOptions={themeOptions}
                  tabIndex={6}
                  onClick={handleTabChange}
                />
              </VStack>
            </GridItem>

            <GridItem
              h="auto"
              pl={4}
              bg={
                colorMode === "light" ? "rgb(245, 245, 245)" : "rgb(23, 23, 23)"
              }
            >
              {/* Tab 01 - Mi perfil */}
              {activeTab === 0 && (
                <Box
                  bg={
                    colorMode === "light"
                      ? "rgb(245, 245, 245)"
                      : "rgb(23, 23, 23)"
                  }
                >
                  <Text mb={2} fontSize="2xl" fontWeight={600}>
                    Perfil
                  </Text>
                  <HStack gap={4}>
                    <Avatar
                      src={`//wsrv.nl/?url=${userInfo.photoURL}`}
                      name={userName}
                      size="xl"
                    >
                      <Badge
                        top={0}
                        right={-2}
                        colorScheme={typeAccountColor}
                        variant="solid"
                        position="absolute"
                        fontWeight={600}
                      >
                        {userData.typeAccount}
                      </Badge>
                    </Avatar>
                    <Box>
                      <FormLabel
                        mb={1}
                        fontSize="xs"
                        fontWeight={600}
                        textTransform="uppercase"
                        color={
                          colorMode === "light" ? "#00000050" : "#FFFFFF50"
                        }
                      >
                        Nombre de usuario
                      </FormLabel>
                      <HStack>
                        <Input
                          type="text"
                          value={name}
                          onChange={handleChangeName}
                          borderRadius={themeOptions.borderRadius}
                          colorScheme={themeOptions.focusColor}
                          _focusVisible="none"
                        />
                        <IconButton
                          colorScheme={themeOptions.focusColor}
                          onClick={handleSaveName}
                          isDisabled={!isNameChanged}
                        >
                          <LuIcons.LuCheck />
                        </IconButton>
                      </HStack>
                    </Box>
                    <Box>
                      <FormLabel
                        mb={1}
                        fontSize="xs"
                        fontWeight={600}
                        textTransform="uppercase"
                        color={
                          colorMode === "light" ? "#00000050" : "#FFFFFF50"
                        }
                      >
                        Fecha de nacimiento
                      </FormLabel>
                      <HStack>
                        <Input
                          type="date"
                          value={birthDay}
                          onChange={handleBirthDayChange}
                          borderRadius={themeOptions.borderRadius}
                          colorScheme={themeOptions.focusColor}
                          _focusVisible="none"
                        />
                        <IconButton
                          colorScheme={themeOptions.focusColor}
                          onClick={handleSaveBirthDay}
                          isDisabled={!isBirthDayChanged}
                        >
                          <LuIcons.LuCheck />
                        </IconButton>
                      </HStack>
                    </Box>
                  </HStack>
                  <FormLabel
                    mt={5}
                    mb={1}
                    fontSize="xs"
                    fontWeight={600}
                    textTransform="uppercase"
                    color={colorMode === "light" ? "#00000050" : "#FFFFFF50"}
                  >
                    Datos personales
                  </FormLabel>
                  <Box>
                    <HStack
                      mt={1}
                      p={2}
                      border="1px solid"
                      borderColor="var(--chakra-colors-chakra-border-color)"
                      borderRadius={themeOptions.borderRadius}
                      display="flex"
                      flexDirection="row"
                      alignItems="center"
                      justifyContent="space-between"
                      gap={4}
                    >
                      <Box maxW="70%">
                        <Text fontSize="md" fontWeight={600}>
                          Correo electrónico
                          {userInfo.emailVerified && (
                            <>
                              <Tooltip
                                label="Correo verificado"
                                placement="right"
                                fontSize="sm"
                                bg={
                                  colorMode === "light"
                                    ? "rgb(23, 23, 23)"
                                    : "rgb(245, 245, 245)"
                                }
                                color={
                                  colorMode === "light" ? "#FFFFFF" : "#000000"
                                }
                                borderRadius={themeOptions.borderRadius}
                              >
                                <Icon ml={1} fontSize={20}>
                                  <LuIcons.LuCircleCheck />
                                </Icon>
                              </Tooltip>
                            </>
                          )}
                        </Text>
                        <Text fontSize="sm" fontWeight={400}>
                          {userInfo.email}
                        </Text>
                      </Box>
                      {!userInfo.emailVerified && (
                        <Button
                          px={4}
                          py={0}
                          colorScheme={themeOptions.focusColor}
                          variant="solid"
                        >
                          Verificar correo
                        </Button>
                      )}
                    </HStack>
                  </Box>
                  <FormLabel
                    mt={5}
                    mb={1}
                    fontSize="xs"
                    fontWeight={600}
                    textTransform="uppercase"
                    color={colorMode === "light" ? "#00000050" : "#FFFFFF50"}
                  >
                    Método de registro
                  </FormLabel>
                  <Box>
                    <HStack
                      mt={1}
                      p={2}
                      border="1px solid"
                      borderColor="var(--chakra-colors-chakra-border-color)"
                      borderRadius={themeOptions.borderRadius}
                    >
                      {userData.authProvider === "email" ? (
                        <>
                          <Image mx={2} src={mailLogo} w="30px" h="30px" />
                          <Box
                            display="flex"
                            flexDirection="column"
                            alignItems="flex-start"
                            justifyContent="center"
                            gap={0}
                            fontFamily={themeOptions.fontFamily}
                          >
                            <Text fontSize="md" fontWeight={600}>
                              Correo electrónico
                            </Text>
                            <Text fontSize="sm" fontWeight={400}>
                              {userInfo.email}
                            </Text>
                          </Box>
                        </>
                      ) : (
                        <>
                          <Image mx={2} src={gLogo} w="30px" h="30px" />
                          <Box>
                            <Text fontSize="md" fontWeight={600}>
                              Cuenta de Google
                            </Text>
                            <Text fontSize="sm" fontWeight={400}>
                              {userInfo.email}
                            </Text>
                          </Box>
                        </>
                      )}
                    </HStack>
                  </Box>
                  <FormLabel
                    mt={5}
                    mb={1}
                    fontSize="xs"
                    fontWeight={600}
                    textTransform="uppercase"
                    color={colorMode === "light" ? "#00000050" : "#FFFFFF50"}
                  >
                    Zona de peligro
                  </FormLabel>
                  <Box>
                    <HStack
                      mt={1}
                      p={2}
                      border="1px solid"
                      borderColor="var(--chakra-colors-chakra-border-color)"
                      borderRadius={themeOptions.borderRadius}
                      display="flex"
                      flexDirection="row"
                      alignItems="center"
                      justifyContent="space-between"
                      gap={4}
                    >
                      <Box maxW="70%">
                        <Text fontSize="md" fontWeight={600}>
                          Cerrar sesión
                        </Text>
                        <Text
                          fontSize="xs"
                          fontWeight={400}
                          color={
                            colorMode === "light" ? "#00000080" : "#FFFFFF60"
                          }
                        >
                          Si deseas cerrar sesión, podrás volver cuando quieras
                          y no perderás el progreso de la cuenta.
                        </Text>
                      </Box>
                      <Button
                        px={4}
                        py={0}
                        colorScheme="red"
                        variant="solid"
                        onClick={handleLogout}
                      >
                        Cerrar sesión
                      </Button>
                    </HStack>
                    <HStack
                      mt={2}
                      p={2}
                      border="1px solid"
                      borderColor="var(--chakra-colors-chakra-border-color)"
                      borderRadius={themeOptions.borderRadius}
                      display="flex"
                      flexDirection="row"
                      alignItems="center"
                      justifyContent="space-between"
                      gap={4}
                    >
                      <Box maxW="70%">
                        <Text fontSize="md" fontWeight={600}>
                          Eliminar cuenta
                        </Text>
                        <Text
                          fontSize="xs"
                          fontWeight={400}
                          color={
                            colorMode === "light" ? "#00000080" : "#FFFFFF60"
                          }
                        >
                          Tras eliminar la cuenta se perderá todo el proceso y
                          datos que hay actualmente en ella. No se podrá
                          recuperar la cuenta una vez eliminada.
                        </Text>
                      </Box>
                      <DeleteAccountButton w="1000px" />
                    </HStack>
                  </Box>
                </Box>
              )}

              {/* Tab 02 - General */}
              {activeTab === 1 && (
                <Box>
                  <Text fontSize="2xl" fontWeight="semibold">
                    General
                  </Text>
                  <HStack
                    py={2}
                    display="flex"
                    justifyContent="space-between"
                    gap={2}
                    borderBottom="1px"
                    borderColor="var(--chakra-colors-chakra-border-color)"
                  >
                    <Box maxW="70%">
                      <Text fontSize="md" fontWeight="600">
                        Tema
                      </Text>
                      <Text
                        fontSize="xs"
                        fontWeight={400}
                        color={
                          colorMode === "light" ? "#00000080" : "#FFFFFF60"
                        }
                      >
                        Cambia el tema de la página al modo oscuro o al modo
                        claro.
                      </Text>
                    </Box>
                    <IconButton
                      fontSize="lg"
                      bg="transparent"
                      onChange={toggleColorMode}
                      onClick={toggleColorMode}
                      size="sm"
                      borderRadius={themeOptions.borderRadius}
                      outline="none"
                    >
                      {colorMode === "light" ? (
                        <LuIcons.LuSun />
                      ) : (
                        <LuIcons.LuMoon />
                      )}
                    </IconButton>
                  </HStack>
                  <HStack
                    py={4}
                    display="flex"
                    justifyContent="space-between"
                    gap={4}
                    borderBottom="1px"
                    borderColor="var(--chakra-colors-chakra-border-color)"
                  >
                    <Box>
                      <Text fontSize="md" fontWeight={600}>
                        Primer día de la semana
                      </Text>
                      <Text
                        fontSize="xs"
                        fontWeight={400}
                        color={
                          colorMode === "light" ? "#00000080" : "#FFFFFF60"
                        }
                      >
                        Elige el día en el que comienza la semana.
                      </Text>
                    </Box>
                    <Menu closeOnSelect={true}>
                      <MenuButton
                        as={Button}
                        p={4}
                        textAlign="left"
                        variant="ghost"
                        size="sm"
                        borderWidth={1}
                        borderColor={`var(--chakra-colors-chakra-border-color)`}
                        _focusVisible="none"
                        _hover={{
                          bg: "none",
                          borderColor:
                            colorMode === "light"
                              ? "#CBD5E0"
                              : "rgba(255, 255, 255, 0.24)",
                        }}
                      >
                        {valueToLabel[selectedValue] || "Seleccionar día"}
                      </MenuButton>
                      <MenuList
                        borderRadius={themeOptions.borderRadius}
                        bg={
                          colorMode === "light"
                            ? "var(--menu-bg)"
                            : "rgb(23, 23, 23)"
                        }
                      >
                        <MenuOptionGroup
                          type="radio"
                          value={selectedValue}
                          onChange={handleDayChange}
                        >
                          <MenuItemOption
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
                            value="monday"
                          >
                            Lunes
                          </MenuItemOption>
                          <MenuItemOption
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
                            value="sunday"
                            disabled
                          >
                            Domingo
                          </MenuItemOption>
                        </MenuOptionGroup>
                      </MenuList>
                    </Menu>
                  </HStack>
                  <HStack
                    py={4}
                    display="flex"
                    justifyContent="space-between"
                    gap={4}
                    borderBottom="1px"
                    borderColor="var(--chakra-colors-chakra-border-color)"
                  >
                    <Box maxW="70%">
                      <Text fontSize="md" fontWeight="600">
                        Idioma global
                      </Text>
                      <Text
                        fontSize="xs"
                        fontWeight={400}
                        color={
                          colorMode === "light" ? "#00000080" : "#FFFFFF60"
                        }
                      >
                        Selecciona el idioma que más se adapte a ti.
                      </Text>
                    </Box>
                    <Menu closeOnSelect={true}>
                      <MenuButton
                        as={Button}
                        p={4}
                        textAlign="left"
                        variant="ghost"
                        size="sm"
                        borderWidth={1}
                        borderColor={`var(--chakra-colors-chakra-border-color)`}
                        _focusVisible="none"
                        _hover={{
                          bg: "none",
                          borderColor:
                            colorMode === "light"
                              ? "#CBD5E0"
                              : "rgba(255, 255, 255, 0.24)",
                        }}
                      >
                        {langToLabel[selectedLang] || "Seleccionar idioma"}
                      </MenuButton>
                      <MenuList
                        borderRadius={themeOptions.borderRadius}
                        bg={
                          colorMode === "light"
                            ? "var(--menu-bg)"
                            : "rgb(23, 23, 23)"
                        }
                      >
                        <MenuOptionGroup
                          type="radio"
                          value={selectedLang}
                          onChange={handleLangChange}
                        >
                          <MenuItemOption
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
                            value="esp"
                          >
                            Español
                          </MenuItemOption>
                          <MenuItemOption
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
                            value="eng"
                          >
                            Inglés
                          </MenuItemOption>
                        </MenuOptionGroup>
                      </MenuList>
                    </Menu>
                  </HStack>
                  <HStack
                    py={4}
                    display="flex"
                    flexDirection="column"
                    alignItems="flex-start"
                    justifyContent="flex-start"
                    gap={4}
                  >
                    <Box>
                      <Text fontSize="md" fontWeight={600}>
                        Notificaciones
                      </Text>
                      <Text
                        fontSize="xs"
                        fontWeight={400}
                        color={
                          colorMode === "light" ? "#00000080" : "#FFFFFF60"
                        }
                      >
                        Modifica las notificaciones para no perderte ninguna
                        novedad.
                      </Text>
                    </Box>
                    <VStack spacing={2}>
                      <Box
                        w="100%"
                        display="flex"
                        alignItems="flex-start"
                        justifyContent="flex-start"
                        gap={0}
                      >
                        <Text w="50%" fontWeight={500} fontSize="15px">
                          Marketing
                        </Text>
                        <Text w="50%" fontWeight={500} fontSize="15px">
                          Sistema
                        </Text>
                      </Box>
                      <Box
                        w="100%"
                        display="flex"
                        alignItems="flex-start"
                        justifyContent="flex-start"
                        gap={0}
                      >
                        <FormControl
                          as={SimpleGrid}
                          columns={2}
                          w="50%"
                          justifyContent="flex-start"
                        >
                          <FormLabel
                            htmlFor="notificationsMarketingEmail"
                            fontWeight={400}
                            fontSize="14px"
                          >
                            Correo electrónico
                          </FormLabel>
                          <Switch
                            id="notificationsMarketingEmail"
                            defaultChecked
                          />
                          <FormLabel
                            htmlFor="notificationsMarketingBrowser"
                            fontWeight={400}
                            fontSize="14px"
                          >
                            Navegador web
                          </FormLabel>
                          <Switch id="notificationsMarketingBrowser" />
                        </FormControl>
                        <FormControl
                          as={SimpleGrid}
                          columns={2}
                          w="50%"
                          justifyContent="flex-start"
                        >
                          <FormLabel
                            htmlFor="notificationsSystemEmail"
                            fontWeight={400}
                            fontSize="14px"
                          >
                            Correo electrónico
                          </FormLabel>
                          <Switch id="notificationsSystemEmail" />
                          <FormLabel
                            htmlFor="notificationsSystemBrowser"
                            fontWeight={400}
                            fontSize="14px"
                          >
                            Navegador web
                          </FormLabel>
                          <Switch
                            id="notificationsSystemBrowser"
                            defaultChecked
                          />
                        </FormControl>
                      </Box>
                    </VStack>
                  </HStack>
                </Box>
              )}

              {/* Tab 03 - Páginas principales */}
              {activeTab === 2 && (
                <Box>
                  <Text fontSize="2xl" fontWeight="semibold">
                    Páginas generales
                  </Text>
                  <Box
                    mt={4}
                    as={SimpleGrid}
                    columns={{ base: 2, lg: 3 }}
                    gap={4}
                    py={2}
                  >
                    <DynamicWebButton
                      iconName="LuGlobe"
                      webName="Habituo"
                      webDesc="Página principal de habituo"
                      webLink="https://habituo.es"
                      themeOptions={themeOptions}
                    />
                    <Link
                      p={4}
                      position="relative"
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      justifyContent="center"
                      gap={0}
                      borderWidth="1px"
                      borderColor="var(--chakra-colors-chakra-border-color)"
                      borderRadius={themeOptions.borderRadius}
                      href="http://patreon.com/habituo"
                      target="_blank"
                    >
                      <Box
                        position="absolute"
                        top={-2}
                        right={-2}
                        w={6}
                        h={6}
                        bg={
                          colorMode === "light"
                            ? "rgb(230, 230, 230)"
                            : "rgb(10, 10, 10)"
                        }
                        borderRadius="50%"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <LuIcons.LuExternalLink size={14} />
                      </Box>
                      <TbBrandPatreon size={30} />
                      <Text fontSize="md" fontWeight="600" textAlign="center">
                        Patreon
                      </Text>
                      <Text
                        fontSize="xs"
                        fontWeight={400}
                        color={
                          colorMode === "light" ? "#00000080" : "#FFFFFF60"
                        }
                        textAlign="center"
                      >
                        Página para apoyar al proyecto
                      </Text>
                    </Link>
                    <DynamicWebButton
                      iconName="LuSun"
                      webName="Documentación"
                      webDesc="Documentación general del proyecto"
                      webLink="https://habituo.es/docs"
                      themeOptions={themeOptions}
                    />
                  </Box>
                </Box>
              )}
            </GridItem>
          </Grid>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

ModalWithTabs.propTypes = {
  userInfo: PropTypes.shape({
    email: PropTypes.string.isRequired,
    displayName: PropTypes.string,
    photoURL: PropTypes.string,
  }).isRequired,
  userData: PropTypes.object,
};

export default ModalWithTabs;
