"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useMyContext } from "@/context/MyContext";
import Loding from "./_components/Loding";
import TransactionSummary from "./charts/TransactionSummary";
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

// Lazy load charts (client-side only)
const AreaCharts = dynamic(() => import("./charts/AreaCharts"), { ssr: false });
const LineChartComponent = dynamic(
  () => import("./charts/LineChartComponent"),
  {
    ssr: false,
  }
);
const PieChartCard = dynamic(() => import("./charts/PieChartCard"), {
  ssr: false,
});
const PolarAreaChart = dynamic(() => import("./charts/PolarAreaChart"), {
  ssr: false,
});
const RadarCharts = dynamic(() => import("./charts/RadarCharts"), {
  ssr: false,
});
const TopPositiveTable = dynamic(() => import("./charts/TopPositiveTable"), {
  ssr: false,
});
const TopNegativeTable = dynamic(() => import("./charts/TopNegativeTable"), {
  ssr: false,
});
const TopCategoriesTable = dynamic(
  () => import("./charts/TopCategoriesTable"),
  {
    ssr: false,
  }
);

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

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loding />
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
    <div className="mx-auto lg:p-4 ">
      {/* Header */}
      <div className="lg:bg-white lg:bg-gradient-to-r from-white to-gray-50 lg:p-6 lg:rounded-md lg:shadow-sm mb-6 flex flex-col md:flex-row justify-between items-start">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">
            Welcome, {session.user.name}
          </h1>
          <p className="text-gray-600">Your financial dashboard is ready.</p>
        </div>
        {hasOriginalData && (
          <div className="flex gap-4">
            <Link href="/dashboard/upload-files">
              <Button className="bg-[var(--color-primary)] text-white rounded-[2px] hover:bg-[var(--color-primary-dark)] lg:w-[200px] w-[110px]">
                Upload File
              </Button>
            </Link>
          </div>
        )}
      </div>

      {hasOriginalData && (
        <>
          {/* Mobile: Filter shown as a modal */}
          <hr className="border lg:hidden mb-6" />
          <div className="flex justify-between items-center lg:hidden  gap-4">
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

          {/* Desktop: Inline filter */}
          <div className="hidden lg:block mb-6">
            <div className="flex flex-wrap justify-between items-center border-gray-200 mb-5 mt-4">
              <div className="flex gap-2 items-center">
                {selectedFileData && (
                  <span className="font-semibold">
                    <span className=" font-bold">Current Balance:</span>{" "}
                    {selectedFileData.currentBalance}
                  </span>
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
                      className="rounded-sm flex gap-2 items-center shadow-inner border border-gray-300"
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
                      className="w-[220px] flex justify-between items-center rounded-[4px] border border-gray-300 shadow-sm px-4 py-2 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-sm font-medium text-gray-700">
                        {selectedProvider || "Select Provider"}
                      </span>
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[220px] rounded-[4px] shadow-md border border-gray-200 bg-white z-50">
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
          </div>

          {/* Transactions & Charts */}
          {hasFilteredData ? (
            <>
              <TransactionSummary transactions={filteredTransactions} />
              <div className="flex flex-col gap-4">
                <div className="grid lg:grid-cols-2 grid-cols-1 gap-6 mt-6 lg:h-[400px] h-auto mb-6">
                  <AreaCharts userTransaction={filteredTransactions} />
                  <LineChartComponent userTransaction={filteredTransactions} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
                  <PieChartCard userTransaction={filteredTransactions} />
                  <PolarAreaChart userTransaction={filteredTransactions} />
                  <RadarCharts userTransaction={filteredTransactions} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
                  <TopPositiveTable transactions={filteredTransactions} />
                  <TopNegativeTable transactions={filteredTransactions} />
                  <TopCategoriesTable transactions={filteredTransactions} />
                </div>
              </div>
            </>
          ) : (
            <div className="bg-yellow-100 p-6 rounded-lg shadow mb-6 text-center">
              <h2 className="text-xl font-semibold mb-2">No Transactions</h2>
              <p className="text-gray-600">
                No transactions found in the selected date range.
              </p>
            </div>
          )}
        </>
      )}

      {!hasOriginalData && (
        <div className="bg-teal-50 p-6 rounded-lg shadow mb-6 text-center">
          <h2 className="text-2xl font-bold mb-2">No Transactions Available</h2>
          <p className="text-gray-600">
            Connect your bank account to see your transactions.
          </p>
          <div className="mt-4 flex gap-4 justify-center items-center flex-wrap">
            <Link href="/dashboard/upload-files">
              <Button className="bg-[var(--color-primary)] text-white rounded-[2px] hover:bg-[var(--color-primary-dark)] w-[200px]">
                Upload File
              </Button>
            </Link>
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
          className="flex lg:hidden font-semibold justify-center items-center rounded-[5px] shadow-sm hover:shadow-md transition-all duration-300"
        >
          <span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-4"
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          />
        </Dialog.Overlay>
        {/* Animate the content */}
        <Dialog.Content asChild>
          <motion.div
            className="fixed inset-x-4 bottom-0 p-6 bg-white rounded-t-2xl shadow-2xl max-w-md mx-auto transform transition-all duration-300 md:max-w-lg overflow-y-auto"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
          >
            <Dialog.Title className="text-2xl font-bold text-gray-800 mb-6">
              Filter Transactions
            </Dialog.Title>
            <div className="flex flex-col gap-6">
              {selectedFileData && (
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg shadow-sm">
                  <span className="font-semibold text-lg text-gray-800">
                    Current Balance:{" "}
                    <span>{selectedFileData.currentBalance}</span>
                  </span>
                </div>
              )}

              {/* Export Dropdown */}
              <div className="flex flex-col gap-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full flex gap-2 items-center bg-white border rounded-[2px] border-gray-200 px-4 py-3 text-gray-700 font-medium shadow-sm hover:bg-gray-50 hover:shadow-md transition-all duration-200"
                    >
                      <Download className="w-5 h-5" /> Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="bg-white border border-gray-200 rounded-lg shadow-xl p-2 w-56 z-50"
                  >
                    <DropdownMenuItem
                      onClick={() => handleExport("csv")}
                      className="cursor-pointer px-3 py-2 rounded-md hover:bg-indigo-50 text-sm text-gray-700 hover:text-indigo-600 transition-colors duration-200"
                    >
                      Export as CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleExport("xlsx")}
                      className="cursor-pointer px-3 py-2 rounded-md hover:bg-indigo-50 text-sm text-gray-700 hover:text-indigo-600 transition-colors duration-200"
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
                      className="w-full flex justify-between items-center rounded-[2px] border border-gray-200 shadow-sm px-4 py-3 bg-white text-gray-700 font-medium hover:bg-gray-50 hover:shadow-md transition-all duration-200"
                    >
                      <span className="text-sm">
                        {selectedProvider || "Select Provider"}
                      </span>
                      <ChevronDown className="w-5 h-5 " />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full max-w-[220px] rounded-lg shadow-xl border border-gray-200 bg-white z-50 p-2">
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
            {/* Close/Apply Filters button */}
            <Dialog.Close asChild>
              <Button className="mt-8 w-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white font-semibold py-3 rounded-[2px] shadow-md hover:shadow-lg hover:bg-[var(--color-primary-dark)] transition-all duration-300">
                Apply Filters
              </Button>
            </Dialog.Close>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
