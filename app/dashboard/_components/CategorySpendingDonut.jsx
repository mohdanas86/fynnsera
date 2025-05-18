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
import { PieChart } from "lucide-react";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const formatCurrency = (value) => {
  const roundedValue = Math.round(value);
  if (roundedValue >= 1000000)
    return `₹${(roundedValue / 1000000).toFixed(1)}M`;
  if (roundedValue >= 1000) return `₹${(roundedValue / 1000).toFixed(1)}K`;
  return `₹${roundedValue}`;
};

const CATEGORY_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#ef4444",
  "#06b6d4",
  "#6366f1",
  "#d946ef",
  "#84cc16",
  "#14b8a6",
  "#f97316",
];

function CategorySpendingDonut({ transactions = [], isLoading = false }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [timeframe, setTimeframe] = useState("all");
  const [loading, setLoading] = useState(isLoading);

  React.useEffect(() => {
    setLoading(isLoading);
    if (isLoading) {
      const timer = setTimeout(() => setLoading(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  const getCurrentPeriod = () => {
    const now = new Date();
    return { month: now.getMonth(), year: now.getFullYear() };
  };

  const timeframeFilteredTransactions = useMemo(() => {
    if (!Array.isArray(transactions) || transactions.length === 0) return [];

    const debitTransactions = transactions.filter(
      (tx) =>
        tx.transactionType?.toUpperCase() === "DEBIT" ||
        parseFloat(tx.amount) < 0
    );

    if (timeframe === "all") return debitTransactions;

    const { month, year } = getCurrentPeriod();

    const result = debitTransactions.filter((tx) => {
      if (!tx.date) return false;
      const txDate = new Date(tx.date);
      if (isNaN(txDate.getTime())) return false;

      if (timeframe === "yearly") return txDate.getFullYear() === year;
      if (timeframe === "quarterly") {
        const txQuarter = Math.floor(txDate.getMonth() / 3);
        const currentQuarter = Math.floor(month / 3);
        return txDate.getFullYear() === year && txQuarter === currentQuarter;
      }
      return txDate.getMonth() === month && txDate.getFullYear() === year;
    });

    return result.length === 0 ? debitTransactions : result;
  }, [transactions, timeframe]);

  const { chartData, totalSpending, categories } = useMemo(() => {
    if (
      loading ||
      !Array.isArray(timeframeFilteredTransactions) ||
      timeframeFilteredTransactions.length === 0
    ) {
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

    const categoryMap = {};
    timeframeFilteredTransactions.forEach((tx) => {
      const category = tx.category || "Uncategorized";
      if (!categoryMap[category]) categoryMap[category] = 0;
      categoryMap[category] += Math.abs(parseFloat(tx.amount) || 0);
    });

    const sortedCategories = Object.entries(categoryMap)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);

    const totalSpending = sortedCategories.reduce(
      (total, item) => total + item.amount,
      0
    );

    const topCategories = sortedCategories.slice(0, 7);
    const hasOthers = sortedCategories.length > 7;

    if (hasOthers) {
      const othersAmount = sortedCategories
        .slice(7)
        .reduce((total, item) => total + item.amount, 0);
      if (othersAmount > 0)
        topCategories.push({ category: "Others", amount: othersAmount });
    }

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

  const handleChartClick = (event, elements) => {
    if (elements?.length > 0) {
      const clickedIndex = elements[0].index;
      const clickedCategory = chartData.labels[clickedIndex];
      setSelectedCategory(
        clickedCategory === selectedCategory ? null : clickedCategory
      );
    }
  };

  const categoryFilteredTransactions = useMemo(() => {
    if (!selectedCategory) return [];

    if (selectedCategory === "Others") {
      const topCategoryNames = categories
        .filter((cat) => cat.category !== "Others")
        .map((cat) => cat.category);

      return transactions
        .filter((tx) => {
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

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "65%",
    onClick: handleChartClick,
    animation: {
      animateScale: true,
      animateRotate: true,
      duration: 500,
      easing: "easeOutQuart",
    },
    plugins: {
      legend: {
        display: totalSpending > 0,
        position: "bottom",
        labels: {
          color: "#6b7280",
          font: {
            size:
              typeof window !== "undefined" && window.innerWidth < 640 ? 9 : 11,
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
        callbacks: {
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
    visible: { opacity: 1, transition: { duration: 0.4 } },
  };

  return (
    <motion.div
      className="w-full h-full"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <Card className="w-full h-full border-0 shadow-none lg:border lg:bg-white bg-transparent">
        <CardHeader className="pb-2 lg:px-4 px-2">
          <CardTitle className="flex justify-between items-center text-lg">
            Spending by Category
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200"
              >
                Back
              </button>
            )}
          </CardTitle>
          <CardDescription className="text-sm text-gray-500 flex flex-wrap justify-between gap-2 mt-1">
            {selectedCategory ? (
              `Showing top transactions in ${selectedCategory}`
            ) : (
              <>
                <span>Distribution of your expenses</span>
                <div className="flex gap-1">
                  {["all", "monthly", "quarterly", "yearly"].map((key) => (
                    <button
                      key={key}
                      onClick={() => setTimeframe(key)}
                      className={`px-2 py-1 rounded text-xs ${
                        timeframe === key
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {key === "quarterly"
                        ? `Q${Math.floor(getCurrentPeriod().month / 3) + 1}`
                        : key === "yearly"
                        ? getCurrentPeriod().year
                        : key[0].toUpperCase() + key.slice(1)}
                    </button>
                  ))}
                </div>
              </>
            )}
          </CardDescription>
        </CardHeader>

        <CardContent className="h-[calc(100%-90px)] lg:px-4 px-2 pb-4 flex flex-col">
          {selectedCategory ? (
            categoryFilteredTransactions.length > 0 ? (
              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs bg-gray-50 text-gray-700">
                    <tr>
                      <th className="p-2">Date</th>
                      <th className="p-2">Description</th>
                      <th className="p-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryFilteredTransactions.map((tx, i) => (
                      <tr key={i} className="border-b hover:bg-gray-50">
                        <td className="p-2">
                          {new Date(tx.date).toLocaleDateString()}
                        </td>
                        <td className="p-2 truncate max-w-[150px]">
                          {tx.description || "No description"}
                        </td>
                        <td className="p-2 text-right text-red-600">
                          {formatCurrency(Math.abs(tx.amount))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex-grow flex items-center justify-center text-gray-500">
                No transactions found
              </div>
            )
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center">
              {totalSpending > 0 ? (
                <div className="w-full max-w-[260px] h-[200px] sm:h-[280px] lg:h-[250px] relative">
                  <Doughnut data={chartData} options={chartOptions} />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <div className="rounded-full bg-gray-100 w-28 h-28 flex items-center justify-center mb-4">
                    <PieChart className="w-10 h-10 text-gray-300" />
                  </div>
                  <p className="text-sm text-gray-500">
                    No spending data available
                  </p>
                </div>
              )}
              <div className="text-center mt-4">
                <p className="text-sm text-gray-600">
                  Total Expenses:{" "}
                  <span className="font-semibold text-gray-800">
                    {totalSpending > 0
                      ? formatCurrency(totalSpending)
                      : "No data"}
                  </span>
                </p>
                {totalSpending > 0 && (
                  <p className="text-xs text-gray-400">
                    Click on a segment to drill down
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
