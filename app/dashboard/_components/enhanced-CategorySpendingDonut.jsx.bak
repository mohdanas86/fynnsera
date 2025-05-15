"use client";

import React, { useState, useMemo } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import { PieChart, List, ChevronLeft, PlusCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Register required Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

// Format currency values consistently
const formatCurrency = (value) => {
  if (value >= 1000000) return `₹${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value}`;
};

// Vibrant color palette for categories
const CATEGORY_COLORS = [
  "#3b82f6", // Blue
  "#10b981", // Green
  "#f59e0b", // Amber
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#f43f5e", // Rose
  "#84cc16", // Lime
  "#6366f1", // Indigo
  "#0ea5e9", // Sky
  "#14b8a6", // Teal
  "#f97316", // Orange
];

export default function CategorySpendingDonut({
  transactions = [],
  isLoading = false,
}) {
  const [loading, setLoading] = useState(isLoading);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [timeframe, setTimeframe] = useState("monthly"); // monthly, quarterly, yearly

  // Simulate loading state if needed
  React.useEffect(() => {
    setLoading(isLoading);
    if (isLoading) {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // Function to determine current month and year
  const getCurrentPeriod = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    return { month: currentMonth, year: currentYear };
  };

  // Filter transactions based on selected timeframe
  const filteredTransactions = useMemo(() => {
    if (!Array.isArray(transactions) || transactions.length === 0) {
      return [];
    }

    const { month, year } = getCurrentPeriod();

    // Only process debit transactions (expenses)
    const debitTransactions = transactions.filter(
      (tx) => tx.transactionType?.toUpperCase() === "DEBIT"
    );

    return debitTransactions.filter((tx) => {
      if (!tx.date) return false;
      const txDate = new Date(tx.date);

      if (timeframe === "yearly") {
        return txDate.getFullYear() === year;
      } else if (timeframe === "quarterly") {
        const txQuarter = Math.floor(txDate.getMonth() / 3);
        const currentQuarter = Math.floor(month / 3);
        return txDate.getFullYear() === year && txQuarter === currentQuarter;
      } else {
        // Default: monthly
        return txDate.getMonth() === month && txDate.getFullYear() === year;
      }
    });
  }, [transactions, timeframe]);

  // Process category data
  const categoryData = useMemo(() => {
    if (loading || filteredTransactions.length === 0) {
      return {
        labels: [],
        datasets: [
          {
            data: [],
            backgroundColor: [],
            borderColor: [],
            borderWidth: 1,
          },
        ],
      };
    }

    // If we're in drill-down mode, filter by selected category
    let processedTransactions = filteredTransactions;
    let groupByField = "category";

    if (selectedCategory) {
      processedTransactions = filteredTransactions.filter(
        (tx) => tx.category === selectedCategory
      );
      groupByField = "subcategory";
    }

    // Group transactions by category or subcategory
    const categoryGroups = {};

    processedTransactions.forEach((tx) => {
      const key = tx[groupByField] || "Uncategorized";

      if (!categoryGroups[key]) {
        categoryGroups[key] = {
          total: 0,
          transactions: [],
        };
      }

      categoryGroups[key].total += parseFloat(tx.amount) || 0;
      categoryGroups[key].transactions.push(tx);
    });

    // Sort categories by total amount (descending)
    const sortedCategories = Object.entries(categoryGroups)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 8); // Take top 8 categories for better visualization

    // Calculate the 'Other' category if needed
    let otherTotal = 0;
    if (Object.keys(categoryGroups).length > 8) {
      Object.entries(categoryGroups)
        .sort((a, b) => b[1].total - a[1].total)
        .slice(8)
        .forEach(([_, data]) => {
          otherTotal += data.total;
        });
    }

    // Prepare data for Chart.js
    const labels = sortedCategories.map(([cat]) => cat);
    const values = sortedCategories.map(([_, data]) => data.total);

    // Add "Other" category if needed
    if (otherTotal > 0) {
      labels.push("Other");
      values.push(otherTotal);
    }

    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: CATEGORY_COLORS.slice(0, labels.length),
          borderColor: CATEGORY_COLORS.slice(0, labels.length).map(
            (color) => color + "33"
          ),
          borderWidth: 1,
        },
      ],
      rawData: sortedCategories,
    };
  }, [filteredTransactions, selectedCategory, loading]);

  // Calculate total spending
  const totalSpending = useMemo(() => {
    return filteredTransactions.reduce(
      (sum, tx) => sum + (parseFloat(tx.amount) || 0),
      0
    );
  }, [filteredTransactions]);

  // Chart.js options
  const chartOptions = {
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw;
            const percentage = ((value / totalSpending) * 100).toFixed(1);
            return `${context.label}: ${formatCurrency(
              value
            )} (${percentage}%)`;
          },
        },
      },
    },
    cutout: "70%",
    maintainAspectRatio: false,
    responsive: true,
  };

  // Get period text based on timeframe
  const getPeriodText = () => {
    const { month, year } = getCurrentPeriod();
    const monthNames = [
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

    if (timeframe === "yearly") {
      return `${year}`;
    } else if (timeframe === "quarterly") {
      const quarter = Math.floor(month / 3) + 1;
      return `Q${quarter} ${year}`;
    } else {
      return `${monthNames[month]} ${year}`;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <Card className="border-none shadow-md">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <PieChart className="w-5 h-5 text-purple-500" />
                Category Spending
                {selectedCategory && (
                  <span className="text-sm font-normal text-gray-500">
                    &gt; {selectedCategory}
                  </span>
                )}
              </CardTitle>
              <CardDescription>
                {selectedCategory
                  ? `Subcategory breakdown for ${selectedCategory}`
                  : `Where your money went in ${getPeriodText()}`}
              </CardDescription>
            </div>
            <div className="flex gap-2 items-center">
              {selectedCategory && (
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="flex items-center gap-1 text-xs bg-purple-100 text-purple-700 hover:bg-purple-200 py-1 px-2 rounded-md"
                >
                  <ChevronLeft className="w-3 h-3" />
                  Back
                </button>
              )}
              <div className="flex gap-1">
                <button
                  onClick={() => setTimeframe("monthly")}
                  className={`px-3 py-1 text-xs rounded-md ${
                    timeframe === "monthly"
                      ? "bg-purple-100 text-purple-700 font-medium"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Month
                </button>
                <button
                  onClick={() => setTimeframe("quarterly")}
                  className={`px-3 py-1 text-xs rounded-md ${
                    timeframe === "quarterly"
                      ? "bg-purple-100 text-purple-700 font-medium"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Quarter
                </button>
                <button
                  onClick={() => setTimeframe("yearly")}
                  className={`px-3 py-1 text-xs rounded-md ${
                    timeframe === "yearly"
                      ? "bg-purple-100 text-purple-700 font-medium"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Year
                </button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col md:flex-row gap-6 h-[350px]">
              <div className="w-full md:w-1/2 flex items-center justify-center">
                <Skeleton className="w-full h-64 rounded-full" />
              </div>
              <div className="w-full md:w-1/2 space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[350px] bg-gray-50 rounded-lg border border-dashed border-gray-200">
              <PieChart className="w-16 h-16 text-gray-300 mb-2" />
              <p className="text-gray-500">No expense data available</p>
              <p className="text-gray-400 text-sm mb-4">
                Record some expenses to see your spending categories
              </p>
              <button className="flex items-center gap-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                <PlusCircle className="w-4 h-4" />
                Add Transaction
              </button>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-6 h-[350px]">
              <div className="w-full md:w-1/2 flex items-center justify-center relative">
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <p className="text-4xl font-bold text-gray-800">
                    {formatCurrency(totalSpending)}
                  </p>
                  <p className="text-sm text-gray-500">Total Spending</p>
                </div>
                <div className="w-full h-64">
                  <Doughnut data={categoryData} options={chartOptions} />
                </div>
              </div>
              <div className="w-full md:w-1/2">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <List className="w-4 h-4" />
                    {selectedCategory ? "Subcategories" : "Top Categories"}
                  </h3>
                  <p className="text-xs text-gray-500">Click to drill down</p>
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                  {categoryData.labels.map((label, index) => {
                    const value = categoryData.datasets[0].data[index];
                    const percentage = ((value / totalSpending) * 100).toFixed(
                      1
                    );

                    return (
                      <div
                        key={label}
                        className={`flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors ${
                          label !== "Other" && !selectedCategory
                            ? "cursor-pointer"
                            : ""
                        }`}
                        onClick={() => {
                          if (label !== "Other" && !selectedCategory) {
                            setSelectedCategory(label);
                          }
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor:
                                CATEGORY_COLORS[index % CATEGORY_COLORS.length],
                            }}
                          ></div>
                          <span
                            className={`text-sm ${
                              label === "Uncategorized"
                                ? "italic text-gray-500"
                                : "text-gray-700"
                            }`}
                          >
                            {label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-900">
                            {formatCurrency(value)}
                          </span>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            {percentage}%
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {categoryData.labels.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                      No data available
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
