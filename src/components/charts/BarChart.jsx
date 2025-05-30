import React, { useState, useEffect, useCallback, useMemo } from "react";
import ReactApexChart from "react-apexcharts";
import { useTheme } from "../../context/ThemeContext";
import { getHabitRecordsGroupedByDayListener } from "../../hooks/database";
import { Box, Button, HStack, Text, useColorMode } from "@chakra-ui/react";

const BarChart = (props) => {
  const { themeOptions } = useTheme();
  const { colorMode } = useColorMode();
  const [colorTheme, setColorTheme] = useState("#DD6B20");
  const [records, setRecords] = useState([]);
  const [filterPeriod, setFilterPeriod] = useState("1W");
  const { userId, areaId, habitId } = props;

  const borderRadius = useMemo(() => {
    const radiusMap = {
      "3xl": 24,
      "2xl": 16,
      xl: 12,
      lg: 8,
      md: 6,
      sm: 2,
      none: 0,
    };
    return radiusMap[themeOptions.borderRadius] || 6;
  }, [themeOptions.borderRadius]);

  useEffect(() => {
    const colorMap = {
      gray: "#718096",
      red: "#E53E3E",
      orange: "#DD6B20",
      yellow: "#ECC94B",
      green: "#48BB78",
      teal: "#38B2AC",
      blue: "#4299E1",
      cyan: "#00B5D8",
      purple: "#9F7AEA",
      pink: "#ED64A6",
    };
    setColorTheme(colorMap[themeOptions.focusColor] || "#DD6B20");
  }, [themeOptions.focusColor]);

  useEffect(() => {
    if (!userId || !areaId || !habitId) {
      setRecords([]);
      return;
    }

    const unsubscribe = getHabitRecordsGroupedByDayListener(
      userId,
      areaId,
      habitId,
      (updatedRecords) => {
        const formattedRecords = updatedRecords.map((record) => ({
          ...record,
          date:
            record.date instanceof Date ? record.date : new Date(record.date),
          times:
            typeof record.times === "number"
              ? record.times
              : parseInt(record.times || "0", 10),
          status: record.status || "unknown",
        }));
        setRecords(formattedRecords);
      },
      (error) => {
        setRecords([]);
      }
    );

    return () => unsubscribe();
  }, [userId, areaId, habitId]);

  const generateDateRange = useCallback((startDate, endDate) => {
    const dates = [];
    let currentDate = new Date(startDate);
    currentDate.setHours(0, 0, 0, 0);

    const endDay = new Date(endDate);
    endDay.setHours(0, 0, 0, 0);

    while (currentDate <= endDay) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  }, []);

  const chartData = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    let startDate, endDate;

    switch (filterPeriod) {
      case "1D":
        startDate = new Date(now);
        endDate = new Date(now);
        break;
      case "1W":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 6);
        endDate = new Date(now);
        break;
      case "1M":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        if (endDate > now) endDate = new Date(now);
        break;
      case "ALL":
        if (records.length > 0) {
          startDate = records.reduce((minDate, record) => {
            return record.date < minDate ? record.date : minDate;
          }, new Date());
          startDate.setHours(0, 0, 0, 0);
        } else {
          startDate = new Date(now);
        }
        endDate = new Date(now);
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 6);
        endDate = new Date(now);
    }

    const dateRange = generateDateRange(startDate, endDate);

    const dataPoints = dateRange.map((date) => {
      const formattedDateLabel = date
        .toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "short",
        })
        .replace(".", "");

      const recordForDate = records.find(
        (record) =>
          record.date.getFullYear() === date.getFullYear() &&
          record.date.getMonth() === date.getMonth() &&
          record.date.getDate() === date.getDate()
      );

      let valueForChart = 0;
      if (recordForDate) {
        if (recordForDate.status === "completed") {
          valueForChart = recordForDate.times;
        } else if (recordForDate.status === "skipped") {
          valueForChart = null;
        } else if (recordForDate.status === "failed") {
          valueForChart = 0;
        }
      }

      return {
        x: formattedDateLabel,
        y: valueForChart,
      };
    });

    return {
      categories: dataPoints.map((item) => item.x),
      seriesData: dataPoints.map((item) => item.y),
    };
  }, [records, filterPeriod, generateDateRange]);

  const [chartState, setChartState] = useState({
    series: [{ name: "Veces", data: [] }],
    options: {
      chart: {
        width: "100%",
        height: 300,
        type: "bar",
        toolbar: { show: false },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "80%",
          borderRadius: 0,
          borderRadiusApplication: "end",
        },
      },
      dataLabels: { enabled: false },
      stroke: { show: false },
      xaxis: {
        categories: [],
        labels: {
          style: { fontFamily: themeOptions.fontFamily, fontSize: "12px" },
        },
      },
      yaxis: {
        labels: {
          style: { fontFamily: themeOptions.fontFamily, fontSize: "11px" },
        },
        min: 0,
        tickAmount: 3,
      },
      colors: ["#DD6B20"],
      fill: { opacity: 1 },
      tooltip: {
        enabled: true,
        followCursor: false,
        custom: function ({ series, seriesIndex, dataPointIndex, w }) {
          const category = w.config.xaxis.categories[dataPointIndex];
          const value = series[seriesIndex][dataPointIndex];
          let tooltipContent;
          if (value === null) {
            tooltipContent = `<span style="font-size:16px;font-weight:600">Saltado</span>`;
          } else if (value === 0) {
            tooltipContent = `<span style="font-size:16px;font-weight:600">Fallido</span>`;
          } else {
            tooltipContent = `<span style="font-size:16px;font-weight:600">${value} veces</span>`;
          }
          return `<div style="padding:5px 8px;background:var(--chakra-colors-${themeOptions.focusColor}-500);color:#fff;border:none;border-radius:${borderRadius}px;box-shadow:none;">
            <span style="font-size:12px;font-weight:400;">${category}</span> - ${tooltipContent}
          </div>`;
        },
        hideEmptySeries: true,
        fillSeriesColor: false,
        theme: false,
        style: { fontSize: "14px", fontFamily: themeOptions.fontFamily },
        onDatasetHover: { highlightDataSeries: true },
        x: { show: true, format: "dd MMM", formatter: undefined },
        marker: { show: false },
      },
      grid: {
        show: true,
        borderColor: colorMode === "light" ? "#f1f1f1" : "#333333",
        strokeDashArray: 4,
        xaxis: {
          lines: {
            show: false,
          },
        },
        yaxis: {
          lines: {
            show: true,
          },
        },
      },
      annotations: {
        yaxis: [
          {
            y: 5,
            borderColor: "#00E396",
            label: {
              borderColor: "#00E396",
              style: {
                color: "#fff",
                background: "#00E396",
              },
              text: "Meta",
            },
          },
        ],
      },
    },
  });

  useEffect(() => {
    setChartState((prevState) => ({
      ...prevState,
      series: [{ data: chartData.seriesData }],
      options: {
        ...prevState.options,
        xaxis: {
          ...prevState.options.xaxis,
          categories: chartData.categories,
          labels: {
            ...prevState.options.xaxis.labels,
            style: {
              ...prevState.options.xaxis.labels.style,
              colors: colorMode === "light" ? "#333" : "#ddd",
            },
          },
        },
        yaxis: {
          ...prevState.options.yaxis,
          labels: {
            ...prevState.options.yaxis.labels,
            style: {
              ...prevState.options.yaxis.labels.style,
              colors: colorMode === "light" ? "#333" : "#ddd",
            },
          },
        },
        colors: [colorTheme],
        plotOptions: {
          bar: {
            ...prevState.options.plotOptions.bar,
            borderRadius: borderRadius,
          },
        },
        tooltip: {
          ...prevState.options.tooltip,
          custom: function ({ series, seriesIndex, dataPointIndex, w }) {
            const category = w.config.xaxis.categories[dataPointIndex];
            const value = series[seriesIndex][dataPointIndex];

            let tooltipContent;
            if (value === null) {
              tooltipContent = `<span style="font-size:16px;font-weight:600">Saltado</span>`;
            } else if (value === 0) {
              tooltipContent = `<span style="font-size:16px;font-weight:600">Fallido</span>`;
            } else {
              tooltipContent = `<span style="font-size:16px;font-weight:600">${value} veces</span>`;
            }

            return `<div style="padding:5px 8px;background:var(--chakra-colors-${themeOptions.focusColor}-500);color:#fff;border:none;border-radius:${borderRadius}px;box-shadow:none;">
              <span style="font-size:12px;font-weight:400;">${category}</span> - ${tooltipContent}
            </div>`;
          },
          style: {
            ...prevState.options.tooltip.style,
            fontFamily: themeOptions.fontFamily,
          },
        },
        grid: {
          ...prevState.options.grid,
          borderColor: colorMode === "light" ? "#f1f1f1" : "#333333",
        },
      },
    }));
  }, [
    chartData,
    colorTheme,
    borderRadius,
    themeOptions.fontFamily,
    themeOptions.focusColor,
    colorMode,
  ]);

  return (
    <Box>
      <HStack
        p={2}
        pb={0}
        alignItems="center"
        justifyContent="center"
        spacing={2}
        className="custom-filter-buttons"
      >
        <Button
          onClick={() => setFilterPeriod("1D")}
          size="sm"
          borderRadius={borderRadius}
          variant={filterPeriod === "1D" ? "solid" : "outline"}
          colorScheme={filterPeriod === "1D" ? themeOptions.focusColor : "gray"}
        >
          Hoy
        </Button>
        <Button
          onClick={() => setFilterPeriod("1W")}
          size="sm"
          borderRadius={borderRadius}
          variant={filterPeriod === "1W" ? "solid" : "outline"}
          colorScheme={filterPeriod === "1W" ? themeOptions.focusColor : "gray"}
        >
          1S
        </Button>
        <Button
          onClick={() => setFilterPeriod("1M")}
          size="sm"
          borderRadius={borderRadius}
          variant={filterPeriod === "1M" ? "solid" : "outline"}
          colorScheme={filterPeriod === "1M" ? themeOptions.focusColor : "gray"}
        >
          1M
        </Button>
        <Button
          onClick={() => setFilterPeriod("ALL")}
          size="sm"
          borderRadius={borderRadius}
          variant={filterPeriod === "ALL" ? "solid" : "outline"}
          colorScheme={
            filterPeriod === "ALL" ? themeOptions.focusColor : "gray"
          }
        >
          Todo
        </Button>
      </HStack>
      <Box id="chart" style={{ marginBottom: "-15px" }}>
        <ReactApexChart
          options={chartState.options}
          series={chartState.series}
          type="bar"
          width="100%"
          height={300}
        />
      </Box>
    </Box>
  );
};

export default BarChart;
