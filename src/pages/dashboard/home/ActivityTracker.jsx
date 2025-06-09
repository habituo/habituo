import React, { useState, useEffect } from "react";
import { Box, Center, Divider, HStack, Spinner, Text, useColorMode } from "@chakra-ui/react";
import ReactApexChart from "react-apexcharts";
import { useTheme } from "../../../context/ThemeContext";
import { useAuthUser } from "../../../context/AuthUserContext";
import { fetchMonthlyHabitStats } from "../../../hooks/database";
import * as LuIcons from "react-icons/lu";

const ActivityTracker = () => {
  const { colorMode } = useColorMode();
  const { themeOptions } = useTheme();
  const { user } = useAuthUser();
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({
    series: [0, 0, 0],
    options: {
      chart: {
        height: 350,
        type: "radialBar",
      },
      stroke: {
        lineCap: "round",
      },
      plotOptions: {
        radialBar: {
          dataLabels: {
            name: {
              fontFamily: themeOptions.fontFamily,
              fontSize: "22px",
            },
            value: {
              fontFamily: themeOptions.fontFamily,
              fontSize: "16px",
            },
            total: {
              show: true,
              label: "Total",
              formatter: function (w) {
                return w.globals.seriesTotals.reduce((a, b) => a + b, 0);
              },
            },
          },
        },
      },
      labels: ["Completados", "Saltados", "Fallados"],
      colors: ["#81C784", "#FFD54F", "#E57373"],
    },
  });

  useEffect(() => {
    const loadActivityStats = async () => {
      if (!user?.uid) return;

      try {
        const { completed, skipped, failed } = await fetchMonthlyHabitStats(
          user.uid
        );
        setChartData((prev) => ({
          ...prev,
          series: [completed, skipped, failed],
        }));
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    loadActivityStats();
  }, [user?.uid]);

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
        <Spinner
          size="lg"
          thickness="4px"
          emptyColor="gray.200"
          color={`${themeOptions.focusColor}.500`}
        />
        <Text size="lg">Cargando...</Text>
      </Center>
    );
  }

  return (
    <Box
      p={4}
      borderRadius={themeOptions.borderRadius}
      bg={colorMode === "light" ? "white" : "black"}
      border="2px solid var(--chakra-colors-chakra-border-color)"
    >
      <HStack
        pb={2}
        alignItems="center"
        justifyContent="flex-start"
        spacing={2}
      >
        <LuIcons.LuChartPie size="25px" />
        <Text fontSize="xl" fontWeight={600}>
          Estadísticas globales
        </Text>
      </HStack>
      <Divider />
      <div id="chart">
        <ReactApexChart
          options={chartData.options}
          series={chartData.series}
          type="radialBar"
          height={300}
        />
      </div>
    </Box>
  );
};

export default ActivityTracker;
