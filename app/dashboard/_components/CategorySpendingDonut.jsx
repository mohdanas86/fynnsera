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
  "#ef4444", // Red
  "#06b6d4", // Cyan
  "#6366f1", // Indigo
  "#d946ef", // Fuchsia
  "#84cc16", // Lime
  "#14b8a6", // Teal
  "#f97316", // Orange
];

function CategorySpendingDonut({ transactions = [] }) {
  // For drill-down functionality
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Transform data for pie chart
  const { chartData, totalSpending, categories } = useMemo(() => {
    // Filter for expense transactions only
    const expenses = transactions.filter(
      (tx) => tx.transactionType?.toUpperCase() === "DEBIT" || tx.amount < 0
    );

    // Group by category
    const categoryMap = {};
    expenses.forEach((tx) => {
      const category = tx.category || "Uncategorized";
      if (!categoryMap[category]) {
        categoryMap[category] = 0;
      }
      categoryMap[category] += Math.abs(tx.amount);
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
  }, [transactions]);

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
  const filteredTransactions = useMemo(() => {
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
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        labels: {
          color: "#6b7280",
          font: { size: 11 },
          boxWidth: 12,
          boxHeight: 12,
          padding: 10,
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        backgroundColor: "#ffffff",
        titleColor: "#111827",
        bodyColor: "#4b5563",
        borderColor: "#e5e7eb",
        borderWidth: 1,
        padding: 10,
        boxPadding: 4,
        titleFont: { size: 12, weight: "bold" },
        bodyFont: { size: 11 },
        mode: "index",
        caretSize: 6,
        cornerRadius: 6,
        displayColors: true,
        boxWidth: 8,
        boxHeight: 8,
        callbacks: {
          title: (tooltipItems) => {
            return tooltipItems[0].label;
          },
          label: (context) => {
            const value = context.raw;
            const percentage = ((value / totalSpending) * 100).toFixed(1);
            return `${formatCurrency(value)} (${percentage}%)`;
          },
        },
      },
    },
    // Enable onClick for drill-down
    onClick: handleChartClick,
    // Add hover effects
    elements: {
      arc: {
        hoverBorderColor: "#ffffff",
      },
    },
    // Animation settings for better visual feedback
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1200,
      easing: "easeOutQuart",
    },
    cutout: "65%",
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
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <span className="text-xl font-bold text-gray-800">
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
          <CardDescription className="text-sm text-gray-500">
            {selectedCategory
              ? `Showing top transactions in ${selectedCategory}`
              : "Distribution of your expenses"}
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
              </div>

              {filteredTransactions.length > 0 ? (
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
                      {filteredTransactions.map((tx, index) => (
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
              <div className="h-[calc(100%-30px)] w-full max-w-[250px] mx-auto">
                <Doughnut data={chartData} options={chartOptions} />
              </div>

              <div className="text-center mt-auto">
                <p className="text-sm text-gray-500">
                  Total Expenses:{" "}
                  <span className="font-semibold text-gray-700">
                    {formatCurrency(totalSpending)}
                  </span>
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Click on a segment to see details
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default CategorySpendingDonut;
