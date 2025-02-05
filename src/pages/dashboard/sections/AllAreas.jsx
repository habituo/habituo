import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ColumnHeader, ModalCreateArea } from "../../../routes/index";
import {
  Grid,
  HStack,
  VStack,
  Box,
  Text,
  Stack,
  Skeleton,
  Button,
  LinkBox,
  LinkOverlay,
  useDisclosure,
  Heading,
  useColorMode,
} from "@chakra-ui/react";
import { useTheme } from "../../../theme/ThemeContext";
import { FaPlus } from "react-icons/fa6";
import { db } from "../../../hooks/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { useAuth } from "../../../hooks/AuthContext";
import * as LuIcons from "react-icons/lu";

const AllAreas = () => {
  const { themeOptions } = useTheme();
  const { colorMode } = useColorMode();
  const [isLoaded, setIsLoaded] = useState(false);
  const [areas, setAreas] = useState([]);
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Fetch areas from Firestore
  useEffect(() => {
    if (!user) return;

    const userId = user.uid;
    const areasRef = collection(db, `users/${userId}/areas`);

    // Escuchar cambios en tiempo real
    const unsubscribe = onSnapshot(areasRef, (snapshot) => {
      const areasList = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          icon: data.icon || "LuFolder",
          registeredAt: data.registeredAt
            ? data.registeredAt.toDate().toLocaleDateString("es-ES")
            : "Desconocido",
        };
      });

      setAreas(areasList);
      setIsLoaded(true);
    });

    // Limpiar suscripción al desmontar
    return () => unsubscribe();
  }, [user]);

  // Get order by URL
  const orderBy = searchParams.get("order_by") || "asc";

  // Get areas list
  const sortedAreas = [...areas].sort((a, b) => {
    if (orderBy === "asc") return a.name.localeCompare(b.name);
    if (orderBy === "desc") return b.name.localeCompare(a.name);
    if (orderBy === "created")
      return (a.registeredAt || 0) - (b.registeredAt || 0);
    return 0;
  });

  // Show content based on areas load
  const renderContent = () => {
    if (isLoaded && areas.length > 0) {
      return (
        <>
          <Grid
            templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(3, 1fr)" }}
            gap={3}
            w="100%"
          >
            {sortedAreas.map((area) => {
              const IconComponent = LuIcons[area.icon] || LuIcons.LuFolder;
              return (
                <LinkBox
                  as="article"
                  key={area.id}
                  p={3}
                  borderWidth="1px"
                  borderRadius={themeOptions.borderRadius}
                  w="100%"
                  userSelect="none"
                >
                  <Box as="time" fontSize="sm" opacity={0.8}>
                    Creado el: {area.registeredAt}
                  </Box>
                  <HStack mt={2} alignItems="center">
                    <IconComponent size="20px" />
                    <Heading fontFamily={themeOptions.fontFamily} fontSize="xl">
                      <LinkOverlay href={`/dashboard/areas/${area.id}`}>
                        {area.name}
                      </LinkOverlay>
                    </Heading>
                  </HStack>
                </LinkBox>
              );
            })}
          </Grid>
        </>
      );
    } else {
      return (
        <VStack
          w="100%"
          h={`calc(100vh - 90px)`}
          alignItems="center"
          justifyContent="center"
          userSelect="none"
        >
          <Stack mb={2} borderRadius={themeOptions.borderRadius}>
            <Skeleton
              isLoaded={isLoaded}
              w="200px"
              h="40px"
              borderRadius={themeOptions.borderRadius}
            />
            <Skeleton
              isLoaded={isLoaded}
              w="200px"
              h="40px"
              borderRadius={themeOptions.borderRadius}
            />
            <Skeleton
              isLoaded={isLoaded}
              w="200px"
              h="40px"
              borderRadius={themeOptions.borderRadius}
            />
          </Stack>
          <Text as="h2" fontSize="lg" fontWeight="bold">
            Da el paso y construye tu mejor versión
          </Text>
          <Text as="h2" fontSize="sm" maxW="600px" textAlign="center">
            Los hábitos son como los escalones de una escalera: al dar el primer
            paso, el resto se va sumando uno a uno.
          </Text>
          <Button
            mt={2}
            variant="outline"
            leftIcon={<FaPlus size="16px" />}
            iconSpacing={1}
            onClick={onOpen}
          >
            Añadir una área
          </Button>
          <ModalCreateArea isOpen={isOpen} onClose={onClose} />
        </VStack>
      );
    }
  };

  return (
    <Box
      w="100%"
      minH="100vh"
      bg={colorMode === "light" ? "rgb(245, 245, 245)" : "rgb(23, 23, 23)"}
    >
      <ColumnHeader page="all-areas" title="Todas las áreas" />
      <Box p={3}>{renderContent()}</Box>
    </Box>
  );
};

export default AllAreas;
