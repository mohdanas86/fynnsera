"use client";

// Format currency values consistently
export const formatCurrency = (value) => {
  if (value >= 1000000) return `₹${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value}`;
};

// Vibrant color palette for categories
export const CATEGORY_COLORS = [
  "#3b82f6", // Blue
  "#10b981", // Green
  "#f59e0b", // Amber
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#ef4444", // Red
  "#06b6d4", // Cyan
  "#6366f1", // Indigo
  "#d946ef", // Fuchsia
  "#84cc16", // Lime
  "#14b8a6", // Teal
  "#f97316", // Orange
];

// Category colors by name
export const CATEGORY_COLORS_BY_NAME = {
  "Food & Dining": "#f59e0b",
  Shopping: "#ec4899",
  Housing: "#3b82f6",
  Transportation: "#10b981",
  Entertainment: "#8b5cf6",
  Travel: "#06b6d4",
  "Health & Fitness": "#ef4444",
  Education: "#6366f1",
  "Bills & Utilities": "#d946ef",
  "Personal Care": "#84cc16",
  Investments: "#0891b2",
  Income: "#16a34a",
  Uncategorized: "#94a3b8",
  Others: "#64748b",
};

// Category icons mapping
export const CATEGORY_ICONS = {
  "Food & Dining": "🍕",
  Shopping: "🛍️",
  Housing: "🏠",
  Transportation: "🚗",
  Entertainment: "🎬",
  Travel: "✈️",
  "Health & Fitness": "🏥",
  Education: "📚",
  "Bills & Utilities": "📱",
  "Personal Care": "💇",
  Investments: "📈",
  Income: "💰",
  Uncategorized: "📋",
  Others: "📦",
};

// Function to get month name
export const getMonthName = (month) => {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return monthNames[month];
};

// Function to format date
export const formatDate = (date, format = "medium") => {
  if (!date) return "";

  const d = new Date(date);

  if (format === "short") {
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  }

  if (format === "medium") {
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  if (format === "long") {
    return d.toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  // Default
  return d.toLocaleDateString();
};

// Format percentage
export const formatPercentage = (value, decimals = 1) => {
  return `${value.toFixed(decimals)}%`;
};

// Get positive/negative classes
export const getTrendClass = (value, reverse = false) => {
  if (value === 0) return "text-gray-500";

  if (reverse) {
    return value > 0 ? "text-green-600" : "text-red-600";
  }

  return value > 0 ? "text-red-600" : "text-green-600";
};

// Filter credit/debit transactions
export const filterTransactionsByType = (transactions, type = "debit") => {
  if (!Array.isArray(transactions) || transactions.length === 0) {
    return [];
  }

  if (type.toLowerCase() === "debit") {
    return transactions.filter(
      (tx) =>
        tx.transactionType?.toUpperCase() === "DEBIT" ||
        parseFloat(tx.amount) < 0
    );
  }

  if (type.toLowerCase() === "credit") {
    return transactions.filter(
      (tx) =>
        tx.transactionType?.toUpperCase() === "CREDIT" ||
        parseFloat(tx.amount) > 0
    );
  }

  // All transactions
  return transactions;
};

// Function to get period text based on timeframe
export const getPeriodText = (timeframe = "monthly") => {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  if (timeframe === "yearly") {
    return `${year}`;
  } else if (timeframe === "quarterly") {
    const quarter = Math.floor(month / 3) + 1;
    return `Q${quarter} ${year}`;
  } else {
    // Monthly
    return `${getMonthName(month)} ${year}`;
  }
};
