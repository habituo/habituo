import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Grid,
  HStack,
  VStack,
  Box,
  Text,
  Stack,
  Skeleton,
  useColorMode,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  TabIndicator,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverCloseButton,
  Button,
  useToast,
} from "@chakra-ui/react";
import Calendar from "react-calendar";
import * as LuIcons from "react-icons/lu";
import { VscFlame } from "react-icons/vsc";
import { useTheme } from "../../../context/ThemeContext";
import {
  getHabitRecordsListener,
  deleteHabitRecord as deleteHabitInDb,
  skipHabit as skipHabitInDb,
  completeHabit as completeHabitInDb,
  getAreaNameById,
} from "../../../hooks/database";
import BarChart from "../../../components/charts/BarChart";
// import HeatMap from "../../../components/charts/HeatMap";
import { NoDataPage } from "../../../routes";
import { useAuthUser } from "../../../context/AuthUserContext";

const HABIT_STATUS = {
  COMPLETED: "completed",
  FAILED: "failed",
  SKIPPED: "skipped",
  DELETED: "deleted",
};

const safeToDate = (dateInput) => {
  if (dateInput instanceof Date) {
    return dateInput;
  }
  if (typeof dateInput === "string" || typeof dateInput === "number") {
    const date = new Date(dateInput);
    return isNaN(date.getTime()) ? null : date;
  }
  return null;
};

const getTodayFormattedDate = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const useCalendarIconReplacement = (calendarRef) => {
  useEffect(() => {
    const replaceIcon = (element, svgContent) => {
      if (element) {
        element.innerHTML = "";
        const icon = document.createElement("span");
        icon.innerHTML = svgContent;
        element.appendChild(icon);
      }
    };

    const arrowSvg = `<svg stroke="#000000" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="20px" width="20px" xmlns="http://www.w3.org/2000/svg"><path d="m15 18-6-6 6-6"></path></svg>`;
    const doubleArrowSvg = `<svg stroke="#000000" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="20px" width="20px" xmlns="http://www.w3.org/2000/svg"><path d="m11 17-5-5 5-5"></path><path d="m18 17-5-5 5-5"></path></svg>`;
    const nextArrowSvg = `<svg stroke="#000000" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="20px" width="20px" xmlns="http://www.w3.org/2000/svg"><path d="m9 18 6-6-6-6"></path></svg>`;
    const nextDoubleArrowSvg = `<svg stroke="#000000" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="20px" width="20px" xmlns="http://www.w3.org/2000/svg"><path d="m6 17 5-5-5-5"></path><path d="m13 17 5-5-5-5"></path></svg>`;

    const observer = new MutationObserver(() => {
      if (calendarRef.current) {
        replaceIcon(
          calendarRef.current.querySelector(
            ".react-calendar__navigation__prev2-button"
          ),
          doubleArrowSvg
        );
        replaceIcon(
          calendarRef.current.querySelector(
            ".react-calendar__navigation__prev-button"
          ),
          arrowSvg
        );
        replaceIcon(
          calendarRef.current.querySelector(
            ".react-calendar__navigation__next2-button"
          ),
          nextDoubleArrowSvg
        );
        replaceIcon(
          calendarRef.current.querySelector(
            ".react-calendar__navigation__next-button"
          ),
          nextArrowSvg
        );
      }
    });

    if (calendarRef.current) {
      observer.observe(calendarRef.current, { childList: true, subtree: true });
    }

    return () => observer.disconnect();
  }, [calendarRef]);
};

const HabitStat = ({ label, current, change, icon, unit }) => {
  const displayUnit = (count) => {
    return count === 1 ? unit : `${unit}s`;
  };

  return (
    <Stat>
      <StatLabel display="flex" alignItems="center" gap={1}>
        {icon} {label}
      </StatLabel>
      <StatNumber>
        {current} {displayUnit(current)}
      </StatNumber>
      <StatHelpText>
        {current === 0 ? (
          "---"
        ) : (
          <>
            <StatArrow type={change >= 0 ? "increase" : "decrease"} />
            {change.toFixed(1)}%
          </>
        )}
      </StatHelpText>
    </Stat>
  );
};

const HabitPage = ({ habit, allAreas }) => {
  const { themeOptions } = useTheme();
  const { colorMode } = useColorMode();
  const [isLoaded, setIsLoaded] = useState(false);
  const toast = useToast();
  const { user } = useAuthUser();
  const [habitRecords, setHabitRecords] = useState([]);
  const [stats, setStats] = useState({
    completed: { current: 0, previous: 0, change: 0 },
    failed: { current: 0, previous: 0, change: 0 },
    skipped: { current: 0, previous: 0, change: 0 },
    streak: 0,
    total: 0,
  });
  const userId = user?.uid;
  const areaId = habit?.area;
  const habitId = habit?.id;
  const [calendarValue, setCalendarValue] = useState(new Date());
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [clickedDate, setClickedDate] = useState(null);
  const [selectedDateInfo, setSelectedDateInfo] = useState(null);
  const [calendarKey, setCalendarKey] = useState(0);
  const calendarRef = useRef(null);
  useCalendarIconReplacement(calendarRef);

  const areaName = useMemo(() => {
    return getAreaNameById(areaId, allAreas);
  }, [areaId, allAreas]);

  const processRecords = useCallback((records) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const getRecordsForMonth = (recs, year, month) =>
      recs.filter((record) => {
        const recordDate = record.date;
        return (
          recordDate &&
          recordDate.getFullYear() === year &&
          recordDate.getMonth() === month
        );
      });

    const previousMonthDate = new Date(now);
    previousMonthDate.setMonth(now.getMonth() - 1);
    const previousYear = previousMonthDate.getFullYear();
    const previousMonth = previousMonthDate.getMonth();
    const currentMonthRecords = getRecordsForMonth(
      records,
      currentYear,
      currentMonth
    );
    const previousMonthRecords = getRecordsForMonth(
      records,
      previousYear,
      previousMonth
    );

    const calculateStatusCounts = (recs) => {
      let completed = 0,
        failed = 0,
        skipped = 0;
      recs.forEach((record) => {
        if (record.status === HABIT_STATUS.COMPLETED) completed++;
        if (record.status === HABIT_STATUS.FAILED) failed++;
        if (record.status === HABIT_STATUS.SKIPPED) skipped++;
      });
      return { completed, failed, skipped };
    };

    const currentStats = calculateStatusCounts(currentMonthRecords);
    const previousStats = calculateStatusCounts(previousMonthRecords);

    const calculateChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const calculateLongestStreak = (records) => {
      if (!records || records.length === 0) return 0;

      const recordMap = {};
      records.forEach((record) => {
        const date = record.date;
        if (date instanceof Date && record.status) {
          const key = date.toISOString().split("T")[0];
          recordMap[key] = record.status;
        }
      });

      let streak = 0;
      let today = new Date();
      today.setHours(0, 0, 0, 0);

      while (true) {
        const key = today.toISOString().split("T")[0];
        const status = recordMap[key];

        if (status === "completed") {
          streak++;
          today.setDate(today.getDate() - 1);
        } else {
          break;
        }
      }

      return streak;
    };

    setStats({
      completed: {
        current: currentStats.completed,
        previous: previousStats.completed,
        change: calculateChange(
          currentStats.completed,
          previousStats.completed
        ),
      },
      failed: {
        current: currentStats.failed,
        previous: previousStats.failed,
        change: calculateChange(currentStats.failed, previousStats.failed),
      },
      skipped: {
        current: currentStats.skipped,
        previous: previousStats.skipped,
        change: calculateChange(currentStats.skipped, previousStats.skipped),
      },
      streak: calculateLongestStreak(records),
      total: records.length,
    });
  }, []);

  useEffect(() => {
    if (!userId || !areaId || !habitId) {
      setIsLoaded(true);
      return;
    }

    setIsLoaded(false);

    const unsubscribe = getHabitRecordsListener(
      userId,
      areaId,
      habitId,
      (updatedRecords) => {
        const formattedRecords = updatedRecords.map((record) => ({
          ...record,
          date: safeToDate(record.date),
        }));
        setHabitRecords(formattedRecords);
        processRecords(formattedRecords);
        setIsLoaded(true);
      },
      (error) => {
        toast({
          title: (
            <Text fontWeight={600}>Error al cargar registros del hábito</Text>
          ),
          description: error.message,
          status: "error",
          position: "bottom",
        });
        setIsLoaded(true);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [userId, areaId, habitId, processRecords, toast]);

  const tileClassName = useCallback(
    ({ date, view }) => {
      if (view === "month" && Array.isArray(habitRecords)) {
        const calendarYear = date.getFullYear();
        const calendarMonth = date.getMonth();
        const calendarDay = date.getDate();

        const recordForDate = habitRecords.find((record) => {
          return (
            record.date &&
            record.date.getFullYear() === calendarYear &&
            record.date.getMonth() === calendarMonth &&
            record.date.getDate() === calendarDay
          );
        });

        if (recordForDate) {
          switch (recordForDate.status) {
            case HABIT_STATUS.COMPLETED:
              return "habit-completed";
            case HABIT_STATUS.FAILED:
              return "habit-failed";
            case HABIT_STATUS.SKIPPED:
              return "habit-skipped";
            default:
              return null;
          }
        }
      }
      return null;
    },
    [habitRecords]
  );

  const failedIcon =
    colorMode === "light"
      ? "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMTkgNi40MSAxNy41OSA1IDEyIDEwLjU5IDYuNDEgNSA1IDYuNDEgMTAuNTkgMTIgNSAxNy41OSA2LjQxIDE5IDEyIDEzLjQxIDE3LjU5IDE5IDE5IDE3LjU5IDEzLjQxIDEyeiIvPjwvc3ZnPg=="
      : "data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjZmZmZmZmIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMTkgNi40MSAxNy41OSA1IDEyIDEwLjU5IDYuNDEgNSA1IDYuNDEgMTAuNTkgMTIgNSAxNy41OSA2LjQxIDE5IDEyIDEzLjQxIDE3LjU5IDE5IDE5IDE3LjU5IDEzLjQxIDEyeiIvPjwvc3ZnPg==";

  const IconComponent = LuIcons[habit.icon];

  const handleDayClick = useCallback(
    (date) => {
      setCalendarValue(date);
      setClickedDate(date);
      const habitInfo = habitRecords.find((record) => {
        const recordDate = record.date;
        return recordDate && recordDate.toDateString() === date.toDateString();
      });
      setSelectedDateInfo(habitInfo?.status || null);
      setPopoverOpen(true);
    },
    [habitRecords]
  );

  const handleHabitAction = useCallback(
    async (actionType) => {
      if (!habit || !clickedDate || !userId) {
        toast({
          title: <Text fontWeight={600}>Error</Text>,
          description:
            "No se ha seleccionado una fecha o hábito válido para la acción.",
          status: "error",
          position: "bottom",
        });
        return;
      }

      const dateToProcess = getTodayFormattedDate(clickedDate);

      try {
        if (actionType === HABIT_STATUS.COMPLETED) {
          const amountToComplete = habit.goal?.unit === "minutes" ? 30 : 1;
          await completeHabitInDb(
            userId,
            habit.area,
            habit.id,
            habit,
            toast,
            dateToProcess,
            amountToComplete
          );
        } else if (actionType === HABIT_STATUS.SKIPPED) {
          await skipHabitInDb(
            userId,
            areaId,
            habitId,
            toast,
            habit.name,
            clickedDate
          );
        } else if (actionType === HABIT_STATUS.DELETED) {
          await deleteHabitInDb(
            userId,
            areaId,
            habitId,
            toast,
            habit.name,
            clickedDate
          );
        }
        setPopoverOpen(false);
      } catch (error) {
        toast({
          title: <Text fontWeight={600}>Error en la acción del hábito</Text>,
          description: error.message,
          status: "error",
          position: "bottom",
        });
      }
    },
    [habit, clickedDate, userId, areaId, habitId, toast]
  );

  const memoizedHabitStats = useMemo(
    () => (
      <>
        <HabitStat
          label="Completado"
          current={stats.completed.current}
          change={stats.completed.change}
          icon={IconComponent ? <IconComponent /> : <LuIcons.LuCheck />}
          unit="vez"
        />
        <HabitStat
          label="Fallado"
          current={stats.failed.current}
          change={stats.failed.change}
          icon={
            <Box
              as="span"
              dangerouslySetInnerHTML={{ __html: failedIcon }}
              display="inline-flex"
              alignItems="center"
              justifyContent="center"
            />
          }
          unit="vez"
        />
        <HabitStat
          label="Saltado"
          current={stats.skipped.current}
          change={stats.skipped.change}
          icon={<LuIcons.LuSkipForward />}
          unit="vez"
        />
        <HabitStat
          label="Racha"
          current={stats.streak}
          change={0}
          icon={<VscFlame />}
          unit="día"
        />
      </>
    ),
    [stats, IconComponent, failedIcon]
  );

  const repeatType =
    habit.goal.period === "day" ? "días" : "week" ? "semanas" : "meses";

  if (!habit) {
    return (
      <NoDataPage
        title="Hábito no encontrado"
        description="Parece que este hábito no existe o no tienes permiso para verlo."
      />
    );
  }

  return (
    <>
      {habit ? (
        <Tabs
          pt={2}
          position="relative"
          variant="unstyled"
          w="100%"
          minH="100vh"
          maxH="100vh"
          bg={colorMode === "light" ? "gray.100" : "gray.900"}
          overflowY="scroll"
        >
          <TabList>
            <Tab _selected={{ fontWeight: "600" }}>Información</Tab>
            <Tab _selected={{ fontWeight: "600" }}>Detalles</Tab>
          </TabList>
          <TabIndicator
            mt="-1.5px"
            height="2px"
            bg={`var(--chakra-colors-${themeOptions.focusColor}-500)`}
          />
          <TabPanels>
            <TabPanel>
              {habit ? (
                <>
                  <HStack alignItems="center" spacing={2} marginBottom={2}>
                    <Box
                      p={2}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      borderRadius={themeOptions.borderRadius}
                      backgroundColor={
                        colorMode === "light" ? "#00000010" : "#ffffff20"
                      }
                    >
                      {IconComponent && (
                        <IconComponent
                          size="22px"
                          aria-label={`${habit.name} icon`}
                        />
                      )}
                    </Box>
                    <Text fontSize="20px" fontWeight="600">
                      {habit.name}
                    </Text>
                  </HStack>
                  <Box
                    p={2}
                    border="2px solid var(--chakra-colors-chakra-border-color)"
                    borderRadius={themeOptions.borderRadius}
                    bg={colorMode === "light" ? "white" : "black"}
                  >
                    <HStack>
                      <VscFlame size={50} />
                      <VStack
                        spacing={0}
                        alignItems="flex-start"
                        justifyContent="center"
                      >
                        <Text fontSize="14px" fontWeight="500">
                          Racha actual
                        </Text>
                        <Text fontSize="2xl" fontWeight="600">
                          {stats.streak} {stats.streak === 1 ? "día" : "días"}
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                  <Grid
                    my={2}
                    display="grid"
                    gridTemplateColumns="repeat(2, minmax(0, 1fr))"
                    gap={2}
                  >
                    <Box
                      px={3}
                      py={2}
                      pb={0}
                      border="2px solid var(--chakra-colors-chakra-border-color)"
                      borderRadius={themeOptions.borderRadius}
                      bg={colorMode === "light" ? "white" : "black"}
                    >
                      <HabitStat
                        label="Completado"
                        current={stats.completed.current}
                        change={stats.completed.change}
                        icon={<LuIcons.LuCheck />}
                        unit="día"
                      />
                    </Box>
                    <Box
                      px={3}
                      py={2}
                      pb={0}
                      border="2px solid var(--chakra-colors-chakra-border-color)"
                      borderRadius={themeOptions.borderRadius}
                      bg={colorMode === "light" ? "white" : "black"}
                    >
                      <HabitStat
                        label="Fallado"
                        current={stats.failed.current}
                        change={stats.failed.change}
                        icon={<LuIcons.LuX />}
                        unit="día"
                      />
                    </Box>
                    <Box
                      px={3}
                      py={2}
                      pb={0}
                      border="2px solid var(--chakra-colors-chakra-border-color)"
                      borderRadius={themeOptions.borderRadius}
                      bg={colorMode === "light" ? "white" : "black"}
                    >
                      <HabitStat
                        label="Saltado"
                        current={stats.skipped.current}
                        change={stats.skipped.change}
                        icon={<LuIcons.LuArrowRight />}
                        unit="día"
                      />
                    </Box>
                    <Box
                      px={3}
                      py={2}
                      pb={0}
                      border="2px solid var(--chakra-colors-chakra-border-color)"
                      borderRadius={themeOptions.borderRadius}
                      bg={colorMode === "light" ? "white" : "black"}
                    >
                      <Stat>
                        <StatLabel>Total</StatLabel>
                        <StatNumber>
                          {stats.total} {stats.total === 1 ? "vez" : "veces"}
                        </StatNumber>
                      </Stat>
                    </Box>
                  </Grid>
                  <Popover
                    isOpen={popoverOpen}
                    onClose={() => setPopoverOpen(false)}
                    placement="bottom-start"
                    closeOnBlur={false}
                    trigger="click"
                  >
                    <PopoverTrigger>
                      <Box
                        as="div"
                        bg={colorMode === "light" ? "white" : "black"}
                        borderRadius={themeOptions.borderRadius}
                      >
                        <Calendar
                          key={calendarKey}
                          className="custom-react-calendar"
                          onClickDay={handleDayClick}
                          value={calendarValue}
                          tileClassName={tileClassName}
                        />
                      </Box>
                    </PopoverTrigger>
                    <PopoverContent
                      borderRadius={themeOptions.borderRadius}
                      bg={colorMode === "light" ? "white" : "black"}
                    >
                      <PopoverCloseButton
                        top={2}
                        right={2}
                        borderRadius={themeOptions.borderRadius}
                      />
                      <PopoverHeader px={4} py={2} fontWeight={600}>
                        ¿Qué deseas hacer?
                      </PopoverHeader>
                      <PopoverBody px={4}>
                        <Button
                          size="sm"
                          colorScheme="green"
                          mr={2}
                          onClick={() =>
                            handleHabitAction(HABIT_STATUS.COMPLETED)
                          }
                        >
                          Completar
                        </Button>
                        <Button
                          size="sm"
                          colorScheme="yellow"
                          mr={2}
                          onClick={() =>
                            handleHabitAction(HABIT_STATUS.SKIPPED)
                          }
                        >
                          Saltar
                        </Button>
                        <Button
                          size="sm"
                          colorScheme="red"
                          onClick={() =>
                            handleHabitAction(HABIT_STATUS.DELETED)
                          }
                        >
                          Borrar
                        </Button>
                      </PopoverBody>
                    </PopoverContent>
                  </Popover>
                  <style>
                    {`
                      .custom-react-calendar {
                        margin-bottom: .5rem;
                        padding: 1rem 0 .5rem;
                        border: 2px solid var(--chakra-colors-chakra-border-color);
                        border-radius: var(--chakra-radii-${
                          themeOptions.borderRadius
                        });
                      }
                      .react-calendar__navigation {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 8px;
                        margin-bottom: 8px;
                      }
                      button.react-calendar__navigation__arrow {
                        width: 20px;
                        height: 20px;
                        border: 1px solid var(--chakra-colors-chakra-border-color);
                        border-radius: var(--chakra-radii-${
                          themeOptions.borderRadius
                        });
                        display: flex;
                        align-items: center;
                        justify-content: center;
                      }
                      button.react-calendar__navigation__arrow.react-calendar__navigation__prev2-button,
                      button.react-calendar__navigation__arrow.react-calendar__navigation__next2-button {
                        display: none;
                      }
                      .react-calendar__navigation__label {
                        flex-grow: inherit !important;
                        margin: 0 .5rem;
                      }
                      .react-calendar__month-view__weekdays__weekday {
                        text-align: center;
                        text-transform: capitalize;
                        font-size: 0.6875rem;
                        font-weight: 600;
                        text-decoration: none;
                        margin-bottom: 10px;
                      }
                      .react-calendar__month-view__weekdays__weekday abbr[title] {
                        text-decoration: none;
                      }
                      .react-calendar__tile.react-calendar__month-view__days__day {
                        position: relative;
                        height: 35px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        line-height: 40px;
                        font-size: 0.9375rem;
                        font-weight: 400;
                        border-radius: var(--chakra-radii-${
                          themeOptions.borderRadius
                        });
                        color: ${colorMode === "light" ? "black" : "white"};
                        border: 2px solid transparent;
                        overflow: visible !important;
                      }
                      .react-calendar__tile.react-calendar__month-view__days__day.react-calendar__month-view__days__day--neighboringMonth {
                        color: ${
                          colorMode === "light"
                            ? "rgb(123, 124, 124)"
                            : "rgb(127, 127, 127)"
                        };
                      }
                      .react-calendar__tile.react-calendar__tile--now abbr {
                        font-weight: 900;
                      }
                      .habit-completed {
                        background: var(--chakra-colors-${
                          themeOptions.focusColor
                        }-300);
                      }
                      .habit-failed::after {
                        content: '';
                        position:absolute;
                        top: -6px;
                        background-image: url(${failedIcon});
                        background-position: center;
                        background-size: cover;
                        color: #fff;
                        width: 14px;
                        height: 14px;
                      }
                      .habit-skipped {
                        border-color: var(--chakra-colors-${
                          themeOptions.focusColor
                        }-300) !important;
                      }
                    `}
                  </style>
                  <Box
                    p={0}
                    border="2px solid var(--chakra-colors-chakra-border-color)"
                    borderRadius={themeOptions.borderRadius}
                    bg={colorMode === "light" ? "white" : "black"}
                  >
                    <BarChart
                      userId={userId}
                      habitId={habit.id}
                      areaId={habit.area}
                    />
                  </Box>
                  {/* <Box
                    p={0}
                    border="2px solid var(--chakra-colors-chakra-border-color)"
                    borderRadius={themeOptions.borderRadius}
                  >
                    <HeatMap
                      userId={userId}
                      habitId={habit.id}
                      areaId={habit.area}
                    />
                  </Box> */}
                </>
              ) : (
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
                  <Text as="h2" fontSize="lg" fontWeight="600">
                    Da el paso y construye tu mejor versión
                  </Text>
                  <Text as="h2" fontSize="sm" maxW="600px" textAlign="center">
                    Los hábitos son como los escalones de una escalera: al dar
                    el primer paso, el resto se va sumando uno a uno.
                  </Text>
                </VStack>
              )}
            </TabPanel>
            <TabPanel>
              <VStack
                w="100%"
                alignItems="stretch"
                justifyContent="flex-start"
                spacing={4}
              >
                <Text align="center" fontSize="sm" fontWeight={400}>
                  ID: {habit.id}
                </Text>
                <Box
                  px={3}
                  py={2}
                  border="2px solid var(--chakra-colors-chakra-border-color)"
                  borderRadius={themeOptions.borderRadius}
                  bg={colorMode === "light" ? "white" : "black"}
                >
                  <Text fontSize="sm" fontWeight={500}>
                    Nombre
                  </Text>
                  <Text fontSize="xl" fontWeight={600}>
                    {habit.name}
                  </Text>
                </Box>
                <Box
                  p={2}
                  pb={1}
                  border="2px solid var(--chakra-colors-chakra-border-color)"
                  borderRadius={themeOptions.borderRadius}
                  bg={colorMode === "light" ? "white" : "black"}
                >
                  <Text fontSize="sm" fontWeight={500}>
                    Fecha de creación
                  </Text>
                  <Text fontSize="xl" fontWeight={600}>
                    {habit.createdAt
                      ? `${habit.createdAt
                          .toDate()
                          .toLocaleDateString("es-ES", {
                            day: "2-digit",
                          })} de ${habit.createdAt
                          .toDate()
                          .toLocaleDateString("es-ES", {
                            month: "long",
                          })
                          .replace(/^\w/, (c) =>
                            c.toUpperCase()
                          )} de ${habit.createdAt.toDate().getFullYear()}`
                      : "Sin fecha de creación"}
                  </Text>
                </Box>
                <Box
                  p={2}
                  pb={1}
                  border="2px solid var(--chakra-colors-chakra-border-color)"
                  borderRadius={themeOptions.borderRadius}
                  bg={colorMode === "light" ? "white" : "black"}
                >
                  <Text fontSize="sm" fontWeight={500}>
                    Recordatorio
                  </Text>
                  <Text fontSize="xl" fontWeight={600}>
                    {habit.reminder ? habit.reminder : "--:--"}h
                  </Text>
                </Box>
                <Box
                  p={2}
                  pb={1}
                  border="2px solid var(--chakra-colors-chakra-border-color)"
                  borderRadius={themeOptions.borderRadius}
                  bg={colorMode === "light" ? "white" : "black"}
                >
                  <Text fontSize="sm" fontWeight={500}>
                    Meta a lograr
                  </Text>
                  <Text fontSize="xl" fontWeight={600}>
                    {habit.goal.value}
                    {habit.goal.unit === "times" ? " veces " : " minutos "}
                    {habit.goal.period === "day"
                      ? "al día"
                      : "week"
                      ? "a la semana"
                      : "al més"}
                  </Text>
                </Box>
                <Box
                  p={2}
                  pb={1}
                  border="2px solid var(--chakra-colors-chakra-border-color)"
                  borderRadius={themeOptions.borderRadius}
                  bg={colorMode === "light" ? "white" : "black"}
                >
                  <Text fontSize="sm" fontWeight={500}>
                    Repetición
                  </Text>
                  <Text fontSize="xl" fontWeight={600}>
                    {habit.repeat.type === "month"
                      ? `El ${habit.repeat.dayOfMonth} de cada més`
                      : habit.repeat.type === "day"
                      ? habit.repeat.days
                      : `Cada ${habit.repeat.interval} ${repeatType}`}
                  </Text>
                </Box>
                <Box
                  p={2}
                  pb={1}
                  border="2px solid var(--chakra-colors-chakra-border-color)"
                  borderRadius={themeOptions.borderRadius}
                  bg={colorMode === "light" ? "white" : "black"}
                >
                  <Text fontSize="sm" fontWeight={500}>
                    Área
                  </Text>
                  <Text fontSize="xl" fontWeight={600}>
                    {areaName || habit.area}
                  </Text>
                </Box>
                <Box
                  p={2}
                  pb={1}
                  border="2px solid var(--chakra-colors-chakra-border-color)"
                  borderRadius={themeOptions.borderRadius}
                  bg={colorMode === "light" ? "white" : "black"}
                >
                  <Text fontSize="sm" fontWeight={500}>
                    Fecha de comienzo
                  </Text>
                  <Text fontSize="xl" fontWeight={600}>
                    {habit.startDate
                      ? `${habit.startDate
                          .toDate()
                          .toLocaleDateString("es-ES", {
                            day: "2-digit",
                          })} de ${habit.startDate
                          .toDate()
                          .toLocaleDateString("es-ES", {
                            month: "long",
                          })
                          .replace(/^\w/, (c) =>
                            c.toUpperCase()
                          )} de ${habit.startDate.toDate().getFullYear()}`
                      : "Sin fecha de comienzo"}
                  </Text>
                </Box>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      ) : (
        <NoDataPage type="habits" />
      )}
    </>
  );
};

export default HabitPage;
