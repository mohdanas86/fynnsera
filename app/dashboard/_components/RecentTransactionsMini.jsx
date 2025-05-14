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

function RecentTransactionsMini({ transactions = [] }) {
  // Process and sort transactions
  const recentTransactions = useMemo(() => {
    if (!Array.isArray(transactions) || transactions.length === 0) {
      return [];
    }

    return [...transactions]
      .filter((tx) => tx.date && tx.amount && !isNaN(new Date(tx.date)))
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 7) // Show only the 7 most recent transactions
      .map((tx) => ({
        ...tx,
        icon: CATEGORY_ICONS[tx.category] || "📋",
        isCredit:
          tx.transactionType?.toUpperCase() === "CREDIT" || tx.amount > 0,
      }));
  }, [transactions]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.1,
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.3 },
    },
  };

  // Format date nicely
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if date is today
    if (date.toDateString() === now.toDateString()) {
      return "Today";
    }

    // Check if date is yesterday
    if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }

    // Otherwise return formatted date
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
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
            Recent Transactions
          </CardTitle>
          <CardDescription className="text-sm text-gray-500">
            Your latest financial activity
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-2 h-[calc(100%-80px)] overflow-hidden">
          {recentTransactions.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-500">No recent transactions</p>
            </div>
          ) : (
            <div className="h-full overflow-y-auto pr-2">
              <div className="space-y-3">
                {recentTransactions.map((tx, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
                    variants={itemVariants}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          tx.isCredit ? "bg-green-100" : "bg-red-100"
                        }`}
                      >
                        <span
                          className="text-base"
                          role="img"
                          aria-label={tx.category || "Transaction"}
                        >
                          {tx.icon}
                        </span>
                      </div>

                      <div className="flex flex-col">
                        <span className="font-medium text-gray-800 max-w-[160px] truncate">
                          {tx.description || "Unknown merchant"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(tx.date)} ·{" "}
                          {tx.category || "Uncategorized"}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`font-semibold ${
                        tx.isCredit ? "text-green-600" : "text-red-600"
                      } whitespace-nowrap`}
                    >
                      {tx.isCredit ? "+" : "-"}
                      {formatCurrency(Math.abs(tx.amount))}
                    </span>
                  </motion.div>
                ))}
              </div>

              <div className="mt-4 pt-2 text-center">
                <button className="text-sm text-blue-500 hover:text-blue-700 hover:underline transition-colors">
                  View All Transactions
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default RecentTransactionsMini;
