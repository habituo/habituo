import React, { useState, useEffect } from "react";
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Flex,
  Link,
  Spinner,
  Text,
} from "@chakra-ui/react";
import {
  auth,
  db,
  signInAnonymously,
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "../../hooks/firebase";

const COOKIE_CONSENT_COLLECTION = "user_cookie_consents";

const CookiesBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        await checkConsent(user.uid);
      } else {
        try {
          const anonymousUserCredential = await signInAnonymously(auth);
          setUserId(anonymousUserCredential.user.uid);
          await checkConsent(anonymousUserCredential.user.uid);
        } catch (error) {
          console.error("Error al iniciar sesión anónimamente:", error);
          setLoading(false);
          setShowBanner(true);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const checkConsent = async (uid) => {
    try {
      const docRef = doc(db, COOKIE_CONSENT_COLLECTION, uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists() && docSnap.data().consentStatus === "accepted") {
        setShowBanner(false);
      } else {
        setShowBanner(true);
      }
    } catch (error) {
      console.error(
        "Error al verificar el consentimiento en Firestore:",
        error
      );
      setShowBanner(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSetConsent = async (status) => {
    if (!userId) {
      console.warn(
        "Intentando establecer el consentimiento sin ID de usuario."
      );
      return;
    }
    try {
      const docRef = doc(db, COOKIE_CONSENT_COLLECTION, userId);
      await setDoc(
        docRef,
        {
          consentStatus: status,
          timestamp: serverTimestamp(),
        },
        { merge: true }
      );

      setShowBanner(false);
    } catch (error) {
      console.error("Error al guardar el consentimiento en Firestore:", error);
    }
  };

  if (!showBanner) {
    return null;
  }

  return (
    <Alert
      status="info"
      position="fixed"
      bottom="0"
      left="0"
      right="0"
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
        color="blue.300"
        display={{ base: "none", md: "block" }}
      />
      <Text
        flex="1"
        mb={{ base: 2, md: 0 }}
        mr={{ base: 0, md: 4 }}
        fontSize={{ base: "sm", md: "md" }}
      >
        Utilizamos cookies propias y de terceros para mejorar nuestros servicios
        y mostrarte publicidad relacionada con tus preferencias. Si continúas
        navegando, consideramos que aceptas su uso.
        <Link
          href="/policy"
          isExternal
          color="blue.300"
          ml={1}
          textDecoration="underline"
          fontWeight="bold"
        >
          Más información sobre nuestra Política de Privacidad.
        </Link>
      </Text>
      <Flex
        gap={3}
        mt={{ base: 2, md: 0 }}
        width={{ base: "100%", md: "auto" }}
        justifyContent={{ base: "center", md: "flex-end" }}
      >
        <Button
          colorScheme="blue"
          onClick={() => handleSetConsent("accepted")}
          size="sm"
        >
          Aceptar
        </Button>
        <Button
          variant="outline"
          onClick={() => handleSetConsent("configured")}
          size="sm"
          color="white"
          borderColor="white"
          _hover={{ bg: "whiteAlpha.200" }}
        >
          Configurar
        </Button>
      </Flex>
    </Alert>
  );
};

export default CookiesBanner;
