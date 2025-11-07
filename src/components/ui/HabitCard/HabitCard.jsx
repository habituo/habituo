import React, { useEffect, useState } from "react";
import {
  LinkBox,
  Box,
  HStack,
  Text,
  LinkOverlay,
  useColorMode,
} from "@chakra-ui/react";
import { useTheme } from "../../../context/ThemeContext/ThemeContext";
import { getHabitRecord } from "../../../hooks/useDatabase";
import { useAuthUser } from "../../../context/AuthUserContext/AuthUserContext";
import { HabitCardSkeleton, HabitCardOptions } from "../../../exports";
import { formatCreationDate } from "../../../utils/formatters/formatters";
import { getGoalDisplay } from "../../../utils/getGoalDisplay/getGoalDisplay";
import PropTypes from "prop-types";

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

    // Data Fetching Logic (Minimal useEffect)
    useEffect(() => {
      const fetchTodayRecord = async () => {
        if (!user || !habit) return; // Add check for habit

        // This key generation should ideally be in a utility for testing
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
    }, [user, habit, habit?.id, habit?.areaId]); // Use optional chaining for safety

    // Loading State (Skeleton)
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
      } else if (date instanceof Date && !Number.isNaN(date.getTime())) {
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
        aria-label={`Hábito: ${habit.name}`}
        data-testid={`habit-card-${habit.id}`}
      >
        {/* Creation Date/Time */}
        <Box
          as="time"
          fontSize="sm"
          color={colorMode === "light" ? "gray.400" : "gray.600"}
          dateTime={getIsoStringDate(habit.createdAt)}
        >
          {formatCreationDate(habit.createdAt)}
        </Box>

        {/* Habit Name and Icon */}
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

        {/* Goal Display (Uses external utility) */}
        <Text
          fontSize="sm"
          fontWeight={400}
          color={colorMode === "light" ? "gray.400" : "gray.600"}
        >
          {getGoalDisplay(todayRecord, habit)}
        </Text>

        {/* Options Menu (Extracted Component) */}
        <HabitCardOptions
          habit={habit}
          handleComplete={handleComplete}
          handleSkip={handleSkip}
          handleEdit={handleEdit}
          confirmDelete={confirmDelete}
        />
      </LinkBox>
    );
  }
);

HabitCard.propTypes = {
  habit: PropTypes.shape({
    id: PropTypes.string.isRequired,
    areaId: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    icon: PropTypes.node,
    createdAt: PropTypes.oneOfType([
      PropTypes.instanceOf(Date),
      PropTypes.object,
    ]),
    goals: PropTypes.shape({
      period: PropTypes.oneOf(["day", "week", "month"]).isRequired,
      unit: PropTypes.oneOf(["times", "minutes"]).isRequired,
      value: PropTypes.number.isRequired,
    }).isRequired,
  }),
  setSelectedHabit: PropTypes.func.isRequired,
  handleComplete: PropTypes.func.isRequired,
  handleSkip: PropTypes.func.isRequired,
  handleEdit: PropTypes.func.isRequired,
  confirmDelete: PropTypes.func.isRequired,
};

HabitCard.defaultProps = {
  habit: null,
};

export default HabitCard;
