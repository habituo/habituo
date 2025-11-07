import {
  Badge,
  Box,
  Button,
  HStack,
  Icon,
  Spinner,
  Text,
  useTheme,
  VStack,
} from "@chakra-ui/react";
import PropTypes from "prop-types";
import { FaGoogle } from "react-icons/fa";

/**
 * Content for the 'Access' tab in the User Settings Modal.
 * It displays authentication and security information, including email verification status
 * and sign-in provider details.
 *
 * @param {object} props - Component properties.
 * @param {string} props.currentUserEmail - The user's current email address.
 * @param {boolean} props.isEmailVerified - Flag indicating if the email is verified in Firebase.
 * @param {boolean} props.isGoogleProvider - Flag indicating if the user signed in via Google provider.
 * @param {function} props.handleSendVerificationEmail - Handler to initiate sending a verification email.
 * @param {boolean} props.isSending - Status indicating if a verification email is currently being sent.
 * @param {boolean} props.isSaving - Status indicating if general data saving is in progress (for the main spinner).
 */
const AccessTabContent = ({
  currentUserEmail,
  isEmailVerified,
  isGoogleProvider,
  handleSendVerificationEmail,
  isSending,
  isSaving,
}) => {
  const themeOptions = useTheme();

  return (
    <VStack spacing={4} align="stretch">
      <HStack justifyContent="space-between" alignItems="center">
        <Text fontWeight={500} fontSize="lg">
          Acceso y seguridad
        </Text>
        {isSaving && <Spinner size="sm" />}
      </HStack>

      {/* Email Info and Verification Status */}
      <Box position="relative">
        <Text fontWeight={500}>Correo electrónico</Text>
        <Text fontSize="md" fontWeight={300}>
          {currentUserEmail}
        </Text>

        {/* Show verification options if email is not verified and user didn't sign in with Google */}
        {!isEmailVerified && !isGoogleProvider && (
          <VStack align="flex-start" my={4} spacing={2}>
            <Badge
              px={2}
              py={1}
              fontSize="sm"
              colorScheme="red"
              variant="solid"
              borderRadius={themeOptions.borderRadius}
              fontFamily={themeOptions.fontFamily}
            >
              Correo no verificado
            </Badge>
            <Button
              onClick={handleSendVerificationEmail}
              isLoading={isSending}
              loadingText="Enviando..."
              size="lg"
            >
              Reenviar correo de verificación
            </Button>
          </VStack>
        )}

        {/* Show Google connection status if signed in with Google */}
        {isGoogleProvider && (
          <HStack
            w="fit-content"
            mt={4}
            px={4}
            py={2}
            bg="green.100"
            borderRadius={themeOptions.borderRadius}
            color="gray.700"
          >
            <Icon as={FaGoogle} />
            <Text fontSize="sm">Conectado con Google</Text>
          </HStack>
        )}
      </Box>
    </VStack>
  );
};

// --- PropTypes Definition in English ---
AccessTabContent.propTypes = {
  /** The user's current email address. (Required) */
  currentUserEmail: PropTypes.string.isRequired,
  /** Flag indicating if the email is verified in Firebase. (Required) */
  isEmailVerified: PropTypes.bool.isRequired,
  /** Flag indicating if the user signed in using the Google provider. (Required) */
  isGoogleProvider: PropTypes.bool.isRequired,
  /** Handler to send a verification email to the user. (Required) */
  handleSendVerificationEmail: PropTypes.func.isRequired,
  /** Status indicating if a verification email is currently being sent. (Required) */
  isSending: PropTypes.bool.isRequired,
  /** Status indicating if general data saving is in progress (for the main spinner). (Required) */
  isSaving: PropTypes.bool.isRequired,
};

export default AccessTabContent;
