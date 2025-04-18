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
import { toast } from "sonner";
import { Legend } from "chart.js";

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

const SummaryCard = ({ title, amount, isLoading, imgUrl }) => (
  <Card
    className={`w-full lg:shadow-md shadow-sm py-0 rounded-2xl  transition-all duration-300
    relative overflow-hidden
  `}
  >
    <CardContent className="p-4">
      <h2 className="text-xl font-bold text-muted-foreground">{title}</h2>
      <img
        src={`/img/${imgUrl}`}
        className="absolute bottom-[-0px] right-[-0px] w-[100px] "
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
  const { userTransaction } = useMyContext();
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
      try {
        const res = await fetch("/api/tips", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transactions: userTransaction,
            userId: session?.user?.id,
            summary: processTransactions.totals,
          }),
        });

        const data = await res.json();
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
  }, [userTransaction, session]);

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
    <div className="px-4 space-y-8">
      <h1 className="text-2xl font-bold">Financial Overview</h1>

      <div className="grid md:grid-cols-3 lg:gap-6 gap-4">
        <SummaryCard
          title="Credited"
          imgUrl="cradit.png"
          amount={processTransactions.totals.income}
          isLoading={isLoading}
        />
        <SummaryCard
          title="Debited"
          imgUrl="debit.png"
          amount={processTransactions.totals.expenses}
          isLoading={isLoading}
        />
        <SummaryCard
          title="Total Expenses"
          imgUrl="transfer.png"
          amount={processTransactions.totals.expenses}
          isLoading={isLoading}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Spending by Category - Pie Chart */}
        <Card className="lg:shadow-lg lg:rounded-2xl lg:border shadow-none rounded-sm border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">
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
                    paddingAngle={5}
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
                    formatter={(value, name) => [formatINR(value), "Spent"]}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trends - Bar Chart */}
        <Card className="lg:shadow-lg lg:rounded-2xl lg:border shadow-none rounded-sm border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">
              Monthly Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={processTransactions.monthlyTrends}
                  barCategoryGap="15%"
                >
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `₹${value}`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderRadius: "8px",
                      boxShadow: "0 0 10px rgba(0,0,0,0.1)",
                    }}
                    formatter={(value, name) => [formatINR(value), name]}
                  />
                  <Legend />
                  <Bar
                    dataKey="income"
                    fill="#00C49F"
                    name="Income"
                    radius={[8, 8, 0, 0]}
                  />
                  <Bar
                    dataKey="expenses"
                    fill="#FF8042"
                    name="Expenses"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-blue-50 lg:p-6 p-3 lg:rounded-xl rounded-sm shadow-sm border border-blue-100"
      >
        <h3 className="text-xl font-semibold mb-4 text-blue-800">
          AI-Powered Insights
        </h3>
        <div className="prose max-w-none text-blue-900">
          <ReactMarkdown>{aiTips}</ReactMarkdown>
        </div>
      </motion.div>

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
