"use client";

import React, { useEffect, useMemo } from "react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  Tooltip,
  ResponsiveContainer,
  defs,
  RadialBar,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { TrendingUp } from "lucide-react";

// Modern gradient color
const GRADIENT_ID = "radarGradient";

const chartConfig = {
  value: { label: "Spending", color: "#4F46E5" }, // Indigo
};

const transformData = (transactions) => {
  if (!Array.isArray(transactions) || transactions.length === 0) return [];

  const groups = {};
  transactions.forEach((transaction) => {
    if (!transaction.date) return;
    const dateObj = new Date(transaction.date);
    const month = dateObj
      .toLocaleString("default", { month: "short" })
      .toLowerCase();
    groups[month] = (groups[month] || 0) + transaction.amount;
  });

  const monthOrder = [
    "jan",
    "feb",
    "mar",
    "apr",
    "may",
    "jun",
    "jul",
    "aug",
    "sep",
    "oct",
    "nov",
    "dec",
  ];

  return monthOrder
    .filter((month) => groups[month] !== undefined)
    .map((month) => ({ month, value: groups[month] }));
};

function RadarCharts({ userTransaction = [] }) {
  const chartData = useMemo(
    () => transformData(userTransaction),
    [userTransaction]
  );

  useEffect(() => {
    console.log("Radar Chart data:", chartData);
  }, [chartData]);

  return (
    <Card className="w-full bg-white shadow-md rounded-2xl">
      <CardHeader className="items-center">
        <CardTitle className="text-xl font-semibold text-gray-800">
          Monthly Spending Patterns
        </CardTitle>
        <CardDescription className="text-sm text-gray-500">
          Visual breakdown of spending habits across months.
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-6">
        {chartData.length === 0 ? (
          <div className="text-center text-gray-400">No data to display</div>
        ) : (
          <div className="aspect-square max-h-[340px] mx-auto">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                {/* Gradient for radar fill */}
                <defs>
                  <radialGradient id={GRADIENT_ID} cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#6366F1" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#6366F1" stopOpacity={0.2} />
                  </radialGradient>
                </defs>

                <PolarGrid stroke="#E5E7EB" />
                <PolarAngleAxis
                  dataKey="month"
                  tick={{ fill: "#4B5563", fontSize: 12 }}
                />
                <Radar
                  name="Spending"
                  dataKey="value"
                  fill={`url(#${GRADIENT_ID})`}
                  stroke="#6366F1"
                  strokeWidth={2}
                  animationBegin={300}
                  animationDuration={1000}
                />
                <Tooltip
                  formatter={(value) => `₹${Number(value).toFixed(2)}`}
                  contentStyle={{
                    fontSize: "14px",
                    backgroundColor: "#ffffff",
                    color: "#111827",
                    border: "1px solid #E5E7EB",
                    borderRadius: "0.5rem",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default RadarCharts;
