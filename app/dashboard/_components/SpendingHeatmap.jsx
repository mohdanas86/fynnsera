"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Info,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip } from "@/components/ui/tooltip";

// Format currency values consistently
const formatCurrency = (value) => {
  // First round the value to nearest integer
  const roundedValue = Math.round(value);

  if (roundedValue >= 1000000)
    return `₹${(roundedValue / 1000000).toFixed(1)}M`;
  if (roundedValue >= 1000) return `₹${(roundedValue / 1000).toFixed(1)}K`;
  return `₹${roundedValue}`;
};

function SpendingHeatmap({ transactions = [], isLoading = false }) {
  const [loading, setLoading] = useState(isLoading);
  const [currentMonth, setCurrentMonth] = useState(() => {
    // Default to current month
    const now = new Date();
    return `${now.getMonth() + 1}-${now.getFullYear()}`;
  });
  const [selectedDay, setSelectedDay] = useState(null);

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

  // Navigate to previous month
  const goToPreviousMonth = () => {
    const [month, year] = currentMonth.split("-").map(Number);
    const newMonth = month === 1 ? 12 : month - 1;
    const newYear = month === 1 ? year - 1 : year;
    setCurrentMonth(`${newMonth}-${newYear}`);
    setSelectedDay(null);
  };

  // Navigate to next month
  const goToNextMonth = () => {
    const [month, year] = currentMonth.split("-").map(Number);
    const newMonth = month === 12 ? 1 : month + 1;
    const newYear = month === 12 ? year + 1 : year;
    setCurrentMonth(`${newMonth}-${newYear}`);
    setSelectedDay(null);
  };

  // Process transaction data for the heatmap
  const {
    daysInMonth,
    monthName,
    year,
    calendarData,
    maxSpending,
    totalMonthSpending,
    totalMonthSpendingLastMonth,
    monthOverMonthChange,
    avgDailySpend,
    highestSpendingDay,
    lowestSpendingDay,
    dayOfWeekSpending,
  } = useMemo(() => {
    if (loading || !Array.isArray(transactions) || transactions.length === 0) {
      return {
        daysInMonth: 31,
        monthName: "Month",
        year: 2023,
        calendarData: [],
        maxSpending: 0,
        totalMonthSpending: 0,
        totalMonthSpendingLastMonth: 0,
        monthOverMonthChange: 0,
        avgDailySpend: 0,
        highestSpendingDay: null,
        lowestSpendingDay: null,
        dayOfWeekSpending: [],
      };
    }

    // Parse the selected month-year
    const [month, year] = currentMonth.split("-").map(Number);

    // Get month details
    const firstDayOfMonth = new Date(year, month - 1, 1);
    const lastDayOfMonth = new Date(year, month, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const monthName = firstDayOfMonth.toLocaleString("default", {
      month: "long",
    });

    // Current month
    const currentMonthStart = new Date(year, month - 1, 1).getTime();
    const currentMonthEnd = new Date(year, month, 0, 23, 59, 59).getTime();

    // Last month
    const lastMonthStart = new Date(
      month === 1 ? year - 1 : year,
      month === 1 ? 11 : month - 2,
      1
    ).getTime();
    const lastMonthEnd = new Date(
      month === 1 ? year - 1 : year,
      month === 1 ? 12 : month - 1,
      0,
      23,
      59,
      59
    ).getTime();

    // Filter transactions for the current and last month
    const currentMonthTransactions = transactions.filter((tx) => {
      if (!tx.date) return false;
      const txDate = new Date(tx.date).getTime();
      return (
        txDate >= currentMonthStart &&
        txDate <= currentMonthEnd &&
        (tx.transactionType?.toUpperCase() === "DEBIT" || tx.amount < 0)
      );
    });

    const lastMonthTransactions = transactions.filter((tx) => {
      if (!tx.date) return false;
      const txDate = new Date(tx.date).getTime();
      return (
        txDate >= lastMonthStart &&
        txDate <= lastMonthEnd &&
        (tx.transactionType?.toUpperCase() === "DEBIT" || tx.amount < 0)
      );
    });

    // Group spending by day for current month
    const dailySpending = {};
    let maxSpending = 0;
    let totalMonthSpending = 0;
    let totalMonthSpendingLastMonth = 0;

    // Initialize all days of month with zero spending
    for (let day = 1; day <= daysInMonth; day++) {
      dailySpending[day] = {
        day,
        date: new Date(year, month - 1, day),
        spending: 0,
        transactions: [],
      };
    }

    // Fill with actual spending data
    currentMonthTransactions.forEach((tx) => {
      const txDate = new Date(tx.date);
      const day = txDate.getDate();
      const amount = Math.abs(tx.amount);

      dailySpending[day].spending += amount;
      dailySpending[day].transactions.push(tx);

      totalMonthSpending += amount;
      maxSpending = Math.max(maxSpending, dailySpending[day].spending);
    });

    // Calculate last month's total
    lastMonthTransactions.forEach((tx) => {
      totalMonthSpendingLastMonth += Math.abs(tx.amount);
    });

    // Calculate month-over-month change
    const monthOverMonthChange =
      totalMonthSpendingLastMonth === 0
        ? 100
        : ((totalMonthSpending - totalMonthSpendingLastMonth) /
            totalMonthSpendingLastMonth) *
          100; // Calculate average daily spend (only for days with spending)
    const daysWithSpending = Object.values(dailySpending).filter(
      (day) => day.spending > 0
    ).length;
    const avgDailySpend =
      daysWithSpending > 0
        ? Math.round(totalMonthSpending / daysWithSpending)
        : 0;

    // Find highest and lowest spending days
    let highestSpendingDay = null;
    let lowestSpendingDay = null;

    Object.values(dailySpending).forEach((dayData) => {
      if (dayData.spending > 0) {
        if (
          !highestSpendingDay ||
          dayData.spending > highestSpendingDay.spending
        ) {
          highestSpendingDay = dayData;
        }

        if (
          !lowestSpendingDay ||
          dayData.spending < lowestSpendingDay.spending
        ) {
          lowestSpendingDay = dayData;
        }
      }
    });

    // Calculate spending by day of week
    const dayOfWeekSpending = [0, 0, 0, 0, 0, 0, 0]; // Sun, Mon, ... Sat
    const dayOfWeekCount = [0, 0, 0, 0, 0, 0, 0];

    Object.values(dailySpending).forEach((dayData) => {
      if (dayData.spending > 0) {
        const dayOfWeek = dayData.date.getDay();
        dayOfWeekSpending[dayOfWeek] += dayData.spending;
        dayOfWeekCount[dayOfWeek]++;
      }
    });

    // Calculate average per day of week
    const dayOfWeekAvg = dayOfWeekSpending.map((total, i) =>
      dayOfWeekCount[i] > 0 ? total / dayOfWeekCount[i] : 0
    );

    // Find the highest spending day of week
    const maxDayOfWeekSpending = Math.max(...dayOfWeekAvg);

    // Create calendar data array with all days
    const calendarData = [];
    const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Add empty cells for days before the 1st of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      calendarData.push({ isEmpty: true });
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayData = dailySpending[day];
      const intensity = maxSpending > 0 ? dayData.spending / maxSpending : 0;
      const colorIntensity = Math.min(Math.floor(intensity * 9), 8); // 0-8 scale for heat intensity

      calendarData.push({
        isEmpty: false,
        day,
        spending: dayData.spending,
        intensity: colorIntensity,
        transactions: dayData.transactions,
        date: new Date(year, month - 1, day),
      });
    }

    // Generate day of week insights
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayOfWeekInsights = dayOfWeekAvg.map((avg, i) => ({
      day: dayNames[i],
      average: avg,
      percentage:
        maxDayOfWeekSpending > 0 ? (avg / maxDayOfWeekSpending) * 100 : 0,
    }));

    return {
      daysInMonth,
      monthName,
      year,
      calendarData,
      maxSpending,
      totalMonthSpending,
      totalMonthSpendingLastMonth,
      monthOverMonthChange,
      avgDailySpend,
      highestSpendingDay,
      lowestSpendingDay,
      dayOfWeekSpending: dayOfWeekInsights,
    };
  }, [transactions, currentMonth, loading]);

  // Color scale for heat intensity (from light to dark)
  const getHeatmapColor = (intensity) => {
    const colors = [
      "bg-teal-50", // 0 - No spending
      "bg-teal-100", // 1 - Very low spending
      "bg-teal-200", // 2
      "bg-teal-300", // 3
      "bg-teal-400", // 4
      "bg-teal-500", // 5
      "bg-teal-600", // 6
      "bg-teal-700", // 7
      "bg-teal-800", // 8 - Highest spending
    ];
    return colors[intensity];
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

  const calendarVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.2,
        duration: 0.5,
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
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Calendar className="size-5 text-teal-500" />
                Spending Heatmap
              </CardTitle>
              <CardDescription>
                See your daily spending patterns
              </CardDescription>
            </div>

            {/* Month navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={goToPreviousMonth}
                className="p-1 rounded-full hover:bg-gray-100"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-5 h-5 text-gray-500" />
              </button>
              <span className="text-sm font-medium text-gray-700">
                {monthName} {year}
              </span>
              <button
                onClick={goToNextMonth}
                className="p-1 rounded-full hover:bg-gray-100"
                aria-label="Next month"
              >
                <ChevronRight className="w-5 h-5 text-gray-500" />
              </button>
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
          ) : calendarData.length === 0 ? (
            <div className="h-full w-full flex items-center justify-center">
              <div className="text-center">
                <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">
                  No spending data available
                </p>
                <p className="text-gray-400 text-sm">
                  Add some transactions to see your spending patterns
                </p>
              </div>
            </div>
          ) : (
            <div className="h-full w-full flex flex-col">
              {/* Summary metrics */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="p-3 bg-teal-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">
                    Monthly Total
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(totalMonthSpending)}
                    </p>
                    <div
                      className={`flex items-center gap-0.5 text-xs font-medium ${
                        monthOverMonthChange > 0
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {monthOverMonthChange > 0 ? (
                        <ArrowUpRight className="size-3" />
                      ) : (
                        <ArrowDownRight className="size-3" />
                      )}
                      {Math.abs(monthOverMonthChange).toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-teal-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">
                    Avg Daily Spend
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(avgDailySpend)}
                  </p>
                </div>

                <div className="p-3 bg-teal-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Highest Day</div>
                  <p className="text-lg font-bold text-gray-900">
                    {highestSpendingDay
                      ? formatCurrency(highestSpendingDay.spending)
                      : "₹0"}
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 h-[calc(100%-80px)]">
                {/* Calendar */}
                <motion.div
                  className="w-full md:w-3/5"
                  variants={calendarVariants}
                >
                  {/* Day labels (S, M, T, etc.) */}
                  <div className="grid grid-cols-7 mb-2">
                    {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                      <div
                        key={index}
                        className="h-8 flex items-center justify-center text-sm font-medium text-gray-500"
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar grid */}
                  <div className="grid grid-cols-7 gap-1.5">
                    {calendarData.map((day, index) => {
                      if (day.isEmpty) {
                        return (
                          <div
                            key={`empty-${index}`}
                            className="h-12 rounded-md bg-transparent"
                          ></div>
                        );
                      }

                      return (
                        <div
                          key={`day-${day.day}`}
                          className={`h-12 p-1 rounded-md flex flex-col justify-between ${getHeatmapColor(
                            day.intensity
                          )} cursor-pointer hover:ring-1 hover:ring-teal-600 transition-all
                            ${
                              selectedDay?.day === day.day
                                ? "ring-2 ring-teal-600"
                                : ""
                            }
                          `}
                          onClick={() => setSelectedDay(day)}
                        >
                          <span className="text-xs font-medium text-gray-700">
                            {day.day}
                          </span>
                          {day.spending > 0 && (
                            <span
                              className={`text-xs font-semibold ${
                                day.intensity > 5
                                  ? "text-white"
                                  : "text-gray-800"
                              }`}
                            >
                              {formatCurrency(day.spending)}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-sm bg-teal-50"></div>
                      <span className="text-xs text-gray-500">No spending</span>
                    </div>
                    <div className="flex gap-1">
                      <div className="w-3 h-3 rounded-sm bg-teal-200"></div>
                      <div className="w-3 h-3 rounded-sm bg-teal-400"></div>
                      <div className="w-3 h-3 rounded-sm bg-teal-600"></div>
                      <div className="w-3 h-3 rounded-sm bg-teal-800"></div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-sm bg-teal-800"></div>
                      <span className="text-xs text-gray-500">
                        High spending
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Details Section */}
                <div className="w-full md:w-2/5 flex flex-col">
                  {selectedDay ? (
                    // Transactions for selected day
                    <div className="h-full flex flex-col border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-medium text-gray-800">
                          {selectedDay.date.toLocaleDateString(undefined, {
                            weekday: "long",
                            month: "short",
                            day: "numeric",
                          })}
                        </h3>
                        <button
                          onClick={() => setSelectedDay(null)}
                          className="text-xs px-2 py-1 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200"
                        >
                          Close
                        </button>
                      </div>

                      <div className="p-3 bg-teal-50 rounded-lg mb-3">
                        <div className="text-xs text-gray-500">Total Spent</div>
                        <div className="text-xl font-bold text-gray-900">
                          {formatCurrency(selectedDay.spending)}
                        </div>
                      </div>

                      <div className="text-sm font-medium text-gray-500 mb-2">
                        {selectedDay.transactions.length} Transactions
                      </div>

                      <div className="grow overflow-auto">
                        {selectedDay.transactions.length > 0 ? (
                          <div className="space-y-2">
                            {selectedDay.transactions
                              .sort(
                                (a, b) =>
                                  Math.abs(b.amount) - Math.abs(a.amount)
                              )
                              .map((tx, i) => (
                                <div
                                  key={i}
                                  className="p-2 rounded-md border border-gray-100 hover:bg-gray-50"
                                >
                                  <div className="font-medium text-gray-800 text-sm">
                                    {tx.description || "No description"}
                                  </div>
                                  <div className="flex justify-between items-center mt-1">
                                    <div className="text-xs text-gray-500">
                                      {tx.category || "Uncategorized"}
                                    </div>
                                    <div className="text-sm font-semibold text-red-600">
                                      {formatCurrency(Math.abs(tx.amount))}
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <p className="text-gray-500">
                              No transactions on this day
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    // Day of week spending patterns
                    <div className="h-full flex flex-col border rounded-lg p-4">
                      <h3 className="font-medium text-gray-800 mb-3 flex items-center gap-1">
                        Day of Week Insights
                        <div
                          className="tooltip"
                          data-tip="Average spending by day of week"
                        >
                          <Info className="size-3.5 text-gray-400" />
                        </div>
                      </h3>

                      <div className="grow">
                        {dayOfWeekSpending.map((data, i) => (
                          <div key={i} className="mb-3">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="font-medium text-gray-700">
                                {data.day}
                              </span>
                              <span className="text-gray-900">
                                {formatCurrency(data.average)}
                              </span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full w-full">
                              <div
                                className="h-2 bg-teal-500 rounded-full"
                                style={{ width: `${data.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="p-3 bg-gray-50 rounded-lg mt-2">
                        <p className="text-xs text-gray-500">
                          Click on any date to see transactions from that day
                        </p>
                      </div>
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

export default SpendingHeatmap;
