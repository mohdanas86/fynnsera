"use client";

import React, { useMemo, useState, useEffect } from "react";
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

// Helper: Format to k
const formatToK = (value) => {
  return value <= -1000 || value >= 1000
    ? `${(value / 1000).toFixed(0)}k`
    : value;
};

// Responsive description truncator
const ResponsiveDescription = ({ text }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const truncated =
    text && text.length > 30 ? text.substring(0, 10) + "..." : text;
  return isMobile ? truncated : text;
};

function TopNegativeChart({ transactions = [] }) {
  const data = Array.isArray(transactions) ? transactions : [];
  // Get top 5 negative transactions
  const topNegatives = useMemo(() => {
    // Filter for DEBIT transactions
    return data
      .filter(
        (tx) => tx.transactionType?.toUpperCase() === "DEBIT" || tx.amount < 0
      )
      .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
      .slice(0, 5);
  }, [data]);
  const chartColors = [
    "#2563EB", // Primary brand blue
    "#4F46E5", // Brand indigo
    "#7C3AED", // Brand violet
    "#3B82F6", // Brand blue
    "#0EA5E9", // Brand sky blue
  ]; // Create gradient colors for better visualization
  function createGradients(ctx) {
    const gradients = chartColors.map((color, index) => {
      const gradient = ctx.createLinearGradient(0, 0, 0, 250);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, color + "60"); // Add alpha for gradient effect
      return gradient;
    });
    return gradients;
  }

  const chartData = {
    labels: topNegatives.map((tx) => {
      const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
      const desc = tx.description || "";
      return isMobile && desc.length > 30
        ? desc.substring(0, 10) + "..."
        : desc;
    }),

    datasets: [
      {
        label: "Amount Sent (₹)",
        data: topNegatives.map((tx) => Math.abs(tx.amount)),
        backgroundColor: function (context) {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) {
            return chartColors.slice(0, topNegatives.length);
          }
          return createGradients(ctx);
        },
        borderRadius: 8,
        barThickness: 36,
        borderSkipped: false,
        hoverBackgroundColor: chartColors.map((color) => color + "CC"),
        hoverBorderWidth: 2,
        hoverBorderColor: "#FFF",
      },
    ],
  };
  const chartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        display: false, // Hide the legend
      },
      title: {
        display: true,
        text: "Top 5 Debited Transactions",
        color: "#111827",
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
            return topNegatives[index]?.description || "Transaction";
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
            const tx = topNegatives[index];
            const date = tx?.date
              ? new Date(tx.date).toLocaleDateString("en-IN")
              : "";
            return date ? `Date: ${date}` : "";
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          display: true, // Show x-axis labels
          color: "#4B5563",
          font: { size: 11, weight: "500" },
          maxRotation: 0,
          autoSkip: true,
          callback: function (index) {
            // Just show index numbers (1-5) for cleaner display
            return index + 1;
          },
        },
      },
      y: {
        grid: {
          color: "#E5E7EB",
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
    },
  };

  return (
    <Card className="p-4 sm:p-6 bg-white rounded-xl shadow-md max-w-4xl w-full h-[400px] mx-auto">
      <Bar data={chartData} options={chartOptions} />
    </Card>
  );
}

export default TopNegativeChart;
