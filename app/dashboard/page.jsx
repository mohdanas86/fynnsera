// "use client";
// import React, { useEffect, useState, useMemo } from "react";
// import { useSession } from "next-auth/react";
// import PlaidLink from "./_components/PlaidLink";
// import { useMyContext } from "@/context/MyContext";
// import { AreaCharts } from "./charts/AreaCharts";
// import PieChartCard from "./charts/PieChartCard";
// import { PolarAreaChart } from "./charts/PolarAreaChart";
// import TopPositiveTable from "./charts/TopPositiveTable";
// import TopNegativeTable from "./charts/TopNegativeTable";
// import TopCategoriesTable from "./charts/TopCategoriesTable";
// import Loding from "./_components/Loding";
// import TransactionSummary from "./charts/TransactionSummary";
// import { RadarCharts } from "./charts/RadarCharts";
// import { LineChartComponent } from "./charts/LineChartComponent";

// export default function Home() {
//   const { userTransaction, setUserTransaction } = useMyContext();
//   const { data: session, status } = useSession();
//   const [loadingTransactions, setLoadingTransactions] = useState(false);
//   const [hasFetched, setHasFetched] = useState(false);

//   // Memoize transactions data so that child components only update when necessary.
//   const memoizedTransactions = useMemo(
//     () => userTransaction,
//     [userTransaction]
//   );
//   const hasTransactions = useMemo(
//     () => memoizedTransactions && memoizedTransactions.length > 0,
//     [memoizedTransactions]
//   );

//   // Function to fetch transactions after bank connection is established.
//   const fetchTransactions = async () => {
//     if (status === "authenticated" && session?.user?.id && !hasFetched) {
//       setLoadingTransactions(true);
//       try {
//         const response = await fetch(
//           `/api/transactions?userId=${session.user.id}`
//         );
//         // if (!response.ok) throw new Error("Failed to fetch transactions");
//         const data = await response.json();
//         setUserTransaction(data);
//         setHasFetched(true);
//         console.log("Transactions:", data);
//       } catch (error) {
//         console.error("Error fetching transactions:", error);
//       } finally {
//         setLoadingTransactions(false);
//       }
//     }
//   };

//   useEffect(() => {
//     if (status === "authenticated" && !hasFetched) {
//       fetchTransactions();
//     }
//   }, [session, status, hasFetched, userTransaction]);

//   if (status === "loading" || loadingTransactions) {
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
//     <div className="mx-auto lg:px-4">
//       {/* Welcome Card with bank connection button */}
//       <div className="bg-white lg:p-6 lg:rounded-lg lg:shadow mb-6 flex flex-col md:flex-row justify-between items-start">
//         <div className="mb-4 md:mb-0">
//           <h1 className="lg:text-3xl text-2xl font-bold mb-2">
//             Welcome, {session.user.email}
//           </h1>
//           <p className="text-gray-600">Your financial dashboard is ready.</p>
//         </div>
//         <div>
//           <PlaidLink onConnected={fetchTransactions} />
//         </div>
//       </div>

//       {hasTransactions ? (
//         <>
//           {/* Dashboard Summary */}
//           <TransactionSummary transactions={memoizedTransactions} />

//           {/* Charts */}
//           <div className="grid grid-cols-1 gap-4">
//             <div className="grid lg:grid-cols-2 grid-cols-1 w-full h-[400px] mt-6 gap-6">
//               <AreaCharts userTransaction={memoizedTransactions} />
//               <LineChartComponent userTransaction={memoizedTransactions} />
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-3 w-full py-4 mt-6 gap-8">
//               <PieChartCard userTransaction={memoizedTransactions} />
//               <PolarAreaChart userTransaction={memoizedTransactions} />
//               <RadarCharts userTransaction={memoizedTransactions} />
//             </div>
//           </div>

//           {/* Tables */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-6">
//             <TopPositiveTable transactions={memoizedTransactions} />
//             <TopNegativeTable transactions={memoizedTransactions} />
//             <TopCategoriesTable transactions={memoizedTransactions} />
//           </div>
//         </>
//       ) : (
//         // Fallback card when no transactions are available
//         <div className="bg-blue-100 p-6 rounded-lg shadow mb-6 text-center">
//           <h2 className="text-2xl font-bold mb-2">No Transactions Available</h2>
//           <p className="text-gray-600">
//             Connect your bank account to see your transactions.
//           </p>
//           <div className="mt-4">
//             <PlaidLink onConnected={fetchTransactions} />
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

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
  const { userTransaction, setUserTransaction } = useMyContext();
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

  const fetchTransactions = async () => {
    if (status !== "authenticated" || !session?.user?.id || hasFetched) return;
    setLoadingTransactions(true);
    try {
      const response = await fetch(
        `/api/transactions?userId=${encodeURIComponent(session.user.id)}`
      );
      if (!response.ok) throw new Error("Failed to fetch transactions");
      const data = await response.json();
      setUserTransaction(data);
      setHasFetched(true);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoadingTransactions(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [session?.user?.id, status]);

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

          <div className="grid grid-cols-1 gap-4">
            <div className="grid lg:grid-cols-2 grid-cols-1 gap-6 mt-6 h-[400px]">
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
