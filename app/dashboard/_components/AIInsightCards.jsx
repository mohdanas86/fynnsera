"use client";

import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, TrendingUp, BarChart3, PieChart } from "lucide-react";
import { motion } from "framer-motion";

// Format currency values consistently
const formatCurrency = (value) => {
  // Round the value to nearest integer
  const roundedValue = Math.round(value);
  if (roundedValue >= 1000000)
    return `₹${(roundedValue / 1000000).toFixed(1)}M`;
  if (roundedValue >= 1000) return `₹${(roundedValue / 1000).toFixed(1)}K`;
  return `₹${roundedValue}`;
};

function AIInsightCards({ transactions = [], enabled = true }) {
  const [insights, setInsights] = useState([
    {
      id: 1,
      title: "Dining Out Analysis",
      description:
        "You spent 28% more on restaurants this month compared to last month. Consider setting a budget for dining out.",
      type: "spending",
      icon: <BarChart3 className="size-4 sm:size-5" />,
      color: "from-amber-50 to-orange-50",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
    },
    {
      id: 2,
      title: "Savings Opportunity",
      description:
        "Based on your income patterns, you could potentially save an additional ₹15K per month by optimizing utility bills.",
      type: "saving",
      icon: <TrendingUp className="size-4 sm:size-5" />,
      color: "from-green-50 to-emerald-50",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      id: 3,
      title: "Subscription Alert",
      description:
        "You have 5 active subscriptions totaling ₹2.4K monthly. Review them to identify services you may not be using.",
      type: "alert",
      icon: <PieChart className="size-4 sm:size-5" />,
      color: "from-blue-50 to-indigo-50",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
  ]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  // Remove an insight card
  const dismissInsight = (id) => {
    setInsights(insights.filter((insight) => insight.id !== id));
  };

  if (!enabled || insights.length === 0) return null;

  return (
    <div className="w-full mb-8">
      {" "}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="size-4 sm:size-5 text-blue-600" />
          <h2 className="text-base sm:text-lg font-bold text-gray-800">
            AI-Powered Insights
          </h2>
        </div>
        <Button
          variant="outline"
          className="text-[10px] sm:text-xs px-2 sm:px-3 py-1 h-auto border border-gray-200 text-gray-600 hover:bg-gray-50"
        >
          Refresh Insights
        </Button>
      </div>
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-5"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {insights.map((insight) => (
          <motion.div key={insight.id} variants={itemVariants}>
            {" "}
            <Card
              className={`bg-gradient-to-r ${insight.color} border-none shadow-sm hover:shadow-md transition-shadow`}
            >
              <CardHeader className="pb-2 pt-3 px-3 sm:p-6 sm:pb-2">
                <div className="flex justify-between items-start">
                  <div
                    className={`${insight.iconBg} p-1.5 sm:p-2 rounded-full mb-2`}
                  >
                    <div className={`${insight.iconColor}`}>
                      {React.cloneElement(insight.icon, {
                        className: "size-4 sm:size-5",
                      })}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    className="h-5 w-5 sm:h-6 sm:w-6 p-0 text-gray-400 hover:text-gray-600 hover:bg-transparent"
                    onClick={() => dismissInsight(insight.id)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </Button>
                </div>
                <CardTitle className="text-base sm:text-lg font-bold text-gray-800">
                  {insight.title}
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm text-gray-600">
                  {insight.description}
                </CardDescription>
              </CardHeader>
              <CardFooter className="pt-0 pb-3 px-3 sm:p-6 sm:pt-0">
                <Button
                  variant="link"
                  className="text-xs sm:text-sm text-blue-600 p-0 h-auto hover:text-blue-800 hover:underline hover:bg-transparent"
                >
                  See details
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

export default AIInsightCards;
