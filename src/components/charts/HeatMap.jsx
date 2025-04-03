import React, { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import { useTheme } from "../../context/ThemeContext";

const generateData = (count, { min, max }) => {
  return Array.from(
    { length: count },
    () => Math.floor(Math.random() * (max - min + 1)) + min
  );
};

const HeatMap = () => {
  const { themeOptions } = useTheme();
  const [colorTheme, setColorTheme] = useState("#DD6B20");

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
      { name: "Metric1", data: generateData(18, { min: 0, max: 90 }) },
      { name: "Metric2", data: generateData(18, { min: 0, max: 90 }) },
      { name: "Metric3", data: generateData(18, { min: 0, max: 90 }) },
      { name: "Metric4", data: generateData(18, { min: 0, max: 90 }) },
      { name: "Metric5", data: generateData(18, { min: 0, max: 90 }) },
      { name: "Metric6", data: generateData(18, { min: 0, max: 90 }) },
      { name: "Metric7", data: generateData(18, { min: 0, max: 90 }) },
      { name: "Metric8", data: generateData(18, { min: 0, max: 90 }) },
      { name: "Metric9", data: generateData(18, { min: 0, max: 90 }) },
    ],
    options: {
      chart: {
        height: 350,
        type: "heatmap",
      },
      dataLabels: {
        enabled: false,
      },
      colors: [colorTheme],
      title: {
        text: "HeatMap Chart (Single color)",
      },
    },
  });

  useEffect(() => {
    setState((prevState) => ({
      ...prevState,
      options: { ...prevState.options, colors: [colorTheme] },
    }));
  }, [colorTheme]);

  return (
    <div>
      <div id="chart">
        <ReactApexChart
          options={state.options}
          series={state.series}
          type="heatmap"
          height={350}
        />
      </div>
    </div>
  );
};

export default HeatMap;
