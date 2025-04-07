// "use client";

// import { useSession } from "next-auth/react";
// import React, { createContext, useContext, useState, useEffect } from "react";

// // Create a context with no default value.
// const MyContext = createContext();

// // Create a provider component.
// export function MyContextProvider({ children }) {
//   const { data: session, status } = useSession();
//   const [userTransaction, setUserTransaction] = useState("");
//   const [showSidebar, setShowSidebar] = useState(true);
//   const [isLoggedin, setIsLoggedin] = useState(false);

//   // Update isLoggedin based on session status
//   useEffect(() => {
//     setIsLoggedin(status === "authenticated");
//   }, [status]);

//   return (
//     <MyContext.Provider
//       value={{
//         userTransaction,
//         setUserTransaction,
//         showSidebar,
//         setShowSidebar,
//         isLoggedin,
//       }}
//     >
//       {children}
//     </MyContext.Provider>
//   );
// }

// // Custom hook to use the MyContext value.
// export function useMyContext() {
//   const context = useContext(MyContext);
//   if (!context) {
//     throw new Error("useMyContext must be used within a MyContextProvider");
//   }
//   return context;
// }

"use client";

import { useSession } from "next-auth/react";
import React, { createContext, useContext, useState, useEffect } from "react";

// Create a context
const MyContext = createContext();

// Create a provider component
export function MyContextProvider({ children }) {
  const { data: session, status } = useSession();
  const [userTransaction, setUserTransaction] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);
  const [isLoggedin, setIsLoggedin] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  // Update isLoggedin based on session status
  useEffect(() => {
    setIsLoggedin(status === "authenticated");
  }, [status]);

  // Fetch transactions
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

  return (
    <MyContext.Provider
      value={{
        userTransaction,
        setUserTransaction,
        showSidebar,
        setShowSidebar,
        isLoggedin,
        loadingTransactions,
        fetchTransactions,
      }}
    >
      {children}
    </MyContext.Provider>
  );
}

// Custom hook to use the MyContext value
export function useMyContext() {
  const context = useContext(MyContext);
  if (!context) {
    throw new Error("useMyContext must be used within a MyContextProvider");
  }
  return context;
}
