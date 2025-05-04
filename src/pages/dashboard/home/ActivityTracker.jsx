import React, { useState, useEffect } from "react";
import { Box, Divider, HStack, Text, useColorMode } from "@chakra-ui/react";
import ReactApexChart from "react-apexcharts";
import { getAllHabits, getAreas } from "../../../hooks/database";
import { useTheme } from "../../../context/ThemeContext";
import * as LuIcons from "react-icons/lu";
import { useAuth } from "../../../context/AuthContext";
import { db } from "../../../hooks/firebase";
import { collection, getDocs } from "firebase/firestore";

const ActivityTracker = () => {
  const { colorMode } = useColorMode();
  const { themeOptions } = useTheme();
  const { user } = useAuth();

  const [areas, setAreas] = useState([]);
  const [chartData, setChartData] = useState({
    series: [0, 0, 0],
    options: {
      chart: {
        height: "auto",
        type: "radialBar",
      },
      stroke: {
        lineCap: "round",
      },

      plotOptions: {
        radialBar: {
          track: {
            background:
              colorMode === "light" ? "rgb(245,245,245)" : "rgb(23,23,23)",
            strokeWidth: "15px",
            opacity: 1,
            margin: 4,
          },
          dataLabels: {
            name: {
              fontFamily: themeOptions.fontFamily,
              fontSize: "25px",
            },
            value: {
              fontFamily: themeOptions.fontFamily,
              fontSize: "20px",
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = getAreas((areasList) => {
      if (isMounted) {
        setAreas(areasList);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user?.uid || areas.length === 0) return;

    const fetchHabitData = async () => {
      const allSeries = [];
      for (const area of areas) {
        const habitsRef = collection(
          db,
          "users",
          user.uid,
          "areas",
          area.id,
          "habits"
        );
        const habitsSnapshot = await getDocs(habitsRef);

        for (const habitDoc of habitsSnapshot.docs) {
          const recordsRef = collection(habitsRef, habitDoc.id, "records");
          const recordsSnapshot = await getDocs(recordsRef);

          let completed = 0;
          let skipped = 0;
          let failed = 0;

          recordsSnapshot.forEach((recordDoc) => {
            const record = recordDoc.data();
            if (record.status === "completed") completed++;
            if (record.status === "skipped") skipped++;
            if (record.status === "failed") failed++;
          });

          allSeries.push([completed, skipped, failed]);
        }
      }

      if (allSeries.length > 0) {
        setChartData((prevState) => ({
          ...prevState,
          series: allSeries,
        }));
      }

      setLoading(false);
    };

    fetchHabitData();
  }, [user?.uid, areas]);

  if (loading) {
    return (
      <Box
        p={2}
        borderRadius={themeOptions.borderRadius}
        bg={colorMode === "light" ? "rgb(255, 255, 255)" : "rgb(0, 0, 0)"}
        border="2px solid var(--chakra-colors-chakra-border-color)"
      >
        Cargando datos de actividad...
      </Box>
    );
  }

  return (
    <Box
      px={2}
      pt={3}
      pb={0}
      borderRadius={themeOptions.borderRadius}
      bg={colorMode === "light" ? "rgb(255, 255, 255)" : "rgb(0, 0, 0)"}
      border="2px solid var(--chakra-colors-chakra-border-color)"
    >
      <HStack
        pb={2}
        px={2}
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
