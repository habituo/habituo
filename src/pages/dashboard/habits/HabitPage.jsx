import React, { useState, useEffect, useCallback } from "react";
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
  getHabitRecords,
  getHabitRecordsGroupedByDay,
  getHabitRecordsListener,
  deleteHabitRecord as deleteHabitInDb,
  skipHabit as skipHabitInDb,
  completeHabit as completeHabitInDb,
  getWeekNumber,
  getAreaNameById,
  getAreas,
} from "../../../hooks/database";
import BarChart from "../../../components/charts/BarChart";
// import HeatMap from "../../../components/charts/HeatMap";
import { NoDataPage } from "../../../routes";
import { useAuth } from "../../../context/AuthContext";

/**
 * Replaces the default navigation icons of the react-calendar with custom SVG icons.
 * This function directly manipulates the DOM after the Calendar component renders.
 */
const replaceCalendarIcons = () => {
  const replaceIcon = (selector, svgContent) => {
    const element = document.querySelector(selector);
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

  replaceIcon(".react-calendar__navigation__prev2-button", doubleArrowSvg);
  replaceIcon(".react-calendar__navigation__prev-button", arrowSvg);
  replaceIcon(".react-calendar__navigation__next2-button", nextDoubleArrowSvg);
  replaceIcon(".react-calendar__navigation__next-button", nextArrowSvg);
};

/**
 * HabitStat component to display a single habit statistic with label, current value, and change.
 */
const HabitStat = ({ label, current, change, icon, unit }) => (
  <Stat>
    <StatLabel display="flex" alignItems="center" gap={1}>
      {icon} {label}
    </StatLabel>
    <StatNumber>
      {current} {current === 1 ? unit : `${unit}s`}
    </StatNumber>
    <StatHelpText>
      {current === 0 ? (
        "---"
      ) : (
        <>
          <StatArrow type={change > 0 ? "increase" : "decrease"} />
          {current === 1 ? `${current} ${unit}` : `${current} ${unit}s`}
        </>
      )}
    </StatHelpText>
  </Stat>
);

const HabitPage = ({ habit, userInfo }) => {
  const { colorMode } = useColorMode();
  const [isLoaded, setIsLoaded] = useState(false);
  const toast = useToast();
  const { themeOptions } = useTheme();
  const { user } = useAuth();
  const [areas, setAreas] = useState([]);
  const [habitRecords, setHabitRecords] = useState([]);
  const [stats, setStats] = useState({
    completed: { current: 0, previous: 0, change: 0 },
    failed: { current: 0, previous: 0, change: 0 },
    skipped: { current: 0, previous: 0, change: 0 },
    streak: 0,
    total: 0,
  });

  const userId = user.currentUser?.uid;
  const areaId = habit?.area;
  const habitId = habit?.id;
  const areaName = habit.area;

  // Calendar states
  const [calendarValue, setCalendarValue] = useState(new Date());
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [clickedDate, setClickedDate] = useState(null);
  const [selectedDateInfo, setSelectedDateInfo] = useState(null);
  const [calendarKey, setCalendarKey] = useState(0);

  const processRecords = useCallback(
    (records) => {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

      const getRecordsForMonth = (recs, year, month) =>
        recs.filter(
          (record) =>
            record.date?.getFullYear() === year &&
            record.date?.getMonth() === month
        );

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
          if (record.status === "completed") completed++;
          if (record.status === "failed") failed++;
          if (record.status === "skipped") skipped++;
        });
        return { completed, failed, skipped };
      };

      const currentStats = calculateStatusCounts(currentMonthRecords);
      const previousStats = calculateStatusCounts(previousMonthRecords);

      const calculateChange = (current, previous) =>
        previous === 0 ? 0 : ((current - previous) / previous) * 100;

      const calculateStreak = (recs) => {
        let currentStreak = 0;
        let maxStreak = 0;
        const sortedRecords = recs
          .slice()
          .sort((a, b) => new Date(a.date) - new Date(b.date));

        if (sortedRecords.length === 0) {
          return 0;
        }

        for (let i = 0; i < sortedRecords.length; i++) {
          const record = sortedRecords[i];
          if (record.status === "completed") {
            currentStreak = 1;
            for (let j = i + 1; j < sortedRecords.length; j++) {
              const prevRecord = sortedRecords[j - 1];
              const currentDate = new Date(sortedRecords[j].date);
              const prevDate = new Date(prevRecord.date);
              const diffInDays =
                (currentDate.getTime() - prevDate.getTime()) /
                (1000 * 3600 * 24);

              if (diffInDays === 1 && sortedRecords[j].status === "completed") {
                currentStreak++;
              } else {
                break;
              }
            }
            maxStreak = Math.max(maxStreak, currentStreak);
          }
        }
        return maxStreak;
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
        streak: calculateStreak(records),
        total: records.length,
      });
    },
    [setStats]
  );

  useEffect(() => {
    if (!areaId || !habitId) return;

    const fetchInitialData = async () => {
      setIsLoaded(false);
      try {
        const records = await getHabitRecordsGroupedByDay(
          user?.uid,
          areaId,
          habitId
        );
        const formattedRecords = records.map((record) => ({
          date: record.date,
          status: record.status,
          timestamp: record.timestamp,
        }));
        setHabitRecords(formattedRecords);
        processRecords(formattedRecords);
      } catch (error) {
        toast({
          title: (
            <Text fontWeight={600}>Error al cargar los datos del hábito</Text>
          ),
          description: error.message,
          status: "error",
          position: "bottom",
        });
      } finally {
        setIsLoaded(true);
      }
    };

    fetchInitialData();

    return () => {};
  }, [areaId, habitId, processRecords, toast, user?.uid]);

  useEffect(() => {
    if (!areaId || !habitId) return;

    setIsLoaded(true);

    const unsubscribe = getHabitRecordsListener(
      user?.uid,
      areaId,
      habitId,
      (updatedRecords) => {
        setHabitRecords(updatedRecords);
        processRecords(updatedRecords);
      },
      (error) => {
        toast({
          title: <Text fontWeight={600}>Error en los registros</Text>,
          description: error.message,
          status: "error",
          position: "bottom",
        });
        setIsLoaded(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [areaId, habitId, processRecords, toast, user?.uid]);

  useEffect(() => {
    replaceCalendarIcons();
  }, []);

  const tileClassName = useCallback(
    ({ date, view }) => {
      if (view === "month" && Array.isArray(habitRecords)) {
        const calendarYear = date.getFullYear();
        const calendarMonth = date.getMonth();
        const calendarDay = date.getDate();

        const hasRecordWithStatus = (status) =>
          habitRecords.some((record) => {
            if (record.status === status && record.date) {
              let recordDate;
              if (typeof record.date.toDate === "function") {
                recordDate = record.date.toDate();
              } else if (record.date instanceof Date) {
                recordDate = record.date;
              } else {
                console.error(
                  "Error: Tipo de fecha de hábito desconocido:",
                  record.date
                );
                return false;
              }

              return (
                recordDate.getFullYear() === calendarYear &&
                recordDate.getMonth() === calendarMonth &&
                recordDate.getDate() === calendarDay
              );
            }
            return false;
          });

        if (hasRecordWithStatus("completed")) return "habit-completed";
        if (hasRecordWithStatus("failed")) return "habit-failed";
        if (hasRecordWithStatus("skipped")) return "habit-skipped";
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

  const handleDayClick = (date, event) => {
    setCalendarValue(date);
    setClickedDate(date);
    const habitInfo = getHabitStatusForDate(date);
    setSelectedDateInfo(habitInfo);
    setTimeout(() => {
      setPopoverOpen(true);
    }, 50);
  };

  const getHabitStatusForDate = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`;

    const habitRecord = habitRecords.find((record) => {
      const recordDate = record.date
        ? `${record.date.getFullYear()}-${(record.date.getMonth() + 1)
            .toString()
            .padStart(2, "0")}-${record.date
            .getDate()
            .toString()
            .padStart(2, "0")}`
        : null;
      return recordDate === formattedDate;
    });

    if (habitRecord) {
      return habitRecord.status;
    }

    return null;
  };

  const handleDelete = (habit) => {
    if (habit && clickedDate) {
      deleteHabitInDb(habit.area, habit.id, toast, habit.name, clickedDate);
      setPopoverOpen(false);
      setCalendarKey((prevKey) => prevKey + 1);
    } else {
      toast({
        title: <Text fontWeight="600">Error</Text>,
        description:
          "No se ha seleccionado ningún hábito para eliminar registros.",
        status: "error",
        position: "bottom",
      });
    }
  };

  const handleSkip = (habit) => {
    if (habit && clickedDate) {
      skipHabitInDb(habit.area, habit.id, toast, habit.name, clickedDate);
      setPopoverOpen(false);
      setCalendarKey((prevKey) => prevKey + 1);
    } else {
      toast({
        title: <Text fontWeight="600">Error</Text>,
        description: "No se ha seleccionado ningún hábito para saltar.",
        status: "error",
        position: "bottom",
      });
    }
  };

  const handleComplete = (habit) => {
    if (habit && clickedDate) {
      completeHabitInDb(
        habit.area,
        habit.id,
        habit,
        toast,
        getWeekNumber,
        clickedDate
      );
      setPopoverOpen(false);
      setCalendarKey((prevKey) => prevKey + 1);
    } else {
      toast({
        title: <Text fontWeight="600">Error</Text>,
        description: "No se ha seleccionado ningún hábito para completar.",
        status: "error",
        position: "bottom",
      });
    }
  };

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
          bg={colorMode === "light" ? "rgb(245, 245, 245)" : "rgb(23, 23, 23)"}
          overflowY="scroll"
          sx={{
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: `var(--chakra-colors-${themeOptions.focusColor}-200)`,
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              backgroundColor: `var(--chakra-colors-${themeOptions.focusColor}-400)`,
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "transparent",
              borderRadius: "4px",
            },
          }}
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
                    bg={
                      colorMode === "light"
                        ? "rgb(255, 255, 255)"
                        : "rgb(0, 0, 0)"
                    }
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
                      bg={
                        colorMode === "light"
                          ? "rgb(255, 255, 255)"
                          : "rgb(0, 0, 0)"
                      }
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
                      bg={
                        colorMode === "light"
                          ? "rgb(255, 255, 255)"
                          : "rgb(0, 0, 0)"
                      }
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
                      bg={
                        colorMode === "light"
                          ? "rgb(255, 255, 255)"
                          : "rgb(0, 0, 0)"
                      }
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
                      bg={
                        colorMode === "light"
                          ? "rgb(255, 255, 255)"
                          : "rgb(0, 0, 0)"
                      }
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
                        bg={
                          colorMode === "light"
                            ? "rgb(255, 255, 255)"
                            : "rgb(0, 0, 0)"
                        }
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
                      bg={
                        colorMode === "light"
                          ? "rgb(255, 255, 255)"
                          : "rgb(0, 0, 0)"
                      }
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
                          onClick={() => handleComplete(habit)}
                        >
                          Completar
                        </Button>
                        <Button
                          size="sm"
                          colorScheme="yellow"
                          mr={2}
                          onClick={() => handleSkip(habit)}
                        >
                          Saltar
                        </Button>
                        <Button
                          size="sm"
                          colorScheme="red"
                          onClick={() => handleDelete(habit)}
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
                border-radius: var(--chakra-radii-${themeOptions.borderRadius});
              }
              .react-calendar__navigation {
                display: none;
                align-items: center;
                justify-content: center;
                gap: 0;
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
                border-radius: var(--chakra-radii-${themeOptions.borderRadius});
                color: ${
                  colorMode === "light" ? "rgb(0, 0, 0)" : "rgb(255, 255, 255)"
                };
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
              /*.react-calendar__tile.react-calendar__tile--now::before {
                content: '';
                position: absolute;
                top: 0;
                width: 4px;
                height: 4px;
                border-radius: 50%;
                background: var(--chakra-colors-${themeOptions.focusColor}-500);
              }*/
              .habit-completed {
                background: var(--chakra-colors-${themeOptions.focusColor}-300);
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
                    bg={colorMode === "light" ? "rgb(255, 255, 255)" : "rgb(0, 0, 0)"}
                  >
                    <BarChart
                      userId={user.currentç?.uid}
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
                <Text mb={-4} fontSize="2xl" fontWeight={600}>
                  Información
                </Text>
                <Box
                  p={2}
                  pb={1}
                  border="2px solid var(--chakra-colors-chakra-border-color)"
                  borderRadius={themeOptions.borderRadius}
                  bg={
                    colorMode === "light"
                      ? "rgb(255, 255, 255)"
                      : "rgb(0, 0, 0)"
                  }
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
                  bg={
                    colorMode === "light"
                      ? "rgb(255, 255, 255)"
                      : "rgb(0, 0, 0)"
                  }
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
                  bg={
                    colorMode === "light"
                      ? "rgb(255, 255, 255)"
                      : "rgb(0, 0, 0)"
                  }
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
                  bg={
                    colorMode === "light"
                      ? "rgb(255, 255, 255)"
                      : "rgb(0, 0, 0)"
                  }
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
                  bg={
                    colorMode === "light"
                      ? "rgb(255, 255, 255)"
                      : "rgb(0, 0, 0)"
                  }
                >
                  <Text fontSize="sm" fontWeight={500}>
                    Repetición
                  </Text>
                  <Text fontSize="xl" fontWeight={600}>
                    {habit.repeat.type === "month"
                      ? `El ${habit.repeat.dayOfMonth} de cada més`
                      : habit.repeat.type === "day"
                      ? habit.repeat.days
                      : habit.repeat.interval}
                  </Text>
                </Box>
                <Box
                  p={2}
                  pb={1}
                  border="2px solid var(--chakra-colors-chakra-border-color)"
                  borderRadius={themeOptions.borderRadius}
                  bg={
                    colorMode === "light"
                      ? "rgb(255, 255, 255)"
                      : "rgb(0, 0, 0)"
                  }
                >
                  <Text fontSize="sm" fontWeight={500}>
                    Área
                  </Text>
                  <Text fontSize="xl" fontWeight={600}>
                    {areaName}
                  </Text>
                </Box>
                <Box
                  p={2}
                  pb={1}
                  border="2px solid var(--chakra-colors-chakra-border-color)"
                  borderRadius={themeOptions.borderRadius}
                  bg={
                    colorMode === "light"
                      ? "rgb(255, 255, 255)"
                      : "rgb(0, 0, 0)"
                  }
                >
                  <Text fontSize="sm" fontWeight={500}>
                    Fecha de comienzo
                  </Text>
                  <Text fontSize="xl" fontWeight={600}>
                    {habit.startDate
                      ? (() => {
                          const startDate = new Date(habit.startDate);
                          const day = startDate.toLocaleDateString("es-ES", {
                            day: "2-digit",
                          });
                          const month = startDate.toLocaleDateString("es-ES", {
                            month: "long",
                          });
                          const year = startDate.getFullYear();
                          return `${day} de ${
                            month.charAt(0).toUpperCase() + month.slice(1)
                          } del ${year}`;
                        })()
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
