"use client";

import React, { useEffect } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

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
    // Use abbreviated month name (e.g., "Jan")
    const monthName = dateObj.toLocaleString("default", { month: "short" });
    groups[monthName] = (groups[monthName] || 0) + transaction.amount;
  });
  // Define proper month order for abbreviated names
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

export function VerticalBarChart({ userTransaction = [] }) {
  const chartData = transformData(userTransaction);

  useEffect(() => {
    console.log("userTransaction prop:", userTransaction);
    console.log("Chart data:", chartData);
  }, [userTransaction, chartData]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Labeled Monthly Transactions</CardTitle>
        <CardDescription>
          Detailed Transaction Data for Each Month.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{ value: { label: "Value", color: "#00C853" } }}
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData}
              margin={{ top: 20, left: 0, right: 20, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis hide />
              <Tooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar dataKey="value" fill="rgb(0, 200, 83)" radius={8}>
                <LabelList
                  position="top"
                  offset={12}
                  fontSize={12}
                  formatter={(value) => `₹${Number(value).toFixed(2)}`}
                  className="fill-foreground"
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
