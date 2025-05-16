"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart,
  ReferenceLine,
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Format currency values for display
const formatCurrency = (value) => {
  if (!value && value !== 0) return "";
  // Round the value to nearest integer
  const roundedValue = Math.round(value);
  if (roundedValue >= 1000000)
    return `₹${(roundedValue / 1000000).toFixed(1)}M`;
  if (roundedValue >= 1000) return `₹${(roundedValue / 1000).toFixed(1)}K`;
  return `₹${roundedValue}`;
};

function CashFlowLineChart({ transactions = [], isLoading = false }) {
  const [timeframe, setTimeframe] = useState("monthly"); // weekly, monthly, quarterly
  const [loading, setLoading] = useState(isLoading);
  const [showCredits, setShowCredits] = useState(true);
  const [showDebits, setShowDebits] = useState(true);
  const [showNetFlow, setShowNetFlow] = useState(true);

  // Handle timeframe change
  const handleTimeframeChange = useCallback((newTimeframe) => {
    setTimeframe(newTimeframe);
  }, []);

  // Toggle data visibility
  const toggleDataVisibility = useCallback((dataKey) => {
    if (dataKey === "credit") {
      setShowCredits((prev) => !prev);
    } else if (dataKey === "debit") {
      setShowDebits((prev) => !prev);
    } else if (dataKey === "netFlow") {
      setShowNetFlow((prev) => !prev);
    }
  }, []);

  // Simulate loading state if needed
  React.useEffect(() => {
    setLoading(isLoading);
    if (isLoading) {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // Transform data based on selected timeframe
  const chartData = useMemo(() => {
    if (loading || !Array.isArray(transactions) || transactions.length === 0)
      return [];

    const sortedTransactions = [...transactions].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    let groupedData = {};

    if (timeframe === "weekly") {
      // Group by week number
      sortedTransactions.forEach((tx) => {
        if (!tx.date) return;
        const date = new Date(tx.date);
        const year = date.getFullYear();

        // Calculate the week number
        const firstDayOfYear = new Date(year, 0, 1);
        const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
        const weekNumber = Math.ceil(
          (pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7
        );
        const key = `Week ${weekNumber}`;

        if (!groupedData[key]) {
          groupedData[key] = { credit: 0, debit: 0, timestamp: date.getTime() };
        }

        // Determine if transaction is credit or debit based on type or amount
        if (tx.transactionType?.toUpperCase() === "CREDIT") {
          // Credit transaction - add to credit total
          groupedData[key].credit += Math.abs(Number(tx.amount) || 0);
        } else if (tx.transactionType?.toUpperCase() === "DEBIT") {
          // Debit transaction - add to debit total
          groupedData[key].debit += Math.abs(Number(tx.amount) || 0);
        } else if (tx.amount > 0) {
          // Positive amount without type, assume credit
          groupedData[key].credit += Math.abs(Number(tx.amount) || 0);
        } else {
          // Negative amount without type, assume debit
          groupedData[key].debit += Math.abs(Number(tx.amount) || 0);
        }
      });
    } else if (timeframe === "quarterly") {
      // Group by quarter
      sortedTransactions.forEach((tx) => {
        if (!tx.date) return;
        const date = new Date(tx.date);
        const year = date.getFullYear();
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        const key = `Q${quarter} ${year}`;

        if (!groupedData[key]) {
          groupedData[key] = { credit: 0, debit: 0, timestamp: date.getTime() };
        }

        // Determine if transaction is credit or debit based on type or amount
        if (tx.transactionType?.toUpperCase() === "CREDIT") {
          // Credit transaction - add to credit total
          groupedData[key].credit += Math.abs(Number(tx.amount) || 0);
        } else if (tx.transactionType?.toUpperCase() === "DEBIT") {
          // Debit transaction - add to debit total
          groupedData[key].debit += Math.abs(Number(tx.amount) || 0);
        } else if (tx.amount > 0) {
          // Positive amount without type, assume credit
          groupedData[key].credit += Math.abs(Number(tx.amount) || 0);
        } else {
          // Negative amount without type, assume debit
          groupedData[key].debit += Math.abs(Number(tx.amount) || 0);
        }
      });
    } else {
      // Group by month (default)
      sortedTransactions.forEach((tx) => {
        if (!tx.date) return;
        const date = new Date(tx.date);
        const monthYear = date.toLocaleString("default", {
          month: "short",
          year: "numeric",
        });

        if (!groupedData[monthYear]) {
          groupedData[monthYear] = {
            credit: 0,
            debit: 0,
            timestamp: date.getTime(),
          };
        }

        // Determine if transaction is credit or debit based on type or amount
        if (tx.transactionType?.toUpperCase() === "CREDIT") {
          // Credit transaction - add to credit total
          groupedData[monthYear].credit += Math.abs(Number(tx.amount) || 0);
        } else if (tx.transactionType?.toUpperCase() === "DEBIT") {
          // Debit transaction - add to debit total
          groupedData[monthYear].debit += Math.abs(Number(tx.amount) || 0);
        } else if (tx.amount > 0) {
          // Positive amount without type, assume credit
          groupedData[monthYear].credit += Math.abs(Number(tx.amount) || 0);
        } else {
          // Negative amount without type, assume debit
          groupedData[monthYear].debit += Math.abs(Number(tx.amount) || 0);
        }
      });
    }

    // Convert to array and sort by timestamp
    return Object.entries(groupedData)
      .map(([name, data]) => ({
        name,
        credit: data.credit,
        debit: data.debit,
        netFlow: data.credit - data.debit,
        timestamp: data.timestamp,
      }))
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [transactions, timeframe, loading]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    if (chartData.length === 0) {
      return {
        avgCredit: 0,
        avgDebit: 0,
        avgNetFlow: 0,
      };
    }

    return {
      avgCredit:
        chartData.reduce((sum, item) => sum + item.credit, 0) /
        chartData.length,
      avgDebit:
        chartData.reduce((sum, item) => sum + item.debit, 0) / chartData.length,
      avgNetFlow:
        chartData.reduce((sum, item) => sum + item.netFlow, 0) /
        chartData.length,
    };
  }, [chartData]);

  // Animation variables
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4 },
    },
  };

  // Custom formatter for tooltip
  const customTooltipFormatter = useCallback((value, name) => {
    // Format the value as currency
    const formattedValue = formatCurrency(value);

    // Add "+" prefix for credit values
    if (name === "credit") {
      return [`+${formattedValue}`, "Income"];
    }

    // Add "-" prefix for debit values
    if (name === "debit") {
      return [`-${formattedValue}`, "Expense"];
    }

    // Format net flow with appropriate sign
    if (name === "netFlow") {
      return [`${value >= 0 ? "+" : ""}${formattedValue}`, "Net Flow"];
    }

    return [formattedValue, name];
  }, []);

  // Custom formatter for legend
  const customLegendFormatter = useCallback(
    (value) => {
      let labelText = value;
      let color = "#6b7280";
      let opacity = 1;

      // Customize legend labels and colors
      if (value === "credit") {
        labelText = "Income";
        color = "#10b981"; // Green
        opacity = showCredits ? 1 : 0.5;
      } else if (value === "debit") {
        labelText = "Expense";
        color = "#ef4444"; // Red
        opacity = showDebits ? 1 : 0.5;
      } else if (value === "netFlow") {
        labelText = "Net Cash Flow";
        color = "#3b82f6"; // Blue
        opacity = showNetFlow ? 1 : 0.5;
      }

      return (
        <span
          style={{
            color,
            fontSize: "12px",
            fontWeight: "500",
            opacity,
            textDecoration: opacity < 1 ? "line-through" : "none",
            cursor: "pointer",
          }}
        >
          {labelText}
        </span>
      );
    },
    [showCredits, showDebits, showNetFlow]
  );

  return (
    <motion.div
      className="w-full h-full"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <Card className="w-full h-full overflow-hidden">
        <CardHeader className="pb-1">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl font-bold text-gray-800">
                Cash Flow Trend
              </CardTitle>
              <CardDescription className="text-sm text-gray-500">
                Credit vs Debit over time
              </CardDescription>
            </div>
            <div className="flex rounded-md border border-gray-200 overflow-hidden">
              <button
                onClick={() => handleTimeframeChange("weekly")}
                className={`px-3 py-1 text-xs font-medium ${
                  timeframe === "weekly"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
                aria-label="Show weekly data"
              >
                Weekly
              </button>
              <button
                onClick={() => handleTimeframeChange("monthly")}
                className={`px-3 py-1 text-xs font-medium ${
                  timeframe === "monthly"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
                aria-label="Show monthly data"
              >
                Monthly
              </button>
              <button
                onClick={() => handleTimeframeChange("quarterly")}
                className={`px-3 py-1 text-xs font-medium ${
                  timeframe === "quarterly"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
                aria-label="Show quarterly data"
              >
                Quarterly
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-2 h-[calc(100%-80px)] overflow-hidden">
          {loading ? (
            <div className="w-full h-full flex flex-col">
              <div className="h-8 flex items-center justify-center mb-4">
                <Skeleton className="h-4 w-32 rounded-md" />
              </div>
              <Skeleton className="w-full h-[calc(100%-60px)] rounded-lg" />
              <div className="mt-4 grid grid-cols-3 gap-2">
                <Skeleton className="h-12 rounded-md" />
                <Skeleton className="h-12 rounded-md" />
                <Skeleton className="h-12 rounded-md" />
              </div>
            </div>
          ) : (
            <motion.div
              className="w-full h-full flex flex-col"
              variants={itemVariants}
            >
              {chartData.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-gray-500">
                    No data available for the selected period
                  </p>
                </div>
              ) : (
                <>
                  {" "}
                  <ResponsiveContainer
                    width="100%"
                    height="85%"
                    className="overflow-visible"
                  >
                    <ComposedChart
                      data={chartData}
                      margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#e5e7eb"
                        opacity={0.7}
                      />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: "#6b7280", fontSize: 10 }}
                        tickMargin={10}
                        axisLine={{ stroke: "#d1d5db" }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis
                        tickFormatter={formatCurrency}
                        tick={{ fill: "#6b7280", fontSize: 10 }}
                        width={45}
                        axisLine={{ stroke: "#d1d5db" }}
                        tickLine={false}
                      />{" "}
                      <Tooltip
                        formatter={customTooltipFormatter}
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "6px",
                          padding: "8px 10px",
                          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                          fontSize: "12px",
                        }}
                        labelFormatter={(label) => `${label}`}
                        wrapperStyle={{ zIndex: 1000 }}
                        allowEscapeViewBox={{ x: true, y: true }}
                      />{" "}
                      <Legend
                        verticalAlign="top"
                        height={36}
                        iconType="circle"
                        iconSize={8}
                        formatter={customLegendFormatter}
                        onClick={(e) => toggleDataVisibility(e.dataKey)}
                        wrapperStyle={{
                          paddingTop: "4px",
                          fontSize: window.innerWidth >= 640 ? "12px" : "10px",
                        }}
                      />
                      {/* Shaded area for net cash flow */}
                      <defs>
                        <linearGradient
                          id="netFlowGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#3b82f6"
                            stopOpacity={0.1}
                          />
                          <stop
                            offset="95%"
                            stopColor="#3b82f6"
                            stopOpacity={0.01}
                          />
                        </linearGradient>
                      </defs>
                      {/* Only show netFlow area if enabled */}
                      {showNetFlow && (
                        <Area
                          type="monotone"
                          dataKey="netFlow"
                          fill="url(#netFlowGradient)"
                          stroke="#3b82f6"
                          strokeWidth={1.5}
                          strokeDasharray="5 5"
                          fillOpacity={0.6}
                        />
                      )}
                      {/* Reference line at y=0 */}
                      <ReferenceLine
                        y={0}
                        stroke="#64748b"
                        strokeDasharray="3 3"
                        strokeWidth={1}
                      />
                      {/* Lines for credit and debit */}
                      {showCredits && (
                        <Line
                          type="monotone"
                          dataKey="credit"
                          stroke="#10b981"
                          strokeWidth={2.5}
                          dot={{
                            r: 4,
                            fill: "#10b981",
                            strokeWidth: 1,
                            stroke: "#fff",
                          }}
                          activeDot={{
                            r: 6,
                            fill: "#10b981",
                            stroke: "#fff",
                            strokeWidth: 2,
                          }}
                          animationDuration={1500}
                        />
                      )}
                      {showDebits && (
                        <Line
                          type="monotone"
                          dataKey="debit"
                          stroke="#ef4444"
                          strokeWidth={2.5}
                          dot={{
                            r: 4,
                            fill: "#ef4444",
                            strokeWidth: 1,
                            stroke: "#fff",
                          }}
                          activeDot={{
                            r: 6,
                            fill: "#ef4444",
                            stroke: "#fff",
                            strokeWidth: 2,
                          }}
                          animationDuration={1500}
                        />
                      )}
                    </ComposedChart>
                  </ResponsiveContainer>
                  {/* Summary statistics */}
                  <div className="mt-1 grid grid-cols-3 gap-2 overflow-hidden max-h-20">
                    <div className="flex flex-col p-1.5 rounded-md bg-emerald-50 border border-emerald-100">
                      <span className="text-xs text-emerald-800 font-medium">
                        Avg. Income
                      </span>
                      <span className="text-xs font-bold text-emerald-600 truncate">
                        {formatCurrency(summaryStats.avgCredit)}
                      </span>
                    </div>
                    <div className="flex flex-col p-1.5 rounded-md bg-red-50 border border-red-100">
                      <span className="text-xs text-red-800 font-medium">
                        Avg. Expense
                      </span>
                      <span className="text-xs font-bold text-red-600 truncate">
                        {formatCurrency(summaryStats.avgDebit)}
                      </span>
                    </div>
                    <div className="flex flex-col p-1.5 rounded-md bg-blue-50 border border-blue-100">
                      <span className="text-xs text-blue-800 font-medium">
                        Avg. Net Flow
                      </span>
                      <span className="text-xs font-bold text-blue-600 truncate">
                        {formatCurrency(summaryStats.avgNetFlow)}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default CashFlowLineChart;
