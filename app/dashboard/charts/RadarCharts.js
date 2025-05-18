"use client";

import React from "react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Improved data transformation for consistent display
const transformData = (transactions) => {
  if (!Array.isArray(transactions) || transactions.length === 0) return [];

  // Get categories with transactions
  const categories = {};

  transactions.forEach((tx) => {
    if (!tx.category) return;

    const category = tx.category.trim();
    if (!category) return;

    if (!categories[category]) {
      categories[category] = 0;
    }

    // Sum the absolute value for better visualization
    categories[category] += Math.abs(tx.amount || 0);
  });

  // Convert to array and sort by value
  let result = Object.entries(categories)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Limit to top 6 categories for better visualization on radar chart
  result = result.slice(0, 6);

  return result;
};

function RadarCharts({ transactions = [] }) {
  const chartData = transformData(transactions);
  // Format currency consistently
  const formatCurrency = (value) => {
    if (value >= 1000000) return `₹${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
    return `₹${value}`;
  };

  return (
    <Card className="w-full h-full overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-base sm:text-lg font-semibold">
          Category Distribution
        </CardTitle>
        <CardDescription className="text-sm">
          Top spending categories
        </CardDescription>
      </CardHeader>{" "}
      <CardContent className="pt-2 h-[calc(100%-80px)]">
        {chartData.length < 3 ? (
          <div className="h-full flex items-center justify-center text-center text-gray-500">
            <p>Not enough category data</p>
          </div>
        ) : (
          <div className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                <defs>
                  <linearGradient
                    id="radarGradient"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#6366F1" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#6366F1" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis
                  dataKey="name"
                  tick={{
                    fontSize: 10,
                    fill: "#4B5563",
                    dy: 1,
                  }}
                  tickSize={5}
                />
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "0.5rem",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    padding: "8px 12px",
                    fontSize: "12px",
                  }}
                />
                <Radar
                  name="Amount"
                  dataKey="value"
                  fill="url(#radarGradient)"
                  stroke="#6366F1"
                  strokeWidth={2}
                  fillOpacity={0.6}
                  animationDuration={1200}
                  animationEasing="ease-in-out"
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default RadarCharts;

// export default RadarCharts;
