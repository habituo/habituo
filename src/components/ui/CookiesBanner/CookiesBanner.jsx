import { useState } from "react";
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  HStack,
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
  useColorMode,
  VStack,
} from "@chakra-ui/react";
import { useCookiesConsent } from "../../../hooks/useCookiesConsent";

const CookiesBanner = () => {
  const [showConfigModal, setShowConfigModal] = useState(false);
  const { colorMode } = useColorMode();
  const isLight = colorMode === "light" ? true : false;
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
        p={4}
        status="info"
        w="full"
        position="fixed"
        bottom={0}
        left={0}
        right={0}
        zIndex="sticky"
        bg="transparent"
      >
        <HStack
          w="full"
          py={{ base: 3, md: 4 }}
          px={{ base: 4, md: 5 }}
          bg={isLight ? "#00000010" : "transparent"}
          backdropFilter="blur(10px) hue-rotate(90deg)"
          color={isLight ? "black" : "white"}
          flexDirection={{ base: "column", md: "row" }}
          alignItems={{ base: "flex-start", md: "center" }}
          justifyContent="space-between"
          boxShadow="lg"
          borderRadius={{ base: "2xl", xl: "full" }}
        >
          <AlertIcon
            boxSize="24px"
            mr={4}
            color="orange.500"
            display={{ base: "none", md: "block" }}
          />
          <Text mb={{ base: 2, md: 0 }} mr={{ base: 0, md: 4 }} fontSize="md">
            Usamos cookies propias y de terceros para analizar el uso de nuestro
            sitio web, mejorar nuestros servicios y mostrarte publicidad
            personalizada según tus hábitos de navegación. Puedes aceptar todas
            las cookies o configurar tus preferencias. Más información en
            nuestra{" "}
            <Link
              href="/terms"
              isExternal
              color="orange.500"
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
              color="orange.500"
              ml={1}
              textDecoration="underline"
              fontWeight={600}
            >
              Política de Privacidad
            </Link>
            .
          </Text>
          <Flex
            flexDirection={{ base: "column", md: "row" }}
            gap={3}
            mt={{ base: 2, md: 0 }}
            width={{ base: "100%", md: "auto" }}
            justifyContent={{ base: "center", md: "flex-end" }}
          >
            <Button
              variant="solid"
              colorScheme="orange"
              onClick={acceptAll}
              size="md"
              borderRadius="full"
            >
              Aceptar todas
            </Button>
            <Button onClick={rejectAll} size="md" borderRadius="full">
              Rechazar
            </Button>
            <Button
              onClick={() => setShowConfigModal(true)}
              size="md"
              borderRadius="full"
            >
              Configurar cookies
            </Button>
          </Flex>
        </HStack>
      </Alert>

      <Modal
        size="xl"
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
      >
        <ModalOverlay backdropFilter="blur(10px) hue-rotate(90deg)" />
        <ModalContent borderRadius="3xl">
          <ModalHeader
            borderBottom="1px solid"
            borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
          >
            Configuración de Cookies
          </ModalHeader>
          <ModalCloseButton
            position="absolute"
            top={4}
            right={4}
            borderRadius="full"
            _focusVisible={{}}
          />
          <ModalBody
            py={4}
            overflowX="hidden"
            borderBottom="1px solid"
            borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
          >
            <VStack spacing={4}>
              <VStack spacing={1}>
                <FormControl display="flex" alignItems="center">
                  <Switch
                    id="functional-cookies"
                    isChecked={cookiePreferences.functional}
                    colorScheme="orange"
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
                    colorScheme="orange"
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
                    colorScheme="orange"
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
                    colorScheme="orange"
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
              onClick={rejectAll}
              size="md"
              borderRadius="full"
              _focusVisible={{}}
            >
              Rechazar todas
            </Button>
            <Button
              variant="outline"
              colorScheme="orange"
              onClick={() => savePreferences(cookiePreferences)}
              size="md"
              borderRadius="full"
              _focusVisible={{}}
            >
              Guardar preferencias
            </Button>
            <Button
              variant="solid"
              colorScheme="orange"
              onClick={acceptAll}
              size="md"
              borderRadius="full"
              _focusVisible={{}}
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
