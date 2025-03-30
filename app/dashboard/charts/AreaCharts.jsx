"use client";

import React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Helper function to aggregate transactions by month.
// The output keys are renamed to "name" (month) and "value" (total amount)
// to match the LChart style.
const transformData = (transactions) => {
  if (!Array.isArray(transactions)) {
    transactions = [];
  }
  const groups = {};
  transactions.forEach((transaction) => {
    if (!transaction.date) return;
    const dateObj = new Date(transaction.date);
    // Get full month name (e.g., "January")
    const monthName = dateObj.toLocaleString("default", { month: "long" });
    groups[monthName] = (groups[monthName] || 0) + transaction.amount;
  });
  // Define month order for sorting
  const monthOrder = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return monthOrder
    .filter((month) => groups[month] !== undefined)
    .map((month) => ({ name: month, value: groups[month] }));
};

export function AreaCharts({ userTransaction }) {
  const chartData = transformData(userTransaction);
  console.log("userTransaction", userTransaction, "chartData", chartData);

  return (
    <Card className="w-full h-[430px]">
      <CardHeader>
        <CardTitle>Monthly Transaction Trends</CardTitle>
        <CardDescription>
          Visualizing Total Amounts Across Each Month at a Glance.
        </CardDescription>
      </CardHeader>
      <CardContent className="h-full">
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 0, right: 0, left: 20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 14, fill: "#6b7280" }}
                axisLine={{ stroke: "#d1d5db" }}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(value) => {
                  if (value >= 1000000) {
                    return (value / 1000000).toFixed(0) + "M";
                  } else if (value >= 1000) {
                    return (value / 1000).toFixed(0) + "K";
                  } else {
                    return value.toFixed(0);
                  }
                }}
                tick={{ fontSize: 14, fill: "#6b7280" }}
                axisLine={{ stroke: "#d1d5db" }}
                tickLine={false}
                width={35}
              />
              <Tooltip
                contentStyle={{
                  fontSize: "14px",
                  backgroundColor: "#ffffff",
                  color: "#333333",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                }}
                formatter={(value) => {
                  return `₹${value.toLocaleString()}`;
                }}
              />
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="rgb(38, 98, 217)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="rgb(38, 98, 217)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <Area
                type="monotoneX"
                dataKey="value"
                stroke="rgb(38, 98, 217)"
                fill="url(#colorValue)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
      {/* <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              Trending up by 5.2% this month
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              January - June 2024
            </div>
          </div>
        </div>
      </CardFooter> */}
    </Card>
  );
}
