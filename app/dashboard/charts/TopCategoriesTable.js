"use client";

import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { Card } from "@/components/ui/card";

// Register Chart.js modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function TopCategoriesBarChart({ transactions }) {
  const data = Array.isArray(transactions) ? transactions : []; // Aggregate and sort data
  const aggregatedData = useMemo(() => {
    const totals = {};
    data.forEach((tx) => {
      // Focus on spending (DEBIT transactions) for categories
      if (tx.transactionType?.toUpperCase() === "DEBIT" || tx.amount < 0) {
        const category = tx.category || "Uncategorized";
        totals[category] = (totals[category] || 0) + Math.abs(tx.amount);
      }
    });

    return Object.entries(totals)
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [data]);
  const chartColors = [
    "#3B82F6", // Blue
    "#8B5CF6", // Purple
    "#EC4899", // Pink
    "#6366F1", // Indigo
    "#2563EB", // Dark Blue
  ];

  // Create gradient colors for better visualization
  function createGradients(ctx) {
    const gradients = chartColors.map((color, index) => {
      const gradient = ctx.createLinearGradient(0, 0, 300, 0);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, color + "99"); // Add alpha for gradient effect
      return gradient;
    });
    return gradients;
  }
  const formatCurrency = (value) => {
    if (value >= 1000000) return `₹${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
    return `₹${value}`;
  };
  const chartData = {
    labels: aggregatedData.map((item) => item.category),
    datasets: [
      {
        label: "Amount (₹)",
        data: aggregatedData.map((item) => item.total),
        backgroundColor: function (context) {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) {
            return chartColors.slice(0, aggregatedData.length);
          }
          return createGradients(ctx);
        },
        borderRadius: 8,
        borderSkipped: false,
        barThickness: 28,
        hoverBackgroundColor: chartColors.map((color) => color + "CC"),
        hoverBorderWidth: 2,
        hoverBorderColor: "#FFF",
      },
    ],
  };
  const chartOptions = {
    indexAxis: "y", // Horizontal bars
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        display: false, // Hide the legend
      },
      title: {
        display: true,
        text: "Top 5 Spending Categories",
        color: "#111827", // Gray-900
        font: { size: 20, weight: "bold" },
        padding: { top: 10, bottom: 20 },
      },
      tooltip: {
        backgroundColor: "#111827",
        titleColor: "#FFF",
        bodyColor: "#FFF",
        callbacks: {
          title: (context) => {
            const index = context[0].dataIndex;
            return aggregatedData[index]?.category || "Category";
          },
          label: (context) => {
            const value = context.raw;
            let formattedValue;
            if (value >= 1000000) {
              formattedValue = `₹${(value / 1000000).toFixed(1)}M`;
            } else if (value >= 1000) {
              formattedValue = `₹${(value / 1000).toFixed(1)}K`;
            } else {
              formattedValue = `₹${value}`;
            }
            return `Amount: ${formattedValue}`;
          },
          afterLabel: (context) => {
            const index = context.dataIndex;
            const percent = (
              (context.raw /
                aggregatedData.reduce((sum, item) => sum + item.total, 0)) *
              100
            ).toFixed(1);
            return `${percent}% of total spending`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: true,
          color: "#e5e7eb",
          borderDash: [4, 4],
        },
        ticks: {
          color: "#6B7280",
          font: { size: 12 },
          callback: (value) => {
            if (value >= 1000000) return `₹${(value / 1000000).toFixed(1)}M`;
            if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
            return `₹${value}`;
          },
        },
      },
      y: {
        grid: { display: false },
        ticks: {
          color: "#4B5563",
          font: { size: 13, weight: "500" },
        },
      },
    },
  };

  return (
    <Card className="p-4 sm:p-6 bg-white rounded-xl shadow-md max-w-4xl w-full h-[400px]">
      <Bar data={chartData} options={chartOptions} />
    </Card>
  );
}

export default TopCategoriesBarChart;
