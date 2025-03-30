// // "use client";

// // import React, { useEffect, useState } from "react";
// // import { useSession } from "next-auth/react";
// // import Loding from "./_components/Loding";
// // import PlaidLink from "./_components/PlaidLink";
// // import { useMyContext } from "@/context/MyContext";
// // import { AreaCharts } from "./charts/AreaCharts";
// // import { BarCharts } from "./charts/BarCharts";
// // import { VerticalBarChart } from "./charts/VerticalBarChart";
// // import { RadarCharts } from "./charts/RadarCharts";
// // import TopPositiveTable from "./_components/TopPositiveTable";
// // import TopNegativeTable from "./_components/TopNegativeTable";
// // import TopCategoriesTable from "./_components/TopCategoriesTable";

// // export default function Home() {
// //   const { userTransaction, setUserTransaction } = useMyContext();
// //   const { data: session, status } = useSession();
// //   const [loadingTransactions, setLoadingTransactions] = useState(false);

// //   // Function to fetch transactions after the bank connection is established
// //   const fetchTransactions = async () => {
// //     if (status === "authenticated" && session?.user?.id) {
// //       setLoadingTransactions(true);
// //       try {
// //         const response = await fetch(
// //           `/api/transactions?userId=${session.user.id}`
// //         );
// //         if (!response.ok) throw new Error("Failed to fetch transactions");
// //         // Process your transactions data as needed here
// //         const data = await response.json();
// //         setUserTransaction(data);
// //         console.log("Transactions:", data);
// //       } catch (error) {
// //         console.error("Error fetching transactions:", error);
// //       } finally {
// //         setLoadingTransactions(false);
// //       }
// //     }
// //   };

// //   useEffect(() => {
// //     // Optionally, fetch transactions when the session becomes authenticated
// //     if (status === "authenticated") {
// //       fetchTransactions();
// //     }
// //   }, [session, status]);

// //   if (status === "loading") {
// //     return (
// //       <div className="flex items-center justify-center h-screen">
// //         <Loding />
// //       </div>
// //     );
// //   }

// //   if (!session) {
// //     return (
// //       <div className="flex items-center justify-center h-screen">
// //         Please sign in to connect your bank account.
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="mx-auto">
// //       {/* Welcome Card */}
// //       <div className="bg-white p-6 rounded-lg shadow mb-6">
// //         <h1 className="text-3xl font-bold mb-2">
// //           Welcome, {session.user.email}
// //         </h1>
// //         <p className="text-gray-600">Your financial dashboard is ready.</p>
// //       </div>

// //       {/* Bank Connection Button */}
// //       <div className="mb-6">
// //         <PlaidLink onConnected={fetchTransactions} />
// //       </div>

// //       <div className="grid grid-cols-3 gap-12 my-6">
// //         <TopPositiveTable transactions={userTransaction} />
// //         <TopNegativeTable transactions={userTransaction} />
// //         <TopCategoriesTable transactions={userTransaction} />
// //       </div>

// //       <div className="grid grid-cols-1 gap-4">
// //         <div className="flex w-full h-[400px]">
// //           <AreaCharts userTransaction={userTransaction} />
// //         </div>
// //         <div className="grid grid-cols-3 w-full py-4 mt-6 gap-8">
// //           <BarCharts userTransaction={userTransaction} />
// //           <VerticalBarChart userTransaction={userTransaction} />
// //           <RadarCharts userTransaction={userTransaction} />
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// "use client";
// import React, { useEffect, useState } from "react";
// import { useSession } from "next-auth/react";
// import PlaidLink from "./_components/PlaidLink";
// import { useMyContext } from "@/context/MyContext";
// import { AreaCharts } from "./charts/AreaCharts";
// import { BarCharts } from "./charts/BarCharts";
// import { VerticalBarChart } from "./charts/VerticalBarChart";
// import { RadarCharts } from "./charts/RadarCharts";
// import TopPositiveTable from "./_components/TopPositiveTable";
// import TopNegativeTable from "./_components/TopNegativeTable";
// import TopCategoriesTable from "./_components/TopCategoriesTable";
// import Loding from "./_components/Loding";
// import TransactionSummary from "./_components/TransactionSummary";

// export default function Home() {
//   const { userTransaction, setUserTransaction } = useMyContext();
//   const { data: session, status } = useSession();
//   const [loadingTransactions, setLoadingTransactions] = useState(false);

//   // Function to fetch transactions after the bank connection is established
//   const fetchTransactions = async () => {
//     if (status === "authenticated" && session?.user?.id) {
//       setLoadingTransactions(true);
//       try {
//         const response = await fetch(
//           `/api/transactions?userId=${session.user.id}`
//         );
//         if (!response.ok) throw new Error("Failed to fetch transactions");
//         const data = await response.json();
//         setUserTransaction(data);
//         console.log("Transactions:", data);
//       } catch (error) {
//         console.error("Error fetching transactions:", error);
//       } finally {
//         setLoadingTransactions(false);
//       }
//     }
//   };

//   useEffect(() => {
//     if (status === "authenticated") {
//       fetchTransactions();
//     }
//   }, [session, status]);

//   if (status === "loading") {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <Loding />
//       </div>
//     );
//   }

//   if (!session) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         Please sign in to connect your bank account.
//       </div>
//     );
//   }

//   return (
//     <div className="mx-auto">
//       {/* Welcome Card */}
//       <div className="bg-white p-6 rounded-lg shadow mb-6 justify-between flex">
//         <div>
//           {" "}
//           <h1 className="text-3xl font-bold mb-2">
//             Welcome, {session.user.email}
//           </h1>
//           <p className="text-gray-600">Your financial dashboard is ready.</p>
//         </div>
//         {/* Bank Connection Button */}
//         <div className="mb-6">
//           <PlaidLink onConnected={fetchTransactions} />
//         </div>
//       </div>

//       {/* Bank Connection Button
//       <div className="mb-6">
//         <PlaidLink onConnected={fetchTransactions} />
//       </div> */}

//       {/* Transaction Summary */}
//       {userTransaction && userTransaction.length > 0 && (
//         <TransactionSummary transactions={userTransaction} />
//       )}

//       <div className="grid grid-cols-3 gap-12 my-6">
//         <TopPositiveTable transactions={userTransaction} />
//         <TopNegativeTable transactions={userTransaction} />
//         <TopCategoriesTable transactions={userTransaction} />
//       </div>

//       <div className="grid grid-cols-1 gap-4">
//         <div className="flex w-full h-[400px]">
//           <AreaCharts userTransaction={userTransaction} />
//         </div>
//         <div className="grid grid-cols-3 w-full py-4 mt-6 gap-8">
//           <BarCharts userTransaction={userTransaction} />
//           <VerticalBarChart userTransaction={userTransaction} />
//           <RadarCharts userTransaction={userTransaction} />
//         </div>
//       </div>
//     </div>
//   );
// }

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
    <div className="mx-auto">
      {/* Welcome Card with bank connection button */}
      <div className="bg-white p-6 rounded-lg shadow mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">
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
      <div className="grid grid-cols-3 gap-12 my-6">
        <TopPositiveTable transactions={memoizedTransactions} />
        <TopNegativeTable transactions={memoizedTransactions} />
        <TopCategoriesTable transactions={memoizedTransactions} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4">
        <div className="flex w-full h-[400px]">
          <AreaCharts userTransaction={memoizedTransactions} />
        </div>
        <div className="grid grid-cols-3 w-full py-4 mt-6 gap-8">
          <BarCharts userTransaction={memoizedTransactions} />
          <VerticalBarChart userTransaction={memoizedTransactions} />
          <RadarCharts userTransaction={memoizedTransactions} />
        </div>
      </div>
    </div>
  );
}
