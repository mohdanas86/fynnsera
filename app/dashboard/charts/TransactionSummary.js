"use client";

import { Doughnut } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import { useMemo } from "react";

Chart.register(ArcElement, Tooltip, Legend);

const RadialChart = ({ label, value, color, maxValue }) => {
  // Calculate percentage value for the chart.
  const percentage = maxValue > 0 ? (Math.abs(value) / maxValue) * 100 : 0;
  const remainder = 100 - percentage;

  // Chart data for the doughnut chart.
  const data = useMemo(
    () => ({
      labels: [label, "Remaining"],
      datasets: [
        {
          data: [percentage, remainder],
          backgroundColor: [color, "#f1f5f9"],
          borderWidth: 0,
        },
      ],
    }),
    [percentage, remainder, label, color]
  );

  // Chart options to remove tooltips and legends and customize the cutout.
  const options = {
    cutout: "65%",
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    animation: { animateRotate: true, duration: 1500 },
  };

  return (
    <div className="flex flex-col items-center p-6">
      {/* Only the chart container scales on hover */}
      <div
        className="relative transition-transform duration-300 hover:scale-105"
        style={{ width: "250px", height: "250px" }}
      >
        <Doughnut data={data} options={options} />
        {/* Overlay for center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-extrabold text-gray-800">
            ₹{value.toLocaleString()}
          </span>
          <span className="text-xl text-gray-500">
            {percentage.toFixed(0)}%
          </span>
        </div>
      </div>
      <h3 className="text-2xl font-bold text-gray-800 mt-8">{label}</h3>
    </div>
  );
};

function TransactionSummaryCharts({ transactions }) {
  const income = transactions
    .filter((tx) => tx.amount > 0)
    .reduce((acc, tx) => acc + tx.amount, 0);

  const expenses = Math.abs(
    transactions
      .filter((tx) => tx.amount < 0)
      .reduce((acc, tx) => acc + tx.amount, 0)
  );

  const balance = income - expenses;
  const maxValue = Math.max(income, expenses, Math.abs(balance));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 p-8 mx-auto border rounded-sm shadow-sm">
      <RadialChart
        label="Income"
        value={income}
        color="#34d399" // Emerald-400
        maxValue={maxValue}
      />
      <RadialChart
        label="Expenses"
        value={expenses}
        color="#f43f5e" // Rose-500
        maxValue={maxValue}
      />
      <RadialChart
        label="Balance"
        value={balance}
        color={balance >= 0 ? "#3b82f6" : "#fb923c"} // Blue if positive, Orange if negative
        maxValue={maxValue}
      />
    </div>
  );
}

export default TransactionSummaryCharts;
