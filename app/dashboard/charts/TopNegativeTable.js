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
    return data
      .filter((tx) => tx.amount < 0)
      .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
      .slice(0, 5);
  }, [data]);

  const chartColors = [
    "#EF4444", // Red
    "#F97316", // Orange
    "#EAB308", // Yellow
    "#14B8A6", // Teal
    "#6366F1", // Indigo
  ];

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
        backgroundColor: chartColors.slice(0, topNegatives.length),
        borderRadius: 8,
        barThickness: 36,
        borderSkipped: false,
      },
    ],
  };

  const chartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          color: "#1F2937",
          font: { size: 12, weight: "600" },
        },
      },
      title: {
        display: true,
        text: "Top 5 Transactions Sent",
        color: "#111827",
        font: { size: 20, weight: "bold" },
        padding: { top: 10, bottom: 20 },
      },
      tooltip: {
        backgroundColor: "#111827",
        titleColor: "#FFF",
        bodyColor: "#FFF",
        callbacks: {
          label: (context) => `₹${formatToK(context.raw)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: "#4B5563",
          font: { size: 13 },
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
          callback: (value) => `₹${formatToK(value)}`,
        },
      },
    },
  };

  return (
    <div className="p-4 sm:p-6 bg-white rounded-xl shadow-md max-w-4xl w-full h-[400px] mx-auto">
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
}

export default TopNegativeChart;
