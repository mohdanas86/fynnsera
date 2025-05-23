// "use client";

// import { Doughnut } from "react-chartjs-2";
// import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
// import { useMemo } from "react";

// Chart.register(ArcElement, Tooltip, Legend);

// const RadialChart = ({ label, value, color, maxValue }) => {
//   // Calculate percentage value for the chart.
//   const percentage = maxValue > 0 ? (Math.abs(value) / maxValue) * 100 : 0;
//   const remainder = 100 - percentage;

//   // Chart data for the doughnut chart.
//   const data = useMemo(
//     () => ({
//       labels: [label, "Remaining"],
//       datasets: [
//         {
//           data: [percentage, remainder],
//           backgroundColor: [color, "#f1f5f9"],
//           borderWidth: 0,
//         },
//       ],
//     }),
//     [percentage, remainder, label, color]
//   );

//   // Chart options to remove tooltips and legends and customize the cutout.
//   const options = {
//     cutout: "65%",
//     plugins: {
//       legend: { display: false },
//       tooltip: { enabled: false },
//     },
//     animation: { animateRotate: true, duration: 1500 },
//   };

//   return (
//     <div className="flex flex-col items-center p-6">
//       {/* Only the chart container scales on hover */}
//       <div
//         className="relative transition-transform duration-300 hover:scale-105 lg:w-[250px] lg:h-[250px] w-[200px] h-[200px]"
//         // style={{ width: "250px", height: "250px" }}
//       >
//         <Doughnut data={data} options={options} />
//         {/* Overlay for center text */}
//         <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
//           <span className="lg:text-2xl text-lg font-extrabold text-gray-800">
//             ₹{value.toLocaleString()}
//           </span>
//           <span className="text-xl text-gray-500">
//             {percentage.toFixed(0)}%
//           </span>
//         </div>
//       </div>
//       <h3 className="lg:text-2xl text-lg font-bold text-gray-800 lg:mt-8 mt-4">
//         {label}
//       </h3>
//     </div>
//   );
// };

// function TransactionSummaryCharts({ transactions }) {
//   const income = transactions
//     .filter((tx) => tx.amount > 0)
//     .reduce((acc, tx) => acc + tx.amount, 0);

//   const expenses = Math.abs(
//     transactions
//       .filter((tx) => tx.amount < 0)
//       .reduce((acc, tx) => acc + tx.amount, 0)
//   );

//   const balance = income - expenses;
//   const maxValue = Math.max(income, expenses, Math.abs(balance));

//   return (
//     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:gap-8 gap-4 lg:p-8 mx-auto border rounded-sm shadow-sm">
//       <RadialChart
//         label="Income"
//         value={income}
//         color="#34d399" // Emerald-400
//         maxValue={maxValue}
//       />
//       <RadialChart
//         label="Expenses"
//         value={expenses}
//         color="#f43f5e" // Rose-500
//         maxValue={maxValue}
//       />
//       <RadialChart
//         label="Balance"
//         value={balance}
//         color={balance >= 0 ? "#3b82f6" : "#fb923c"} // Blue if positive, Orange if negative
//         maxValue={maxValue}
//       />
//     </div>
//   );
// }

// export default TransactionSummaryCharts;

"use client";

import { Doughnut } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import { useMemo } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { useMyContext } from "@/context/MyContext";

Chart.register(ArcElement, Tooltip, Legend);

// Chart for a single section (credit, debit, balance, etc.)
const RadialChart = ({ label, value, color, maxValue }) => {
  const safeValue = typeof value === "number" && !isNaN(value) ? value : 0;
  const percentage = maxValue > 0 ? (Math.abs(safeValue) / maxValue) * 100 : 0;
  const remainder = 100 - percentage;

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

  const options = {
    cutout: "70%",
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    animation: { animateRotate: true, duration: 1500 },
  };

  return (
    <div className="relative w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] mx-auto">
      <Doughnut data={data} options={options} />
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-xl sm:text-2xl font-extrabold text-gray-800">
          ₹{safeValue.toLocaleString()}
        </span>
        <span className="text-sm text-gray-500">{percentage.toFixed(0)}%</span>
      </div>
    </div>
  );
};

function TransactionSummaryCharts({ transactions = [] }) {
  const { selectedFileData } = useMyContext();

  // Cleaned, accurate transaction filtering
  const filteredTx = useMemo(() => {
    return Array.isArray(transactions)
      ? transactions.filter(
          (tx) =>
            typeof tx.amount === "number" &&
            typeof tx.transactionType === "string"
        )
      : [];
  }, [transactions]);

  const credit = filteredTx
    .filter((tx) => tx.transactionType.toUpperCase() === "CREDIT")
    .reduce((acc, tx) => acc + tx.amount, 0);

  const debit = filteredTx
    .filter((tx) => tx.transactionType.toUpperCase() === "DEBIT")
    .reduce((acc, tx) => acc + tx.amount, 0);

  const balance = credit - debit;
  const currentBalance =
    typeof selectedFileData?.currentBalance === "number"
      ? selectedFileData.currentBalance
      : balance;

  const maxValue = Math.max(
    credit,
    debit,
    Math.abs(balance),
    Math.abs(currentBalance)
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
      {/* Credited Amount */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Credited Amount</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <RadialChart
            label="Credit"
            value={credit}
            color="#34d399"
            maxValue={maxValue}
          />
        </CardContent>
      </Card>

      {/* Debited Amount */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Debited Amount</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <RadialChart
            label="Debit"
            value={debit}
            color="#f43f5e"
            maxValue={maxValue}
          />
        </CardContent>
      </Card>

      {/* Net Balance (Credit - Debit) */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Net Balance</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <RadialChart
            label="Net"
            value={balance}
            color={balance >= 0 ? "#3b82f6" : "#fb923c"}
            maxValue={maxValue}
          />
        </CardContent>
      </Card>

      {/* Current Balance (from file or fallback to net balance) */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Current Balance</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <RadialChart
            label="Current"
            value={currentBalance}
            color={currentBalance >= 0 ? "#3b82f6" : "#fb923c"}
            maxValue={maxValue}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default TransactionSummaryCharts;
