"use client";

import React, { useMemo } from "react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

// Month order for consistent sorting
const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// Improved data transformation to handle edge cases
const transformData = (transactions = []) => {
  // Filter valid transactions
  const validTransactions = transactions.filter(
    (tx) =>
      tx.date && typeof tx.amount === "number" && !isNaN(new Date(tx.date))
  );

  if (validTransactions.length === 0) {
    return [];
  }

  // Get current year
  const currentYear = new Date().getFullYear();

  // Group by month for current year only
  const grouped = {};

  validTransactions.forEach((tx) => {
    const txDate = new Date(tx.date);
    const txYear = txDate.getFullYear();

    // Only include current year data
    if (txYear === currentYear) {
      const month = txDate.toLocaleString("default", { month: "short" });
      if (!grouped[month]) grouped[month] = 0;

      // For radar chart, use negative values for expenses, positive for income
      grouped[month] += tx.amount > 0 ? tx.amount : Math.abs(tx.amount);
    }
  });

  // Create data points for all months with 0 for missing data
  const currentMonthIndex = new Date().getMonth();

  // Only include months up to current month
  return monthNames.slice(0, currentMonthIndex + 1).map((month) => ({
    month,
    value: grouped[month] || 0,
  }));
};

function PolarAreaChart({ transactions = [] }) {
  const chartData = useMemo(() => transformData(transactions), [transactions]);
  // Format currency consistently
  const formatCurrency = (value) => {
    if (value >= 1000000) return `₹${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
    return `₹${value}`;
  };

  return (
    <Card className="w-full h-full overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-base sm:text-lg font-semibold">
          Monthly Spending Pattern
        </CardTitle>
        <CardDescription className="text-sm">
          Current year transactions by month
        </CardDescription>
      </CardHeader>{" "}
      <CardContent className="pt-2 h-[calc(100%-80px)]">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center text-gray-500">
            <p>No monthly data available</p>
          </div>
        ) : (
          <div className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis
                  dataKey="month"
                  tick={{ fontSize: 10, fill: "#374151" }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, "auto"]}
                  tick={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "0.5rem",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    padding: "8px 12px",
                    fontSize: "12px",
                  }}
                />
                <Radar
                  name="Amount"
                  dataKey="value"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.6}
                  animationDuration={1200}
                  animationEasing="ease-in-out"
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default PolarAreaChart;

// export default PolarAreaChart;
