"use client";

import React, { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { motion } from "framer-motion";

// Format currency values for display
const formatCurrency = (value) => {
  if (!value && value !== 0) return "";
  if (value >= 1000000) return `₹${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value}`;
};

function CashFlowLineChart({ transactions = [] }) {
  const [timeframe, setTimeframe] = useState("monthly"); // weekly, monthly, quarterly

  // Transform data based on selected timeframe
  const chartData = useMemo(() => {
    if (!Array.isArray(transactions) || transactions.length === 0) return [];

    const sortedTransactions = [...transactions].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    let groupedData = {};

    if (timeframe === "weekly") {
      // Group by week number
      sortedTransactions.forEach((tx) => {
        if (!tx.date) return;

        const date = new Date(tx.date);
        const year = date.getFullYear();

        // Calculate the week number
        const firstDayOfYear = new Date(year, 0, 1);
        const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
        const weekNumber = Math.ceil(
          (pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7
        );

        const key = `Week ${weekNumber}`;

        if (!groupedData[key]) {
          groupedData[key] = { credit: 0, debit: 0, timestamp: date.getTime() };
        }

        if (tx.transactionType?.toUpperCase() === "CREDIT" || tx.amount > 0) {
          groupedData[key].credit += Math.abs(Number(tx.amount) || 0);
        } else {
          groupedData[key].debit += Math.abs(Number(tx.amount) || 0);
        }
      });
    } else if (timeframe === "quarterly") {
      // Group by quarter
      sortedTransactions.forEach((tx) => {
        if (!tx.date) return;

        const date = new Date(tx.date);
        const year = date.getFullYear();
        const quarter = Math.floor(date.getMonth() / 3) + 1;

        const key = `Q${quarter} ${year}`;

        if (!groupedData[key]) {
          groupedData[key] = { credit: 0, debit: 0, timestamp: date.getTime() };
        }

        if (tx.transactionType?.toUpperCase() === "CREDIT" || tx.amount > 0) {
          groupedData[key].credit += Math.abs(Number(tx.amount) || 0);
        } else {
          groupedData[key].debit += Math.abs(Number(tx.amount) || 0);
        }
      });
    } else {
      // Group by month (default)
      sortedTransactions.forEach((tx) => {
        if (!tx.date) return;

        const date = new Date(tx.date);
        const monthYear = date.toLocaleString("default", {
          month: "short",
          year: "numeric",
        });

        if (!groupedData[monthYear]) {
          groupedData[monthYear] = {
            credit: 0,
            debit: 0,
            timestamp: date.getTime(),
          };
        }

        if (tx.transactionType?.toUpperCase() === "CREDIT" || tx.amount > 0) {
          groupedData[monthYear].credit += Math.abs(Number(tx.amount) || 0);
        } else {
          groupedData[monthYear].debit += Math.abs(Number(tx.amount) || 0);
        }
      });
    }

    // Convert to array and sort by timestamp
    return Object.entries(groupedData)
      .map(([name, data]) => ({
        name,
        credit: data.credit,
        debit: data.debit,
        netFlow: data.credit - data.debit,
        timestamp: data.timestamp,
      }))
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [transactions, timeframe]);

  // Animation variables
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4 },
    },
  };

  return (
    <motion.div
      className="w-full h-full"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <Card className="w-full h-full">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl font-bold text-gray-800">
                Cash Flow Trend
              </CardTitle>
              <CardDescription className="text-sm text-gray-500">
                Credit vs Debit over time
              </CardDescription>
            </div>
            <div className="flex rounded-md border border-gray-200 overflow-hidden">
              <button
                onClick={() => setTimeframe("weekly")}
                className={`px-3 py-1 text-xs font-medium ${
                  timeframe === "weekly"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setTimeframe("monthly")}
                className={`px-3 py-1 text-xs font-medium ${
                  timeframe === "monthly"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setTimeframe("quarterly")}
                className={`px-3 py-1 text-xs font-medium ${
                  timeframe === "quarterly"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Quarterly
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-2 h-[calc(100%-80px)]">
          <motion.div className="w-full h-full" variants={itemVariants}>
            {chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500">
                  No data available for the selected period
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e5e7eb"
                    opacity={0.7}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#6b7280", fontSize: 11 }}
                    tickMargin={10}
                    axisLine={{ stroke: "#d1d5db" }}
                  />
                  <YAxis
                    tickFormatter={formatCurrency}
                    tick={{ fill: "#6b7280", fontSize: 11 }}
                    width={60}
                    axisLine={{ stroke: "#d1d5db" }}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "6px",
                      padding: "8px 12px",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => (
                      <span style={{ color: "#6b7280", fontSize: "12px" }}>
                        {value}
                      </span>
                    )}
                  />

                  {/* Shaded area for net cash flow */}
                  <defs>
                    <linearGradient
                      id="netFlowGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                      <stop
                        offset="95%"
                        stopColor="#3b82f6"
                        stopOpacity={0.01}
                      />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="netFlow"
                    fill="url(#netFlowGradient)"
                    stroke="none"
                    fillOpacity={0.6}
                  />

                  {/* Lines for credit and debit */}
                  <Line
                    type="monotone"
                    dataKey="credit"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={{
                      r: 4,
                      fill: "#10b981",
                      strokeWidth: 1,
                      stroke: "#fff",
                    }}
                    activeDot={{
                      r: 6,
                      fill: "#10b981",
                      stroke: "#fff",
                      strokeWidth: 2,
                    }}
                    animationDuration={1500}
                  />
                  <Line
                    type="monotone"
                    dataKey="debit"
                    stroke="#ef4444"
                    strokeWidth={2.5}
                    dot={{
                      r: 4,
                      fill: "#ef4444",
                      strokeWidth: 1,
                      stroke: "#fff",
                    }}
                    activeDot={{
                      r: 6,
                      fill: "#ef4444",
                      stroke: "#fff",
                      strokeWidth: 2,
                    }}
                    animationDuration={1500}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default CashFlowLineChart;
