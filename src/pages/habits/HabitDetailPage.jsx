import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Grid,
  HStack,
  VStack,
  Box,
  Text,
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
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverCloseButton,
  Button,
  useToast,
  Heading,
  Icon,
  SimpleGrid,
  Divider,
  useDisclosure,
  Badge,
  Card,
} from "@chakra-ui/react";
import Calendar from "react-calendar";
import * as LuIcons from "react-icons/lu";
import { VscFlame } from "react-icons/vsc";
import { useTheme } from "../../context/ThemeContext/ThemeContext";
import {
  getHabitRecord,
  getHabitRecordsListener,
  deleteHabitRecord,
  skipHabit,
  completeHabit,
  getAreaName,
  autoGenerateFailedDaysOnLoad,
} from "../../hooks/useDatabase";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import BarChart from "../../components/charts/BarChart";
// import HeatMap from "../../components/charts/HeatMap";
import { EmptyState, GoalModal } from "../../exports";
import { useAuthUser } from "../../context/AuthUserContext/AuthUserContext";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../api/firebase/firebase";

const HABIT_STATUS = {
  COMPLETED: "completed",
  IN_PROGRESS: "in_progress",
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

const formatHabitDate = (dateValue) => {
  if (!dateValue) return "Sin fecha";
  let date;
  if (typeof dateValue.toDate === "function") {
    date = dateValue.toDate();
  } else if (dateValue instanceof Date) {
    date = dateValue;
  } else {
    try {
      date = new Date(dateValue);
    } catch (e) {
      return "Fecha inválida";
    }
  }

  if (isNaN(date.getTime())) {
    return "Fecha inválida";
  }

  return format(date, "dd 'de' MMMM 'de' yyyy", { locale: es }).replace(
    /^\w/,
    (c) => c.toUpperCase()
  );
};

const dayMap = {
  0: "Domingo",
  1: "Lunes",
  2: "Martes",
  3: "Miércoles",
  4: "Jueves",
  5: "Viernes",
  6: "Sábado",
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
        {change === null ? (
          "Nuevo hábito"
        ) : (
          <>
            <StatArrow type={change >= 0 ? "increase" : "decrease"} />
            {change >= 0 ? "+" : "-"}
            {Math.abs(change).toFixed(1)}%
          </>
        )}
      </StatHelpText>
    </Stat>
  );
};

const HabitDetailPage = ({ habit, allAreas }) => {
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
  const calendarRef = useRef(null);
  const [habitToCompleteQuantified, setHabitToCompleteQuantified] =
    useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const {
    isOpen: isQuantityModalOpen,
    onOpen: openQuantityModal,
    onClose: closeQuantityModal,
  } = useDisclosure();
  const inputRef = useRef(null);

  useCalendarIconReplacement(calendarRef);

  const areaName = useMemo(() => {
    return getAreaName(areaId, allAreas);
  }, [areaId, allAreas]);

  const calculateCurrentStreak = useCallback((records) => {
    if (!records || records.length === 0) return 0;

    const completedDates = new Set(
      records
        .filter((record) => record.status === HABIT_STATUS.COMPLETED)
        .map((record) => {
          const date = safeToDate(record.date);
          return date ? date.toISOString().split("T")[0] : null;
        })
        .filter(Boolean)
    );

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const todayKey = currentDate.toISOString().split("T")[0];
    if (completedDates.has(todayKey)) {
      streak++;
    } else {
      currentDate.setDate(currentDate.getDate() - 1);
      const yesterdayKey = currentDate.toISOString().split("T")[0];
      if (!completedDates.has(yesterdayKey)) {
        return 0;
      }
      return 0;
    }

    currentDate.setDate(currentDate.getDate() - 1);
    while (true) {
      const key = currentDate.toISOString().split("T")[0];
      if (completedDates.has(key)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }, []);

  const processRecords = useCallback(
    (records) => {
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
        if (previous === 0 && current > 0) return null;
        if (previous === 0 && current === 0) return 0;
        return ((current - previous) / previous) * 100;
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
        streak: calculateCurrentStreak(records),
        total: records.filter(
          (r) =>
            r.status === HABIT_STATUS.COMPLETED ||
            r.status === HABIT_STATUS.SKIPPED
        ).length,
      });
    },
    [calculateCurrentStreak]
  );

  const autoMarkFailedDays = useCallback(
    async (records, habitStartDate) => {
      if (!userId || !habit?.id || !habitStartDate) return;

      const start = new Date(habitStartDate);
      const today = new Date();
      start.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      const missingDays = [];
      const current = new Date(start);
      while (current < today) {
        const hasRecord = records.some(
          (r) =>
            r.date &&
            r.date.getFullYear() === current.getFullYear() &&
            r.date.getMonth() === current.getMonth() &&
            r.date.getDate() === current.getDate()
        );

        if (!hasRecord) {
          missingDays.push(new Date(current));
        }
        current.setDate(current.getDate() + 1);
      }

      for (const day of missingDays) {
        const formatted = `${day.getFullYear()}-${String(
          day.getMonth() + 1
        ).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;

        try {
          await completeHabit(
            userId,
            areaId,
            habitId,
            habit,
            toast,
            formatted,
            0
          );
          await updateDoc(
            doc(
              db,
              "users",
              userId,
              "areas",
              areaId,
              "habits",
              habitId,
              "records",
              formatted
            ),
            { status: HABIT_STATUS.FAILED }
          );
        } catch (e) {
          throw new Error(e);
        }
      }
    },
    [userId, areaId, habitId, habit, toast]
  );

  useEffect(() => {
    if (!userId || !habit?.area || !habit?.id) {
      setIsLoaded(true);
      return;
    }

    setIsLoaded(false);

    const unsubscribe = getHabitRecordsListener(
      userId,
      habit.area,
      habit.id,
      (updatedRecords) => {
        const formattedRecords = updatedRecords.map((record) => ({
          ...record,
          date: safeToDate(record.date),
        }));
        setHabitRecords(formattedRecords);
        processRecords(formattedRecords);

        if (habit.startDate) {
          autoGenerateFailedDaysOnLoad(userId, areaId, habitId, habit);
        }

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
  }, [userId, habit, areaId, habitId, processRecords, toast]);

  useEffect(() => {
    if (habit && habit.startDate && habitRecords.length === 0) {
      autoMarkFailedDays([], habit.startDate);
    }
  }, [habit, habitRecords, autoMarkFailedDays]);

  const tileClassName = useCallback(
    ({ date, view }) => {
      if (view !== "month" || !Array.isArray(habitRecords)) return null;

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

      if (!recordForDate) return null;

      const { status, dailyGoal, amount, times, minutes, unit } = recordForDate;

      let currentProgress = 0;
      if (typeof amount === "number") {
        currentProgress = amount;
      } else if (unit === "times" && typeof times === "number") {
        currentProgress = times;
      } else if (unit === "minutes" && typeof minutes === "number") {
        currentProgress = minutes;
      }

      const goalValue = dailyGoal || habit.goals?.value || 1;
      let progressPercentage = Math.min(
        100,
        Math.max(0, Math.round((currentProgress / goalValue) * 100))
      );

      switch (status) {
        case HABIT_STATUS.COMPLETED:
          return "habit-completed";
        case HABIT_STATUS.IN_PROGRESS:
          return `habit-inprogress progress-width-${progressPercentage}`;
        case HABIT_STATUS.FAILED:
          return "habit-failed";
        case HABIT_STATUS.SKIPPED:
          return "habit-skipped";
        default:
          return null;
      }
    },
    [habitRecords, habit]
  );

  const handleTileClick = useCallback(
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
    [
      habitRecords,
      setCalendarValue,
      setClickedDate,
      setSelectedDateInfo,
      setPopoverOpen,
    ]
  );

  const executeCompleteHabit = useCallback(
    async (habitData, amount, dateToProcess) => {
      if (amount <= 0 || isNaN(amount)) {
        toast({
          title: <Text fontWeight={600}>Valor inválido</Text>,
          description: "La cantidad debe ser un número positivo.",
          status: "warning",
          position: "bottom",
        });
        return;
      }

      setIsSaving(true);
      try {
        await completeHabit(
          userId,
          habitData.area,
          habitData.id,
          habitData,
          toast,
          dateToProcess,
          amount
        );

        toast.closeAll();
        toast({
          title: <Text fontWeight={600}>Hábito completado</Text>,
          description: `Has completado "${
            habitData.name
          }" para el ${formatHabitDate(dateToProcess)}.`,
          status: "success",
          position: "bottom",
        });
      } catch (error) {
        toast({
          title: <Text fontWeight={600}>Error al completar</Text>,
          description: error.message || "No se pudo completar el hábito.",
          status: "error",
          position: "bottom",
        });
      } finally {
        setIsSaving(false);
        closeQuantityModal();
        setHabitToCompleteQuantified(null);
        setPopoverOpen(false);
      }
    },
    [userId, toast, closeQuantityModal]
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

      if (habit.startDate) {
        const startDate = habit.startDate.toDate
          ? habit.startDate.toDate()
          : new Date(habit.startDate);

        startDate.setHours(0, 0, 0, 0);
        const selected = new Date(clickedDate);
        selected.setHours(0, 0, 0, 0);

        if (selected < startDate) {
          toast.closeAll();
          toast({
            title: <Text fontWeight={600}>Fecha no válida</Text>,
            description: `Este hábito comienza el ${formatHabitDate(
              startDate
            )}, no puedes registrar días anteriores.`,
            status: "warning",
            position: "bottom",
          });
          setPopoverOpen(false);
          setIsSaving(false);
          return;
        }
      }

      const getLocalFormattedDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      const dateToProcess = getLocalFormattedDate(clickedDate);

      try {
        setIsSaving(true);

        if (actionType === HABIT_STATUS.COMPLETED) {
          if (habit.goals?.value > 1 || habit.goals?.unit === "minutes") {
            let currentProgress = 0;
            try {
              const record = await getHabitRecord(
                userId,
                habit.area,
                habit.id,
                dateToProcess
              );
              if (record) {
                const unitField =
                  habit.goals.unit === "minutes" ? "minutes" : "times";
                currentProgress = record[unitField] || 0;
              }
            } catch (error) {
              throw new Error(error);
            }

            const dailyGoal = habit.goals.value || 1;
            let remainingAmount = dailyGoal - currentProgress;

            if (remainingAmount <= 0 && currentProgress >= dailyGoal) {
              toast({
                title: <Text fontWeight={600}>Hábito ya completado</Text>,
                description: `"${
                  habit.name
                }" ya ha alcanzado su meta para el ${formatHabitDate(
                  clickedDate
                )}.`,
                status: "info",
                position: "bottom",
              });
              setPopoverOpen(false);
              setIsSaving(false);
              return;
            }

            remainingAmount = Math.max(1, remainingAmount);

            let initialAmount = 1;
            if (habit.goals?.unit === "minutes") {
              initialAmount = Math.min(remainingAmount, 15);
              initialAmount = Math.max(1, initialAmount);
            } else {
              initialAmount = Math.min(remainingAmount, 1);
            }

            setHabitToCompleteQuantified({
              ...habit,
              _currentProgress: currentProgress,
              _remainingAmount: remainingAmount,
              _initialInputAmount: initialAmount,
              _dateToProcess: dateToProcess,
            });
            openQuantityModal();
            setPopoverOpen(false);
            return;
          } else {
            await executeCompleteHabit(habit, 1, dateToProcess);
          }
        } else if (actionType === HABIT_STATUS.SKIPPED) {
          await skipHabit(
            userId,
            areaId,
            habitId,
            toast,
            habit.name,
            clickedDate
          );
          toast({
            title: <Text fontWeight={600}>Hábito saltado</Text>,
            description: `Has saltado "${habit.name}" para el ${formatHabitDate(
              clickedDate
            )}.`,
            status: "info",
            position: "bottom",
          });
        } else if (actionType === HABIT_STATUS.DELETED) {
          await deleteHabitRecord(
            userId,
            areaId,
            habitId,
            toast,
            habit.name,
            clickedDate
          );
          toast({
            title: <Text fontWeight={600}>Registro eliminado</Text>,
            description: `Se ha eliminado el registro de "${
              habit.name
            }" para el ${formatHabitDate(clickedDate)}.`,
            status: "success",
            position: "bottom",
          });
        }
        if (!isQuantityModalOpen) {
          setIsSaving(false);
        }
        setPopoverOpen(false);
      } catch (error) {
        toast({
          title: <Text fontWeight={600}>Error en la acción del hábito</Text>,
          description: error.message,
          status: "error",
          position: "bottom",
        });
        setIsSaving(false);
      }
    },
    [
      habit,
      clickedDate,
      userId,
      areaId,
      habitId,
      toast,
      openQuantityModal,
      executeCompleteHabit,
      isQuantityModalOpen,
    ]
  );

  const getRepeatType = (repetition) => {
    switch (repetition.type) {
      case "diary":
        if (repetition.days && repetition.days.length > 0) {
          const sortedDays = [...repetition.days].sort((a, b) => a - b);
          return sortedDays.map((dayIndex) => dayMap[dayIndex]).join(", ");
        }
        return "Diario";
      case "monthly":
        return `El ${repetition.dayOfMonth} de cada mes`;
      case "interval":
        const intervalValue = parseInt(
          repetition.interval?.replace("every ", "") || "1",
          10
        );
        const modeRepeatSingular =
          habit.goals.period === "day"
            ? "día"
            : habit.goals.period === "week"
            ? "semana"
            : "mes";
        const modeRepeatPlural =
          habit.goals.period === "day"
            ? "días"
            : habit.goals.period === "week"
            ? "semanas"
            : "meses";
        const pluralDay =
          intervalValue === 1 ? modeRepeatSingular : modeRepeatPlural;
        return `Cada ${intervalValue} ${pluralDay}`;
      default:
        return "No especificado";
    }
  };

  const failedIcon =
    colorMode === "light"
      ? "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMTkgNi40MSAxNy41OSA1IDEyIDEwLjU5IDYuNDEgNSA1IDYuNDEgMTAuNTkgMTIgNSAxNy41OSA2LjQxIDE5IDEyIDEzLjQxIDE3LjU5IDE5IDE5IDE3LjU5IDEzLjQxIDEyeiIvPjwvc3ZnPg=="
      : "data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjZmZmZmZmIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMTkgNi40MSAxNy41OSA1IDEyIDEwLjU5IDYuNDEgNSA1IDYuNDEgMTAuNTkgMTIgNSAxNy41OSA2LjQxIDE5IDEyIDEzLjQxIDE3LjU5IDE5IDE5IDE3LjU5IDEzLjQxIDEyeiIvPjwvc3ZnPg==";

  console.log("HABIT: ", habit);

  const repeatTypeText = habit.repetition
    ? getRepeatType(habit.repetition)
    : "No especificado";

  const calendarTypeMap = {
    monday: "iso8601",
    sunday: "gregory",
    saturday: "islamic",
  };

  const calendarType =
    calendarTypeMap[user?.preferences?.startOfWeek] || "iso8601";

  if (!habit) {
    return (
      <EmptyState
        title="Hábito no encontrado"
        description="Parece que este hábito no existe o no tienes permiso para verlo."
      />
    );
  }

  return (
    <>
      {habit ? (
        <Tabs
          position="relative"
          variant="unstyled"
          w="100%"
          minH="100vh"
          maxH="100vh"
          bg={colorMode === "light" ? "white" : "black"}
          overflowY="scroll"
        >
          <TabList
            p={1}
            top={0}
            position="sticky"
            bg={colorMode === "light" ? "white" : "black"}
            borderBottom="2px solid var(--chakra-colors-chakra-border-color)"
            zIndex={1}
          >
            <Tab
              px={4}
              py={3}
              fontWeight={600}
              color="gray.500"
              _selected={{
                color: "black",
                bg: `var(--chakra-colors-${themeOptions.focusColor}-100)`,
              }}
              borderRadius={themeOptions.borderRadius}
            >
              Información
            </Tab>
            <Tab
              px={4}
              py={3}
              fontWeight={600}
              color="gray.500"
              _selected={{
                color: "black",
                bg: `var(--chakra-colors-${themeOptions.focusColor}-100)`,
              }}
              borderRadius={themeOptions.borderRadius}
            >
              Detalles
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel bg={colorMode === "light" ? "gray.100" : "gray.900"}>
              <VStack w="100%" spacing={0} align="stretch">
                <HStack alignItems="center" spacing={2} marginBottom={2}>
                  {isLoaded ? (
                    <Text fontSize="xl">{habit.icon}</Text>
                  ) : (
                    <Skeleton
                      boxSize="38px"
                      borderRadius={themeOptions.borderRadius}
                    />
                  )}
                  {isLoaded ? (
                    <Text fontSize="xl" fontWeight={600} isTruncated>
                      {habit.name}
                    </Text>
                  ) : (
                    <Skeleton
                      height="26px"
                      width="80%"
                      borderRadius={themeOptions.borderRadius}
                    />
                  )}
                </HStack>
                {isLoaded ? (
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
                        <Text fontSize="14px" fontWeight={400}>
                          Racha actual
                        </Text>
                        <Text fontSize="2xl" fontWeight={600}>
                          {stats.streak} {stats.streak === 1 ? "día" : "días"}
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                ) : (
                  <Skeleton
                    height="70px"
                    borderRadius={themeOptions.borderRadius}
                  />
                )}
                {isLoaded ? (
                  <Grid
                    my={2}
                    templateColumns="repeat(auto-fit, minmax(150px, 1fr))" // Responsive grid
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
                        icon={<Icon as={LuIcons.LuCheck} />}
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
                        icon={<Icon as={LuIcons.LuX} />}
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
                        icon={<Icon as={LuIcons.LuArrowRight} />}
                        unit="día"
                      />
                    </Box>
                    <Box
                      px={3}
                      py={2}
                      pb={1}
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
                ) : (
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2} my={2}>
                    {[...Array(4)].map((_, i) => (
                      <Skeleton
                        key={i}
                        height="100px"
                        borderRadius={themeOptions.borderRadius}
                      />
                    ))}
                  </SimpleGrid>
                )}

                {isLoaded ? (
                  <>
                    <Popover
                      isOpen={popoverOpen}
                      onClose={() => setPopoverOpen(false)}
                      placement="bottom"
                      closeOnBlur={true}
                      returnFocusOnClose={false}
                      initialFocusRef={inputRef}
                    >
                      <PopoverTrigger>
                        <Box
                          bg={colorMode === "light" ? "white" : "black"}
                          border="2px solid var(--chakra-colors-chakra-border-color)"
                          borderRadius={themeOptions.borderRadius}
                          p={4}
                        >
                          <Calendar
                            key={calendarValue.toISOString()}
                            className={`custom-react-calendar ${
                              colorMode === "light"
                                ? "light-calendar"
                                : "dark-calendar"
                            }`}
                            onClickDay={handleTileClick}
                            locale="es-ES"
                            value={calendarValue}
                            tileClassName={tileClassName}
                            ref={calendarRef}
                            calendarType={calendarType}
                            navigationLabel={({ date, view, label }) => (
                              <Text fontWeight={600} fontSize="md">
                                {format(date, "MMMM yyyy", {
                                  locale: es,
                                }).replace(/^\w/, (c) => c.toUpperCase())}
                              </Text>
                            )}
                          />
                        </Box>
                      </PopoverTrigger>

                      <PopoverContent
                        borderRadius={themeOptions.borderRadius}
                        p={0}
                      >
                        <PopoverCloseButton
                          top={2}
                          right={2}
                          borderRadius={themeOptions.borderRadius}
                        />
                        <PopoverHeader px={4} py={2} fontWeight={600}>
                          <Text fontWeight={600}>
                            {clickedDate
                              ? formatHabitDate(clickedDate)
                              : "Selecciona una fecha"}
                          </Text>
                        </PopoverHeader>
                        <PopoverBody p={2}>
                          <VStack spacing={2} align="stretch">
                            {selectedDateInfo === HABIT_STATUS.COMPLETED ? (
                              <Text color="green.500" fontWeight={600}>
                                Hábito completado
                              </Text>
                            ) : selectedDateInfo === HABIT_STATUS.SKIPPED ? (
                              <Text color="orange.500" fontWeight={600}>
                                Hábito omitido
                              </Text>
                            ) : selectedDateInfo === HABIT_STATUS.FAILED ? (
                              <Text color="red.500" fontWeight={600}>
                                Hábito fallido
                              </Text>
                            ) : selectedDateInfo ===
                              HABIT_STATUS.IN_PROGRESS ? (
                              <Text color="green.500" fontWeight={600}>
                                Hábito en progreso
                              </Text>
                            ) : (
                              <Text color="gray.500" fontWeight={600}>
                                Sin registro para este día
                              </Text>
                            )}

                            <Divider />

                            <Button
                              size="sm"
                              colorScheme={themeOptions.focus}
                              onClick={() =>
                                handleHabitAction(HABIT_STATUS.COMPLETED)
                              }
                              isLoading={isSaving}
                              isDisabled={
                                selectedDateInfo === HABIT_STATUS.COMPLETED
                              }
                            >
                              Marcar como completado
                            </Button>
                            <Button
                              size="sm"
                              colorScheme="orange"
                              onClick={() =>
                                handleHabitAction(HABIT_STATUS.SKIPPED)
                              }
                              isLoading={isSaving}
                              isDisabled={
                                selectedDateInfo === HABIT_STATUS.SKIPPED
                              }
                            >
                              Marcar como omitido
                            </Button>
                            <Button
                              size="sm"
                              colorScheme="red"
                              onClick={() =>
                                handleHabitAction(HABIT_STATUS.DELETED)
                              }
                              isLoading={isSaving}
                              isDisabled={!selectedDateInfo}
                            >
                              Borrar registro
                            </Button>
                          </VStack>
                        </PopoverBody>
                      </PopoverContent>
                    </Popover>
                  </>
                ) : (
                  <Skeleton
                    height="350px"
                    width="100%"
                    borderRadius={themeOptions.borderRadius}
                  />
                )}
                <style>
                  {`
                      .react-calendar__navigation {
                        margin-bottom: 10px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 8px;
                      }
                      .react-calendar__navigation__next-button,
                      .react-calendar__navigation__prev-button {
                        font-size: 20px;
                        width: 20px;
                        height: 20px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                      }
                      .react-calendar__navigation__next2-button,
                      .react-calendar__navigation__prev2-button {
                        display: none;
                      }
                      .react-calendar__navigation__next2-button,
                      .react-calendar__navigation__prev2-button {
                        display: none;
                      }
                      .react-calendar__navigation__label {
                        flex-grow: inherit !important;
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
                      .habit-inprogress::before {
                        content: "";
                        position: absolute;
                        bottom: 0;
                        left: 0;
                        height: 6px;
                        background-color: var(--chakra-colors-${
                          themeOptions.focusColor
                        }-100);
                        border-radius: var(--chakra-radii-${
                          themeOptions.borderRadius
                        });
                        width: 100%;
                        transition: width 0.3s ease-in-out;
                      }
                      .habit-inprogress::after {
                        content: "";
                        position: absolute;
                        bottom: 0;
                        left: 0;
                        height: 6px;
                        background-color: var(--chakra-colors-${
                          themeOptions.focusColor
                        }-300);
                        border-radius: var(--chakra-radii-${
                          themeOptions.borderRadius
                        });
                        width: var(--progress-width, 0%);
                        transition: width 0.3s ease-in-out;
                      }
                      .habit-completed {
                        background: var(--chakra-colors-${
                          themeOptions.focusColor
                        }-300);
                      }
                      .habit-failed {
                        color: ${
                          colorMode === "light" ? "white" : "black"
                        } !important;
                        user-select: none;
                      }
                      .habit-failed::after {
                        content: '';
                        position:absolute;
                        top: 5px;
                        background-image: url(${failedIcon});
                        background-position: center;
                        background-size: cover;
                        width: 20px;
                        height: 20px;
                      }
                      .habit-skipped {
                        border-color: var(--chakra-colors-${
                          themeOptions.focusColor
                        }-300) !important;
                      }

                      .progress-width-10 { --progress-width: 10%; }
                      .progress-width-20 { --progress-width: 20%; }
                      .progress-width-30 { --progress-width: 30%; }
                      .progress-width-40 { --progress-width: 40%; }
                      .progress-width-50 { --progress-width: 50%; }
                      .progress-width-60 { --progress-width: 60%; }
                      .progress-width-70 { --progress-width: 70%; }
                      .progress-width-80 { --progress-width: 80%; }
                      .progress-width-90 { --progress-width: 90%; }
                      .progress-width-100 { --progress-width: 100%; }
                    `}
                </style>

                {isLoaded ? (
                  <Box
                    mt={2}
                    p={0}
                    border="2px solid var(--chakra-colors-chakra-border-color)"
                    borderRadius={themeOptions.borderRadius}
                    bg={colorMode === "light" ? "white" : "black"}
                    minH="250px"
                  >
                    <BarChart
                      userId={userId}
                      habitId={habit.id}
                      areaId={habit.area}
                    />
                  </Box>
                ) : (
                  <Skeleton
                    height="250px"
                    borderRadius={themeOptions.borderRadius}
                  />
                )}
              </VStack>
            </TabPanel>
            <TabPanel bg={colorMode === "light" ? "gray.100" : "gray.900"}>
              <VStack
                w="100%"
                minH="calc(100vh - 56px)"
                alignItems="stretch"
                justifyContent="flex-start"
                spacing={4}
              >
                <Card
                  p={4}
                  bg={colorMode === "light" ? "white" : "black"}
                  border="2px solid var(--chakra-colors-chakra-border-color)"
                  borderRadius={themeOptions.borderRadius}
                  boxShadow="none"
                >
                  <VStack align="start" spacing={4} w="full">
                    <HStack justify="space-between" w="full">
                      <Heading size="md" color={themeOptions.primary}>
                        {habit.icon} {habit.name}
                      </Heading>
                    </HStack>
                    <Divider />
                    <SimpleGrid columns={[1]} spacing={3} w="full">
                      <Box>
                        <Text fontSize="sm" color="gray.500">
                          Estado actual:
                        </Text>
                        <Badge
                          colorScheme={
                            stats.completed.current > 0
                              ? "green"
                              : stats.failed.current > 0
                              ? "red"
                              : stats.skipped.current > 0
                              ? "yellow"
                              : "gray"
                          }
                          variant="subtle"
                          px={3}
                          py={1}
                          borderRadius="md"
                        >
                          {stats.completed.current > 0
                            ? "En progreso"
                            : habit.startDate &&
                              new Date(habit.startDate) > new Date()
                            ? "Sin empezar"
                            : "Sin progreso"}
                        </Badge>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.500">
                          Fecha de creación:
                        </Text>
                        <Text fontWeight={600}>
                          {formatHabitDate(
                            habit.createdAt || habit.createdAt?.toDate?.()
                          )}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.500">
                          Comienza el:
                        </Text>
                        <Text fontWeight={600}>
                          {formatHabitDate(habit.startDate)}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.500">
                          Frecuencia:
                        </Text>
                        <Text fontWeight={600}>{repeatTypeText}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.500">
                          Meta diaria:
                        </Text>
                        <Text fontWeight={600}>
                          {habit.goals?.value}{" "}
                          {habit.goals?.unit === "times"
                            ? "veces"
                            : habit.goals?.unit === "minutes"
                            ? "minutos"
                            : ""}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.500">
                          Registro:
                        </Text>
                        <Text fontWeight={600}>
                          {stats.completed.current > 0
                            ? "Completando correctamente"
                            : stats.failed.current > 0
                            ? "Fallado recientemente"
                            : stats.skipped.current > 0
                            ? "Saltado"
                            : "Pendiente"}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.500">
                          Area:
                        </Text>
                        <Text fontWeight={600}>
                          {areaName || habit.area || "Sin área"}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.500">
                          Racha actual:
                        </Text>
                        <Text fontWeight={600}>{stats.streak} días 🔥</Text>
                      </Box>
                    </SimpleGrid>
                  </VStack>
                </Card>
                <Card
                  p={4}
                  bg={colorMode === "light" ? "white" : "black"}
                  border="2px solid var(--chakra-colors-chakra-border-color)"
                  borderRadius={themeOptions.borderRadius}
                  boxShadow="none"
                >
                  <VStack align="start" spacing={4} w="full">
                    <HStack justify="space-between" w="full">
                      <Heading size="md">Descripción</Heading>
                    </HStack>
                    <Divider />
                    <SimpleGrid columns={[1]} spacing={3} w="full">
                      <Text fontSize="sm" color="gray.400">
                        Proximamente...
                      </Text>
                    </SimpleGrid>
                  </VStack>
                </Card>
                <Card
                  p={4}
                  bg={colorMode === "light" ? "white" : "black"}
                  border="2px solid var(--chakra-colors-chakra-border-color)"
                  borderRadius={themeOptions.borderRadius}
                  boxShadow="none"
                >
                  <VStack align="start" spacing={4} w="full">
                    <HStack justify="space-between" w="full">
                      <Heading size="md">Recordatorios</Heading>
                    </HStack>
                    <Divider />
                    <SimpleGrid columns={[1]} spacing={3} w="full">
                      <Text fontSize="sm" color="gray.400">
                        Proximamente...
                      </Text>
                    </SimpleGrid>
                  </VStack>
                </Card>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      ) : (
        <EmptyState type="habits" />
      )}
      <GoalModal
        isOpen={isQuantityModalOpen}
        onClose={() => {
          closeQuantityModal();
          setIsSaving(false);
        }}
        title={`Completar "${
          habitToCompleteQuantified?.name || "Hábito"
        }" para el ${formatHabitDate(clickedDate)}`}
        description="Cantidad completada en"
        unitType={
          habitToCompleteQuantified?.goals?.unit === "minutes"
            ? "minuto(s)"
            : "vez(veces)"
        }
        initialValue={habitToCompleteQuantified?._initialInputAmount || 1}
        maxValue={habitToCompleteQuantified?._remainingAmount || 1}
        onConfirm={(amount) => {
          if (
            habitToCompleteQuantified &&
            habitToCompleteQuantified._dateToProcess
          ) {
            executeCompleteHabit(
              habitToCompleteQuantified,
              amount,
              habitToCompleteQuantified._dateToProcess
            );
          }
        }}
        confirmButtonText="Registrar"
        isSaving={isSaving}
        inputRef={inputRef}
      />
    </>
  );
};

export default HabitDetailPage;
