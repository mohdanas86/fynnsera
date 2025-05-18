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

// Helper: Format to K
const formatToK = (value) => {
  return value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value;
};

// Responsive label truncation
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

function TopPositiveChart({ transactions = [] }) {
  const data = Array.isArray(transactions) ? transactions : [];
  // Top 5 positive transactions
  const topReceived = useMemo(() => {
    return data
      .filter(
        (tx) => tx.transactionType?.toUpperCase() === "CREDIT" || tx.amount > 0
      )
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [data]);
  const chartColors = [
    "#0891B2", // Cyan
    "#059669", // Emerald
    "#10B981", // Green
    "#16A34A", // Green
    "#22C55E", // Green
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
    labels: topReceived.map((tx) => {
      const desc = tx.description || "No Description";
      return desc.length > 20 ? desc.slice(0, 10) + "..." : desc;
    }),

    datasets: [
      {
        label: "Amount Received (₹)",
        data: topReceived.map((tx) => tx.amount),
        backgroundColor: function (context) {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) {
            return chartColors.slice(0, topReceived.length);
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
        text: "Top 5 Credited Transactions",
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
            return topReceived[index]?.description || "Transaction";
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
            const tx = topReceived[index];
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

export default TopPositiveChart;
