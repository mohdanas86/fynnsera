"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import PlaidLink from "./_components/PlaidLink";
import { useMyContext } from "@/context/MyContext";
import { AreaCharts } from "./charts/AreaCharts";
import { BarCharts } from "./charts/BarCharts";
import { VerticalBarChart } from "./charts/VerticalBarChart";
import { RadarCharts } from "./charts/RadarCharts";
import TopPositiveTable from "./_components/TopPositiveTable";
import TopNegativeTable from "./_components/TopNegativeTable";
import TopCategoriesTable from "./_components/TopCategoriesTable";
import Loding from "./_components/Loding";
import TransactionSummary from "./_components/TransactionSummary";

export default function Home() {
  const { userTransaction, setUserTransaction } = useMyContext();
  const { data: session, status } = useSession();
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  // Memoize the transactions data so child components only update when needed.
  const memoizedTransactions = useMemo(
    () => userTransaction,
    [userTransaction]
  );
  const hasTransactions = useMemo(
    () => memoizedTransactions && memoizedTransactions.length > 0,
    [memoizedTransactions]
  );

  // Function to fetch transactions after the bank connection is established.
  const fetchTransactions = async () => {
    if (status === "authenticated" && session?.user?.id && !hasFetched) {
      setLoadingTransactions(true);
      try {
        const response = await fetch(
          `/api/transactions?userId=${session.user.id}`
        );
        if (!response.ok) throw new Error("Failed to fetch transactions");
        const data = await response.json();
        setUserTransaction(data);
        setHasFetched(true);
        console.log("Transactions:", data);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoadingTransactions(false);
      }
    }
  };

  useEffect(() => {
    if (status === "authenticated" && !hasFetched) {
      fetchTransactions();
    }
  }, [session, status, hasFetched]);

  if (status === "loading" || loadingTransactions) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loding />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center h-screen">
        Please sign in to connect your bank account.
      </div>
    );
  }

  return (
    <div className="mx-auto lg:px-4">
      {/* Welcome Card with bank connection button */}
      <div className="bg-white lg:p-6 lg:rounded-lg lg:shadow mb-6 flex flex-col md:flex-row justify-between items-start">
        <div className="mb-4 md:mb-0">
          <h1 className="lg:text-3xl text-2xl font-bold mb-2">
            Welcome, {session.user.email}
          </h1>
          <p className="text-gray-600">Your financial dashboard is ready.</p>
        </div>
        <div>
          <PlaidLink onConnected={fetchTransactions} />
        </div>
      </div>

      {/* Fallback card when there are no transactions */}
      {hasTransactions ? (
        <TransactionSummary transactions={memoizedTransactions} />
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

      {/* Tables */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-6">
        <TopPositiveTable transactions={memoizedTransactions} />
        <TopNegativeTable transactions={memoizedTransactions} />
        <TopCategoriesTable transactions={memoizedTransactions} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4">
        <div className="flex w-full h-[400px]">
          <AreaCharts userTransaction={memoizedTransactions} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 w-full py-4 mt-6 gap-8">
          <BarCharts userTransaction={memoizedTransactions} />
          <VerticalBarChart userTransaction={memoizedTransactions} />
          <RadarCharts userTransaction={memoizedTransactions} />
        </div>
      </div>
    </div>
  );
}
