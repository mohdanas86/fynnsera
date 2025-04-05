"use client";

import React, { useEffect } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Helper function to aggregate transactions by month
const transformData = (transactions) => {
  if (!Array.isArray(transactions) || transactions.length === 0) {
    console.log("No transactions provided");
    return [];
  }
  const groups = {};
  transactions.forEach((transaction) => {
    if (!transaction.date) return;
    const dateObj = new Date(transaction.date);
    // Get the abbreviated month name (e.g., "Jan")
    const monthName = dateObj.toLocaleString("default", { month: "short" });
    groups[monthName] = (groups[monthName] || 0) + transaction.amount;
  });
  // Define the proper month order with abbreviated month names
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
  const data = monthOrder
    .filter((month) => groups[month] !== undefined)
    .map((month) => ({ month, value: groups[month] }));
  console.log("Transformed chart data:", data);
  return data;
};

export function BarCharts({ userTransaction = [] }) {
  const chartData = transformData(userTransaction);

  useEffect(() => {
    console.log("userTransaction prop:", userTransaction);
    console.log("Chart data:", chartData);
  }, [userTransaction, chartData]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Monthly Transaction Breakdown</CardTitle>
        <CardDescription>
          Comparing Transaction Data Month Over Month.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="text-center text-gray-500">No data available</div>
        ) : (
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ left: 0, right: 20, top: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" dataKey="value" hide />
                <YAxis
                  dataKey="month"
                  type="category"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(value) => `₹${Number(value).toFixed(2)}`}
                />
                <Bar dataKey="value" fill="rgb(59, 130, 246)" radius={5} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
