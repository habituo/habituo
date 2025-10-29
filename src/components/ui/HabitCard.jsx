import React, { useEffect, useState } from "react";
import {
  LinkBox,
  Box,
  HStack,
  Text,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  LinkOverlay,
  useColorMode,
  Skeleton,
  SkeletonCircle,
} from "@chakra-ui/react";
import * as LuIcons from "react-icons/lu";
import { useTheme } from "../../context/ThemeContext/ThemeContext";
import { getHabitRecord } from "../../hooks/useDatabase";
import { useAuthUser } from "../../context/AuthUserContext/AuthUserContext";

const formatCreationDate = (date) => {
  let finalDate;
  if (date && typeof date.toDate === "function") {
    finalDate = date.toDate();
  } else if (date instanceof Date && !isNaN(date.getTime())) {
    finalDate = date;
  } else {
    return "Sin fecha de creación";
  }

  const options = { day: "2-digit", month: "long", year: "numeric" };
  const formattedDate = finalDate.toLocaleDateString("es-ES", options);

  return formattedDate.replace(
    /(\sde\s)(\w+)/,
    (match, p1, p2) => p1 + p2.charAt(0).toUpperCase() + p2.slice(1)
  );
};

const HabitCardSkeleton = ({ themeOptions, colorMode }) => (
  <LinkBox
    as="article"
    p={3}
    pb={1}
    borderWidth={2}
    borderRadius={themeOptions.borderRadius}
    w="100%"
    minH={119}
    maxH="min-content"
    userSelect="none"
    bg={colorMode === "light" ? "white" : "black"}
    data-testid="habit-card-skeleton"
  >
    <Skeleton w="40%" h={18} />
    <Skeleton
      w={25}
      h={25}
      position="absolute"
      top={3}
      right={3}
      borderRadius="md"
    />
    <HStack my={4} alignItems="center">
      <SkeletonCircle size={6} />
      <Skeleton w="40%" h={26} />
    </HStack>
    <Skeleton w="45%" h={12} />
  </LinkBox>
);

const HabitCard = React.memo(
  ({
    habit,
    setSelectedHabit,
    handleComplete,
    handleSkip,
    handleEdit,
    confirmDelete,
  }) => {
    const { themeOptions } = useTheme();
    const { colorMode } = useColorMode();
    const { user } = useAuthUser();
    const [todayRecord, setTodayRecord] = useState(null);

    useEffect(() => {
      const fetchTodayRecord = async () => {
        if (!user) return;
        const todayKey = new Date().toISOString().split("T")[0];
        const record = await getHabitRecord(
          user.uid,
          habit.areaId,
          habit.id,
          todayKey
        );
        setTodayRecord(record);
      };

      fetchTodayRecord();
    }, [user, habit.id, habit.areaId]);

    if (!habit) {
      return (
        <HabitCardSkeleton themeOptions={themeOptions} colorMode={colorMode} />
      );
    }

    const getIsoStringDate = (date) => {
      if (!date) return undefined;
      let finalDate;

      if (typeof date.toDate === "function") {
        finalDate = date.toDate();
      } else if (date instanceof Date && !isNaN(date.getTime())) {
        finalDate = date;
      } else {
        return undefined;
      }

      return finalDate.toISOString();
    };

    return (
      <LinkBox
        key={habit.id}
        p={3}
        display="flex"
        flexDirection="column"
        alignItems="flex-start"
        gap={2}
        borderWidth="2px"
        borderRadius={themeOptions.borderRadius}
        w="100%"
        maxH="min-content"
        userSelect="none"
        cursor="pointer"
        transition=".1s all linear"
        onClick={() => {
          setSelectedHabit(habit);
        }}
        bg={colorMode === "light" ? "white" : "black"}
        _hover={{
          bg:
            colorMode === "light"
              ? `var(--chakra-colors-${themeOptions.focusColor}-50)`
              : "var(--chakra-colors-blackAlpha-600)",
          borderColor: `var(--chakra-colors-${themeOptions.focusColor}-500)`,
        }}
        role="listitem"
        aria-label={`Hábito: ${habit.name}`}
        data-testid={`habit-card-${habit.id}`}
      >
        <Box
          as="time"
          fontSize="sm"
          color={colorMode === "light" ? "gray.400" : "gray.600"}
          dateTime={getIsoStringDate(habit.createdAt)}
        >
          {formatCreationDate(habit.createdAt)}
        </Box>
        <HStack alignItems="center">
          <Text
            fontFamily={themeOptions.fontFamily}
            fontSize="xl"
            fontWeight={600}
          >
            <LinkOverlay>
              {habit?.icon} {habit.name}
            </LinkOverlay>
          </Text>
        </HStack>
        <Text
          fontSize="sm"
          fontWeight={400}
          color={colorMode === "light" ? "gray.400" : "gray.600"}
        >
          {todayRecord
            ? `${todayRecord.amount ?? todayRecord.times ?? 0} / ${
                todayRecord.dailyGoal ?? habit.goals.value
              } ${todayRecord.unit === "times" ? "veces" : "minutos"}`
            : `Meta ${
                habit.goals.period === "day"
                  ? "diaria"
                  : habit.goals.period === "week"
                  ? "semanal"
                  : "mensual"
              }: ${habit.goals.value} ${
                habit.goals.unit === "times" ? "veces" : "minutos"
              }`}
        </Text>
        <Tooltip
          label="Opciones"
          aria-label="Opciones del Hábito"
          borderRadius={themeOptions.borderRadius}
          bg={colorMode === "light" ? "white" : "black"}
          color={colorMode === "light" ? "black" : "white"}
          _focusVisible={{}}
        >
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label={`Más opciones para ${habit.name}`}
              icon={<LuIcons.LuEllipsisVertical />}
              position="absolute"
              right={1}
              top={1}
              fontSize="lg"
              bg="transparent"
              size="sm"
              borderRadius={themeOptions.borderRadius}
              _hover={{
                bg: colorMode === "light" ? "gray.100" : "whiteAlpha.200",
              }}
              _active={{
                bg: colorMode === "light" ? "gray.200" : "whiteAlpha.300",
              }}
              onClick={(e) => e.stopPropagation()}
            />
            <MenuList
              m={0}
              p={0}
              minW="auto"
              borderRadius={themeOptions.borderRadius}
              bg={colorMode === "light" ? "var(--menu-bg)" : "gray.900"}
              onClick={(e) => e.stopPropagation()}
            >
              <MenuItem
                icon={<LuIcons.LuCheck size={16} />}
                borderTopRadius={themeOptions.borderRadius}
                bg={colorMode === "light" ? "var(--menu-bg)" : "gray.900"}
                _hover={{
                  bg:
                    colorMode === "light"
                      ? "rgb(237, 242, 247)"
                      : "rgba(255, 255, 255, 0.06)",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleComplete(habit);
                }}
              >
                Completar
              </MenuItem>
              <MenuItem
                icon={<LuIcons.LuArrowRight size={16} />}
                bg={colorMode === "light" ? "var(--menu-bg)" : "gray.900"}
                _hover={{
                  bg:
                    colorMode === "light"
                      ? "rgb(237, 242, 247)"
                      : "rgba(255, 255, 255, 0.06)",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSkip(habit);
                }}
              >
                Saltar
              </MenuItem>
              <MenuItem
                icon={<LuIcons.LuPenLine size={16} />}
                bg={colorMode === "light" ? "var(--menu-bg)" : "gray.900"}
                _hover={{
                  bg:
                    colorMode === "light"
                      ? "rgb(237, 242, 247)"
                      : "rgba(255, 255, 255, 0.06)",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(habit);
                }}
              >
                Editar
              </MenuItem>
              <MenuItem
                icon={<LuIcons.LuTrash size={16} />}
                borderBottomRadius={themeOptions.borderRadius}
                bg={colorMode === "light" ? "var(--menu-bg)" : "gray.900"}
                _hover={{
                  bg:
                    colorMode === "light"
                      ? "rgb(237 242 247)"
                      : "rgba(255, 255, 255, 0.06)",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  confirmDelete(habit);
                }}
              >
                Eliminar
              </MenuItem>
            </MenuList>
          </Menu>
        </Tooltip>
      </LinkBox>
    );
  }
);

export default HabitCard;
