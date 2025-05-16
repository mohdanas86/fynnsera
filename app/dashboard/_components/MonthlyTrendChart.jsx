"use client";

import React, { useState, useEffect, useMemo } from "react";
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
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Format currency values consistently
const formatCurrency = (value) => {
  // Round the value to nearest integer
  const roundedValue = Math.round(value);
  if (roundedValue >= 1000000)
    return `₹${(roundedValue / 1000000).toFixed(1)}M`;
  if (roundedValue >= 1000) return `₹${(roundedValue / 1000).toFixed(1)}K`;
  return `₹${roundedValue}`;
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

function MonthlyTrendChart({ transactions = [], isLoading = false }) {
  const [loading, setLoading] = useState(isLoading);
  const [viewMode, setViewMode] = useState("stacked"); // stacked, grouped
  const [timeRange, setTimeRange] = useState("6"); // in months

  // Simulate loading state if needed
  useEffect(() => {
    setLoading(isLoading);
    if (isLoading) {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // Transform data for stacked bar chart
  const {
    chartData,
    topCategories,
    totalSpent,
    monthlyAverage,
    percentageChange,
  } = useMemo(() => {
    if (loading || !Array.isArray(transactions) || transactions.length === 0) {
      return {
        chartData: [],
        topCategories: [],
        totalSpent: 0,
        monthlyAverage: 0,
        percentageChange: 0,
      };
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
    const now = new Date();
    const monthsToShow = parseInt(timeRange);

    // Initialize with empty months for the last N months
    for (let i = monthsToShow - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = date.toLocaleString("default", { month: "short" });
      const year = date.getFullYear();
      const monthYear = `${month} ${year}`;

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

    // Fill with actual data
    expenses.forEach((tx) => {
      if (!tx.date) return;

      const date = new Date(tx.date);
      const month = date.toLocaleString("default", { month: "short" });
      const year = date.getFullYear();
      const monthYear = `${month} ${year}`;

      // Skip if not in our range of months
      if (!monthData[monthYear]) return;

      const category = tx.category || "Uncategorized";
      const amount = Math.abs(tx.amount);

      // Add to total
      monthData[monthYear].total += amount;

      // Add to specific category or "Others"
      if (top5Categories.includes(category)) {
        monthData[monthYear][category] += amount;
      } else {
        monthData[monthYear]["Others"] += amount;
      }
    });

    // Convert to array and sort chronologically
    const sortedData = Object.values(monthData).sort(
      (a, b) => a.timestamp - b.timestamp
    );

    // Calculate total spent and monthly average
    const totalSpent = sortedData.reduce((sum, month) => sum + month.total, 0);
    const monthlyAverage =
      totalSpent / (sortedData.filter((m) => m.total > 0).length || 1);

    // Calculate percentage change between last two months
    let percentageChange = 0;
    if (sortedData.length >= 2) {
      const lastMonth = sortedData[sortedData.length - 1].total;
      const secondLastMonth = sortedData[sortedData.length - 2].total;

      if (secondLastMonth > 0) {
        percentageChange =
          ((lastMonth - secondLastMonth) / secondLastMonth) * 100;
      }
    }

    return {
      chartData: sortedData,
      topCategories: [...top5Categories, "Others"],
      totalSpent,
      monthlyAverage,
      percentageChange,
    };
  }, [transactions, loading, timeRange]);

  // Custom tooltip to show detailed breakdown
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      // Sort categories by amount for this month
      const categoriesInMonth = payload
        .filter((p) => p.value > 0)
        .sort((a, b) => b.value - a.value);

      const totalForMonth = payload.reduce((sum, p) => sum + (p.value || 0), 0);
      return (
        <div className="bg-white border border-gray-200 shadow-lg rounded-lg p-2 sm:p-3 text-sm max-w-[180px] sm:max-w-none">
          <p className="font-semibold mb-1 sm:mb-2 text-xs sm:text-sm">
            {label}
          </p>
          <p className="font-medium text-gray-900 text-xs sm:text-sm">
            Total: {formatCurrency(totalForMonth)}
          </p>
          <div className="mt-1 sm:mt-2 space-y-1 sm:space-y-1.5">
            {categoriesInMonth.map((entry, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-1 sm:gap-3"
              >
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <span
                    className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  ></span>
                  <span className="text-gray-700 text-[10px] sm:text-xs truncate max-w-[80px] sm:max-w-none">
                    {entry.name}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-medium text-[10px] sm:text-xs">
                    {formatCurrency(entry.value)}
                  </span>
                  <span className="text-gray-500 text-[9px] sm:text-xs">
                    ({((entry.value / totalForMonth) * 100).toFixed(0)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.4,
      },
    },
  };

  return (
    <motion.div
      className="w-full h-full"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <Card className="w-full h-full border-none shadow-md">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              {" "}
              <CardTitle className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                <BarChart3 className="size-4 sm:size-5 text-indigo-500" />
                Monthly Spending Trends
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Breakdown of your monthly expenses by category
              </CardDescription>
            </div>{" "}
            <div className="flex gap-1 sm:gap-2">
              {/* Time range selector */}
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="text-[10px] sm:text-xs border border-gray-200 rounded-md bg-gray-50 px-1 sm:px-2 py-1"
              >
                <option value="3">Last 3 months</option>
                <option value="6">Last 6 months</option>
                <option value="12">Last 12 months</option>
              </select>

              {/* View mode toggle */}
              <div className="flex rounded-md border border-gray-200 text-[10px] sm:text-xs">
                <button
                  onClick={() => setViewMode("stacked")}
                  className={`px-1 sm:px-2 py-1 ${
                    viewMode === "stacked"
                      ? "bg-indigo-100 text-indigo-700 font-medium"
                      : "bg-white text-gray-600"
                  }`}
                >
                  Stacked
                </button>
                <button
                  onClick={() => setViewMode("grouped")}
                  className={`px-1 sm:px-2 py-1 ${
                    viewMode === "grouped"
                      ? "bg-indigo-100 text-indigo-700 font-medium"
                      : "bg-white text-gray-600"
                  }`}
                >
                  Grouped
                </button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="h-[calc(100%-90px)] overflow-hidden">
          {loading ? (
            <div className="h-full w-full flex flex-col gap-4">
              <div className="flex gap-4">
                <Skeleton className="h-20 w-1/3" />
                <Skeleton className="h-20 w-1/3" />
                <Skeleton className="h-20 w-1/3" />
              </div>
              <Skeleton className="h-[calc(100%-80px)] w-full" />
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-full w-full flex items-center justify-center">
              <div className="text-center">
                <CalendarDays className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">
                  No spending data available
                </p>
                <p className="text-gray-400 text-sm">
                  Add some transactions to see monthly trends
                </p>
              </div>
            </div>
          ) : (
            <div className="h-full w-full flex flex-col">
              {" "}
              {/* Summary metrics */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-indigo-50 rounded-lg">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <div className="p-1 sm:p-1.5 bg-indigo-100 rounded-full">
                      <CalendarDays className="h-3 w-3 sm:h-4 sm:w-4 text-indigo-600" />
                    </div>
                    <span className="text-xs sm:text-sm text-gray-600">
                      Total Spent
                    </span>
                  </div>
                  <p className="text-sm sm:text-lg font-bold text-gray-900 mt-1">
                    {formatCurrency(totalSpent)}
                  </p>
                </div>

                <div className="p-2 sm:p-3 bg-teal-50 rounded-lg">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <div className="p-1 sm:p-1.5 bg-teal-100 rounded-full">
                      <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 text-teal-600" />
                    </div>
                    <span className="text-xs sm:text-sm text-gray-600">
                      Monthly Avg
                    </span>
                  </div>
                  <p className="text-sm sm:text-lg font-bold text-gray-900 mt-1">
                    {formatCurrency(monthlyAverage)}
                  </p>
                </div>

                <div className="p-2 sm:p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <div className="p-1 sm:p-1.5 bg-purple-100 rounded-full">
                      {percentageChange > 0 ? (
                        <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
                      ) : (
                        <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                      )}
                    </div>
                    <span className="text-xs sm:text-sm text-gray-600">
                      Month/Month
                    </span>
                  </div>
                  <p
                    className={`text-sm sm:text-lg font-bold mt-1 ${
                      percentageChange > 0 ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {percentageChange > 0 ? "+" : ""}
                    {percentageChange.toFixed(1)}%
                  </p>
                </div>
              </div>
              {/* Chart */}
              <div className="grow">
                <ResponsiveContainer width="100%" height="100%">
                  {" "}
                  <BarChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 15 }}
                    barGap={viewMode === "grouped" ? 1 : 0}
                    barCategoryGap={viewMode === "grouped" ? 4 : 8}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      opacity={0.3}
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10 }}
                      tickLine={false}
                      axisLine={{ stroke: "#e5e7eb" }}
                      angle={-25}
                      textAnchor="end"
                      height={50}
                    />
                    <YAxis
                      tickFormatter={formatCurrency}
                      tick={{ fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                      width={45}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      wrapperStyle={{ paddingTop: 8 }}
                      iconType="circle"
                      iconSize={7}
                      fontSize={11}
                    />

                    {viewMode === "stacked"
                      ? // Stacked bars
                        topCategories.map((category, index) => (
                          <Bar
                            key={category}
                            dataKey={category}
                            stackId="a"
                            fill={CATEGORY_COLORS[category] || "#94a3b8"}
                            name={category}
                            radius={index === 0 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                            animationDuration={1000}
                            animationEasing="ease-out"
                          />
                        ))
                      : // Grouped bars (limit to top 3 + Others for readability)
                        topCategories
                          .slice(0, 4)
                          .map((category) => (
                            <Bar
                              key={category}
                              dataKey={category}
                              fill={CATEGORY_COLORS[category] || "#94a3b8"}
                              name={category}
                              radius={[4, 4, 0, 0]}
                              animationDuration={1000}
                              animationEasing="ease-out"
                            />
                          ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default MonthlyTrendChart;
