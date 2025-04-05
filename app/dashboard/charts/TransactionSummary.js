// import React from "react";

// const TransactionSummary = ({ transactions }) => {
//   // Calculate total income and expenses
//   const income = transactions
//     .filter((tx) => tx.amount > 0)
//     .reduce((acc, tx) => acc + tx.amount, 0);

//   const expenses = transactions
//     .filter((tx) => tx.amount < 0)
//     .reduce((acc, tx) => acc + tx.amount, 0);

//   const balance = income + expenses;

//   return (
//     <div className="bg-white lg:p-6 lg:rounded-lg lg:shadow mb-6">
//       <h2 className="text-2xl font-bold mb-4">Transaction Summary</h2>
//       <div className="grid lg:grid-cols-3 grid-cols-1 gap-4">
//         <div className="p-4 bg-green-100 rounded-lg">
//           <h3 className="text-lg font-semibold">Income</h3>
//           <p className="text-green-700">${income.toFixed(2)}</p>
//         </div>
//         <div className="p-4 bg-red-100 rounded-lg">
//           <h3 className="text-lg font-semibold">Expenses</h3>
//           <p className="text-red-700">${Math.abs(expenses).toFixed(2)}</p>
//         </div>
//         <div className="p-4 bg-blue-100 rounded-lg">
//           <h3 className="text-lg font-semibold">Balance</h3>
//           <p className="text-blue-700">${balance.toFixed(2)}</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TransactionSummary;"use client";

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
