"use client";

import { useSession } from "next-auth/react";
import PlaidLink from "../_components/PlaidLink";
import TransactionsTable from "../_components/TransactionsTable";
import { useState, useEffect, useMemo } from "react";
import Loding from "../_components/Loding";

export default function Home() {
  const { data: session, status } = useSession();
  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  // Memoize the transactions data for performance
  const memoizedTransactions = useMemo(() => transactions, [transactions]);
  const hasTransactions = useMemo(
    () => memoizedTransactions && memoizedTransactions.length > 0,
    [memoizedTransactions]
  );

  const fetchTransactions = async () => {
    if (status === "authenticated" && session?.user?.id && !hasFetched) {
      setLoadingTransactions(true);
      try {
        const response = await fetch(
          `/api/transactions?userId=${session.user.id}`
        );
        if (!response.ok) throw new Error("Failed to fetch transactions");
        const data = await response.json();
        setTransactions(data);
        setHasFetched(true);
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
      <div className="flex items-center justify-center min-h-screen">
        <Loding />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Please sign in to connect your bank account.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto lg:p-4">
      <div className="flex flex-col lg:flex-row lg:space-x-8">
        {hasTransactions ? (
          <div className="w-full">
            <TransactionsTable transactions={memoizedTransactions} />
          </div>
        ) : (
          <div className="w-full bg-green-100 p-6 rounded-lg shadow text-center">
            <h2 className="text-2xl font-bold mb-2">No Transactions Found</h2>
            <p className="text-gray-600 mb-4">
              Connect your bank account to start tracking your transactions.
            </p>
            <div className="flex justify-center">
              <PlaidLink onConnected={fetchTransactions} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
