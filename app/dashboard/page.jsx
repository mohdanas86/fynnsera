"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { useMyContext } from "@/context/MyContext";
import Loding from "./_components/Loding";
import PlaidLink from "./_components/PlaidLink";
import TransactionSummary from "./charts/TransactionSummary";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";

// Lazy load charts
const AreaCharts = dynamic(() => import("./charts/AreaCharts"), { ssr: false });
const LineChartComponent = dynamic(
  () => import("./charts/LineChartComponent"),
  { ssr: false }
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
  { ssr: false }
);

export default function Home() {
  const { userTransaction, fetchTransactions } = useMyContext();
  const { data: session, status } = useSession();
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Set default date range
  useEffect(() => {
    if (userTransaction && userTransaction.length) {
      const validDates = userTransaction
        .map((tx) => new Date(tx.date))
        .filter((d) => !isNaN(d));
      if (validDates.length > 0) {
        const min = new Date(Math.min(...validDates));
        const max = new Date(Math.max(...validDates));
        const format = (d) => d.toISOString().slice(0, 10);
        setDateFrom(format(min));
        setDateTo(format(max));
      }
    }
  }, [userTransaction]);

  const filteredTransactions = useMemo(() => {
    if (!userTransaction || !userTransaction.length) return [];
    return userTransaction.filter((tx) => {
      const txDate = new Date(tx.date);
      if (dateFrom && new Date(dateFrom) > txDate) return false;
      if (dateTo && new Date(dateTo) < txDate) return false;
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
    <div className="mx-auto lg:p-4">
      <div className="bg-white bg-gradient-to-r from-white to-gray-50 p-4 lg:p-6 rounded-md shadow-sm mb-6 flex flex-col md:flex-row justify-between items-start">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">
            Welcome, {session.user.email}
          </h1>
          <p className="text-gray-600">Your financial dashboard is ready.</p>
        </div>
        <PlaidLink onConnected={fetchTransactions} />
      </div>

      {hasOriginalData ? (
        <>
          {/* Filters and Export */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-6 rounded-md shadow-sm bg-gradient-to-r from-white to-gray-50 border border-gray-200 mb-8">
            {/* Date Range Picker */}
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 font-medium mb-1">
                  From
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200 text-sm shadow-sm"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 font-medium mb-1">
                  To
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200 text-sm shadow-sm"
                />
              </div>

              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl shadow-md transition-all duration-200"
                onClick={() => {}}
              >
                Apply
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  setDateFrom("");
                  setDateTo("");
                }}
                className="border-gray-300 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-100 transition-all duration-200"
              >
                Clear
              </Button>
            </div>

            {/* Export Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="rounded-xl flex gap-2 items-center bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 hover:from-gray-200 hover:to-gray-300 shadow-inner border border-gray-300">
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
          </div>

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
      ) : (
        <div className="bg-blue-100 p-6 rounded-lg shadow mb-6 text-center">
          <h2 className="text-2xl font-bold mb-2">No Transactions Available</h2>
          <p className="text-gray-600">
            Connect your bank account to see your transactions.
          </p>
          <div className="mt-4">
            <PlaidLink onConnected={fetchTransactions} />
          </div>
        </div>
      )}
    </div>
  );
}
