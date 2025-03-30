// "use client";

// import { useSession } from "next-auth/react";
// import PlaidLink from "../_components/PlaidLink";
// import TransactionsTable from "../_components/TransactionsTable";
// import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import Loding from "../_components/Loding";

// export default function Home() {
//   const { data: session, status } = useSession();
//   const [transactions, setTransactions] = useState([]);
//   const [loadingTransactions, setLoadingTransactions] = useState(false);

//   const fetchTransactions = async () => {
//     if (status === "authenticated" && session?.user?.id) {
//       setLoadingTransactions(true);
//       try {
//         const response = await fetch(
//           `/api/transactions?userId=${session.user.id}`
//         );
//         if (!response.ok) throw new Error("Failed to fetch transactions");
//         const data = await response.json();
//         setTransactions(data);
//       } catch (error) {
//         console.error("Error fetching transactions:", error);
//       } finally {
//         setLoadingTransactions(false);
//       }
//     }
//   };

//   useEffect(() => {
//     fetchTransactions();
//   }, [session, status]);

//   if (status === "loading")
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <Loding />
//       </div>
//     );
//   if (!session)
//     return (
//       <div className="flex items-center justify-center h-screen">
//         Please sign in to connect your bank account.
//       </div>
//     );

//   return (
//     <div className="container mx-auto">
//       {/* Transactions Section */}
//       {loadingTransactions && (
//         <div className="text-blue-500 mb-4">
//           <Loding />
//         </div>
//       )}
//       {transactions.length > 0 && (
//         <div className="">
//           <TransactionsTable transactions={transactions} />
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import { useSession } from "next-auth/react";
import PlaidLink from "../_components/PlaidLink";
import TransactionsTable from "../_components/TransactionsTable";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
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
    <div className="container mx-auto p-4">
      {hasTransactions ? (
        <TransactionsTable transactions={memoizedTransactions} />
      ) : (
        <div className="bg-green-100 p-6 rounded-lg shadow text-center">
          <h2 className="text-2xl font-bold mb-2">No Transactions Found</h2>
          <p className="text-gray-600 mb-4">
            Connect your bank account to start tracking your transactions.
          </p>
          <PlaidLink onConnected={fetchTransactions} />
        </div>
      )}
    </div>
  );
}
