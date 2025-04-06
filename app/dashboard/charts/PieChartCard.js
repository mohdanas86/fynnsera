"use client";

import React, { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

// Colors for Pie slices
const COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#6366F1",
  "#EC4899",
  "#8B5CF6",
  "#F97316",
  "#14B8A6",
  "#22D3EE",
  "#A855F7",
  "#4B5563",
];

// Format large numbers to k
const formatAmount = (amount) => {
  return Math.abs(amount) >= 1000
    ? `₹${(amount / 1000).toFixed(1)}k`
    : `₹${amount}`;
};

// Group by month
const transformData = (transactions) => {
  if (!Array.isArray(transactions)) return [];
  const groups = {};

  transactions.forEach((tx) => {
    if (!tx.date) return;
    const date = new Date(tx.date);
    const month = date.toLocaleString("default", { month: "short" });

    if (!groups[month]) groups[month] = 0;
    groups[month] += tx.amount;
  });

  const monthOrder = [
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

  return monthOrder
    .filter((m) => groups[m] !== undefined)
    .map((month) => ({
      name: month,
      value: Math.abs(groups[month]),
    }));
};

function PieChartCard({ userTransaction = [] }) {
  const data = useMemo(() => transformData(userTransaction), [userTransaction]);

  // Get current month name (e.g., "Apr")
  const currentMonth = new Date().toLocaleString("default", { month: "short" });

  return (
    <Card className="w-full bg-white shadow-md rounded-xl">
      <CardHeader>
        <CardTitle>Monthly Transaction Distribution</CardTitle>
        <CardDescription>
          A visual overview of transactions grouped by month.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center text-gray-500">No data available</div>
        ) : (
          <div className="h-[360px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart
                tabIndex={-1}
                style={{
                  outline: "none",
                  userSelect: "none",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  label={({ name, value }) => `${name}: ${formatAmount(value)}`}
                  labelLine
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      stroke="#fff"
                      strokeWidth={entry.name === currentMonth ? 1 : 1}
                      style={{
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        outline: "none",
                        userSelect: "none",
                        WebkitTapHighlightColor: "transparent",
                        ...(entry.name === currentMonth && {
                          filter: "drop-shadow(0 0 6px rgba(0, 0, 0, 0.4))",
                          transform: "scale(1.03)",
                          transformOrigin: "center",
                        }),
                      }}
                    />
                  ))}
                </Pie>

                <Tooltip
                  formatter={(value) => `₹${Number(value).toFixed(2)}`}
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #E5E7EB",
                    borderRadius: "0.5rem",
                    color: "#111827",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    fontSize: "14px",
                  }}
                  cursor={{ fill: "rgba(0, 0, 0, 0.03)" }}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  formatter={(value) => (
                    <span className="text-sm text-gray-700">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default PieChartCard;
