import {
  Button,
  FormControl,
  FormLabel,
  HStack,
  Menu,
  MenuButton,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Spinner,
  Switch,
  Text,
  VStack,
} from "@chakra-ui/react";
import PropTypes from "prop-types";

/**
 * Content for the 'Preferences' tab in the User Settings Modal.
 * It manages application-wide settings like Dark Mode, Start of Week, and Language.
 *
 * @param {object} props - Component properties.
 * @param {object} props.userData - Local state of user data.
 * @param {function} props.handleSaveUserData - Handler to save data to Firestore.
 * @param {function} props.toggleColorMode - Toggle function for color mode.
 * @param {string} props.colorMode - Current color mode state.
 * @param {object} props.themeOptions - Theme options object.
 * @param {string} props.currentLanguageText - Formatted text for the current language.
 * @param {boolean} props.isSaving - State indicating if data is currently saving.
 */
const PreferencesTabContent = ({
  userData,
  handleSaveUserData,
  toggleColorMode,
  colorMode,
  themeOptions,
  currentLanguageText,
  isSaving,
}) => (
  <VStack spacing={4} align="stretch">
    <HStack justifyContent="space-between" alignItems="center">
      <Text fontWeight={500} fontSize="lg">
        Preferencias de aplicación
      </Text>
      {isSaving && <Spinner size="sm" />}
    </HStack>

    {/* Dark Mode Switch */}
    <FormControl
      display="flex"
      alignItems="center"
      justifyContent="space-between"
    >
      <FormLabel mb={0}>Modo oscuro</FormLabel>
      <Switch
        id="dark-mode"
        size="md"
        isChecked={colorMode === "dark"}
        onChange={toggleColorMode}
        colorScheme={themeOptions.focusColor}
      />
    </FormControl>

    {/* Start of Week Menu */}
    <HStack justifyContent="space-between" alignItems="center">
      <Text fontWeight={500}>
        Inicio de semana
      </Text>
      <Menu>
        <MenuButton as={Button} size="md">
          {userData.startOfWeek === "monday" ? "Lunes" : "Domingo"}
        </MenuButton>
        <MenuList>
          <MenuOptionGroup
            value={userData.startOfWeek}
            type="radio"
            onChange={(value) => handleSaveUserData("startOfWeek", value)}
          >
            <MenuItemOption value="monday">Lunes</MenuItemOption>
            <MenuItemOption value="sunday">Domingo</MenuItemOption>
          </MenuOptionGroup>
        </MenuList>
      </Menu>
    </HStack>

    {/* Language Menu */}
    <HStack justifyContent="space-between" alignItems="center">
      <Text fontWeight={500}>
        Idioma establecido
      </Text>
      <Menu>
        <MenuButton as={Button} size="md">{userData.language === "esp" ? "Español" : "Inglés"}</MenuButton>
        <MenuList>
          <MenuOptionGroup
            value={userData.language}
            type="radio"
            onChange={(value) => handleSaveUserData("language", value)}
          >
            <MenuItemOption value="esp">Español</MenuItemOption>
            <MenuItemOption value="eng" isDisabled>
              Inglés
            </MenuItemOption>
          </MenuOptionGroup>
        </MenuList>
      </Menu>
    </HStack>
  </VStack>
);

// --- PropTypes Definition ---
PreferencesTabContent.propTypes = {
  /** User data object, containing `startOfWeek` and `language`. (Required) */
  userData: PropTypes.shape({
    startOfWeek: PropTypes.string.isRequired,
    language: PropTypes.string.isRequired,
  }).isRequired,
  /** Handler function to save changes to Firestore. (Required) */
  handleSaveUserData: PropTypes.func.isRequired,
  /** Toggle function for Chakra UI's color mode. (Required) */
  toggleColorMode: PropTypes.func.isRequired,
  /** The current color mode ('light' or 'dark'). (Required) */
  colorMode: PropTypes.oneOf(["light", "dark"]).isRequired,
  /** Custom theme options (used for `focusColor`, etc.). (Required) */
  themeOptions: PropTypes.object.isRequired,
  /** Formatted text for the current language displayed in the MenuButton. (Required) */
  currentLanguageText: PropTypes.string.isRequired,
  /** Indicates if a database saving operation is currently in progress. (Required) */
  isSaving: PropTypes.bool.isRequired,
};

export default PreferencesTabContent;
