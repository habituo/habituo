import {
  Button,
  FormControl,
  FormLabel,
  HStack,
  Input,
  InputGroup,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import PropTypes from "prop-types";

const hasChanges = (currentData, initialData) => {
  return (
    currentData.name !== initialData.name ||
    currentData.birthDay !== initialData.birthDay
  );
};

/**
 * Content for the 'Profile' tab in the User Settings Modal.
 * It allows the user to view and edit basic personal information.
 *
 * @param {object} props - Component properties.
 * @param {object} props.userData - Local state of user data (name, birthDay).
 * @param {function} props.setUserData - Setter function for user data state.
 * @param {function} props.handleSaveUserData - Handler to save field data to Firestore.
 * @param {boolean} props.isSaving - Status indicating if data is currently saving.
 * @param {boolean} props.isNameValid - Validation status for the name field.
 * @param {boolean} props.isBirthDayValid - Validation status for the birthDay field.
 * @param {boolean} props.isBirthDayChanged - Indicates if the birthDay field value has been changed.
 * @param {object} props.themeOptions - Theme options object (used for borderRadius).
 * @param {string} props.formattedRegistrationDate - The user's registration date, formatted for display.
 */
const ProfileTabContent = ({
  userData,
  initialUserData,
  setUserData,
  handleSaveAllUserData,
  handleCancelEdit,
  handleSaveUserData,
  isSaving,
  isNameValid,
  isBirthDayValid,
  themeOptions,
  formattedRegistrationDate,
}) => {
  const changesPending = hasChanges(userData, initialUserData);
  const isSaveDisabled = !changesPending || !isNameValid || !isBirthDayValid;

  return (
    <VStack spacing={4} align="stretch">
      <HStack justifyContent="space-between" alignItems="center">
        <Text fontWeight={500} fontSize="lg">
          Información del perfil
        </Text>
        {isSaving && <Spinner size="sm" />}
      </HStack>

      {/* Name Field */}
      <FormControl>
        <InputGroup flexDirection="column" size="md">
          <FormLabel fontSize="sm">Nombre</FormLabel>
          <Input
            type="text"
            value={userData.name}
            onChange={(e) => {
              setUserData({ ...userData, name: e.target.value });
            }}
            size="lg"
            isInvalid={!isNameValid}
            borderRadius={themeOptions.borderRadius}
            _focusVisible={{}}
          />
          <Text fontSize="xs" color="red.500" mt={1} hidden={isNameValid}>
            Solo se permiten letras y números.
          </Text>
        </InputGroup>
      </FormControl>

      {/* Birthday Field */}
      <FormControl>
        <InputGroup flexDirection="column" size="md">
          <FormLabel fontSize="sm">Fecha de nacimiento</FormLabel>
          <Input
            type="date"
            value={userData.birthDay}
            size="lg"
            onChange={(e) => {
              setUserData({ ...userData, birthDay: e.target.value });
            }}
            isInvalid={changesPending && !isBirthDayValid}
            borderRadius={themeOptions.borderRadius}
            _focusVisible={{}}
          />
          <Text fontSize="xs" color="red.500" mt={1} hidden={isBirthDayValid}>
            La fecha no puede ser en el futuro.
          </Text>
        </InputGroup>
      </FormControl>

      {/* Registration Date Info */}
      <HStack>
        <Text fontSize="sm" fontWeight={600}>
          Miembro desde:
        </Text>
        <Text fontSize="sm">{formattedRegistrationDate}</Text>
      </HStack>

      {/* Save and Cancel buttons */}
      <HStack justifyContent="flex-end" spacing={3} pt={2}>
        <Button
          onClick={handleCancelEdit}
          isDisabled={!changesPending || isSaving}
          variant="outline"
          colorScheme={themeOptions.focusColor}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSaveAllUserData}
          isLoading={isSaving}
          isDisabled={isSaveDisabled}
          colorScheme={themeOptions.focusColor}
        >
          Guardar cambios
        </Button>
      </HStack>
    </VStack>
  );
};

// --- PropTypes Definition ---
ProfileTabContent.propTypes = {
  /** User data object, containing editable fields like `name` and `birthDay`. (Required) */
  userData: PropTypes.shape({
    name: PropTypes.string.isRequired,
    birthDay: PropTypes.string,
  }).isRequired,
  initialUserData: PropTypes.shape({
    name: PropTypes.string.isRequired,
    birthDay: PropTypes.string,
  }).isRequired,
  /** Setter function for the user data state. (Required) */
  setUserData: PropTypes.func.isRequired,
  /** Handler function to save specific field data to Firestore. (Required) */
  handleSaveUserData: PropTypes.func.isRequired,
  handleSaveAllUserData: PropTypes.func.isRequired,
  /** Handler para revertir los cambios al estado inicial. (NUEVO) */
  handleCancelEdit: PropTypes.func.isRequired,
  /** Indicates if a database saving operation is currently in progress. (Required) */
  isSaving: PropTypes.bool.isRequired,
  /** Validation status for the user's name input. (Required) */
  isNameValid: PropTypes.bool.isRequired,
  /** Validation status for the user's date of birth input. (Required) */
  isBirthDayValid: PropTypes.bool.isRequired,
  /** Theme options object, typically used for styling constants like `borderRadius`. (Required) */
  themeOptions: PropTypes.object.isRequired,
  /** The user's registration date, formatted as a display string. (Required) */
  formattedRegistrationDate: PropTypes.string.isRequired,
};

export default ProfileTabContent;
