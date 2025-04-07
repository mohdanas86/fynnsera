"use client";

import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Card, CardContent } from "@/components/ui/card";
import {
  format,
  parseISO,
  isThisWeek,
  isThisMonth,
  isThisYear,
  parse,
} from "date-fns";
import { motion } from "framer-motion";
import { useMyContext } from "@/context/MyContext";
import { useSession } from "next-auth/react";

const SummaryCard = ({ title, amount }) => (
  <Card className="w-full max-w-sm shadow rounded-md">
    <CardContent className="lg:p-5 p-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-2xl font-bold mt-2">${amount.toFixed(2)}</p>
    </CardContent>
  </Card>
);

const AiSummaryPage = () => {
  const { data: session, status } = useSession();
  const userId = session?.user?.id;
  const { userTransaction } = useMyContext();
  const transactions = Array.isArray(userTransaction) ? userTransaction : [];
  const [aiTips, setAiTips] = useState("Loading AI tips...");

  const filterBy = (filterFn) =>
    transactions.filter((txn) => {
      try {
        return filterFn(parseISO(txn.date));
      } catch {
        return false;
      }
    });

  const getTotal = (list) => list.reduce((sum, t) => sum + t.amount, 0);
  const thisWeek = filterBy(isThisWeek);
  const thisMonth = filterBy(isThisMonth);
  const thisYear = filterBy(isThisYear);

  const monthlySummary = transactions.reduce((acc, txn) => {
    try {
      const date = parseISO(txn.date);
      const key = format(date, "MMMM yyyy");
      acc[key] = (acc[key] || 0) + txn.amount;
    } catch {}
    return acc;
  }, {});

  const sortedMonths = Object.entries(monthlySummary).sort(
    ([a], [b]) =>
      parse(b, "MMMM yyyy", new Date()).getTime() -
      parse(a, "MMMM yyyy", new Date()).getTime()
  );

  useEffect(() => {
    const fetchAITips = async () => {
      try {
        const res = await fetch("/api/tips", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transactions,
            userId: userId,
          }), // Replace with dynamic userId
        });

        const data = await res.json();
        if (res.ok && data.tips) {
          setAiTips(data.tips);
        } else {
          console.error("AI tips error:", data.error);
          setAiTips("Failed to load AI tips.");
        }
      } catch (err) {
        console.error("Request error:", err);
        setAiTips("Failed to load AI tips.");
      }
    };

    if (transactions.length > 0) {
      fetchAITips();
    }
  }, [transactions]);

  return (
    <div className="lg:p-6 lg:space-y-8 space-y-4">
      <h1 className="text-2xl font-bold">AI Summary</h1>
      <div className="grid md:grid-cols-3 gap-6">
        <SummaryCard title="This Week" amount={getTotal(thisWeek)} />
        <SummaryCard title="This Month" amount={getTotal(thisMonth)} />
        <SummaryCard title="This Year" amount={getTotal(thisYear)} />
      </div>
      <Card className="rounded-md">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Monthly Spending</h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-600 border-b">
                <th className="py-2">Month</th>
                <th className="py-2">Total Spent</th>
              </tr>
            </thead>
            <tbody>
              {sortedMonths.map(([month, total]) => (
                <tr key={month} className="border-b">
                  <td className="py-2">{month}</td>
                  <td className="py-2 font-medium">${total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="bg-indigo-100 border-l-4 border-indigo-500 text-indigo-900 p-6 rounded-xl shadow"
      >
        <h3 className="text-lg font-semibold mb-2">AI Insights</h3>
        <div
          className="prose prose-sm max-w-none text-sm leading-relaxed flex flex-col gap-4"
          dangerouslySetInnerHTML={{ __html: aiTips }}
        />
      </motion.div>
    </div>
  );
};

export default AiSummaryPage;
