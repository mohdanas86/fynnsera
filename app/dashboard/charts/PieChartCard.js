"use client";

import React, { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

// Colors for Pie slices with better contrast
const COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Green
  "#F59E0B", // Yellow
  "#EF4444", // Red
  "#6366F1", // Indigo
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#F97316", // Orange
  "#14B8A6", // Teal
  "#22D3EE", // Cyan
  "#A855F7", // Violet
  "#4B5563", // Gray
];

// More consistent transform function
const transformData = (transactions) => {
  if (!Array.isArray(transactions) || transactions.length === 0) {
    return [];
  }

  const categoryGroups = {};

  // Group by category
  transactions.forEach((tx) => {
    if (!tx.category) return;

    const category = tx.category.trim();
    if (!category) return;

    if (!categoryGroups[category]) {
      categoryGroups[category] = 0;
    }

    // Use absolute value for better visualization
    categoryGroups[category] += Math.abs(tx.amount || 0);
  });

  // Convert to array and sort by value (descending)
  const result = Object.entries(categoryGroups)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Limit to top 8 categories for better visualization
  const topCategories = result.slice(0, 8);

  // If there are more than 8 categories, add an "Others" category
  if (result.length > 8) {
    const othersValue = result
      .slice(8)
      .reduce((sum, item) => sum + item.value, 0);

    topCategories.push({ name: "Others", value: othersValue });
  }

  return topCategories;
};

function PieChartCard({ transactions }) {
  const data = useMemo(() => transformData(transactions), [transactions]);
  // Format currency consistently with other charts
  const formatCurrency = (value) => {
    if (value >= 1000000) return `₹${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
    return `₹${value}`;
  };

  return (
    <Card className="w-full h-full overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-base sm:text-lg font-semibold">
          Expense Categories
        </CardTitle>
        <CardDescription className="text-sm">
          Distribution of transactions by category
        </CardDescription>
      </CardHeader>{" "}
      <CardContent className="pt-2 h-[calc(100%-80px)]">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center text-gray-500">
            <p>No category data available</p>
          </div>
        ) : (
          <div className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius="70%"
                  innerRadius="30%"
                  paddingAngle={2}
                  fill="#8884d8"
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      strokeWidth={1}
                      stroke="#fff"
                    />
                  ))}
                </Pie>
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
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  iconSize={8}
                  iconType="circle"
                  formatter={(value) => (
                    <span style={{ fontSize: "10px" }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default PieChartCard;

// export default PieChartCard;
