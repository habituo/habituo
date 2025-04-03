import React, { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import { useTheme } from "../../context/ThemeContext";
import { db } from "../../hooks/firebase";
import { collection, getDocs } from "firebase/firestore";

const BarChart = (props) => {
  const { themeOptions } = useTheme();
  const [colorTheme, setColorTheme] = useState("#DD6B20");
  const [records, setRecords] = useState([]);

  const userId = props.userId;
  const areaId = props.areaId;
  const habitId = props.habitId;

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const recordsRef = collection(
          db,
          `users/${userId}/areas/${areaId}/habits/${habitId}/records`
        );
        const snapshot = await getDocs(recordsRef);

        const recordsMap = {};
        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          const date = data.date ? new Date(data.date) : null;

          if (!date) return;

          const day = date.getDate();
          const month = date.getMonth();
          const year = date.getFullYear();
          const monthName = date.toLocaleString("default", { month: "short" });
          const key = `${day}-${month}-${year}`;

          if (recordsMap[key]) {
            recordsMap[key].times += data.times || 1;
          } else {
            recordsMap[key] = {
              id: doc.id,
              date,
              day,
              month: monthName,
              year,
              times: data.times || 0,
            };
          }
        });

        const groupedRecords = Object.values(recordsMap);

        setRecords(groupedRecords);
      } catch (error) {
        console.error("Error obteniendo los registros del hábito:", error);
      }
    };

    fetchRecords();
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
          borderRadius: 5,
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
            if (records.length === 0) return '';
  
            const record = records[dataPointIndex];
            if (!record || !record.date) return '';
  
            const date = record.date;
            const formattedDate = date.toLocaleDateString("es-ES", {
              day: "2-digit",
              month: "short",
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
          categories: records.map((record) => `${record.day} ${record.month}`),
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
