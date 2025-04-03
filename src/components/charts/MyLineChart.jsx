import React from "react";
import Chart from "react-apexcharts";

const MyLineChart = () => {
  const options = {
    chart: {
      id: "line-chart",
    },
    xaxis: {
      categories: ["Jan", "Feb", "Mar", "Apr", "May"],
    },
    stroke: {
      curve: "smooth",
    },
  };

  const series = [
    {
      name: "Sales",
      data: [30, 40, 35, 50, 49],
    },
  ];

  return (
    <div>
      <Chart options={options} series={series} type="line" width="500" />
    </div>
  );
};

export default MyLineChart;