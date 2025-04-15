import React, { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import { useTheme } from "../../context/ThemeContext";
import { getHabitRecordsGroupedByDay } from "../../hooks/database";

const HeatMap = (props) => {
  const { themeOptions } = useTheme();
  const [colorTheme, setColorTheme] = useState("#DD6B20");
  const [heatmapSeries, setHeatmapSeries] = useState([]);

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

      const transformedSeries = transformRecordsToHeatmapSeries(groupedRecords);
      setHeatmapSeries(transformedSeries);
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
    series: [],
    options: {
      chart: {
        width: "100%",
        height: "500px",
        type: "heatmap",
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        heatmap: {
          horizontal: false,
          radius: 0,
          
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: false,
      },
      colors: [colorTheme],
      fill: {
        opacity: 1,
      },
      xaxis: {
        categories: [],
      },
      yaxis: {
        labels: {
          style: {
            fontFamily: themeOptions.fontFamily,
          },
        },
      },
      grid: {
        show: false,
      },
      tooltip: {
        enabled: false,
      },
    },
  });

  /**
   * @function transformRecordsToHeatmapSeries
   * @description Transforms the grouped habit records into the series format
   * required by the ApexCharts heatmap, with days of the week on the X-axis
   * and days of the month on the Y-axis.
   * @param {Array<object>} groupedRecords - An array of habit records grouped by day.
   * @returns {Array<object>} - An array of series objects for the heatmap.
   */
  const transformRecordsToHeatmapSeries = (groupedRecords) => {
    if (!groupedRecords || groupedRecords.length === 0) {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const dateLabels = Array.from({ length: daysInMonth }, (_, i) => {
        const date = new Date(year, month, i + 1);
        return date.toLocaleDateString("es-ES", {
          day: "numeric",
          month: "short",
        });
      });
      const daysOfWeek = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

      return dateLabels.map((dateLabel) => ({
        name: dateLabel,
        data: daysOfWeek.map((day) => ({ x: day, y: 0 })),
      }));
    }

    groupedRecords.sort((a, b) => a.date.getTime() - b.date.getTime());

    const allDates = groupedRecords.map((record) => record.date);
    const minDate = new Date(Math.min(...allDates));
    const maxDate = new Date(Math.max(...allDates));

    const startYear = minDate.getFullYear();
    const startMonth = minDate.getMonth();
    const endYear = maxDate.getFullYear();
    const endMonth = maxDate.getMonth();

    const allMonthDays = [];
    for (let year = startYear; year <= endYear; year++) {
      const startMonthIter = year === startYear ? startMonth : 0;
      const endMonthIter = year === endYear ? endMonth : 11;

      for (let month = startMonthIter; month <= endMonthIter; month++) {
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
          allMonthDays.push(new Date(year, month, day));
        }
      }
    }

    const uniqueFormattedDates = [
      ...new Set(
        allMonthDays.map((date) =>
          date.toLocaleDateString("es-ES", { day: "numeric", month: "short" })
        )
      ),
    ].sort((a, b) => {
      const dateA = new Date(a.split(" ")[1], parseInt(a.split(" ")[0]), 1);
      const dateB = new Date(b.split(" ")[1], parseInt(b.split(" ")[0]), 1);
      return (
        dateA.getTime() - dateB.getTime() ||
        parseInt(a.split(" ")[0]) - parseInt(b.split(" ")[0])
      );
    });

    const daysOfWeek = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
    const heatmapData = uniqueFormattedDates.map((dateLabel) => ({
      name: dateLabel,
      data: daysOfWeek.map((day) => ({ x: day, y: 0 })),
    }));

    groupedRecords.forEach((record) => {
      const recordDateLabel = record.date.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
      });
      const dayOfWeek = daysOfWeek[record.date.getDay()];
      const dateIndex = uniqueFormattedDates.indexOf(recordDateLabel);

      if (heatmapData[dateIndex]) {
        const dayDataIndex = heatmapData[dateIndex].data.findIndex(
          (d) => d.x === dayOfWeek
        );
        if (dayDataIndex !== -1) {
          heatmapData[dateIndex].data[dayDataIndex].y = record.times;
        }
      }
    });

    return heatmapData;
  };

  /**
   * @useEffect
   * @description Updates the chart's series when the heatmap data changes.
   */
  useEffect(() => {
    setState((prevState) => ({
      ...prevState,
      series: heatmapSeries,
      options: {
        ...prevState.options,
        xaxis: {
          categories: heatmapSeries[0]?.data?.map((d) => d.x) || [],
          labels: {
            style: {
              fontFamily: themeOptions.fontFamily,
            },
          },
        },
        yaxis: {
          labels: {
            style: {
              fontFamily: themeOptions?.fontFamily,
            },
          },
        },
      },
    }));
  }, [heatmapSeries, themeOptions]);

  /**
   * @useEffect
   * @description Updates the chart's colors based on the theme.
   */
  useEffect(() => {
    setState((prevState) => ({
      ...prevState,
      options: { ...prevState.options, colors: [colorTheme] },
    }));
  }, [colorTheme]);

  return (
    <div id="chart">
      <ReactApexChart
        options={state.options}
        series={state.series}
        type="heatmap"
        height={500}
      />
    </div>
  );
};

export default HeatMap;
