"use client";

import React, { useMemo, useState, useCallback } from "react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  UtensilsCrossed,
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
  ArrowDownRight,
  ArrowUpRight,
  ChevronRight,
} from "lucide-react";
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

// Category icons mapping
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

function RecentTransactionsMini({ transactions = [], isLoading = false }) {
  // State to track which transaction has tooltip visible
  const [activeTooltipIndex, setActiveTooltipIndex] = useState(null);

  // Tooltip position adjustment for small screens
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  // Event handler for window resize
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  // Memoized tooltip position style
  const getTooltipStyle = useCallback(
    (index) => {
      // For small screens, position tooltip above the item
      if (windowWidth < 768) {
        return {
          width: windowWidth < 400 ? "230px" : "260px",
          bottom: "100%",
          left: "50%",
          transform: "translateX(-50%) translateY(-8px)",
          maxHeight: "50vh",
          overflowY: "auto",
        };
      }

      // For larger screens, position to the right
      return {
        width: "260px",
        top: "0",
        right: "-8px",
        transform: "translateX(100%)",
        maxHeight: "90vh",
        overflowY: "auto",
      };
    },
    [windowWidth]
  );

  // Function to handle mouse leave
  const handleMouseLeave = useCallback(() => {
    setActiveTooltipIndex(null);
  }, []);

  // Function to handle mouse enter
  const handleMouseEnter = useCallback((index) => {
    setActiveTooltipIndex(index);
  }, []);

  // Format transaction time (for tooltip or expanded view)
  const formatTransactionTime = useCallback((dateString) => {
    const date = new Date(dateString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "pm" : "am";
    const formattedHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  }, []);

  // Format date nicely
  const formatDate = useCallback((dateString) => {
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
  }, []);

  // Process and sort transactions
  const recentTransactions = useMemo(() => {
    if (
      isLoading ||
      !Array.isArray(transactions) ||
      transactions.length === 0
    ) {
      return [];
    }

    return [...transactions]
      .filter((tx) => tx.date && tx.amount && !isNaN(new Date(tx.date)))
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 7) // Show only the 7 most recent transactions
      .map((tx) => {
        // Parse transactionType correctly, ensuring proper credit/debit identification
        let isCredit = false;

        // Check transaction type first (most reliable)
        if (tx.transactionType) {
          isCredit = tx.transactionType.toUpperCase() === "CREDIT";
        }
        // If no transaction type, use amount sign as fallback
        else {
          isCredit = parseFloat(tx.amount) > 0;
        }

        return {
          ...tx,
          isCredit,
          formattedTime: formatTransactionTime(tx.date),
        };
      });
  }, [transactions, isLoading, formatTransactionTime]);

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

  return (
    <motion.div
      className="w-full h-full"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {" "}
      <Card className="w-full h-full bg-[#262626] border-[#606060]">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg sm:text-xl font-bold text-white">
            Recent Transactions
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-gray-50">
            Your latest financial activity
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2 h-[calc(100%-80px)]">
          {isLoading ? (
            // Loading skeleton
            <div className="space-y-3">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="flex items-center gap-3 p-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-5 w-16" />
                </div>
              ))}
            </div>
          ) : recentTransactions.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Wallet size={24} className="text-gray-400" />
              </div>
              <p className="text-gray-500 mb-2">No recent transactions</p>
              <p className="text-xs text-gray-400 text-center max-w-[200px]">
                Start adding transactions to track your financial activity
              </p>
            </div>
          ) : (
            <div
              className="h-full overflow-y-auto pr-1 sm:pr-2 relative"
              style={{ position: "relative", zIndex: 0 }}
            >
              {/* Fade shadow at the bottom to indicate scroll */}
              <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white to-transparent pointer-events-none z-10"></div>
              <div className="space-y-2 sm:space-y-3 pb-10">
                {recentTransactions.map((tx, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center justify-between p-2 sm:p-3 rounded-lg border border-gray-100 bg-white hover:bg-gray-50 cursor-pointer transition-colors relative group"
                    variants={itemVariants}
                    onMouseEnter={() => handleMouseEnter(index)}
                    onMouseLeave={handleMouseLeave}
                  >
                    {" "}
                    {/* Transaction details tooltip on hover - absolute position */}
                    {activeTooltipIndex === index && (
                      <div
                        className="absolute bg-white p-2 sm:p-3 rounded-lg shadow-lg border border-gray-200 z-[100]"
                        style={getTooltipStyle(index)}
                      >
                        {/* Pointer triangle - conditionally rendered based on screen size */}
                        {windowWidth >= 768 ? (
                          <div className="absolute w-4 h-4 bg-white border-l border-t border-gray-200 transform -rotate-45 -left-2 top-6"></div>
                        ) : (
                          <div className="absolute w-4 h-4 bg-white border-l border-t border-gray-200 transform rotate-45 bottom-[-8px] left-1/2 ml-[-4px]"></div>
                        )}

                        <div className="relative z-10">
                          {" "}
                          <div className="text-xs sm:text-sm font-medium text-gray-800 mb-1">
                            {new Date(tx.date).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-700 mb-2">
                            {tx.formattedTime}
                          </div>
                          <div className="flex items-center mb-2">
                            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center bg-gray-100 mr-2">
                              {React.createElement(
                                CATEGORY_ICONS[tx.category] || FileText,
                                { size: windowWidth < 640 ? 12 : 14 }
                              )}
                            </div>
                            <span className="text-xs sm:text-sm font-medium">
                              {tx.category || "Uncategorized"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-gray-500">Type</span>
                            <span
                              className={`text-xs font-medium ${
                                tx.isCredit ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {tx.isCredit ? "CREDIT" : "DEBIT"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-gray-500">
                              Amount
                            </span>
                            <span
                              className={`text-sm font-medium ${
                                tx.isCredit ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {tx.isCredit ? "+" : "-"}₹
                              {Math.abs(parseFloat(tx.amount)).toLocaleString(
                                "en-IN",
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }
                              )}
                            </span>
                          </div>{" "}
                          {tx.description && (
                            <div className="border-t border-gray-100 pt-2 mt-1">
                              <span className="text-xs text-gray-500">
                                Description
                              </span>
                              <p className="text-xs sm:text-sm text-gray-800 mt-1 break-words">
                                {tx.description}
                              </p>
                            </div>
                          )}
                          {tx.transactionId && (
                            <div className="text-xs text-gray-500 mt-2 border-t border-gray-100 pt-2">
                              <span className="text-gray-400">
                                Transaction ID:
                              </span>
                              <div className="font-mono bg-gray-50 p-1 rounded mt-1 text-[10px] break-all">
                                {tx.transactionId}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}{" "}
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="relative">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-gray-100">
                          {React.createElement(
                            CATEGORY_ICONS[tx.category] || FileText,
                            {
                              size: windowWidth < 640 ? 16 : 18,
                              className: "text-gray-700",
                            }
                          )}
                        </div>{" "}
                        <div
                          className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center absolute -bottom-1 -right-1 shadow-sm ${
                            tx.isCredit
                              ? "bg-green-100 text-green-600"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {tx.isCredit ? (
                            <ArrowUpRight size={windowWidth < 640 ? 10 : 12} />
                          ) : (
                            <ArrowDownRight
                              size={windowWidth < 640 ? 10 : 12}
                            />
                          )}
                        </div>
                      </div>{" "}
                      <div className="flex flex-col">
                        <span className="text-sm sm:font-medium text-gray-800 max-w-[120px] sm:max-w-[160px] truncate">
                          {tx.description || "Unknown merchant"}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] sm:text-xs flex-wrap">
                          <span className="text-gray-500">
                            {formatDate(tx.date)}
                          </span>
                          <span className="text-gray-400 hidden xs:inline-block">
                            •
                          </span>
                          <span className="text-gray-500 hidden xs:inline-block">
                            {tx.formattedTime}
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-500 truncate max-w-[80px] sm:max-w-none">
                            {tx.category || "Uncategorized"}
                          </span>
                        </div>{" "}
                        {tx.transactionId && (
                          <span className="text-[10px] sm:text-xs text-gray-400 hidden group-hover:inline-block mt-0.5 truncate max-w-[120px] sm:max-w-[160px]">
                            ID: {tx.transactionId.substring(0, 8)}...
                          </span>
                        )}
                      </div>
                    </div>{" "}
                    <span
                      className={`text-sm sm:text-base font-semibold ${
                        tx.isCredit ? "text-green-600" : "text-red-600"
                      } whitespace-nowrap`}
                    >
                      {tx.isCredit ? "+" : "-"}
                      {formatCurrency(Math.abs(parseFloat(tx.amount)))}
                    </span>
                  </motion.div>
                ))}
              </div>{" "}
              <div className="mt-4 pt-2 text-center">
                <Link
                  href="/dashboard/transactions"
                  className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors flex items-center justify-center mx-auto"
                >
                  View All Transactions
                  <ChevronRight
                    size={windowWidth < 640 ? 14 : 16}
                    className="ml-1"
                  />
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default RecentTransactionsMini;
