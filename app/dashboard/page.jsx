"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useMyContext } from "@/context/MyContext";
import Loading from "./_components/Loading";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@radix-ui/react-dropdown-menu";
import * as Dialog from "@radix-ui/react-dialog";
import { ChevronDown, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DatePickerWithRange } from "@/components/ui/DatePickerWithRange";
import * as XLSX from "xlsx";

// Import dashboard components
import SummaryHeaderStats from "./_components/SummaryHeaderStats";
import CashFlowLineChart from "./_components/CashFlowLineChart";
import CategorySpendingDonut from "./_components/CategorySpendingDonut";
import MonthlyTrendChart from "./_components/MonthlyTrendChart";
import TopCategoriesList from "./_components/TopCategoriesList";
import SpendingHeatmap from "./_components/SpendingHeatmap";
import RecentTransactionsMini from "./_components/RecentTransactionsMini";
import AIInsightCards from "./_components/AIInsightCards";
import DashboardSettings from "./_components/DashboardSettings";

export default function Home() {
  const {
    userTransaction,
    selectedProvider,
    selectedFileData,
    handleSelect,
    userFileLogs,
  } = useMyContext();
  const { data: session, status } = useSession();
  // Date picker state
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  // AI insights toggle state
  const [aiInsightsEnabled, setAiInsightsEnabled] = useState(true);
  // Loading states
  const [isLoading, setIsLoading] = useState(true);

  // Set default date range based on transactions (if available)
  useEffect(() => {
    if (userTransaction && userTransaction.length) {
      const validDates = userTransaction
        .map((tx) => new Date(tx.date))
        .filter((d) => !isNaN(d));
      if (validDates.length > 0) {
        const min = new Date(Math.min(...validDates));
        const max = new Date(Math.max(...validDates));
        const formatDate = (d) => d.toISOString().slice(0, 10);
        setDateFrom(formatDate(min));
        setDateTo(formatDate(max));
      }
    }
  }, [userTransaction]);

  // Update loading state when transaction data changes
  useEffect(() => {
    if (status === "loading") {
      setIsLoading(true);
      return;
    }

    if (userTransaction && userTransaction.length > 0) {
      // Show loading for a brief moment to demonstrate skeleton states
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1500);

      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
    }
  }, [userTransaction, status]);

  const filteredTransactions = useMemo(() => {
    if (!userTransaction || !userTransaction.length) return [];
    return userTransaction.filter((tx) => {
      if (!tx.date) return false;
      const txDate = new Date(tx.date);
      const txDay = new Date(txDate.toDateString()); // normalize time
      const from = dateFrom
        ? new Date(new Date(dateFrom).toDateString())
        : null;
      const to = dateTo ? new Date(new Date(dateTo).toDateString()) : null;
      if (from && txDay < from) return false;
      if (to && txDay > to) return false;
      return true;
    });
  }, [userTransaction, dateFrom, dateTo]);

  const hasOriginalData = useMemo(
    () => userTransaction && userTransaction.length > 0,
    [userTransaction]
  );
  const hasFilteredData = useMemo(
    () => filteredTransactions && filteredTransactions.length > 0,
    [filteredTransactions]
  );

  const handleExport = (format) => {
    if (!hasFilteredData) return;
    if (format === "csv") {
      const csvRows = [];
      const headers = Object.keys(filteredTransactions[0]);
      csvRows.push(headers.join(","));
      filteredTransactions.forEach((row) => {
        const values = headers.map((h) => JSON.stringify(row[h] || ""));
        csvRows.push(values.join(","));
      });
      const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "transactions.csv";
      a.click();
    } else if (format === "xlsx") {
      const ws = XLSX.utils.json_to_sheet(filteredTransactions);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Transactions");
      XLSX.writeFile(wb, "transactions.xlsx");
    }
  };

  console.log("filteredTransactions", filteredTransactions);
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loading />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center h-screen text-center text-gray-700">
        Please sign in to connect your bank account.
      </div>
    );
  }
  return (
    <div className="container mx-auto lg:p-8 md:p-6 p-3 max-w-7xl bg-[#0D0D0D]">
      {/* Header */}{" "}
      <div className="mb-4 sm:mb-6 lg:mb-8 flex flex-col md:flex-row justify-between items-start">
        <div className="mb-4 md:mb-0">
          {/* <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2 text-[var(--color-heading)]"> */}
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2 text-[#fff]">
            Welcome, {session.user.name}
          </h1>
          <p className="text-sm sm:text-base text-[var(--color-para)]">
            Your financial dashboard is ready.
          </p>
        </div>
        {hasOriginalData && (
          <div className="flex items-center justify-end gap-2 sm:gap-3 w-full md:w-auto">
            <DashboardSettings
              aiInsightsEnabled={aiInsightsEnabled}
              onToggleAIInsights={(value) => setAiInsightsEnabled(value)}
            />

            <Link
              href="/dashboard/upload-files"
              className="flex-1 md:flex-none max-w-[180px] sm:max-w-[120px]"
            >
              <Button className="w-full md:w-auto bg-[var(--color-primary)] text-white rounded-md hover:bg-[var(--color-primary-dark)] shadow-sm hover:shadow-md transition-all text-sm">
                Upload File
              </Button>
            </Link>
          </div>
        )}
      </div>
      {hasOriginalData && (
        <>
          {" "}
          {/* Mobile: Filter section */}
          <div className="lg:hidden mb-6">
            <hr className="border-gray-200 mb-4" />
            <div className="flex justify-between items-center gap-4">
              <div className="flex-grow max-w-[65%]">
                <DatePickerWithRange
                  defaultRange={{
                    from: dateFrom ? new Date(dateFrom) : undefined,
                    to: dateTo ? new Date(dateTo) : undefined,
                  }}
                  onChange={(range) => {
                    setDateFrom(range?.from?.toISOString().slice(0, 10) || "");
                    setDateTo(range?.to?.toISOString().slice(0, 10) || "");
                  }}
                />
              </div>
              <PhoneFilterModal
                dateFrom={dateFrom}
                dateTo={dateTo}
                setDateFrom={setDateFrom}
                setDateTo={setDateTo}
                handleExport={handleExport}
                selectedProvider={selectedProvider}
                userFileLogs={userFileLogs}
                handleSelect={handleSelect}
                selectedFileData={selectedFileData}
              />
            </div>
          </div>{" "}
          {/* Desktop: Inline filter */}
          <div className="hidden lg:block mb-6">
            {/* <div className="bg-white rounded-lg shadow-sm p-5 flex flex-wrap justify-between items-center"> */}
            <div className="bg-[#262626] rounded-lg shadow-sm p-5 flex flex-wrap justify-between items-center">
              <div className="flex gap-4 items-center">
                {selectedFileData && (
                  // <div className="flex items-center bg-gray-50 px-4 py-2 rounded-md border border-gray-100">
                  <div className="flex items-center bg-[#0D0D0D] text-white px-4 py-2 rounded-md border border-[#606060]">
                    <span className="font-semibold mr-2">Current Balance:</span>{" "}
                    {/* <span className="IbmFont text-[var(--color-primary)] font-bold"> */}
                    <span className="IbmFont text-teal-400 font-bold">
                      ₹
                      {parseInt(selectedFileData.currentBalance).toLocaleString(
                        "en-IN"
                      )}
                    </span>
                  </div>
                )}
                <DatePickerWithRange
                  defaultRange={{
                    from: dateFrom ? new Date(dateFrom) : undefined,
                    to: dateTo ? new Date(dateTo) : undefined,
                  }}
                  onChange={(range) => {
                    setDateFrom(range?.from?.toISOString().slice(0, 10) || "");
                    setDateTo(range?.to?.toISOString().slice(0, 10) || "");
                  }}
                />
              </div>
              <div className="flex items-center gap-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="rounded-md flex gap-2 items-center shadow-sm border border-gray-200 hover:bg-gray-50 transition-all duration-200"
                    >
                      <Download className="w-4 h-4" /> Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="bg-white border border-gray-200 rounded-lg shadow-lg p-2 w-48"
                  >
                    <DropdownMenuItem
                      onClick={() => handleExport("csv")}
                      className="cursor-pointer px-2 py-2 rounded-md hover:bg-gray-100 text-sm"
                    >
                      Export as CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleExport("xlsx")}
                      className="cursor-pointer px-2 py-2 rounded-md hover:bg-gray-100 text-sm"
                    >
                      Export as XLSX
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-[220px] flex justify-between items-center rounded-md border border-gray-200 shadow-sm px-4 py-2 bg-white hover:bg-gray-50 transition-all duration-200"
                    >
                      <span className="text-sm font-medium text-gray-700">
                        {selectedProvider || "Select Provider"}
                      </span>
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[220px] rounded-md shadow-md border border-gray-200 bg-white z-50">
                    <DropdownMenuLabel className="text-xs font-semibold text-gray-500 px-3 py-2">
                      Files
                    </DropdownMenuLabel>
                    {userFileLogs.data.length > 0 ? (
                      userFileLogs.data.map((file, index) => (
                        <DropdownMenuItem
                          key={index}
                          onSelect={() => handleSelect(file)}
                          className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 transition-colors"
                        >
                          {file.filename}
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-gray-400">
                        No files found
                      </div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>{" "}
          {/* Redesigned Dashboard with New Components */}
          {hasFilteredData ? (
            <div className="flex flex-col gap-4 sm:gap-6 lg:gap-8">
              {/* Summary Header Stats */}
              <div className="w-full overflow-x-auto pb-2 -mb-2 sm:pb-0 sm:mb-0">
                <div className="lg:min-w-[640px] sm:min-w-0">
                  <SummaryHeaderStats
                    transactions={filteredTransactions}
                    currentBalance={selectedFileData?.currentBalance || 0}
                    isLoading={isLoading}
                  />
                </div>
              </div>
              {/* AI Insight Cards */}
              <div className="w-full overflow-x-auto pb-2 -mb-2 sm:pb-0 sm:mb-0">
                <div className="min-w-[640px] sm:min-w-0">
                  <AIInsightCards
                    transactions={filteredTransactions}
                    enabled={aiInsightsEnabled}
                    isLoading={isLoading}
                  />
                </div>
              </div>
              {/* Main Charts - 2 column layout */}
              <div className="grid lg:grid-cols-2 grid-cols-1 gap-4 sm:gap-6 lg:gap-8">
                {/* Cash Flow Line Chart */}
                <div className="w-full h-[300px] sm:h-[350px] lg:h-[400px]">
                  <CashFlowLineChart
                    transactions={filteredTransactions}
                    isLoading={isLoading}
                  />
                </div>
                {/* Category Spending Donut */}
                <div className="w-full h-[300px] sm:h-[350px] lg:h-[400px]">
                  <CategorySpendingDonut
                    transactions={filteredTransactions}
                    isLoading={isLoading}
                  />
                </div>
              </div>{" "}
              {/* Secondary Charts - 2 column layout */}
              <div className="grid lg:grid-cols-2 grid-cols-1 gap-4 sm:gap-6 lg:gap-8">
                {/* Monthly Trend Chart */}
                <div className="w-full h-[300px] sm:h-[350px] lg:h-[400px]">
                  <MonthlyTrendChart
                    transactions={filteredTransactions}
                    isLoading={isLoading}
                  />
                </div>
                {/* Top Categories List */}
                <div className="w-full h-[300px] sm:h-[350px] lg:h-[400px]">
                  <TopCategoriesList
                    transactions={filteredTransactions}
                    isLoading={isLoading}
                  />
                </div>
              </div>
              {/* Bottom Row - 2 column layout */}
              <div className="grid lg:grid-cols-2 grid-cols-1 gap-4 sm:gap-6 lg:gap-8">
                {/* Recent Transactions Mini */}
                <div className="w-full h-[300px] sm:h-[350px] lg:h-[400px]">
                  <RecentTransactionsMini
                    transactions={filteredTransactions}
                    isLoading={isLoading}
                  />
                </div>
                {/* Spending Heatmap */}
                <div className="w-full h-[300px] sm:h-[350px] lg:h-[400px]">
                  <SpendingHeatmap
                    transactions={filteredTransactions}
                    isLoading={isLoading}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 p-4 sm:p-6 rounded-lg shadow-sm border border-amber-100 mb-4 sm:mb-6 text-center">
              <svg
                className="w-8 h-8 sm:w-12 sm:h-12 text-amber-500 mx-auto mb-2 sm:mb-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <h2 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2 text-amber-800">
                No Transactions Found
              </h2>
              <p className="text-sm sm:text-base text-amber-700">
                No transactions match your selected date range. Try adjusting
                your filters.
              </p>
            </div>
          )}
        </>
      )}
      {!hasOriginalData && (
        <div className="bg-gradient-to-br from-teal-50 to-blue-50 p-8 rounded-lg shadow-sm border border-blue-100 mb-6 text-center">
          <div className="max-w-md mx-auto">
            <svg
              className="w-16 h-16 text-blue-500 mx-auto mb-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h2 className="text-2xl font-bold mb-3 text-gray-800">
              No Transactions Available
            </h2>
            <p className="text-gray-600 mb-6">
              Connect your bank account or upload a transaction file to start
              tracking your finances.
            </p>
            <div className="flex justify-center">
              <Link href="/dashboard/upload-files">
                <Button className="bg-[var(--color-primary)] text-white rounded-md hover:bg-[var(--color-primary-dark)] w-[200px] py-2 shadow-md hover:shadow-lg transition-all">
                  Upload File
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------
// PhoneFilterModal: Mobile-only filter (triggered as a modal)
// The date picker is hidden by default and toggles on user click.
// ---------------------------------------------------------
// import { Dialog } from "@radix-ui/react-dialog";
// import { DropdownMenu } from "@radix-ui/react-dropdown-menu";
// import { Download, ChevronDown } from "lucide-react";

import { motion } from "framer-motion";

export function PhoneFilterModal({
  handleExport,
  selectedProvider,
  userFileLogs,
  handleSelect,
  selectedFileData,
}) {
  return (
    <Dialog.Root>
      {/* Trigger button for mobile */}
      <Dialog.Trigger asChild>
        <Button
          variant="outline"
          className="flex lg:hidden font-semibold justify-center items-center rounded-md shadow-sm hover:shadow-md transition-all duration-300 bg-white border border-gray-200"
        >
          <span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-4 mr-1"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
              />
            </svg>
          </span>
          <span>Filter</span>
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        {/* Animate the overlay */}
        <Dialog.Overlay asChild>
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        </Dialog.Overlay>
        {/* Animate the content */}
        <Dialog.Content asChild>
          {" "}
          <motion.div
            className="fixed inset-x-0 bottom-0 p-4 sm:p-6 bg-white rounded-t-xl shadow-2xl max-h-[90vh] z-50 mx-auto transform transition-all duration-300 overflow-y-auto"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-between items-center mb-4">
              <Dialog.Title className="text-lg sm:text-xl font-bold text-gray-800">
                Filter Transactions
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="rounded-full p-1 hover:bg-gray-100 transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
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
                </button>
              </Dialog.Close>
            </div>{" "}
            <div className="flex flex-col gap-4 sm:gap-6">
              {selectedFileData && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 sm:p-4 rounded-lg shadow-sm">
                  <span className="font-semibold text-base sm:text-lg text-gray-800">
                    Current Balance:{" "}
                    <span className="IbmFont text-[var(--color-primary)] font-bold">
                      ₹
                      {parseInt(selectedFileData.currentBalance).toLocaleString(
                        "en-IN"
                      )}
                    </span>
                  </span>
                </div>
              )}

              {/* Export Dropdown */}
              <div className="flex flex-col gap-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full flex gap-2 items-center bg-white border rounded-md border-gray-200 px-4 py-3 text-gray-700 font-medium shadow-sm hover:bg-gray-50 hover:shadow-md transition-all duration-200"
                    >
                      {" "}
                      <Download className="w-4 h-4 sm:w-5 sm:h-5" /> Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="bg-white border border-gray-200 rounded-lg shadow-xl p-2 w-full max-w-[250px] z-50"
                  >
                    <DropdownMenuItem
                      onClick={() => handleExport("csv")}
                      className="cursor-pointer px-3 py-2 rounded-md hover:bg-indigo-50 text-xs sm:text-sm text-gray-700 hover:text-indigo-600 transition-colors duration-200"
                    >
                      Export as CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleExport("xlsx")}
                      className="cursor-pointer px-3 py-2 rounded-md hover:bg-indigo-50 text-xs sm:text-sm text-gray-700 hover:text-indigo-600 transition-colors duration-200"
                    >
                      Export as XLSX
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Provider selection dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full flex justify-between items-center rounded-md border border-gray-200 shadow-sm px-4 py-3 bg-white text-gray-700 font-medium hover:bg-gray-50 hover:shadow-md transition-all duration-200"
                    >
                      <span className="text-sm">
                        {selectedProvider || "Select Provider"}
                      </span>
                      <ChevronDown className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full rounded-lg shadow-xl border border-gray-200 bg-white z-50 p-2">
                    <DropdownMenuLabel className="text-xs font-semibold text-gray-500 px-3 py-2">
                      Files
                    </DropdownMenuLabel>
                    {userFileLogs.data.length > 0 ? (
                      userFileLogs.data.map((file, index) => (
                        <DropdownMenuItem
                          key={index}
                          onSelect={() => handleSelect(file)}
                          className="px-3 py-2 text-sm cursor-pointer rounded-md hover:bg-indigo-50 transition-colors duration-200"
                        >
                          {file.filename}
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-gray-400">
                        No files found
                      </div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            {/* Apply Filters button */}
            <Dialog.Close asChild>
              <Button className="mt-8 w-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white font-semibold py-3 rounded-md shadow-md hover:shadow-lg hover:opacity-90 transition-all duration-300">
                Apply Filters
              </Button>
            </Dialog.Close>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
