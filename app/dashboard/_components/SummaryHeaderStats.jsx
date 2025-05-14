"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  TrendingDown,
  DollarSign,
} from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import CountUp from "react-countup";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

// Helper function to format currency values consistently
const formatCurrency = (value) => {
  if (value >= 1000000) return `₹${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value}`;
};

// Animation variants for count-up effect
const countUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export default function SummaryHeaderStats({
  transactions = [],
  currentBalance = 0,
  isLoading = false,
}) {
  // Loading state
  const [loading, setLoading] = useState(isLoading);

  // Simulate loading state if needed for demo purposes
  useEffect(() => {
    setLoading(isLoading);

    if (isLoading) {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isLoading]); // Calculate this month's data
  const stats = useMemo(() => {
    if (loading || !transactions || transactions.length === 0) {
      return {
        currentBalance,
        credited: 0,
        debited: 0,
        netCashFlow: 0,
        spendingChange: 0,
        creditChange: 0,
        creditedVsLastMonth: 0,
        debitedVsLastMonth: 0,
        sparklineData: [0, 0, 0, 0, 0, 0],
      };
    }

    console.log("Processing transactions:", transactions.length);

    // Get current month and year (May 2025)
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    console.log(
      `Current date: ${now.toISOString()}, Month: ${currentMonth}, Year: ${currentYear}`
    );

    // Get last month
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear; // Filter transactions for current month
    const currentMonthTxs = transactions.filter((tx) => {
      if (!tx.date) return false;
      const txDate = new Date(tx.date);
      return (
        !isNaN(txDate) &&
        txDate.getMonth() === currentMonth &&
        txDate.getFullYear() === currentYear
      );
    });

    console.log(`Current month transactions found: ${currentMonthTxs.length}`);

    // If we don't have current month data, check if we have any transactions
    // and use the most recent month with data instead
    let monthWithData = {
      month: currentMonth,
      year: currentYear,
      transactions: currentMonthTxs,
    };

    if (currentMonthTxs.length === 0 && transactions.length > 0) {
      // Find most recent month with data
      const txDates = transactions
        .filter((tx) => tx.date)
        .map((tx) => new Date(tx.date))
        .filter((date) => !isNaN(date))
        .sort((a, b) => b - a); // Sort descending (newest first)

      if (txDates.length > 0) {
        const mostRecentDate = txDates[0];
        const recentMonth = mostRecentDate.getMonth();
        const recentYear = mostRecentDate.getFullYear();

        const recentMonthTxs = transactions.filter((tx) => {
          if (!tx.date) return false;
          const txDate = new Date(tx.date);
          return (
            !isNaN(txDate) &&
            txDate.getMonth() === recentMonth &&
            txDate.getFullYear() === recentYear
          );
        });

        monthWithData = {
          month: recentMonth,
          year: recentYear,
          transactions: recentMonthTxs,
        };

        console.log(
          `Using most recent month with data: ${recentMonth}/${recentYear}, transactions: ${recentMonthTxs.length}`
        );
      }
    } // Get previous month relative to our month with data
    const prevMonth = monthWithData.month === 0 ? 11 : monthWithData.month - 1;
    const prevMonthYear =
      monthWithData.month === 0 ? monthWithData.year - 1 : monthWithData.year;

    // Filter transactions for last month
    const lastMonthTxs = transactions.filter((tx) => {
      if (!tx.date) return false;
      const txDate = new Date(tx.date);
      return (
        !isNaN(txDate) &&
        txDate.getMonth() === prevMonth &&
        txDate.getFullYear() === prevMonthYear
      );
    });

    console.log(`Previous month transactions found: ${lastMonthTxs.length}`);

    // Calculate credited and debited amounts for current month
    const credited = monthWithData.transactions
      .filter((tx) => tx.transactionType?.toUpperCase() === "CREDIT")
      .reduce((total, tx) => total + (parseFloat(tx.amount) || 0), 0);

    const debited = monthWithData.transactions
      .filter((tx) => tx.transactionType?.toUpperCase() === "DEBIT")
      .reduce((total, tx) => total + (parseFloat(tx.amount) || 0), 0);

    console.log(`Current month - Credited: ${credited}, Debited: ${debited}`); // Calculate net cash flow for current month
    const netCashFlow = credited - debited;

    // Calculate last month's debited for comparison
    const lastMonthDebited = lastMonthTxs
      .filter((tx) => tx.transactionType?.toUpperCase() === "DEBIT")
      .reduce((total, tx) => total + (parseFloat(tx.amount) || 0), 0);

    // Calculate last month's credited for comparison
    const lastMonthCredited = lastMonthTxs
      .filter((tx) => tx.transactionType?.toUpperCase() === "CREDIT")
      .reduce((total, tx) => total + (parseFloat(tx.amount) || 0), 0);

    console.log(
      `Last month - Credited: ${lastMonthCredited}, Debited: ${lastMonthDebited}`
    );

    // Calculate spending change percentage
    let spendingChange = 0;
    if (lastMonthDebited > 0) {
      spendingChange = ((debited - lastMonthDebited) / lastMonthDebited) * 100;
    } else if (debited > 0) {
      // If last month was 0 but this month has value, show as 100% increase
      spendingChange = 100;
    }

    // Calculate credit change percentage
    let creditChange = 0;
    if (lastMonthCredited > 0) {
      creditChange = ((credited - lastMonthCredited) / lastMonthCredited) * 100;
    } else if (credited > 0) {
      // If last month was 0 but this month has value, show as 100% increase
      creditChange = 100;
    }
    // Generate sparkline data (last 6 months)
    const sparklineData = [];
    for (let i = 5; i >= 0; i--) {
      const monthOffset = i;
      const targetDate = new Date(
        monthWithData.year,
        monthWithData.month - monthOffset,
        1
      );
      const targetMonth = targetDate.getMonth();
      const targetYear = targetDate.getFullYear();

      const monthTxs = transactions.filter((tx) => {
        if (!tx.date) return false;
        const txDate = new Date(tx.date);
        return (
          !isNaN(txDate) &&
          txDate.getMonth() === targetMonth &&
          txDate.getFullYear() === targetYear
        );
      });

      const monthSpent = monthTxs
        .filter((tx) => tx.transactionType?.toUpperCase() === "DEBIT")
        .reduce((total, tx) => total + (parseFloat(tx.amount) || 0), 0);

      sparklineData.push(monthSpent > 0 ? monthSpent : 0);
    }

    console.log("Sparkline data:", sparklineData);

    return {
      currentBalance,
      credited,
      debited,
      netCashFlow,
      spendingChange,
      creditChange,
      creditedVsLastMonth: credited - lastMonthCredited,
      debitedVsLastMonth: debited - lastMonthDebited,
      sparklineData,
      dataMonth: monthWithData.month,
      dataYear: monthWithData.year,
    };
  }, [transactions, currentBalance, loading]);

  // Import sparkline component
  const Sparkline = React.lazy(() => import("@/components/ui/sparkline"));

  // Helper function to format month names
  const getMonthName = (monthIndex) => {
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
    return monthNames[monthIndex];
  };

  return (
    <TooltipProvider>
      <div className="w-full mb-8">
        {/* Period indicator */}
        {stats.credited > 0 || stats.debited > 0 ? (
          <p className="text-xs text-gray-500 mb-2">
            Showing data for: {getMonthName(stats.dataMonth)} {stats.dataYear}
          </p>
        ) : null}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Current Balance */}
          <motion.div
            className="col-span-1"
            initial="hidden"
            animate="visible"
            variants={countUpVariants}
          >
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-none shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                {loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-32" />
                  </div>
                ) : (
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        Current Balance
                      </p>
                      <div className="flex flex-col">
                        <p className="text-2xl font-bold text-blue-600">
                          <CountUp
                            end={stats.currentBalance}
                            prefix="₹"
                            separator=","
                            duration={1}
                            formattingFn={(value) => formatCurrency(value)}
                          />
                        </p>
                      </div>
                    </div>
                    <div className="bg-blue-100 p-2 rounded-full">
                      <DollarSign className="size-5 text-blue-600" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
          {/* This Month's Credited */}
          <motion.div
            className="col-span-1"
            initial="hidden"
            animate="visible"
            variants={countUpVariants}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-none shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                {loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-32" />
                  </div>
                ) : (
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        Month's Credited
                      </p>
                      <div className="flex items-center gap-2">
                        {" "}
                        <p className="text-2xl font-bold text-green-600">
                          {stats.credited > 0 ? (
                            <CountUp
                              end={stats.credited}
                              prefix="₹"
                              separator=","
                              duration={1}
                              formattingFn={(value) => formatCurrency(value)}
                            />
                          ) : (
                            formatCurrency(0)
                          )}
                        </p>{" "}
                        {stats.credited > 0 && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span
                                className={`text-xs font-medium ${
                                  stats.creditChange >= 0
                                    ? "text-green-600"
                                    : "text-rose-600"
                                }`}
                              >
                                {stats.creditChange > 0 ? "↑" : "↓"}
                                {Math.abs(stats.creditChange).toFixed(1)}%
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                              <p className="text-sm font-medium">
                                {stats.creditChange >= 0
                                  ? "Increased by"
                                  : "Decreased by"}{" "}
                                {formatCurrency(
                                  Math.abs(stats.creditedVsLastMonth)
                                )}{" "}
                                compared to last month
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                      {!loading && (
                        <div className="mt-2">
                          <React.Suspense
                            fallback={
                              <div className="h-5 w-20 bg-gray-100 rounded animate-pulse" />
                            }
                          >
                            <Sparkline
                              data={stats.sparklineData.map((v) => v * 0.1)}
                              color="#16a34a"
                              height={16}
                              width={60}
                            />
                          </React.Suspense>
                        </div>
                      )}
                    </div>
                    <div className="bg-green-100 p-2 rounded-full">
                      <ArrowUpRight className="size-5 text-green-600" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>{" "}
          {/* This Month's Debited */}
          <motion.div
            className="col-span-1"
            initial="hidden"
            animate="visible"
            variants={countUpVariants}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-r from-rose-50 to-pink-50 border-none shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                {loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-32" />
                  </div>
                ) : (
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        Month's Debited
                      </p>
                      <div className="flex items-center gap-2">
                        {" "}
                        <p className="text-2xl font-bold text-rose-600">
                          {stats.debited > 0 ? (
                            <CountUp
                              end={stats.debited}
                              prefix="₹"
                              separator=","
                              duration={1}
                              formattingFn={(value) => formatCurrency(value)}
                            />
                          ) : (
                            formatCurrency(0)
                          )}
                        </p>{" "}
                        {stats.debited > 0 && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span
                                className={`text-xs font-medium ${
                                  stats.spendingChange <= 0
                                    ? "text-green-600"
                                    : "text-rose-600"
                                }`}
                              >
                                {stats.spendingChange > 0 ? "↑" : "↓"}
                                {Math.abs(stats.spendingChange).toFixed(1)}%
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                              <p className="text-sm font-medium">
                                {stats.spendingChange >= 0
                                  ? "Increased by"
                                  : "Decreased by"}{" "}
                                {formatCurrency(
                                  Math.abs(stats.debitedVsLastMonth)
                                )}{" "}
                                compared to last month
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                      {!loading && (
                        <div className="mt-2">
                          <React.Suspense
                            fallback={
                              <div className="h-5 w-20 bg-gray-100 rounded animate-pulse" />
                            }
                          >
                            <Sparkline
                              data={stats.sparklineData}
                              color="#e11d48"
                              height={16}
                              width={60}
                            />
                          </React.Suspense>
                        </div>
                      )}
                    </div>
                    <div className="bg-rose-100 p-2 rounded-full">
                      <ArrowDownRight className="size-5 text-rose-600" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
          {/* Net Cash Flow */}
          <motion.div
            className="col-span-1"
            initial="hidden"
            animate="visible"
            variants={countUpVariants}
            transition={{ delay: 0.3 }}
          >
            <Card
              className={`bg-gradient-to-r ${
                stats.netCashFlow >= 0
                  ? "from-emerald-50 to-teal-50"
                  : "from-amber-50 to-orange-50"
              } border-none shadow-sm hover:shadow-md transition-shadow`}
            >
              <CardContent className="p-6">
                {loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-32" />
                  </div>
                ) : (
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        Net Cash Flow
                      </p>
                      <div className="flex items-center gap-2">
                        {" "}
                        <p
                          className={`text-2xl font-bold ${
                            stats.netCashFlow >= 0
                              ? "text-emerald-600"
                              : "text-amber-600"
                          }`}
                        >
                          {stats.netCashFlow !== 0 ? (
                            <CountUp
                              end={Math.abs(stats.netCashFlow)}
                              prefix="₹"
                              separator=","
                              duration={1.5}
                              formattingFn={(value) => formatCurrency(value)}
                            />
                          ) : (
                            formatCurrency(0)
                          )}
                        </p>
                        {stats.netCashFlow < 0 && (
                          <span className="text-amber-600 text-xs">↓</span>
                        )}
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        {stats.netCashFlow >= 0
                          ? "You're earning more than spending"
                          : "Your expenses exceed your income"}
                      </div>
                    </div>
                    <div
                      className={`p-2 rounded-full ${
                        stats.netCashFlow >= 0
                          ? "bg-emerald-100"
                          : "bg-amber-100"
                      }`}
                    >
                      {stats.netCashFlow >= 0 ? (
                        <TrendingUp
                          className={`size-5 ${
                            stats.netCashFlow >= 0
                              ? "text-emerald-600"
                              : "text-amber-600"
                          }`}
                        />
                      ) : (
                        <TrendingDown
                          className={`size-5 ${
                            stats.netCashFlow >= 0
                              ? "text-emerald-600"
                              : "text-amber-600"
                          }`}
                        />
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>{" "}
          {/* Spending Trend */}
          <motion.div
            className="col-span-2"
            initial="hidden"
            animate="visible"
            variants={countUpVariants}
            transition={{ delay: 0.4 }}
          >
            <Card
              className={`w-full bg-gradient-to-r ${
                stats.spendingChange <= 0
                  ? "from-blue-50 to-indigo-50"
                  : "from-amber-50 to-orange-50"
              } border-none shadow-sm hover:shadow-md transition-shadow`}
            >
              <CardContent className="p-6">
                {loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-32" />
                    <div className="flex space-x-2 mt-2">
                      <Skeleton className="h-20 w-20" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start">
                    <div className="w-full">
                      <p className="text-sm text-gray-600 mb-1">
                        Spending Trend
                      </p>
                      <div className="flex items-center gap-2">
                        <p
                          className={`text-2xl font-bold ${
                            stats.spendingChange <= 0
                              ? "text-blue-600"
                              : "text-amber-600"
                          }`}
                        >
                          {stats.spendingChange > 0 ? "+" : ""}
                          {Math.abs(stats.spendingChange).toFixed(1)}%
                        </p>
                        <span className="text-sm text-gray-600">
                          vs last month
                        </span>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="ml-2 cursor-help bg-gray-100 hover:bg-gray-200 p-1 rounded-full">
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <circle cx="12" cy="12" r="10"></circle>
                                <path d="M12 16v-4M12 8h.01"></path>
                              </svg>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="max-w-xs">
                            <div className="space-y-1">
                              <p className="font-medium text-sm">
                                Spending Comparison
                              </p>
                              <p className="text-xs text-gray-500">
                                This Month: {formatCurrency(stats.debited)}
                              </p>
                              <p className="text-xs text-gray-500">
                                Last Month:{" "}
                                {formatCurrency(
                                  stats.debited - stats.debitedVsLastMonth
                                )}
                              </p>
                              <p className="text-xs font-medium mt-1">
                                {stats.spendingChange <= 0
                                  ? "Great job saving money this month!"
                                  : "Spending has increased compared to last month."}
                              </p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </div>

                      <div className="mt-4 w-full">
                        <React.Suspense
                          fallback={
                            <div className="h-10 w-full bg-gray-100 rounded animate-pulse" />
                          }
                        >
                          <div className="relative h-10">
                            <Sparkline
                              data={stats.sparklineData.reverse()}
                              color={
                                stats.spendingChange <= 0
                                  ? "#2563eb"
                                  : "#d97706"
                              }
                              height={40}
                              width={200}
                            />
                            <div className="absolute bottom-0 left-0 text-[10px] text-gray-500">
                              6 months ago
                            </div>
                            <div className="absolute bottom-0 right-0 text-[10px] text-gray-500">
                              Current
                            </div>
                          </div>
                        </React.Suspense>
                      </div>
                    </div>
                    <div
                      className={`p-2 rounded-full ${
                        stats.spendingChange <= 0
                          ? "bg-blue-100"
                          : "bg-amber-100"
                      }`}
                    >
                      {stats.spendingChange <= 0 ? (
                        <TrendingDown className="size-5 text-blue-600" />
                      ) : (
                        <TrendingUp className="size-5 text-amber-600" />
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>{" "}
          </motion.div>
        </div>
      </div>
    </TooltipProvider>
  );
}
