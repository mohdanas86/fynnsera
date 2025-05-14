"use client";

import React, { useMemo, useState } from "react";
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

function SpendingHeatmap({ transactions = [] }) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    // Default to current month
    const now = new Date();
    return `${now.getMonth() + 1}-${now.getFullYear()}`;
  });

  // Process transaction data for the heatmap
  const {
    daysInMonth,
    monthName,
    year,
    calendarData,
    maxSpending,
    totalMonthSpending,
  } = useMemo(() => {
    if (!Array.isArray(transactions) || transactions.length === 0) {
      return {
        daysInMonth: 31,
        monthName: "Month",
        year: 2023,
        calendarData: [],
        maxSpending: 0,
        totalMonthSpending: 0,
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

    // Filter transactions for the selected month
    const monthTransactions = transactions.filter((tx) => {
      if (!tx.date) return false;
      const txDate = new Date(tx.date);
      return (
        txDate.getMonth() === month - 1 &&
        txDate.getFullYear() === year &&
        (tx.transactionType?.toUpperCase() === "DEBIT" || tx.amount < 0)
      );
    });

    // Group spending by day
    const dailySpending = {};
    let maxSpending = 0;
    let totalMonthSpending = 0;

    monthTransactions.forEach((tx) => {
      const txDate = new Date(tx.date);
      const day = txDate.getDate();
      const amount = Math.abs(tx.amount);

      if (!dailySpending[day]) {
        dailySpending[day] = {
          day,
          spending: 0,
          transactions: [],
        };
      }

      dailySpending[day].spending += amount;
      dailySpending[day].transactions.push(tx);

      totalMonthSpending += amount;
      maxSpending = Math.max(maxSpending, dailySpending[day].spending);
    });

    // Create calendar data array with all days
    const calendarData = [];
    const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Add empty cells for days before the 1st of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      calendarData.push({ isEmpty: true });
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayData = dailySpending[day] || {
        day,
        spending: 0,
        transactions: [],
      };

      // Calculate color intensity based on spending
      const intensity =
        maxSpending > 0
          ? Math.min(0.9, (dayData.spending / maxSpending) * 0.9) // Max alpha is 0.9
          : 0;

      const today = new Date();
      const isToday =
        today.getDate() === day &&
        today.getMonth() === month - 1 &&
        today.getFullYear() === year;

      calendarData.push({
        ...dayData,
        intensity,
        isToday,
      });
    }

    return {
      daysInMonth,
      monthName,
      year,
      calendarData,
      maxSpending,
      totalMonthSpending,
    };
  }, [transactions, currentMonth]);

  // Get previous and next months for navigation
  const { prevMonth, nextMonth } = useMemo(() => {
    const [month, year] = currentMonth.split("-").map(Number);

    let prevMonthNum = month - 1;
    let prevYearNum = year;
    if (prevMonthNum < 1) {
      prevMonthNum = 12;
      prevYearNum--;
    }

    let nextMonthNum = month + 1;
    let nextYearNum = year;
    if (nextMonthNum > 12) {
      nextMonthNum = 1;
      nextYearNum++;
    }

    return {
      prevMonth: `${prevMonthNum}-${prevYearNum}`,
      nextMonth: `${nextMonthNum}-${nextYearNum}`,
    };
  }, [currentMonth]);

  // Calculate if next month is in the future
  const isNextMonthFuture = useMemo(() => {
    const [nextMonthNum, nextYearNum] = nextMonth.split("-").map(Number);
    const today = new Date();
    const nextMonthDate = new Date(nextYearNum, nextMonthNum - 1, 1);

    return nextMonthDate > today;
  }, [nextMonth]);

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
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.01,
      },
    },
  };

  const cellVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3 },
    },
  };

  // Get color for heatmap cell
  const getCellColor = (intensity) => {
    // Color range from light green to dark red
    if (intensity === 0) return "bg-gray-50";
    if (intensity < 0.2) return "bg-green-100";
    if (intensity < 0.4) return "bg-green-200";
    if (intensity < 0.6) return "bg-yellow-200";
    if (intensity < 0.8) return "bg-orange-200";
    return "bg-red-200";
  };

  // Get today indicator classes
  const getTodayClasses = (isToday) => {
    return isToday ? "ring-2 ring-blue-500 font-bold" : "";
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-gray-800">
                Spending Calendar
              </CardTitle>
              <CardDescription className="text-sm text-gray-500">
                View your daily spending patterns
              </CardDescription>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => setCurrentMonth(prevMonth)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              <span className="text-sm font-medium text-gray-700">
                {monthName} {year}
              </span>

              <button
                onClick={() => setCurrentMonth(nextMonth)}
                disabled={isNextMonthFuture}
                className={`p-1 rounded-full ${
                  !isNextMonthFuture
                    ? "hover:bg-gray-100"
                    : "opacity-50 cursor-not-allowed"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-2 h-[calc(100%-80px)] overflow-hidden">
          <motion.div
            className="h-full flex flex-col"
            variants={calendarVariants}
          >
            <div className="grid grid-cols-7 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-medium text-gray-500"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 grow">
              {calendarData.map((day, index) => (
                <motion.div
                  key={index}
                  className={`
                    relative aspect-square rounded-md flex flex-col items-center justify-center p-1
                    ${
                      day.isEmpty
                        ? "bg-transparent"
                        : getCellColor(day.intensity)
                    }
                    ${!day.isEmpty ? getTodayClasses(day.isToday) : ""}
                    ${
                      !day.isEmpty && day.spending > 0
                        ? "cursor-pointer hover:ring-1 hover:ring-gray-300"
                        : ""
                    }
                  `}
                  variants={!day.isEmpty ? cellVariants : {}}
                  // Using a tooltip pattern for spending details
                  title={
                    day.isEmpty
                      ? ""
                      : `${day.day}: ${formatCurrency(day.spending)}`
                  }
                >
                  {!day.isEmpty && (
                    <>
                      <span className="text-xs font-medium text-gray-700">
                        {day.day}
                      </span>
                      {day.spending > 0 && (
                        <span className="text-[10px] text-gray-600 mt-1">
                          {formatCurrency(day.spending)}
                        </span>
                      )}
                    </>
                  )}
                </motion.div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm bg-gray-50"></span>
                <span>No spend</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm bg-green-100"></span>
                <span>Low</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm bg-green-200"></span>
                <span>Medium</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm bg-yellow-200"></span>
                <span>High</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm bg-red-200"></span>
                <span>Very High</span>
              </div>
            </div>

            {totalMonthSpending > 0 && (
              <div className="mt-2 text-center">
                <span className="text-sm font-medium text-gray-700">
                  Monthly Total: {formatCurrency(totalMonthSpending)}
                </span>
              </div>
            )}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default SpendingHeatmap;
