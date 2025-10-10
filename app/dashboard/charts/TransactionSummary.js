"use client";

import { Doughnut } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import { useMemo } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { useMyContext } from "@/context/MyContext";

Chart.register(ArcElement, Tooltip, Legend);

const RadialChart = ({ label, value, color, maxValue }) => {
  const safeValue = Math.abs(Number(value) || 0);
  const percentage = maxValue > 0 ? (safeValue / maxValue) * 100 : 0;
  const remainder = 100 - percentage;

  const data = useMemo(
    () => ({
      labels: [label, "Remaining"],
      datasets: [
        {
          data: [percentage, remainder],
          backgroundColor: [color, "#f1f5f9"],
          borderWidth: 0,
          borderRadius: 4,
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
    responsive: true,
    maintainAspectRatio: false,
  };
  return (
    <div className="relative w-[140px] h-[140px] md:w-[170px] md:h-[170px] mx-auto">
      <Doughnut data={data} options={options} />{" "}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-base md:text-lg font-extrabold text-gray-800">
          {(() => {
            if (safeValue >= 1000000)
              return `₹${(safeValue / 1000000).toFixed(1)}M`;
            if (safeValue >= 1000) return `₹${(safeValue / 1000).toFixed(1)}K`;
            return `₹${safeValue}`;
          })()}
        </span>
        <span className="text-xs md:text-sm text-gray-500">
          {percentage.toFixed(0)}%
        </span>
      </div>
    </div>
  );
};

function TransactionSummaryCharts({ transactions = [] }) {
  const { selectedFileData } = useMyContext();

  const filteredTx = useMemo(() => {
    return transactions
      .filter(
        (tx) =>
          typeof tx.amount === "number" &&
          typeof tx.transactionType === "string" &&
          !isNaN(new Date(tx.date).getTime())
      )
      .map((tx) => ({
        ...tx,
        date: new Date(tx.date),
      }));
  }, [transactions]);

  const { credit, debit } = useMemo(() => {
    const credit = filteredTx
      .filter((tx) => tx.transactionType.toUpperCase() === "CREDIT")
      .reduce((acc, tx) => acc + tx.amount, 0);

    const debit = filteredTx
      .filter((tx) => tx.transactionType.toUpperCase() === "DEBIT")
      .reduce((acc, tx) => acc + Math.abs(tx.amount), 0);

    return { credit, debit };
  }, [filteredTx]);

  const currentBalance =
    typeof selectedFileData?.currentBalance === "number"
      ? selectedFileData.currentBalance
      : 0;

  const maxValue = useMemo(
    () => Math.max(credit, debit, Math.abs(currentBalance)),
    [credit, debit, currentBalance]
  );
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="shadow-sm rounded-lg bg-white border border-gray-100">
          <CardHeader className="pb-0 pt-4">
            <CardTitle className="text-sm md:text-base font-medium text-gray-700">
              Credited Amount
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2 pb-6">
            <RadialChart
              label="Credit"
              value={credit}
              color="#34d399"
              maxValue={maxValue}
            />
          </CardContent>
        </Card>{" "}
        <Card className="shadow-sm rounded-lg bg-white border border-gray-100">
          <CardHeader className="pb-0 pt-4">
            <CardTitle className="text-sm md:text-base font-medium text-gray-700">
              Debited Amount
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2 pb-6">
            <RadialChart
              label="Debit"
              value={debit}
              color="#f43f5e"
              maxValue={maxValue}
            />
          </CardContent>
        </Card>{" "}
        <Card className="shadow-sm rounded-lg bg-white border border-gray-100">
          <CardHeader className="pb-0 pt-4">
            <CardTitle className="text-sm md:text-base font-medium text-gray-700">
              Current Balance
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2 pb-6">
            <RadialChart
              label="Current"
              value={currentBalance}
              color={currentBalance >= 0 ? "#3b82f6" : "#fb923c"}
              maxValue={maxValue}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default TransactionSummaryCharts;

// export default TransactionSummaryCharts;
