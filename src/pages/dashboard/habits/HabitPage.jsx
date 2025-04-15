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
} from "@chakra-ui/react";
import Calendar from "react-calendar";
import * as LuIcons from "react-icons/lu";
import { VscFlame } from "react-icons/vsc";
import { useTheme } from "../../../context/ThemeContext";
import {
  getUserId,
  getHabitRecords,
  getHabitRecordsListener,
  getAreaNameById,
} from "../../../hooks/database";
import BarChart from "../../../components/charts/BarChart";
import HeatMap from "../../../components/charts/HeatMap";
import { NoDataPage } from "../../../routes";

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

const HabitPage = ({ habit }) => {
  const { colorMode } = useColorMode();
  const [isLoaded, setIsLoaded] = useState(false);
  const { themeOptions } = useTheme();
  const [calendarValue, setCalendarValue] = useState(new Date());
  const [habitRecords, setHabitRecords] = useState([]);
  const [stats, setStats] = useState({
    completed: { current: 0, previous: 0, change: 0 },
    failed: { current: 0, previous: 0, change: 0 },
    skipped: { current: 0, previous: 0, change: 0 },
    streak: 0,
    total: 0,
  });

  const userId = getUserId();
  const areaId = habit?.area;
  const habitId = habit?.id;

  const areaName = getAreaNameById(areaId);

  /**
   * Processes the habit records to calculate and update the statistics state.
   */
  const processRecords = useCallback((records) => {
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

      for (const record of sortedRecords) {
        if (record.status === "completed") {
          currentStreak++;
          maxStreak = Math.max(maxStreak, currentStreak);
        } else {
          currentStreak = 0;
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
  }, []);

  /**
   * Fetches habit records using the getHabitRecords function from database.js.
   */
  useEffect(() => {
    if (!areaId || !habitId) return;

    const fetchRecords = async () => {
      try {
        const records = await getHabitRecords(areaId, habitId);
        setHabitRecords(
          records.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            date: doc.data().timestamp?.toDate() || null,
          }))
        );
        processRecords(
          records.map((doc) => ({
            ...doc.data(),
            date: doc.data().timestamp?.toDate() || null,
          }))
        );
        setIsLoaded(true);
      } catch (error) {
        console.error("Error fetching habit records:", error);
      }
    };

    fetchRecords();
  }, [areaId, habitId, processRecords]);

  /**
   * Sets up a real-time listener for habit records using getHabitRecordsListener.
   * This will update the habitRecords and recalculate stats whenever the records change.
   */
  useEffect(() => {
    if (!areaId || !habitId) return () => {};

    const unsubscribe = getHabitRecordsListener(
      areaId,
      habitId,
      (snapshot) => {
        const records = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().timestamp?.toDate() || null,
        }));
        setHabitRecords(records);
        processRecords(records);
        setIsLoaded(true);
      },
      (error) => {
        console.error("Error listening to habit records:", error);
      }
    );

    return () => unsubscribe();
  }, [areaId, habitId, processRecords]);

  /**
   * Replaces the calendar icons after the component mounts.
   */
  useEffect(() => {
    replaceCalendarIcons();
  }, []);

  /**
   * Custom class names for calendar tiles based on the habit record status for that date.
   */
  const tileClassName = useCallback(
    ({ date, view }) => {
      if (view === "month" && Array.isArray(habitRecords)) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        const localDateStr = `${year}-${month}-${day}`;

        const hasRecordWithStatus = (status) =>
          habitRecords.some((record) => {
            if (record.status === status && record.date) {
              let recordDateLocal;
              if (typeof record.date.toDate === "function") {
                recordDateLocal = record.date.toDate();
              } else if (record.date instanceof Date) {
                recordDateLocal = record.date;
              } else if (typeof record.date === "string") {
                recordDateLocal = new Date(record.date);
                if (isNaN(recordDateLocal.getTime())) {
                  console.error(
                    "Error: Fecha de hábito en formato incorrecto:",
                    record.date
                  );
                  return false;
                }
              } else {
                console.error(
                  "Error: Tipo de fecha de hábito desconocido:",
                  record.date
                );
                return false;
              }

              const recordYear = recordDateLocal.getFullYear();
              const recordMonth = (recordDateLocal.getMonth() + 1)
                .toString()
                .padStart(2, "0");
              const recordDay = recordDateLocal
                .getDate()
                .toString()
                .padStart(2, "0");
              const recordLocalDateStr = `${recordYear}-${recordMonth}-${recordDay}`;
              return recordLocalDateStr === localDateStr;
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

  const IconComponent = LuIcons[habit.icon];

  return (
    <>
      {habit ? (
        <Tabs
          position="relative"
          variant="unstyled"
          w="100%"
          minH="100vh"
          maxH="100vh"
          bg={colorMode === "light" ? "rgb(245, 245, 245)" : "rgb(23, 23, 23)"}
          pt={2}
          userSelect="none"
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
                    {IconComponent && (
                      <IconComponent
                        size="22px"
                        aria-label={`${habit.name} icon`}
                      />
                    )}
                    <Text fontSize="20px" fontWeight="600">
                      {habit.name}
                    </Text>
                  </HStack>
                  <Box
                    p={2}
                    border="2px solid"
                    borderColor="var(--chakra-colors-chakra-border-color)"
                    borderRadius={themeOptions.borderRadius}
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
                      border="2px solid"
                      borderColor="var(--chakra-colors-chakra-border-color)"
                      borderRadius={themeOptions.borderRadius}
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
                      border="2px solid"
                      borderColor="var(--chakra-colors-chakra-border-color)"
                      borderRadius={themeOptions.borderRadius}
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
                      border="2px solid"
                      borderColor="var(--chakra-colors-chakra-border-color)"
                      borderRadius={themeOptions.borderRadius}
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
                      border="2px solid"
                      borderColor="var(--chakra-colors-chakra-border-color)"
                      borderRadius={themeOptions.borderRadius}
                    >
                      <Stat>
                        <StatLabel>Total</StatLabel>
                        <StatNumber>
                          {stats.total} {stats.total === 1 ? "vez" : "veces"}
                        </StatNumber>
                      </Stat>
                    </Box>
                  </Grid>
                  <Calendar
                    className="custom-react-calendar"
                    onChange={setCalendarValue}
                    value={calendarValue}
                    tileClassName={tileClassName}
                  />
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
                height: 38px;
                display: flex;
                align-items: center;
                justify-content: center;
                line-height: 38px;
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
                background-image: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20x%3D%220px%22%20y%3D%220px%22%20width%3D%22100%22%20height%3D%22100%22%20viewBox%3D%220%2C0%2C256%2C256%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-rule%3D%22nonzero%22%20stroke%3D%22none%22%20stroke-width%3D%221%22%20stroke-linecap%3D%22butt%22%20stroke-linejoin%3D%22miter%22%20stroke-miterlimit%3D%2210%22%20stroke-dasharray%3D%22%22%20stroke-dashoffset%3D%220%22%20font-family%3D%22none%22%20font-weight%3D%22none%22%20font-size%3D%22none%22%20text-anchor%3D%22none%22%20style%3D%22mix-blend-mode%3A%20normal%22%3E%3Cg%20transform%3D%22scale(3.55556%2C3.55556)%22%3E%3Cpath%20d%3D%22M19%2C15c-1.023%2C0%20-2.04812%2C0.39087%20-2.82812%2C1.17188c-1.562%2C1.562%20-1.562%2C4.09425%200%2C5.65625l14.17188%2C14.17188l-14.17187%2C14.17188c-1.562%2C1.562%20-1.562%2C4.09425%200%2C5.65625c0.78%2C0.78%201.80513%2C1.17188%202.82813%2C1.17188c1.023%2C0%202.04812%2C-0.39088%202.82813%2C-1.17187l14.17188%2C-14.17187l14.17188%2C14.17188c1.56%2C1.562%204.09525%2C1.562%205.65625%2C0c1.563%2C-1.563%201.563%2C-4.09325%200%2C-5.65625l-14.17187%2C-14.17187l14.17188%2C-14.17187c1.562%2C-1.562%201.562%2C-4.09425%200%2C-5.65625c-1.56%2C-1.561%20-4.09625%2C-1.562%20-5.65625%2C0l-14.17187%2C14.17188l-14.17187%2C-14.17187c-0.78%2C-0.78%20-1.80513%2C-1.17187%20-2.82812%2C-1.17187z%22%3E%3C%2Fpath%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E");
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
                    mb=".5rem"
                    p={0}
                    border="2px solid var(--chakra-colors-chakra-border-color)"
                    borderRadius={themeOptions.borderRadius}
                  >
                    <BarChart
                      userId={userId}
                      habitId={habit.id}
                      areaId={habit.area}
                    />
                  </Box>
                  <Box
                    p={0}
                    border="2px solid var(--chakra-colors-chakra-border-color)"
                    borderRadius={themeOptions.borderRadius}
                  >
                    <HeatMap
                      userId={userId}
                      habitId={habit.id}
                      areaId={habit.area}
                    />
                  </Box>
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
                <Text mt={2} mb={-4} fontSize="2xl" fontWeight={600}>
                  Registros
                </Text>
                <Box
                  p={2}
                  pb={1}
                  border="2px solid var(--chakra-colors-chakra-border-color)"
                  borderRadius={themeOptions.borderRadius}
                >
                  <Text fontSize="sm" fontWeight={500}>
                    Último registro
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
