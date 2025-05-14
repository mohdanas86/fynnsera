"use client";

import React, { useMemo } from "react";
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

// Category icons mapping
const CATEGORY_ICONS = {
  "Food & Dining": "🍕",
  Shopping: "🛍️",
  Housing: "🏠",
  Transportation: "🚗",
  Entertainment: "🎬",
  Travel: "✈️",
  "Health & Fitness": "🏥",
  Education: "📚",
  "Bills & Utilities": "📱",
  "Personal Care": "💇",
  Investments: "📈",
  Income: "💰",
  Uncategorized: "📋",
  Others: "📦",
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

function TopCategoriesList({ transactions = [] }) {
  // Process transaction data for category breakdown
  const { categories, totalSpending } = useMemo(() => {
    if (!Array.isArray(transactions) || transactions.length === 0) {
      return { categories: [], totalSpending: 0 };
    }

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

    // Calculate total spending
    const totalSpending = Object.values(categoryMap).reduce(
      (sum, amount) => sum + amount,
      0
    );

    // Transform to array and sort
    const sortedCategories = Object.entries(categoryMap)
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: totalSpending > 0 ? (amount / totalSpending) * 100 : 0,
        icon: CATEGORY_ICONS[name] || "📋",
        color: CATEGORY_COLORS[name] || "#94a3b8",
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10); // Top 10 categories

    return { categories: sortedCategories, totalSpending };
  }, [transactions]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.1,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.4 },
    },
  };

  const barVariants = {
    hidden: { width: 0, opacity: 0 },
    visible: (percentage) => ({
      width: `${percentage}%`,
      opacity: 1,
      transition: { duration: 0.7, ease: "easeOut" },
    }),
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
            Top Spending Categories
          </CardTitle>
          <CardDescription className="text-sm text-gray-500">
            Where your money goes
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-2 h-[calc(100%-80px)] overflow-hidden">
          {categories.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-500">No data available</p>
            </div>
          ) : (
            <div className="h-full overflow-y-auto pr-2">
              <div className="space-y-4">
                {categories.map((category) => (
                  <motion.div
                    key={category.name}
                    className="flex flex-col"
                    variants={itemVariants}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-lg"
                          role="img"
                          aria-label={category.name}
                        >
                          {category.icon}
                        </span>
                        <span className="font-medium text-gray-800">
                          {category.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-gray-800">
                          {formatCurrency(category.amount)}
                        </span>
                        <span className="text-sm text-gray-500 ml-1">
                          ({category.percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <motion.div
                        className="h-2 rounded-full"
                        style={{ backgroundColor: category.color }}
                        variants={barVariants}
                        custom={Math.min(category.percentage, 100)}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">
                    Total Spending
                  </span>
                  <span className="font-bold text-gray-800">
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
