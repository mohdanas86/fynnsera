"use client";
import { useSession } from "next-auth/react";
import PlaidLink from "../_components/PlaidLink";
import TransactionsTable from "../_components/TransactionsTable";
import { useMyContext } from "@/context/MyContext";
import Loding from "../_components/Loding";

export default function Home() {
  const { data: session, status } = useSession();
  const { userTransaction, fetchTransactions } = useMyContext();

  if (status === "loading") {
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
    <div className="container mx-auto lg:px-4">
      <h1 className="text-2xl font-bold mb-6">Transactions</h1>
      <div className="flex flex-col lg:flex-row lg:space-x-8">
        {userTransaction && userTransaction.length > 0 ? (
          <div className="w-full">
            <TransactionsTable transactions={userTransaction} />
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
