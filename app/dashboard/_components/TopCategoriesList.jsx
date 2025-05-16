"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { motion } from "framer-motion";
// import { TrendingUp, TrendingDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Format currency values consistently
const formatCurrency = (value) => {
  // Round the value to nearest integer
  const roundedValue = Math.round(value);
  if (roundedValue >= 1000000)
    return `₹${(roundedValue / 1000000).toFixed(1)}M`;
  if (roundedValue >= 1000) return `₹${(roundedValue / 1000).toFixed(1)}K`;
  return `₹${roundedValue}`;
};

// Category icons mapping using Lucide icons
import {
  ListFilter,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  ListChecks,
  ShoppingBag,
  Home,
  Car,
  Film,
  Plane,
  Heart,
  BookOpen,
  Phone,
  Scissors,
  BarChart3,
  Wallet,
  FileText,
  Package2,
  UtensilsCrossed,
} from "lucide-react";

const CATEGORY_ICONS = {
  "Food & Dining": UtensilsCrossed,
  Shopping: ShoppingBag,
  Housing: Home,
  Transportation: Car,
  Entertainment: Film,
  Travel: Plane,
  "Health & Fitness": Heart,
  Education: BookOpen,
  "Bills & Utilities": Phone,
  "Personal Care": Scissors,
  Investments: BarChart3,
  Income: Wallet,
  Uncategorized: FileText,
  Others: Package2,
};

// Category colors
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
  Investments: "#0891b2",
  Income: "#16a34a",
  Uncategorized: "#94a3b8",
  Others: "#64748b",
};

function TopCategoriesList({ transactions = [], isLoading = false }) {
  const [loading, setLoading] = useState(isLoading);
  const [sortBy, setSortBy] = useState("amount"); // amount, name, percentage
  const [sortDirection, setSortDirection] = useState("desc"); // asc, desc
  const [selectedCategory, setSelectedCategory] = useState(null);

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

  // Process transaction data for category breakdown
  const { categories, totalSpending, categorizedTransactions } = useMemo(() => {
    if (loading || !Array.isArray(transactions) || transactions.length === 0) {
      return {
        categories: [],
        totalSpending: 0,
        categorizedTransactions: {},
      };
    }

    // Filter for expense transactions only
    const expenses = transactions.filter(
      (tx) => tx.transactionType?.toUpperCase() === "DEBIT" || tx.amount < 0
    );

    // Group by category
    const categoryMap = {};
    const transactionsByCategory = {};

    expenses.forEach((tx) => {
      const category = tx.category || "Uncategorized";
      if (!categoryMap[category]) {
        categoryMap[category] = 0;
        transactionsByCategory[category] = [];
      }
      categoryMap[category] += Math.abs(tx.amount);
      transactionsByCategory[category].push(tx);
    });

    // Calculate total spending
    const totalSpending = Object.values(categoryMap).reduce(
      (sum, amount) => sum + amount,
      0
    ); // Transform to array and sort
    let sortedCategories = Object.entries(categoryMap).map(
      ([name, amount]) => ({
        name,
        amount,
        percentage: totalSpending > 0 ? (amount / totalSpending) * 100 : 0,
        color: CATEGORY_COLORS[name] || "#94a3b8",
        transactionCount: transactionsByCategory[name].length,
        averageTransaction: amount / (transactionsByCategory[name].length || 1),
      })
    );

    // Sort based on user preference
    if (sortBy === "amount") {
      sortedCategories = sortedCategories.sort((a, b) =>
        sortDirection === "desc" ? b.amount - a.amount : a.amount - b.amount
      );
    } else if (sortBy === "name") {
      sortedCategories = sortedCategories.sort((a, b) =>
        sortDirection === "desc"
          ? b.name.localeCompare(a.name)
          : a.name.localeCompare(b.name)
      );
    } else if (sortBy === "percentage") {
      sortedCategories = sortedCategories.sort((a, b) =>
        sortDirection === "desc"
          ? b.percentage - a.percentage
          : a.percentage - b.percentage
      );
    }

    // Take top 10 categories after sorting
    sortedCategories = sortedCategories.slice(0, 10);

    return {
      categories: sortedCategories,
      totalSpending,
      categorizedTransactions: transactionsByCategory,
    };
  }, [transactions, loading, sortBy, sortDirection]);

  // Handle sorting
  const handleSort = (field) => {
    if (sortBy === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // New field, default to descending
      setSortBy(field);
      setSortDirection("desc");
    }
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

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
      },
    }),
  };

  return (
    <motion.div
      className="w-full h-full"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <Card className="w-full h-full border-none shadow-md">
        {" "}
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg sm:text-xl font-semibold flex items-center gap-1 sm:gap-2">
                <ListChecks className="size-4 sm:size-5 text-violet-500" />
                Top Spending Categories
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {selectedCategory
                  ? `Transactions in ${selectedCategory}`
                  : "Where your money is going the most"}
              </CardDescription>
            </div>

            {selectedCategory ? (
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-xs px-2 py-1 rounded-md bg-violet-100 text-violet-700 hover:bg-violet-200 transition-colors"
              >
                Back to All
              </button>
            ) : (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleSort("amount")}
                  className={`p-1 rounded ${
                    sortBy === "amount"
                      ? "bg-violet-100 text-violet-700"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                  title="Sort by amount"
                >
                  <ArrowUpDown className="size-4" />
                </button>
                <button
                  onClick={() => handleSort("name")}
                  className={`p-1 rounded ${
                    sortBy === "name"
                      ? "bg-violet-100 text-violet-700"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                  title="Sort by name"
                >
                  <ListFilter className="size-4" />
                </button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-3 h-[calc(100%-90px)] overflow-hidden">
          {loading ? (
            <div className="space-y-3">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <ListChecks className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">
                  No category data available
                </p>
                <p className="text-gray-400 text-sm">
                  Add some transactions to see your spending categories
                </p>
              </div>
            </div>
          ) : selectedCategory ? (
            // Detailed view of selected category
            <div className="space-y-4 h-full flex flex-col">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                {" "}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                  style={{
                    backgroundColor:
                      CATEGORY_COLORS[selectedCategory] || "#94a3b8",
                  }}
                >
                  {React.createElement(
                    CATEGORY_ICONS[selectedCategory] || FileText,
                    { size: 18 }
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">
                    {selectedCategory}
                  </h3>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-600">
                      {formatCurrency(
                        categories.find((c) => c.name === selectedCategory)
                          ?.amount || 0
                      )}
                    </span>
                    <span className="text-gray-500">
                      {categories.find((c) => c.name === selectedCategory)
                        ?.transactionCount || 0}{" "}
                      transactions
                    </span>
                  </div>
                </div>
              </div>

              <div className="grow overflow-auto">
                <div className="text-xs font-medium text-gray-500 border-b pb-2 mb-2 flex px-3">
                  <div className="w-1/4">Date</div>
                  <div className="w-2/4">Description</div>
                  <div className="w-1/4 text-right">Amount</div>
                </div>

                <div className="space-y-1 pr-2">
                  {categorizedTransactions[selectedCategory]
                    ?.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
                    .slice(0, 10)
                    .map((tx, i) => (
                      <motion.div
                        key={i}
                        className="flex items-center rounded-lg p-2 hover:bg-gray-50 text-sm"
                        custom={i}
                        variants={itemVariants}
                      >
                        <div className="w-1/4 text-gray-600">
                          {new Date(tx.date).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                        <div className="w-2/4 text-gray-800 truncate">
                          {tx.description || "No description"}
                        </div>
                        <div className="w-1/4 text-right font-medium text-gray-800">
                          {formatCurrency(Math.abs(tx.amount))}
                        </div>
                      </motion.div>
                    ))}

                  {(categorizedTransactions[selectedCategory]?.length || 0) ===
                    0 && (
                    <div className="py-8 text-center text-gray-500">
                      No transactions found
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            // Main category list view
            <div className="h-full flex flex-col">
              {" "}
              <div className="grow overflow-auto pr-2">
                <div className="space-y-1 sm:space-y-2">
                  {categories.map((category, index) => (
                    <motion.div
                      key={category.name}
                      className="p-2 sm:p-3 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedCategory(category.name)}
                      custom={index}
                      variants={itemVariants}
                    >
                      <div className="flex items-center justify-between mb-1 sm:mb-2">
                        {" "}
                        <div className="flex items-center gap-1 sm:gap-2">
                          <span
                            className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-white"
                            style={{ backgroundColor: category.color }}
                          >
                            {React.createElement(
                              CATEGORY_ICONS[category.name] || FileText,
                              { size: 14, className: "sm:size-16" }
                            )}
                          </span>{" "}
                          <h3 className="font-medium text-gray-800 text-xs sm:text-sm">
                            {category.name}
                          </h3>
                        </div>
                        <span className="font-semibold text-gray-900 text-xs sm:text-sm">
                          {formatCurrency(category.amount)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <div className="h-1 sm:h-1.5 bg-gray-100 rounded-full flex-grow">
                          <div
                            className="h-1 sm:h-1.5 rounded-full"
                            style={{
                              width: `${category.percentage}%`,
                              backgroundColor: category.color,
                            }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium text-gray-500 min-w-[40px] text-right">
                          {category.percentage.toFixed(1)}%
                        </span>
                      </div>

                      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                        <span>{category.transactionCount} transactions</span>
                        <span>
                          Avg: {formatCurrency(category.averageTransaction)}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
              {/* Summary footer */}
              <div className="mt-3 pt-3 border-t text-center">
                <div className="text-sm text-gray-500">
                  Total Spending:{" "}
                  <span className="font-semibold text-gray-800">
                    {formatCurrency(totalSpending)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default TopCategoriesList;
