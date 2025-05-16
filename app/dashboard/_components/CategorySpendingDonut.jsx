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
import { PieChart, ChevronLeft, Filter, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Register required Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

// Format currency values consistently
const formatCurrency = (value) => {
  // First round the value to nearest integer
  const roundedValue = Math.round(value);

  if (roundedValue >= 1000000)
    return `₹${(roundedValue / 1000000).toFixed(1)}M`;
  if (roundedValue >= 1000) return `₹${(roundedValue / 1000).toFixed(1)}K`;
  return `₹${roundedValue}`;
};

// Vibrant color palette for categories
const CATEGORY_COLORS = [
  "#3b82f6", // Blue
  "#10b981", // Green
  "#f59e0b", // Amber
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#ef4444", // Red
  "#06b6d4", // Cyan
  "#6366f1", // Indigo
  "#d946ef", // Fuchsia
  "#84cc16", // Lime
  "#14b8a6", // Teal
  "#f97316", // Orange
];

function CategorySpendingDonut({ transactions = [], isLoading = false }) {
  // For drill-down functionality
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [timeframe, setTimeframe] = useState("all"); // "all", "monthly", "quarterly", "yearly"
  const [loading, setLoading] = useState(isLoading);

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
  const timeframeFilteredTransactions = useMemo(() => {
    if (!Array.isArray(transactions) || transactions.length === 0) {
      return [];
    }

    console.log("Transactions before filtering:", transactions.length);

    // Only process debit transactions (expenses)
    const debitTransactions = transactions.filter(
      (tx) =>
        tx.transactionType?.toUpperCase() === "DEBIT" ||
        parseFloat(tx.amount) < 0
    );

    console.log("Debit transactions:", debitTransactions.length);

    // If timeframe filter is set to "all", return all transactions
    if (timeframe === "all") {
      return debitTransactions;
    }

    const { month, year } = getCurrentPeriod();

    const result = debitTransactions.filter((tx) => {
      if (!tx.date) return false;

      // Parse the date (handle both string and Date objects)
      const txDate = new Date(tx.date);

      // Skip invalid dates
      if (isNaN(txDate.getTime())) {
        return false;
      }

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

    console.log("After timeframe filtering:", result.length);

    // If no transactions match the timeframe filter, return all debit transactions
    if (result.length === 0) {
      return debitTransactions;
    }

    return result;
  }, [transactions, timeframe]); // Transform data for pie chart
  const { chartData, totalSpending, categories } = useMemo(() => {
    console.log("Chart useMemo running, loading:", loading);
    console.log(
      "Filtered transactions length:",
      timeframeFilteredTransactions?.length || 0
    );

    if (
      loading ||
      !Array.isArray(timeframeFilteredTransactions) ||
      timeframeFilteredTransactions.length === 0
    ) {
      console.log("Returning empty chart data");
      return {
        chartData: {
          labels: ["No Data"],
          datasets: [
            {
              data: [1],
              backgroundColor: ["#e2e8f0"],
              borderColor: ["#ffffff"],
              borderWidth: 1,
            },
          ],
        },
        totalSpending: 0,
        categories: [],
      };
    }

    // Group by category
    const categoryMap = {};
    timeframeFilteredTransactions.forEach((tx) => {
      const category = tx.category || "Uncategorized";
      if (!categoryMap[category]) {
        categoryMap[category] = 0;
      }
      categoryMap[category] += Math.abs(parseFloat(tx.amount) || 0);
    });

    // Sort categories by amount
    const sortedCategories = Object.entries(categoryMap)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);

    // Calculate total spending
    const totalSpending = sortedCategories.reduce(
      (total, item) => total + item.amount,
      0
    );

    // Limit to top categories and group smaller ones as "Others"
    const topCategories = sortedCategories.slice(0, 7);

    // If we have more than 7 categories, group the rest as "Others"
    const hasOthers = sortedCategories.length > 7;

    if (hasOthers) {
      const othersAmount = sortedCategories
        .slice(7)
        .reduce((total, item) => total + item.amount, 0);

      if (othersAmount > 0) {
        topCategories.push({ category: "Others", amount: othersAmount });
      }
    }

    // Format data for Chart.js
    const labels = topCategories.map((item) => item.category);
    const data = topCategories.map((item) => item.amount);
    const backgroundColors = CATEGORY_COLORS.slice(0, labels.length);

    return {
      chartData: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: backgroundColors,
            borderColor: Array(labels.length).fill("#ffffff"),
            borderWidth: 2,
            hoverOffset: 15,
            hoverBorderWidth: 3,
          },
        ],
      },
      totalSpending,
      categories: topCategories,
    };
  }, [timeframeFilteredTransactions, loading]);

  // Handle chart click for drill-down
  const handleChartClick = (event, elements) => {
    if (elements && elements.length > 0) {
      const clickedIndex = elements[0].index;
      const clickedCategory = chartData.labels[clickedIndex];
      setSelectedCategory(
        clickedCategory === selectedCategory ? null : clickedCategory
      );
    }
  };
  // Filter transactions for selected category (drill-down)
  const categoryFilteredTransactions = useMemo(() => {
    if (!selectedCategory) return [];

    if (selectedCategory === "Others") {
      // Get top 7 category names for exclusion
      const topCategoryNames = categories
        .filter((cat) => cat.category !== "Others")
        .map((cat) => cat.category);

      return transactions
        .filter((tx) => {
          // Include in "Others" if category not in top list
          const txCategory = tx.category || "Uncategorized";
          return (
            (tx.transactionType?.toUpperCase() === "DEBIT" || tx.amount < 0) &&
            !topCategoryNames.includes(txCategory)
          );
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
    } else {
      return transactions
        .filter((tx) => {
          const txCategory = tx.category || "Uncategorized";
          return (
            (tx.transactionType?.toUpperCase() === "DEBIT" || tx.amount < 0) &&
            txCategory === selectedCategory
          );
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
    }
  }, [selectedCategory, transactions, categories]);

  // Configure chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "65%", // Make the donut hole bigger for better visual
    onClick: handleChartClick,
    animation: {
      animateScale: true,
      animateRotate: true,
      duration: 500,
      easing: "easeOutQuart",
    },
    elements: {
      arc: {
        hoverBorderColor: "#ffffff",
      },
    },
    plugins: {
      legend: {
        display: totalSpending > 0,
        position: "bottom",
        labels: {
          color: "#6b7280",
          font: {
            size: window?.innerWidth < 640 ? 9 : 11,
            family:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          },
          boxWidth: 10,
          boxHeight: 10,
          padding: 8,
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        enabled: totalSpending > 0,
        backgroundColor: "#ffffff",
        titleColor: "#111827",
        bodyColor: "#4b5563",
        borderColor: "#e5e7eb",
        borderWidth: 1,
        padding: 8,
        boxPadding: 3,
        titleFont: { size: 11, weight: "bold" },
        bodyFont: { size: 10 },
        mode: "index",
        caretSize: 5,
        cornerRadius: 6,
        displayColors: true,
        boxWidth: 7,
        boxHeight: 7,
        callbacks: {
          title: (tooltipItems) => {
            return tooltipItems[0].label;
          },
          label: (context) => {
            const value = context.raw;
            const percentage =
              totalSpending > 0
                ? ((value / totalSpending) * 100).toFixed(1)
                : 0;
            return `${formatCurrency(value)} (${percentage}%)`;
          },
        },
      },
    },
  };

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
      <Card className="w-full h-full">
        {" "}
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <span className="text-lg sm:text-xl font-bold text-gray-800">
              Spending by Category
            </span>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors"
              >
                Back to All
              </button>
            )}
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-gray-500 flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <span className="mb-2 sm:mb-0">
              {selectedCategory
                ? `Showing top transactions in ${selectedCategory}`
                : "Distribution of your expenses"}
            </span>

            {!selectedCategory && (
              <div className="flex text-xs mt-1 sm:mt-0 space-x-1">
                <button
                  onClick={() => setTimeframe("all")}
                  className={`px-1.5 sm:px-2 py-1 rounded ${
                    timeframe === "all"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {" "}
                  All
                </button>
                <button
                  onClick={() => setTimeframe("monthly")}
                  className={`px-1.5 sm:px-2 py-1 rounded ${
                    timeframe === "monthly"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setTimeframe("quarterly")}
                  className={`px-1.5 sm:px-2 py-1 rounded ${
                    timeframe === "quarterly"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Q{Math.floor(getCurrentPeriod().month / 3) + 1}
                </button>
                <button
                  onClick={() => setTimeframe("yearly")}
                  className={`px-1.5 sm:px-2 py-1 rounded ${
                    timeframe === "yearly"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {getCurrentPeriod().year}
                </button>
              </div>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[calc(100%-90px)] overflow-hidden">
          {selectedCategory ? (
            <div className="h-full flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor:
                      CATEGORY_COLORS[
                        chartData.labels.findIndex(
                          (label) => label === selectedCategory
                        )
                      ],
                  }}
                ></div>
                <h3 className="text-sm font-medium text-gray-800">
                  {selectedCategory}
                </h3>
              </div>{" "}
              {categoryFilteredTransactions.length > 0 ? (
                <div className="grow overflow-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th className="px-3 py-2">Date</th>
                        <th className="px-3 py-2">Description</th>
                        <th className="px-3 py-2 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoryFilteredTransactions.map((tx, index) => (
                        <tr
                          key={index}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="px-3 py-2 whitespace-nowrap">
                            {new Date(tx.date).toLocaleDateString()}
                          </td>
                          <td className="px-3 py-2 max-w-[150px] truncate">
                            {tx.description || "No description"}
                          </td>
                          <td className="px-3 py-2 text-right text-red-600 whitespace-nowrap">
                            {formatCurrency(Math.abs(tx.amount))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="grow flex items-center justify-center text-gray-500">
                  No transactions found
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center">
              {totalSpending > 0 ? (
                <div className="h-[calc(100%-30px)] w-full max-w-[250px] mx-auto">
                  <Doughnut data={chartData} options={chartOptions} />
                </div>
              ) : (
                <div className="h-[calc(100%-30px)] w-full flex flex-col items-center justify-center">
                  <div className="rounded-full bg-gray-100 w-32 h-32 flex items-center justify-center mb-4">
                    <PieChart className="w-12 h-12 text-gray-300" />
                  </div>
                  <p className="text-sm text-gray-500 mb-1">
                    No spending data available
                  </p>
                  <p className="text-xs text-gray-400">
                    Try another time period or upload transactions
                  </p>
                </div>
              )}

              <div className="text-center mt-auto">
                <p className="text-sm text-gray-500">
                  Total Expenses:{" "}
                  <span className="font-semibold text-gray-700">
                    {totalSpending > 0
                      ? formatCurrency(totalSpending)
                      : "No data"}
                  </span>
                </p>
                {totalSpending > 0 && (
                  <p className="text-xs text-gray-400 mt-1">
                    Click on a segment to see details
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default CategorySpendingDonut;
