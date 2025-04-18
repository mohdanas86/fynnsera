"use client";

import React, { useMemo } from "react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
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
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

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

const transformData = (transactions = []) => {
  const grouped = {};

  transactions.forEach((tx) => {
    if (!tx.date || typeof tx.amount !== "number") return;
    const month = new Date(tx.date).toLocaleString("default", {
      month: "short",
    });
    if (!grouped[month]) grouped[month] = 0;
    grouped[month] += tx.amount;
  });

  return monthNames.map((month) => ({
    month,
    value: grouped[month] || 0,
  }));
};

function PolarAreaChart({ userTransaction = [] }) {
  const chartData = useMemo(
    () => transformData(userTransaction),
    [userTransaction]
  );

  return (
    <Card className="p-4 sm:p-6 bg-white rounded-xl border max-w-4xl w-full  mx-auto">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Polar Monthly Spending
        </CardTitle>
        <CardDescription className="text-sm text-gray-500">
          Radial representation of monthly transactions.
        </CardDescription>
      </CardHeader>
      <CardContent className="min-h-[350px] flex justify-center items-center">
        <ChartContainer
          config={{ value: { label: "Total", color: "#3B82F6" } }}
          className="w-full h-[350px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: "#374151" }}
              />
              <Tooltip
                formatter={(value) => `₹${Number(value).toLocaleString()}`}
                content={<ChartTooltipContent />}
              />
              <Radar
                name="Amount"
                dataKey="value"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.6}
              />
            </RadarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export default PolarAreaChart;
