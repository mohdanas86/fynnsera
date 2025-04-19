"use client";
import ReactMarkdown from "react-markdown";

import React, { useEffect, useMemo, useState } from "react";
import {
  format,
  parseISO,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  differenceInDays,
  isSameMonth,
  isSameYear,
} from "date-fns";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMyContext } from "@/context/MyContext";
import { useSession } from "next-auth/react";
import { Legend } from "chart.js";
import FinancialInsightsCard from "./FinancialInsightsCard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import Image from "next/image";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#AF19FF",
  "#FF0080",
];

const formatINR = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

// utils/formatThousands.ts
const formatThousands = (value) => {
  if (value >= 10000000) return (value / 10000000).toFixed(1) + "Cr";
  if (value >= 100000) return (value / 100000).toFixed(1) + "L";
  if (value >= 1000) return (value / 1000).toFixed(1) + "k";
  return value.toString();
};

const SummaryCard = ({ title, amount, isLoading, imgUrl }) => (
  <Card
    className={`w-full shadow-sm py-4 rounded-lg  transition-all duration-300
    relative overflow-hidden
  `}
  >
    <CardContent className="p-4">
      <h2 className="text-lg font-bold text-muted-foreground">{title}</h2>
      <Image
        width={100}
        height={100}
        alt={imgUrl}
        src={`/img/${imgUrl}`}
        draggable={false}
        className="absolute bottom-[-0px] right-[-0px] "
      />
      {isLoading ? (
        <Skeleton className="h-8 w-32 mt-2" />
      ) : (
        <p className="text-xl font-semibold">{formatINR(amount)}</p>
      )}
    </CardContent>
  </Card>
);

const AiSummaryPage = () => {
  const { data: session } = useSession();
  const {
    formatedData,
    userTransaction,
    selectedProvider,
    selectedFileData,
    handleSelect,
    userFileLogs,
  } = useMyContext();
  const [aiTips, setAiTips] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const processTransactions = useMemo(() => {
    if (!userTransaction) return {};

    const now = new Date();
    const transactions = userTransaction
      .filter((t) => t.date)
      .map((t) => ({
        ...t,
        date: parseISO(t.date),
        amount: parseFloat(t.amount) || 0,
        isCredit: t.transactionType === "CREDIT",
      }));

    // Date ranges
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const yearStart = startOfYear(now);
    const yearEnd = endOfYear(now);

    // Filter transactions
    const thisWeekTxns = transactions.filter(
      (t) => t.date >= weekStart && t.date <= weekEnd
    );
    const thisMonthTxns = transactions.filter(
      (t) => t.date >= monthStart && t.date <= monthEnd
    );
    const thisYearTxns = transactions.filter(
      (t) => t.date >= yearStart && t.date <= yearEnd
    );

    // Category breakdown
    const categoryData = transactions.reduce((acc, t) => {
      if (!t.isCredit) {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
      }
      return acc;
    }, {});

    // Monthly trends
    const monthlyData = transactions.reduce((acc, t) => {
      const monthYear = format(t.date, "MMM yyyy");
      if (!acc[monthYear]) {
        acc[monthYear] = { income: 0, expenses: 0 };
      }
      t.isCredit
        ? (acc[monthYear].income += t.amount)
        : (acc[monthYear].expenses += t.amount);
      return acc;
    }, {});

    return {
      weekly: thisWeekTxns,
      monthly: thisMonthTxns,
      yearly: thisYearTxns,
      categoryData: Object.entries(categoryData).map(([name, value]) => ({
        name,
        value,
      })),
      monthlyTrends: Object.entries(monthlyData).map(([name, values]) => ({
        name,
        ...values,
        net: values.income - values.expenses,
      })),
      totals: {
        week: thisWeekTxns.reduce(
          (sum, t) => sum + (t.isCredit ? t.amount : -t.amount),
          0
        ),
        month: thisMonthTxns.reduce(
          (sum, t) => sum + (t.isCredit ? t.amount : -t.amount),
          0
        ),
        year: thisYearTxns.reduce(
          (sum, t) => sum + (t.isCredit ? t.amount : -t.amount),
          0
        ),
        income: transactions
          .filter((t) => t.isCredit)
          .reduce((sum, t) => sum + t.amount, 0),
        expenses: transactions
          .filter((t) => !t.isCredit)
          .reduce((sum, t) => sum + t.amount, 0),
      },
    };
  }, [userTransaction]);

  useEffect(() => {
    const fetchAITips = async () => {
      if (!session?.user?.id || !selectedFileData) {
        setAiTips("Missing user session or file data.");
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/tips", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: session?.user?.id,
            fileId: selectedFileData._id,
            formatedData: formatedData,
          }),
        });

        const data = await res.json();
        console.log("res : ", data.tips);
        setAiTips(data.tips || "No insights available");
      } catch (error) {
        setAiTips("Failed to load financial insights. Please try again later.");
      }
      setIsLoading(false);
    };

    if (userTransaction?.length > 0) {
      fetchAITips();
    } else {
      setIsLoading(false);
    }
  }, [formatedData]);

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="lg:px-4 lg:space-y-8 space-y-6">
      <h1 className="text-2xl font-bold">Financial Overview</h1>

      <div className="flex justify-between items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-[220px] flex justify-between items-center rounded-[4px] border border-gray-300 shadow-sm px-4 py-2 bg-white hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-medium text-gray-700">
                {selectedProvider || "Select Provider"}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[220px] rounded-[4px] shadow-md border border-gray-200 bg-white z-50">
            <DropdownMenuLabel className="text-xs font-semibold text-gray-500 px-3 py-2">
              Files
            </DropdownMenuLabel>

            {Array.isArray(userFileLogs?.data) &&
            userFileLogs.data.length > 0 ? (
              userFileLogs.data.map((file, index) => (
                <DropdownMenuItem
                  key={index}
                  onSelect={() => handleSelect(file)}
                  className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  {file.filename}
                </DropdownMenuItem>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-400">
                No files found
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid md:grid-cols-3 lg:gap-6 gap-4">
        <SummaryCard
          title="Totoal Credited"
          imgUrl="cradit.png"
          amount={processTransactions.totals.income}
          isLoading={isLoading}
        />
        <SummaryCard
          title="Total Debited"
          imgUrl="debit.png"
          amount={processTransactions.totals.expenses}
          isLoading={isLoading}
        />
      </div>

      <div className="mt-8 lg:mt-0">
        <div className="flex items-center lg:gap-3">
          <div className="p-2 rounded-full ">
            <svg
              className="w-6 h-6 text-gray-800"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h2 className="lg:text-2xl text-lg font-bold text-gray-800">
            AI-Powered Financial Insights
          </h2>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Spending by Category - Pie Chart */}
        <Card className="shadow-sm rounded-lg border hover:shadow-sm transition-shadow duration-300 bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900">
              Spending by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={processTransactions.categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    isAnimationActive
                  >
                    {processTransactions.categoryData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderRadius: "8px",
                      boxShadow: "0 0 10px rgba(0,0,0,0.1)",
                    }}
                    formatter={(value) => [
                      `₹${formatThousands(value)}`,
                      "Spent",
                    ]}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    wrapperStyle={{
                      fontSize: "0.85rem",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Manual Legend */}
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              {processTransactions.categoryData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-gray-700">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trends - Bar Chart */}
        <Card className="shadow-sm rounded-lg border hover:shadow-sm transition-shadow duration-300 bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900">
              Monthly Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={processTransactions.monthlyTrends}
                  barCategoryGap="20%"
                  margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
                >
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis
                    tickFormatter={(value) => `₹${formatThousands(value)}`}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderRadius: "8px",
                      boxShadow: "0 0 10px rgba(0,0,0,0.1)",
                    }}
                    formatter={(value, name) => [
                      `₹${formatThousands(value)}`,
                      name,
                    ]}
                  />
                  <Legend wrapperStyle={{ fontSize: "0.85rem" }} />
                  <Bar
                    dataKey="income"
                    fill="#00C49F"
                    name="Income"
                    radius={[3, 3, 0, 0]}
                    barSize={28}
                  />
                  <Bar
                    dataKey="expenses"
                    fill="#FF8042"
                    name="Expenses"
                    radius={[3, 3, 0, 0]}
                    barSize={28}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Custom Color Legend */}
            <div className="mt-4 flex gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#00C49F]" />
                <span className="text-gray-700">Income</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#FF8042]" />
                <span className="text-gray-700">Expenses</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ****** TIPS START ****** */}
      <div>
        <FinancialInsightsCard insights={aiTips} />
      </div>
      {/* ****** TIPS END ****** */}

      <Card className="lg:p-6 lg:rounded-xl rounded-none border-0 lg:border shadow-none lg:shadow-sm">
        <CardHeader className="p-0">
          <CardTitle>Recent Large Transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-4">
            {userTransaction
              .filter((t) => Math.abs(t.amount) > 500)
              .slice(0, 5)
              .map((txn, i) => (
                <div
                  key={i}
                  className={`flex justify-between items-center p-3 bg-muted/50 rounded-lg border-l-3 ${
                    txn.transactionType === "CREDIT"
                      ? " border-teal-600"
                      : "border-rose-600"
                  } `}
                >
                  <div>
                    <p className="font-medium">{txn.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(parseISO(txn.date), "dd MMM yyyy")} •{" "}
                      {txn.category}
                    </p>
                  </div>
                  <span
                    className={`font-semibold ${
                      txn.transactionType === "CREDIT"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {txn.transactionType === "CREDIT" ? "+" : "-"}
                    {formatINR(txn.amount)}
                  </span>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AiSummaryPage;
