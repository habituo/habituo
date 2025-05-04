import React, { useState, useEffect, useMemo } from "react";
import ReactApexChart from "react-apexcharts";
import { useTheme } from "../../context/ThemeContext";
import { getHabitRecordsGroupedByDayListener } from "../../hooks/database";
import { useColorMode } from "@chakra-ui/react";

const BarChart = (props) => {
  const { themeOptions } = useTheme();
  const [colorTheme, setColorTheme] = useState("#DD6B20");
  const [records, setRecords] = useState([]);
  const [filterPeriod, setFilterPeriod] = useState("1W");
  const { userId, areaId, habitId } = props;

  console.log("Props en BarChart:", { userId, areaId, habitId });

  const borderRadius = React.useMemo(() => {
    switch (themeOptions.borderRadius) {
      case "3xl":
        return 24;
      case "2xl":
        return 16;
      case "xl":
        return 12;
      case "lg":
        return 8;
      case "md":
        return 6;
      case "sm":
        return 2;
      case "none":
        return 0;
      default:
        return 6;
    }
  }, [themeOptions.borderRadius]);

  const [state, setState] = useState({
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
          borderRadius,
          borderRadiusApplication: "end",
        },
      },
      dataLabels: { enabled: false },
      stroke: { show: false },
      xaxis: {
        categories: [],
        labels: {
          style: { fontFamily: themeOptions.fontFamily, fontSize: "14px" },
        },
      },
      yaxis: {
        labels: {
          style: { fontFamily: themeOptions.fontFamily, fontSize: "11px" },
        },
      },
      colors: [colorTheme],
      fill: { opacity: 1 },
      tooltip: {
        enabled: true,
        followCursor: false,
        custom: function ({ series, seriesIndex, dataPointIndex, w }) {
          const category = w.config.xaxis.categories[dataPointIndex];
          const value = series[seriesIndex][dataPointIndex];
          return `<div style="padding:5px 8px;background:var(--chakra-colors-${themeOptions.focusColor}-300);color:#fff;border:none;border-radius:${borderRadius}rem;box-shadow:none;">
            <span style="font-size:12px;font-weight:400;">${category}</span> - <span style="font-size:16px;font-weight:600">${value} veces</span>
          </div>`;
        },
        hideEmptySeries: true,
        fillSeriesColor: false,
        theme: true,
        style: { fontSize: "14px", fontFamily: themeOptions.fontFamily },
        onDatasetHover: { highlightDataSeries: true },
        x: { show: true, format: "dd MMM", formatter: undefined },
        marker: { show: false },
      },
    },
  });

  useEffect(() => {
    if (!userId || !areaId || !habitId) return;

    const unsubscribe = getHabitRecordsGroupedByDayListener(
      userId,
      areaId,
      habitId,
      (updatedRecords) => {
        setRecords(updatedRecords);
        console.log("Datos recibidos:", updatedRecords);
      },
      (error) => {
        console.error("Error fetching habit records:", error);
      }
    );

    return () => unsubscribe();
  }, [userId, areaId, habitId]);

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

  const generateDateRange = (startDate, endDate) => {
    const dates = [];
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  };

  const chartData = useMemo(() => {
    const now = new Date();
    let startDate;
    let endDate = new Date(now);

    switch (filterPeriod) {
      case "1D":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 1);
        endDate = new Date(startDate);
        break;
      case "1W":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case "1M":
        startDate = new Date(now);
        startDate.setDate(1);
        break;
      case "ALL":
        if (records.length > 0) {
          const sortedRecords = [...records].sort(
            (a, b) => a.date.getTime() - b.date.getTime()
          );
          startDate = sortedRecords[0].date;
        } else {
          startDate = new Date();
        }
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
    }

    const dateRange = generateDateRange(startDate, endDate);
    return dateRange.map((date) => {
      const formattedDate = date.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
      });
      const recordForDate = records.find(
        (record) =>
          record.date?.getFullYear() === date.getFullYear() &&
          record.date?.getMonth() === date.getMonth() &&
          record.date?.getDate() === date.getDate()
      );
      return { x: formattedDate, y: recordForDate ? recordForDate.times : 0 };
    });
  }, [records, filterPeriod]);

  useEffect(() => {
    setState((prevState) => ({
      ...prevState,
      series: [{ data: chartData?.map((item) => item.y) || [] }],
      options: {
        ...prevState.options,
        xaxis: {
          categories: chartData?.map((item) => item.x) || [],
          labels: {
            style: {
              fontFamily: themeOptions.fontFamily,
            },
          },
        },
        colors: [colorTheme],
      },
    }));
  }, [chartData, colorTheme, themeOptions]);

  return (
    <div style={{ marginBottom: "-15px" }}>
      <div className="custom-filter-buttons">
        <button
          onClick={() => setFilterPeriod("1D")}
          style={{ borderRadius: `${borderRadius}rem` }}
        >
          1D
        </button>
        <button
          onClick={() => setFilterPeriod("1W")}
          style={{ borderRadius: `${borderRadius}rem` }}
        >
          1S
        </button>
        <button
          onClick={() => setFilterPeriod("1M")}
          style={{ borderRadius: `${borderRadius}rem` }}
        >
          1M
        </button>
        <button
          onClick={() => setFilterPeriod("ALL")}
          style={{ borderRadius: `${borderRadius}rem` }}
        >
          Todo
        </button>
      </div>
      <div id="chart">
        <ReactApexChart
          options={state.options}
          series={state.series}
          type="bar"
          width="100%"
          height={300}
        />
      </div>
    </div>
  );
};

export default BarChart;
