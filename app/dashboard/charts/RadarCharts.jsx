"use client";

import React, { useEffect } from "react";
import { TrendingUp } from "lucide-react";
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  Tooltip,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";

// Chart configuration with modern colors for the single "value" series
const chartConfig = {
  value: { label: "Value", color: "rgb(29, 161, 242)" }, // blue
};

// Helper function to aggregate transactions by month using only "value"
const transformData = (transactions) => {
  if (!Array.isArray(transactions) || transactions.length === 0) {
    console.log("No transactions provided");
    return [];
  }
  const groups = {};
  transactions.forEach((transaction) => {
    if (!transaction.date) return;
    const dateObj = new Date(transaction.date);
    // Use abbreviated month name (e.g., "jan") in lowercase
    const monthName = dateObj
      .toLocaleString("default", { month: "short" })
      .toLowerCase();
    groups[monthName] = (groups[monthName] || 0) + transaction.amount;
  });
  // Define proper month order for abbreviated lowercase names
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
  const data = monthOrder
    .filter((month) => groups[month] !== undefined)
    .map((month) => ({ month, value: groups[month] }));
  console.log("Transformed chart data:", data);
  return data;
};

export function RadarCharts({ userTransaction = [] }) {
  const chartData = transformData(userTransaction);

  useEffect(() => {
    console.log("userTransaction prop:", userTransaction);
    console.log("Radar Chart data:", chartData);
  }, [userTransaction, chartData]);

  return (
    <Card className="w-full border border-gray-200">
      <CardHeader className="items-center">
        <CardTitle>Monthly Spending Patterns</CardTitle>
        <CardDescription className="text-gray-600">
          Visualizing Transaction Amounts Across All Months.
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px] p-4"
        >
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
            <Tooltip
              formatter={(value) => `$${Number(value).toFixed(2)}`}
              contentStyle={{
                fontSize: "14px",
                backgroundColor: "#fff",
                color: "#333",
                border: "1px solid #ddd",
                borderRadius: "8px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              }}
            />
            <PolarAngleAxis
              dataKey="month"
              tick={({ payload, ...rest }) => (
                <text {...rest} fill="#555" fontSize={14}>
                  {payload.value}
                </text>
              )}
            />
            <PolarGrid stroke="#eee" />
            <Radar
              dataKey="value"
              fill={chartConfig.value.color}
              fillOpacity={0.6}
              stroke={chartConfig.value.color}
              strokeWidth={2}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
      {/* <CardFooter className="flex flex-col gap-2 border-t pt-4 text-sm">
        <div className="flex items-center gap-2 font-medium text-green-600">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-gray-500">January - June 2024</div>
      </CardFooter> */}
    </Card>
  );
}
