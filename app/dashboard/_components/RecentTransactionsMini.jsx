"use client";

import React, {
  useMemo,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import {
  UtensilsCrossed,
  ShoppingBag,
  Home,
  Car,
  Film,
  Plane,
  Heart,
  BookOpen,
  Phone,
  Scissors,
  BarChart3,
  Wallet,
  FileText,
  Package2,
  ArrowDownRight,
  ArrowUpRight,
  ChevronRight,
  CircleDollarSign,
  Info,
  X,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const formatCurrency = (value) => {
  const roundedValue = Math.round(value);
  if (roundedValue >= 1_000_000)
    return `₹${(roundedValue / 1_000_000).toFixed(1)}M`;
  if (roundedValue >= 1_000) return `₹${(roundedValue / 1_000).toFixed(1)}K`;
  return `₹${roundedValue}`;
};

const CATEGORY_ICONS = {
  "Food & Dining": UtensilsCrossed,
  Shopping: ShoppingBag,
  Housing: Home,
  Transportation: Car,
  Entertainment: Film,
  Travel: Plane,
  "Health & Fitness": Heart,
  Education: BookOpen,
  "Bills & Utilities": Phone,
  "Personal Care": Scissors,
  Investments: BarChart3,
  Income: Wallet,
  Uncategorized: FileText,
  Others: Package2,
};

export default function RecentTransactionsMini({
  transactions = [],
  isLoading = false,
}) {
  const [loading, setLoading] = useState(isLoading);
  const [activeTooltipIndex, setActiveTooltipIndex] = useState(null);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );
  const itemRefs = useRef([]);
  const listRef = useRef(null);
  const tooltipPositionRef = useRef("left");

  // Set loading state based on props and add timeout for smoother UX
  useEffect(() => {
    setLoading(isLoading);
    if (isLoading) {
      const timer = setTimeout(() => setLoading(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isLoading]); // Handle window resize and reset tooltip
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setActiveTooltipIndex(null); // Reset tooltip when resizing
    };

    // Initial sizing
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty dependency array means this effect runs once on mount// Close tooltip when clicking outside and determine tooltip position
  useEffect(() => {
    if (activeTooltipIndex === null) return;

    // For desktop, calculate available space for tooltip positioning
    if (windowWidth >= 768) {
      const itemRect =
        itemRefs.current[activeTooltipIndex]?.getBoundingClientRect();
      if (itemRect) {
        const viewportWidth = window.innerWidth;
        const spaceOnLeft = itemRect.left;
        const spaceOnRight = viewportWidth - itemRect.right;
        const tooltipWidth = 340; // Width of tooltip + buffer (320px + 20px)

        // Calculate container boundaries
        const containerRect =
          listRef.current?.parentElement?.getBoundingClientRect() || {
            left: 0,
            right: viewportWidth,
          };

        // Check if the tooltip would go outside the container
        const tooltipFitsLeft =
          spaceOnLeft > tooltipWidth &&
          itemRect.left - tooltipWidth > containerRect.left;
        // Place tooltip based on available space, prefer left side for desktop when possible
        tooltipPositionRef.current = tooltipFitsLeft ? "left" : "right";
      }
    }

    const handleClickOutside = (e) => {
      if (
        itemRefs.current[activeTooltipIndex] &&
        !itemRefs.current[activeTooltipIndex].contains(e.target)
      ) {
        setActiveTooltipIndex(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeTooltipIndex, windowWidth]);

  // Close tooltip when scrolling the list
  useEffect(() => {
    if (!listRef.current || activeTooltipIndex === null) return;

    const handleScroll = () => setActiveTooltipIndex(null);
    const listElement = listRef.current;

    listElement.addEventListener("scroll", handleScroll);
    return () => listElement.removeEventListener("scroll", handleScroll);
  }, [activeTooltipIndex]);
  const handleMouseEnter = useCallback(
    (idx) => {
      if (windowWidth < 768) return; // Only show tooltips on hover for desktop

      // Calculate position if needed for desktop
      const itemRect = itemRefs.current[idx]?.getBoundingClientRect();
      const containerRect =
        listRef.current?.parentElement?.getBoundingClientRect();

      if (itemRect && containerRect) {
        // Get container boundaries and viewport dimensions
        const viewportWidth = window.innerWidth;
        const spaceOnLeft = itemRect.left;
        const spaceOnRight = viewportWidth - itemRect.right;

        // Need at least 340px for tooltip width + some margin
        // Prefer left position if there's enough space
        const tooltipFitsLeft = spaceOnLeft > 340;

        // Store position to use in tooltip rendering
        tooltipPositionRef.current = tooltipFitsLeft ? "left" : "right";
      }

      setActiveTooltipIndex(idx);
    },
    [windowWidth]
  );

  const handleMouseLeave = useCallback(() => setActiveTooltipIndex(null), []);

  const handleRowClick = useCallback(
    (idx) => {
      if (windowWidth >= 768) return; // Only toggle tooltip on tap for mobile
      setActiveTooltipIndex(activeTooltipIndex === idx ? null : idx);
    },
    [activeTooltipIndex, windowWidth]
  );

  const formatTransactionTime = useCallback((dateString) => {
    const date = new Date(dateString);
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  }, []);

  const formatDate = useCallback((dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    if (date.toDateString() === now.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  }, []);

  const recentTransactions = useMemo(() => {
    if (loading || !Array.isArray(transactions) || transactions.length === 0)
      return [];

    return [...transactions]
      .filter((tx) => tx.date && tx.amount && !isNaN(new Date(tx.date)))
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 7)
      .map((tx) => {
        const isCredit = tx.transactionType
          ? tx.transactionType.toUpperCase() === "CREDIT"
          : parseFloat(tx.amount) > 0;
        return {
          ...tx,
          isCredit,
          formattedTime: formatTransactionTime(tx.date),
        };
      });
  }, [transactions, loading, formatTransactionTime]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 15, opacity: 0, scale: 0.98 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
        duration: 0.3,
      },
    },
  };

  return (
    <motion.div
      className="w-full h-full"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <Card className="w-full h-full border-0 shadow-none lg:border lg:bg-white bg-transparent">
        <CardHeader className="pb-2 lg:px-4 px-2">
          <div className="flex justify-between items-start sm:items-center flex-wrap gap-y-2">
            <div>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <CircleDollarSign className="h-5 w-5 text-teal-500" />
                Recent Transactions
              </CardTitle>
              <CardDescription className="text-sm text-gray-600">
                Your latest financial activity
              </CardDescription>
            </div>
            <Link
              href="/dashboard/transactions"
              className="inline-flex items-center text-sm text-teal-600 hover:text-teal-700 transition-colors font-medium bg-teal-50 hover:bg-teal-100 px-2.5 py-1 rounded-md"
            >
              View All <ChevronRight className="ml-1" size={16} />
            </Link>
          </div>
        </CardHeader>

        <CardContent className="h-[calc(100%-5.625rem)] relative lg:px-4 px-2">
          {loading ? (
            // Loading skeletons
            <motion.div
              className="space-y-3 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {[...Array(5)].map((_, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-50/50"
                >
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-[calc(100%-60px)] sm:w-36" />
                    <Skeleton className="h-3 w-[calc(70%-30px)] sm:w-24" />
                  </div>
                  <Skeleton className="h-5 w-16" />
                </div>
              ))}
            </motion.div>
          ) : recentTransactions.length === 0 ? (
            // Empty state
            <motion.div
              className="h-full flex flex-col items-center justify-center p-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="h-16 w-16 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                <Wallet size={28} className="text-gray-400" />
              </div>
              <p className="text-gray-700 font-semibold mb-2">
                No recent transactions
              </p>
              <p className="text-gray-500 text-sm text-center max-w-xs">
                Your recent financial activity will appear here
              </p>
              <div className="flex items-center gap-1 mt-6 text-xs text-gray-400">
                <Info size={14} />
                <span>Add transactions to see them in this list</span>
              </div>
            </motion.div>
          ) : (
            // Transactions list
            <div className="h-full overflow-y-auto pr-1 -mr-1" ref={listRef}>
              <div className="space-y-2 pb-16">
                {recentTransactions.map((tx, idx) => {
                  const Icon = CATEGORY_ICONS[tx.category] || FileText;
                  return (
                    <motion.div
                      key={idx}
                      ref={(el) => (itemRefs.current[idx] = el)}
                      className="group flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50/70 hover:shadow-sm transition-all duration-200 relative"
                      variants={itemVariants}
                      onClick={() => handleRowClick(idx)}
                      onMouseEnter={() => handleMouseEnter(idx)}
                      onMouseLeave={handleMouseLeave}
                    >
                      {" "}
                      {/* Tooltip */}
                      <AnimatePresence>
                        {activeTooltipIndex === idx && (
                          <motion.div
                            className={`fixed sm:absolute z-50 bg-white border border-gray-200 shadow-lg rounded-lg p-4 overflow-hidden text-sm
                              ${
                                windowWidth < 768
                                  ? "inset-2 top-1/4 bottom-auto"
                                  : tooltipPositionRef.current === "left"
                                  ? "left-auto right-full translate-x-[-12px] top-0 w-[280px] lg:w-[320px] max-w-xs"
                                  : "left-full translate-x-[12px] right-auto top-0 w-[280px] lg:w-[320px] max-w-xs"
                              }`}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              // Add slight drop shadow for better visibility on desktop
                              boxShadow:
                                windowWidth >= 768
                                  ? "0 4px 16px rgba(0,0,0,0.08)"
                                  : "",
                            }}
                          >
                            {/* Desktop arrow indicator */}
                            {windowWidth >= 768 && (
                              <div
                                className={`absolute top-4 h-3 w-3 rotate-45 bg-white border 
                                  ${
                                    tooltipPositionRef.current === "left"
                                      ? "right-0 -mr-1.5 border-t-0 border-l-0 border-gray-200"
                                      : "left-0 -ml-1.5 border-b-0 border-r-0 border-gray-200"
                                  }`}
                              ></div>
                            )}
                            <div className="flex justify-between items-center mb-3">
                              <div className="text-xs font-medium">
                                {new Date(tx.date).toLocaleDateString(
                                  undefined,
                                  {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  }
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                                  {tx.formattedTime}
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveTooltipIndex(null);
                                  }}
                                  className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            </div>

                            <div className="flex items-center mb-3 bg-gray-50 p-2 rounded">
                              <div className="h-6 w-6 rounded-md bg-gray-200 flex items-center justify-center mr-2">
                                <Icon size={14} className="text-gray-700" />
                              </div>
                              <span className="text-sm font-medium">
                                {tx.category || "Uncategorized"}
                              </span>
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Type</span>
                                <span
                                  className={`font-medium px-1.5 py-0.5 rounded-sm ${
                                    tx.isCredit
                                      ? "bg-green-50 text-green-600"
                                      : "bg-red-50 text-red-600"
                                  }`}
                                >
                                  {tx.isCredit ? "CREDIT" : "DEBIT"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Amount</span>
                                <span
                                  className={`font-medium ${
                                    tx.isCredit
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {tx.isCredit ? "+" : "-"}₹
                                  {Math.abs(
                                    parseFloat(tx.amount)
                                  ).toLocaleString("en-IN", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </span>
                              </div>
                              {tx.description && (
                                <div className="pt-2 mt-1 border-t border-gray-100">
                                  <p className="text-xs text-gray-500">
                                    Description
                                  </p>
                                  <p className="text-sm">{tx.description}</p>
                                </div>
                              )}
                            </div>

                            {windowWidth < 768 && (
                              <button
                                onClick={() => setActiveTooltipIndex(null)}
                                className="mt-4 w-full py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium text-gray-700 transition-colors"
                              >
                                Close
                              </button>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                      {/* Transaction Item - left side with icon and description */}
                      <div className="flex items-center gap-3">
                        <div className="relative flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                            <Icon size={18} className="text-gray-700" />
                          </div>
                          <div
                            className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center shadow-sm ${
                              tx.isCredit
                                ? "bg-green-100 text-green-600"
                                : "bg-red-100 text-red-600"
                            }`}
                          >
                            {tx.isCredit ? (
                              <ArrowUpRight size={12} />
                            ) : (
                              <ArrowDownRight size={12} />
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-medium truncate max-w-[120px] xs:max-w-[140px] sm:max-w-[180px] md:max-w-[220px] lg:max-w-[260px]">
                            {tx.description || "Unknown merchant"}
                          </span>
                          <div className="flex items-center text-xs text-gray-500 gap-1">
                            <span className="whitespace-nowrap">
                              {formatDate(tx.date)}
                            </span>
                            <span>•</span>
                            <span className="whitespace-nowrap">
                              {tx.formattedTime}
                            </span>
                          </div>
                        </div>
                      </div>
                      {/* Transaction amount - right side */}
                      <span
                        className={`font-semibold whitespace-nowrap ${
                          tx.isCredit ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {tx.isCredit ? "+" : "-"}
                        {formatCurrency(Math.abs(parseFloat(tx.amount)))}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
