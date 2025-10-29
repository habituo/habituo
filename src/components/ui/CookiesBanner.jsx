import { useState } from "react";
import {
  Alert,
  AlertIcon,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Switch,
  Text,
  useTheme,
  VStack,
} from "@chakra-ui/react";
import { useCookiesConsent } from "../../hooks/useCookiesConsent";

const CookiesBanner = () => {
  const [showConfigModal, setShowConfigModal] = useState(false);
  const themeOptions = useTheme();
  const [cookiePreferences, setCookiePreferences] = useState({
    functional: true,
    analytics: false,
    personalization: false,
    marketing: false,
  });
  const { showBanner, acceptAll, rejectAll, savePreferences } =
    useCookiesConsent();

  if (!showBanner) return null;

  return (
    <>
      <Alert
        status="info"
        position="fixed"
        bottom={0}
        left={0}
        right={0}
        zIndex="sticky"
        py={{ base: 2, md: 4 }}
        px={{ base: 4, md: 8 }}
        bg="gray.800"
        color="white"
        flexDirection={{ base: "column", md: "row" }}
        alignItems={{ base: "flex-start", md: "center" }}
        justifyContent="space-between"
        wrap="wrap"
      >
        <AlertIcon
          boxSize="24px"
          mr={4}
          color={themeOptions.focusColor}
          display={{ base: "none", md: "block" }}
        />
        <Text
          flex={1}
          mb={{ base: 2, md: 0 }}
          mr={{ base: 0, md: 4 }}
          fontSize={{ base: "sm", md: "md" }}
        >
          Usamos cookies propias y de terceros para analizar el uso de nuestro
          sitio web, mejorar nuestros servicios y mostrarte publicidad
          personalizada según tus hábitos de navegación. Puedes aceptar todas
          las cookies o configurar tus preferencias. Más información en nuestra{" "}
          <Link
            href="/terms"
            isExternal
            color={themeOptions.focusColor}
            ml={1}
            textDecoration="underline"
            fontWeight={600}
          >
            Política de Cookies
          </Link>{" "}
          y
          <Link
            href="/policy"
            isExternal
            color={themeOptions.focusColor}
            ml={1}
            textDecoration="underline"
            fontWeight={600}
          >
            Política de Privacidad
          </Link>
          .
        </Text>
        <Flex
          gap={3}
          mt={{ base: 2, md: 0 }}
          width={{ base: "100%", md: "auto" }}
          justifyContent={{ base: "center", md: "flex-end" }}
        >
          <Button
            variant="solid"
            colorScheme={themeOptions.focusColor}
            onClick={acceptAll}
            size="sm"
          >
            Aceptar todas
          </Button>
          <Button
            variant="outline"
            onClick={rejectAll}
            size="sm"
            color="white"
            borderColor="white"
            _hover={{ bg: "whiteAlpha.200" }}
          >
            Rechazar
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowConfigModal(true)}
            size="sm"
            color="white"
            borderColor="white"
            _hover={{ bg: "whiteAlpha.200" }}
          >
            Configurar cookies
          </Button>
        </Flex>
      </Alert>

      <Modal isOpen={showConfigModal} onClose={() => setShowConfigModal(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Configuración de Cookies</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <VStack spacing={1}>
                <FormControl display="flex" alignItems="center">
                  <Switch
                    id="functional-cookies"
                    isChecked={cookiePreferences.functional}
                    colorScheme={themeOptions.focusColor}
                    isDisabled
                  />
                  <FormLabel htmlFor="functional-cookies" mb="0" ml={3}>
                    Cookies esenciales (obligatorias)
                  </FormLabel>
                </FormControl>
                <Text fontSize="sm" color="gray.500">
                  Son necesarias para que la web funcione correctamente (por
                  ejemplo, para mantener tu sesión iniciada o guardar tus
                  preferencias de privacidad). Estas cookies no se pueden
                  desactivar.
                </Text>
              </VStack>
              <VStack spacing={1}>
                <FormControl display="flex" alignItems="center">
                  <Switch
                    id="analytics-cookies"
                    isChecked={cookiePreferences.analytics}
                    onChange={(e) =>
                      setCookiePreferences({
                        ...cookiePreferences,
                        analytics: e.target.checked,
                      })
                    }
                    colorScheme={themeOptions.focusColor}
                  />
                  <FormLabel htmlFor="analytics-cookies" mb="0" ml={3}>
                    Cookies de rendimiento y analíticas
                  </FormLabel>
                </FormControl>
                <Text fontSize="sm" color="gray.500">
                  Nos ayudan a entender cómo usan los visitantes el sitio, con
                  el fin de mejorar su funcionamiento. La información es anónima
                  y se utiliza únicamente con fines estadísticos. (Ej: Google
                  Analytics)
                </Text>
              </VStack>
              <VStack spacing={1}>
                <FormControl display="flex" alignItems="center">
                  <Switch
                    id="personalization-cookies"
                    isChecked={cookiePreferences.personalization}
                    onChange={(e) =>
                      setCookiePreferences({
                        ...cookiePreferences,
                        personalization: e.target.checked,
                      })
                    }
                    colorScheme={themeOptions.focusColor}
                  />
                  <FormLabel htmlFor="marketing-cookies" mb="0" ml={3}>
                    Cookies de personalización
                  </FormLabel>
                </FormControl>
                <Text fontSize="sm" color="gray.500">
                  Permiten recordar tus preferencias (como idioma, tema o zona
                  horaria) para ofrecerte una experiencia más adaptada.
                </Text>
              </VStack>
              <VStack spacing={1}>
                <FormControl display="flex" alignItems="center">
                  <Switch
                    id="marketing-cookies"
                    isChecked={cookiePreferences.marketing}
                    onChange={(e) =>
                      setCookiePreferences({
                        ...cookiePreferences,
                        marketing: e.target.checked,
                      })
                    }
                    colorScheme={themeOptions.focusColor}
                  />
                  <FormLabel htmlFor="marketing-cookies" mb="0" ml={3}>
                    Cookies de marketing y publicidad
                  </FormLabel>
                </FormControl>
                <Text fontSize="sm" color="gray.500">
                  Utilizadas para mostrar anuncios relevantes en función de tus
                  intereses y medir su rendimiento. (Ej: Meta Pixel, Google Ads)
                </Text>
              </VStack>
            </VStack>
          </ModalBody>
          <ModalFooter gap={2}>
            <Button
              variant="ghost"
              colorScheme={themeOptions.focusColor}
              onClick={rejectAll}
              size="sm"
            >
              Rechazar todas
            </Button>
            <Button
              variant="outline"
              colorScheme={themeOptions.focusColor}
              onClick={() => savePreferences(cookiePreferences)}
              size="sm"
            >
              Guardar preferencias
            </Button>
            <Button
              variant="solid"
              colorScheme={themeOptions.focusColor}
              onClick={acceptAll}
              size="sm"
            >
              Aceptar todas
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default CookiesBanner;
