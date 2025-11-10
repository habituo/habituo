import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Badge,
  Box,
  Center,
  HStack,
  Select,
  Spinner,
  Text,
  useColorMode,
  useToast,
  VStack,
} from "@chakra-ui/react";
import ReactApexChart from "react-apexcharts";
import { useTheme } from "../../context/ThemeContext/ThemeContext";
import { useAuthUser } from "../../context/AuthUserContext/AuthUserContext";
import { fetchMonthlyHabitStats } from "../../hooks/useDatabase";

const ActivityTrackerPage = () => {
  const { colorMode } = useColorMode();
  const { themeOptions } = useTheme();
  const { user } = useAuthUser();
  const toast = useToast();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [loading, setLoading] = useState(true);
  const [series, setSeries] = useState([0, 0, 0]);
  const [error, setError] = useState(null);

  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const chartOptions = useMemo(
    () => ({
      chart: {
        type: "radialBar",
        fontFamily: themeOptions.fontFamily,
      },
      stroke: {
        lineCap: "round",
      },
      plotOptions: {
        radialBar: {
          dataLabels: {
            name: {
              fontFamily: themeOptions.fontFamily,
              fontSize: "18px",
            },
            value: {
              fontFamily: themeOptions.fontFamily,
              fontSize: "16px",
            },
            total: {
              show: true,
              label: "Total",
              formatter: function (w) {
                const total = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                return total;
              },
            },
          },
        },
      },
      labels: ["Completados", "Saltados", "Fallados"],
      colors: ["#81C784", "#FFD54F", "#E57373"],
    }),
    [themeOptions.fontFamily]
  );

  const showToastError = useCallback(
    (title, description) => {
      toast({
        title,
        description,
        status: "error",
        position: "bottom",
        isClosable: true,
      });
    },
    [toast]
  );

  const loadActivityStats = useCallback(async () => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { completed, skipped, failed } = await fetchMonthlyHabitStats(
        user.uid,
        year,
        month
      );
      setSeries([completed, skipped, failed]);
    } catch (err) {
      setSeries([0, 0, 0]);
      setError("No se pudieron cargar las estadísticas.");
      showToastError(
        "Error de carga",
        "No se pudieron obtener las estadísticas de la base de datos."
      );
    } finally {
      setLoading(false);
    }
  }, [user?.uid, year, month, showToastError]);

  useEffect(() => {
    loadActivityStats();
  }, [loadActivityStats]);

  if (loading) {
    return (
      <Center
        p={4}
        bg={colorMode === "light" ? "white" : "black"}
        borderRadius={themeOptions.borderRadius}
        border="2px solid var(--chakra-colors-chakra-border-color)"
        flexDirection="column"
        gap={2}
      >
        <Spinner size="lg" color={`${themeOptions.focusColor}.500`} />
        <Text size="md">Cargando estadísticas...</Text>
      </Center>
    );
  }

  return (
    <Box
      maxH={{ base: "auto", md: "431px" }}
      p={4}
      borderRadius={themeOptions.borderRadius}
      bg={colorMode === "light" ? "white" : "black"}
      border="2px solid var(--chakra-colors-chakra-border-color)"
    >
      <VStack align="start">
        <Text fontSize="xl" fontWeight={600} noOfLines={1}>
          Estadísticas globales
        </Text>
        <HStack>
          <Select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            borderRadius={themeOptions.borderRadius}
            _focusVisible={{}}
          >
            {months.map((m, i) => (
              <option key={i} value={i}>
                {m}
              </option>
            ))}
          </Select>
          <Select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            borderRadius={themeOptions.borderRadius}
            _focusVisible={{}}
          >
            {Array.from({ length: 3 }, (_, i) => now.getFullYear() - i).map(
              (y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              )
            )}
          </Select>
        </HStack>
      </VStack>
      {error ? (
        <Center minH="200px" py={4}>
          <Text color="red.500" fontWeight={600}>
            {error}
          </Text>
        </Center>
      ) : (
        <Box
          display="flex"
          flexDirection={{ base: "column", xl: "row" }}
          alignItems="center"
          justifyContent="center"
          w="100%"
          h="calc(100% - 78px)"
        >
          <Box
            w={{ base: "100%", xl: "60%" }}
            h={{ base: "50%", xl: "100%" }}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <ReactApexChart
              options={chartOptions}
              series={series}
              type="radialBar"
              height={190}
            />
          </Box>
          <VStack
            w={{ base: "100%", xl: "40%" }}
            h={{ base: "50%", xl: "100%" }}
            spacing={4}
            align={{ base: "center", xl: "start" }}
            justify="center"
          >
            <VStack align={{ base: "center", xl: "start" }} spacing={1}>
              <Badge
                fontWeight={600}
                fontSize={{ base: "sm", md: "xs", lg: "xs", xl: "xs" }}
                colorScheme="green"
              >
                🟢 Completados
              </Badge>
              <Text fontSize={{ base: "md", md: "sm", lg: "sm", xl: "md" }}>
                {series[0]} hábitos
              </Text>
            </VStack>
            <VStack align={{ base: "center", xl: "start" }} spacing={1}>
              <Badge
                fontWeight={600}
                fontSize={{ base: "sm", md: "xs", lg: "xs", xl: "xs" }}
                colorScheme="yellow"
              >
                🟡 Saltados
              </Badge>
              <Text fontSize={{ base: "md", md: "sm", lg: "sm", xl: "md" }}>
                {series[1]} hábitos
              </Text>
            </VStack>
            <VStack align={{ base: "center", xl: "start" }} spacing={1}>
              <Badge
                fontWeight={600}
                fontSize={{ base: "sm", md: "xs", lg: "xs", xl: "xs" }}
                colorScheme="red"
              >
                🔴 Fallados
              </Badge>
              <Text fontSize={{ base: "md", md: "sm", lg: "sm", xl: "md" }}>
                {series[2]} hábitos
              </Text>
            </VStack>
          </VStack>
        </Box>
      )}
    </Box>
  );
};

export default ActivityTrackerPage;
