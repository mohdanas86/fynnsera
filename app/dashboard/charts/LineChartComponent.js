"use client";

import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

// Helper to transform data
const transformData = (transactions = []) => {
  const groups = {};
  transactions.forEach((tx) => {
    if (!tx.date || typeof tx.amount !== "number") return;
    const month = new Date(tx.date)
      .toLocaleString("default", { month: "short" })
      .toLowerCase();
    groups[month] = (groups[month] || 0) + tx.amount;
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

  return monthOrder.map((month) => ({
    month: month.charAt(0).toUpperCase() + month.slice(1),
    value: groups[month] || 0,
  }));
};

function LineChartComponent({ userTransaction = [] }) {
  const chartData = useMemo(
    () => transformData(userTransaction),
    [userTransaction]
  );

  return (
    <Card className="w-full h-[430px]">
      <CardHeader>
        <CardTitle>Monthly Transaction Overview</CardTitle>
        <CardDescription>
          Line graph tracking your transaction trends.
        </CardDescription>
      </CardHeader>

      <CardContent className="h-full">
        <div className="w-full h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 30, right: 30, left: 0, bottom: 50 }}
            >
              <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 13, fill: "#6b7280" }}
                axisLine={{ stroke: "#d1d5db" }}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(value) =>
                  value >= 1000 ? `${Math.round(value / 1000)}K` : value
                }
                tick={{ fontSize: 13, fill: "#6b7280" }}
                axisLine={{ stroke: "#d1d5db" }}
                tickLine={false}
              />
              <Tooltip
                formatter={(value) =>
                  value >= 1000 ? `${Math.round(value / 1000)}K` : value
                }
                contentStyle={{
                  fontSize: "14px",
                  backgroundColor: "#fff",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 4 }}
              >
                <LabelList
                  dataKey="value"
                  position="top"
                  formatter={(val) =>
                    val >= 1000 ? `${Math.round(val / 1000)}K` : val
                  }
                  style={{ fontSize: 12, fill: "#111827", fontWeight: 500 }}
                />
              </Line>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export default LineChartComponent;
