"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { useMyContext } from "@/context/MyContext";
import Loding from "./_components/Loding";
import PlaidLink from "./_components/PlaidLink";
import TransactionSummary from "./charts/TransactionSummary";

// Lazy-load components using default exports
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
  const { userTransaction, setUserTransaction, fetchTransactions } =
    useMyContext();
  const { data: session, status } = useSession();
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  const memoizedTransactions = useMemo(
    () => userTransaction,
    [userTransaction]
  );
  const hasTransactions = useMemo(
    () => !!memoizedTransactions?.length,
    [memoizedTransactions]
  );

  if (status === "loading" || loadingTransactions) {
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
    <div className="mx-auto lg:px-4">
      <div className="bg-white p-4 lg:p-6 rounded-lg shadow mb-6 flex flex-col md:flex-row justify-between items-start">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">
            Welcome, {session.user.email}
          </h1>
          <p className="text-gray-600">Your financial dashboard is ready.</p>
        </div>
        <PlaidLink onConnected={fetchTransactions} />
      </div>

      {hasTransactions ? (
        <>
          <TransactionSummary transactions={memoizedTransactions} />

          <div className="flex flex-col gap-4">
            <div className="grid lg:grid-cols-2 grid-cols-1 gap-6 mt-6 lg:h-[400px] h-auto">
              <AreaCharts userTransaction={memoizedTransactions} />
              <LineChartComponent userTransaction={memoizedTransactions} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-4 mt-6">
              <PieChartCard userTransaction={memoizedTransactions} />
              <PolarAreaChart userTransaction={memoizedTransactions} />
              <RadarCharts userTransaction={memoizedTransactions} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-6">
              <TopPositiveTable transactions={memoizedTransactions} />
              <TopNegativeTable transactions={memoizedTransactions} />
              <TopCategoriesTable transactions={memoizedTransactions} />
            </div>
          </div>
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
