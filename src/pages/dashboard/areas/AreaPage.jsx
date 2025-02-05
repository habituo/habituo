import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { ColumnHeader, ModalCreateHabitArea } from "../../../routes/index";
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
  IconButton,
  useColorMode,
} from "@chakra-ui/react";
import { useTheme } from "../../../theme/ThemeContext";
import { FaPlus } from "react-icons/fa6";
import * as LuIcons from "react-icons/lu";

const AreaPage = ({ areas, fetchHabits }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const {colorMode} = useColorMode();
  const { areaId } = useParams();
  const [habits, setHabits] = useState([]);
  const area = areas.find((area) => area.id === areaId);
  const { themeOptions } = useTheme();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [searchParams] = useSearchParams();

  // Function to format date
  const formatDate = (date) => {
    if(date) {

      const firebaseTimestamp = date instanceof Date ? date : date.toDate(); 
      return firebaseTimestamp.toLocaleDateString("es-ES");
    } else {
      return "Undefined";
    }
  };

  useEffect(() => {
    const fetchAreaHabits = async () => {
      if (areaId) {
        try {
          const habitsData = await fetchHabits(areaId);
          setHabits(habitsData);
        } catch (error) {
          console.error("Error fetching habits:", error);
        }
      }
    };

    fetchAreaHabits();
    setIsLoaded(true);
  }, [areaId, areas, fetchHabits]);

  // Get order by URL
  const orderBy = searchParams.get("order_by") || "asc";
  const viewLayout = searchParams.get("layout") || "grid";

  const sortedHabits = [...habits].sort((a, b) => {
    if (orderBy === "asc") return a.name.localeCompare(b.name);
    if (orderBy === "desc") return b.name.localeCompare(a.name);
    if (orderBy === "oldest")
      return (b.registeredAt || 0) - (a.registeredAt || 0);
    if (orderBy === "newest")
      return (a.registeredAt || 0) - (b.registeredAt || 0);
    return 0;
  });

  const HabitCard = ({ habit, areaId }) => {
    const [isHovered, setIsHovered] = useState(false);
    const IconComponent = LuIcons[habit.icon] || LuIcons.LuFolder;

    return (
      <LinkBox
        as="article"
        key={habit.id}
        p={2}
        w="100%"
        display="flex"
        alignItems="center"
        justifyContent="flex-start"
        gap={2}
        borderWidth="2px"
        borderRadius={themeOptions.borderRadius}
        userSelect="none"
        position="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        _hover={{ borderColor: `var(--chakra-colors-${themeOptions.focusColor}-500)` }}
      >
        <Box w="80px" h="80px" display="flex" alignItems="center" justifyContent="center" borderRadius="100%" bg={`var(--chakra-colors-${themeOptions.focusColor}-200)`}>
            <IconComponent size="40px" color={`var(--chakra-colors-${themeOptions.focusColor}-800)`} />
        </Box>
        <VStack alignItems="start">
          <Heading fontSize="xl" fontFamily={themeOptions.fontFamily}>
            <LinkOverlay href={`/dashboard/areas/${areaId}/habits/${habit.id}`}>
              {habit.name}
            </LinkOverlay>
          </Heading>
            <Text>Creado el <Text>{formatDate(habit.createdAt)}</Text></Text>
        </VStack>

        {/* Botones visibles solo en hover */}
        {isHovered && (
          <HStack position="absolute" top={2} right={2}>
            <IconButton
              aria-label="Editar hábito"
              icon={<LuIcons.LuPencil />}
              size="sm"
              variant="ghost"
              onClick={() => console.log("Editar", habit.id)}
            />
            <IconButton
              aria-label="Eliminar hábito"
              icon={<LuIcons.LuTrash />}
              size="sm"
              variant="ghost"
              colorScheme="red"
              onClick={() => console.log("Eliminar", habit.id)}
            />
          </HStack>
        )}
      </LinkBox>
    );
  };

  // Show content based on areas load
  const renderContent = () => {
    if (isLoaded && habits.length > 0) {
      return viewLayout === "grid" ? (
        <Grid
          templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(3, 1fr)" }}
          gap={3}
          w="100%"
        >
          {habits.map((habit) => (
            <HabitCard key={habit.id} habit={habit} areaId={areaId} />
          ))}
        </Grid>
      ) : (
        <VStack spacing={3}>
          {habits.map((habit) => (
            <HabitCard key={habit.id} habit={habit} areaId={areaId} />
          ))}
        </VStack>
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
              w="200px"
              h="40px"
              borderRadius={themeOptions.borderRadius}
            />
            <Skeleton
              w="200px"
              h="40px"
              borderRadius={themeOptions.borderRadius}
            />
            <Skeleton
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
            Añadir una hábito
          </Button>
          <ModalCreateHabitArea isOpen={isOpen} onClose={onClose} />
        </VStack>
      );
    }
  };

  return (
    <Box w="100%" minH="100vh" bg={colorMode === "light" ? "rgb(245, 245, 245)" : "rgb(23, 23, 23)"}>
      <ColumnHeader
        page="habit"
        title={area ? area.name : "Área no encontrada"}
      />
      <Box p={3}>{renderContent()}</Box>
    </Box>
  );
};

export default AreaPage;
