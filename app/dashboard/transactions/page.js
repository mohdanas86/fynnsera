"use client";
import { useSession } from "next-auth/react";
import PlaidLink from "../_components/PlaidLink";
import TransactionsTable from "../_components/TransactionsTable";
import { useMyContext } from "@/context/MyContext";
import Loding from "../_components/Loding";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
      <h1 className="text-2xl font-bold">Transactions</h1>
      <div className="flex flex-col lg:flex-row lg:space-x-8">
        {userTransaction && userTransaction.length > 0 ? (
          <div className="w-full">
            <TransactionsTable transactions={userTransaction} />
          </div>
        ) : (
          <div className="bg-teal-50 p-6 rounded-lg shadow mb-6 text-center w-full">
            <h2 className="text-2xl font-bold mb-2">
              No Transactions Available
            </h2>
            <p className="text-gray-600">
              Connect your bank account to see your transactions.
            </p>
            <div className="mt-4 flex flex-wrap gap-4 justify-center items-center">
              <PlaidLink onConnected={fetchTransactions} />
              <Link href="/dashboard/upload-files">
                <Button className="bg-[var(--color-primary)] text-white rounded-[2px] hover:bg-[var(--color-primary-dark)] w-[200px]">
                  Upload File
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
