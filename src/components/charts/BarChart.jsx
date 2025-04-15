import React, { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import { useTheme } from "../../context/ThemeContext";
import { getHabitRecordsGroupedByDay } from "../../hooks/database";

/**
 * @component BarChart
 * @description A bar chart component that displays the completion times of a specific habit
 * within a given area for a user. It fetches data from Firestore and uses ApexCharts
 * to render the chart.
 * @param {object} props - The component's props.
 * @param {string} props.userId - The ID of the current user.
 * @param {string} props.areaId - The ID of the area the habit belongs to.
 * @param {string} props.habitId - The ID of the habit to display records for.
 */
const BarChart = (props) => {
  const { themeOptions } = useTheme();
  const [colorTheme, setColorTheme] = useState("#DD6B20");
  const [records, setRecords] = useState([]);

  // Determine border radius based on theme options
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

  const { userId, areaId, habitId } = props;

  /**
   * @function fetchChartRecords
   * @async
   * @description Fetches the records for the specified habit, grouped by day,
   * using the `getHabitRecordsGroupedByDay` function from `database.js`.
   */
  const fetchChartRecords = async () => {
    try {
      const groupedRecords = await getHabitRecordsGroupedByDay(
        userId,
        areaId,
        habitId
      );
      setRecords(groupedRecords);
    } catch (error) {
      console.error("Error fetching habit records for the chart:", error);
    }
  };

  /**
   * @useEffect
   * @description Fetches the habit records when the component mounts or when
   * the userId, areaId, or habitId changes.
   */
  useEffect(() => {
    fetchChartRecords();
  }, [userId, areaId, habitId]);

  /**
   * @useEffect
   * @description Updates the chart's color theme based on the `focusColor`
   * from the theme options.
   */
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

  const [state, setState] = useState({
    series: [
      {
        name: "Records",
        data: records.map((record) => record.times),
      },
    ],
    options: {
      chart: {
        width: "100%",
        height: "300px",
        type: "bar",
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "80%",
          borderRadius: borderRadius,
          borderRadiusApplication: "end",
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: false,
      },
      xaxis: {
        categories: [],
        labels: {
          style: {
            fontFamily: themeOptions.fontFamily,
            fontSize: "14px",
          },
        },
      },
      yaxis: {
        labels: {
          style: {
            fontFamily: themeOptions.fontFamily,
            fontSize: "11px",
          },
        },
      },
      colors: [colorTheme],
      fill: {
        opacity: 1,
      },
      tooltip: {
        custom: function ({ seriesIndex, dataPointIndex, w }) {
          if (records.length === 0) return "";

          const record = records[dataPointIndex];
          if (!record || !record.date) return "";

          const date = record.date;
          const formattedDate = date.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });

          const value = w.config.series[seriesIndex].data[dataPointIndex];

          return `
              <div style="padding: 5px; font-size: 14px;">
                <strong>${formattedDate}</strong><br />
                ${value}
              </div>
            `;
        },
      },
    },
  });

  /**
   * @useEffect
   * @description Updates the chart's series, y-axis labels, x-axis categories, and colors
   * whenever the records, colorTheme, or themeOptions change.
   */
  useEffect(() => {
    setState((prevState) => ({
      ...prevState,
      series: [
        {
          data: records.map((record) => record.times),
        },
      ],
      options: {
        ...prevState.options,
        yaxis: {
          labels: {
            style: {
              fontFamily: themeOptions.fontFamily,
            },
          },
        },
        xaxis: {
          categories: records.map((record) =>
            record.date.toLocaleDateString("es-ES", {
              day: "numeric",
              month: "short",
            })
          ),
          labels: {
            style: {
              fontFamily: themeOptions.fontFamily,
            },
          },
        },
        colors: [colorTheme],
      },
    }));
  }, [records, colorTheme, themeOptions]);

  return (
    <div>
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
