"use client";

import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { motion } from "framer-motion";

// Format currency values consistently
const formatCurrency = (value) => {
  if (value >= 1000000) return `₹${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value}`;
};

// Category colors - used for stacked bars
const CATEGORY_COLORS = {
  "Food & Dining": "#f59e0b",
  Shopping: "#ec4899",
  Housing: "#3b82f6",
  Transportation: "#10b981",
  Entertainment: "#8b5cf6",
  Travel: "#06b6d4",
  "Health & Fitness": "#ef4444",
  Education: "#6366f1",
  "Bills & Utilities": "#d946ef",
  "Personal Care": "#84cc16",
  Uncategorized: "#94a3b8",
  Others: "#64748b",
};

function MonthlyTrendChart({ transactions = [] }) {
  // Transform data for stacked bar chart
  const { chartData, topCategories } = useMemo(() => {
    if (!Array.isArray(transactions) || transactions.length === 0) {
      return { chartData: [], topCategories: [] };
    }

    // Filter for expense transactions only
    const expenses = transactions.filter(
      (tx) => tx.transactionType?.toUpperCase() === "DEBIT" || tx.amount < 0
    );

    // Group expenses by category to find top categories
    const categoryTotals = {};
    expenses.forEach((tx) => {
      const category = tx.category || "Uncategorized";
      if (!categoryTotals[category]) {
        categoryTotals[category] = 0;
      }
      categoryTotals[category] += Math.abs(tx.amount);
    });

    // Get top 5 categories + "Others"
    const sortedCategories = Object.entries(categoryTotals)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);

    const top5Categories = sortedCategories
      .slice(0, 5)
      .map((item) => item.category);

    // Group data by month and category
    const monthData = {};

    expenses.forEach((tx) => {
      if (!tx.date) return;

      const date = new Date(tx.date);
      const month = date.toLocaleString("default", { month: "short" });
      const year = date.getFullYear();
      const monthYear = `${month} ${year}`;

      if (!monthData[monthYear]) {
        monthData[monthYear] = {
          name: monthYear,
          timestamp: date.getTime(),
          total: 0,
        };

        // Initialize all categories with 0
        top5Categories.forEach((category) => {
          monthData[monthYear][category] = 0;
        });
        monthData[monthYear]["Others"] = 0;
      }

      const category = tx.category || "Uncategorized";
      const amount = Math.abs(tx.amount);

      // Add to specific category or "Others"
      if (top5Categories.includes(category)) {
        monthData[monthYear][category] += amount;
      } else {
        monthData[monthYear]["Others"] += amount;
      }

      monthData[monthYear].total += amount;
    });

    // Convert to array and sort by timestamp
    const chartData = Object.values(monthData).sort(
      (a, b) => a.timestamp - b.timestamp
    );

    // Take last 12 months of data maximum
    const last12Months = chartData.slice(-12);

    return {
      chartData: last12Months,
      topCategories: [...top5Categories, "Others"],
    };
  }, [transactions]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  // Get colors for each category
  const getCategoryColors = () => {
    return topCategories.map(
      (category) => CATEGORY_COLORS[category] || "#94a3b8" // default gray if not found
    );
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
          <CardTitle className="text-xl font-bold text-gray-800">
            Monthly Spending Pattern
          </CardTitle>
          <CardDescription className="text-sm text-gray-500">
            Spending by category over time
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-2 h-[calc(100%-80px)]">
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-500">No data available</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#6b7280", fontSize: 11 }}
                  axisLine={{ stroke: "#d1d5db" }}
                  tickMargin={8}
                />
                <YAxis
                  tickFormatter={formatCurrency}
                  tick={{ fill: "#6b7280", fontSize: 11 }}
                  width={60}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value, name) => [formatCurrency(value), name]}
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

                {/* Create a Bar for each category */}
                {topCategories.map((category, index) => (
                  <Bar
                    key={category}
                    dataKey={category}
                    name={category}
                    stackId="a"
                    fill={getCategoryColors()[index]}
                    radius={[
                      index === 0 ? 4 : 0,
                      index === 0 ? 4 : 0,
                      index === topCategories.length - 1 ? 4 : 0,
                      index === topCategories.length - 1 ? 4 : 0,
                    ]}
                    animationDuration={1500}
                    animationEasing="ease-out"
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default MonthlyTrendChart;
