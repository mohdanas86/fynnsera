"use client";
import axios from "axios";
import { useSession } from "next-auth/react";
import React, { createContext, useContext, useState, useEffect } from "react";

const MyContext = createContext();

export function MyContextProvider({ children }) {
  const { data: session, status } = useSession();
  const [userTransaction, setUserTransaction] = useState([]);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isLoggedin, setIsLoggedin] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [userId, setUserId] = useState("");
  const [userFileLogs, setUserFileLogs] = useState("");

  // File handling state:
  const [fileList, setFileList] = useState([]);
  const [selectedFileData, setSelectedFileData] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState("");

  // Update isLoggedin based on session status
  useEffect(() => {
    setIsLoggedin(status === "authenticated");
  }, [status]);

  // Set userId once session is authenticated
  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      setUserId(session.user.id);
    }
  }, [status, session]);

  // Fetch transactions from localStorage (if available)
  const fetchTransactions = async () => {
    if (status !== "authenticated" || !session?.user?.id || hasFetched) return;
    setLoadingTransactions(true);
    try {
      // Attempt to get data for this user from localStorage
      const localData = localStorage.getItem(session.user.id);
      if (localData) {
        const parsed = JSON.parse(localData);
        const uploadedFiles = parsed.uploadedFiles || {};
        // Filter only files that match the current user's ID and extract transactions
        const userTransactions = Object.values(uploadedFiles)
          .filter((file) => file.userId === session.user.id)
          .flatMap((file) => file.transactions || []);
        setUserTransaction(userTransactions);
        setHasFetched(true);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoadingTransactions(false);
    }
  };

  // Fetch file list from localStorage and auto-select the first file
  // useEffect(() => {
  //   if (userId) {
  //     const stored = localStorage.getItem(userId);
  //     if (stored) {
  //       try {
  //         const parsed = JSON.parse(stored);
  //         const filesArray = parsed.uploadedFiles
  //           ? Object.values(parsed.uploadedFiles)
  //           : [];
  //         if (filesArray.length > 0) {
  //           setFileList(filesArray);
  //           // Auto-select the first file and update transactions accordingly
  //           handleSelect(filesArray[0]);
  //           // console.log("Loaded files from localStorage:", filesArray);
  //         }
  //       } catch (err) {
  //         console.error(
  //           "Failed to parse uploaded files from localStorage:",
  //           err
  //         );
  //       }
  //     }
  //   }
  // }, [userId]);

  // Function to handle file selection from the dropdown.
  // It updates selectedProvider, selectedFileData, and the transactions.

  // catogerization model api call flask api
  async function catogerizationModelHandle(userTransaction) {
    // console.log("Raw user data from file:", userTransaction);

    let transactionsArray = [];

    // Handle both formats: raw array or { transactions: [...] }
    if (Array.isArray(userTransaction)) {
      transactionsArray = userTransaction;
    } else if (
      typeof userTransaction === "object" &&
      Array.isArray(userTransaction.transactions)
    ) {
      transactionsArray = userTransaction.transactions;
    }

    // Normalize: extract `description` and `transactionType`
    const formatted = transactionsArray
      .map((txn) => {
        // Only include transactions that have at least a description
        if (txn.description) {
          return {
            ...txn, // preserve all original fields
            // Optionally fix transactionType if missing or inconsistent
            transactionType: txn.transactionType
              ? txn.transactionType
              : (() => {
                  const desc = txn.description.toLowerCase();
                  const isCredit =
                    desc.includes("from") ||
                    desc.includes("credit") ||
                    desc.includes("salary");
                  return isCredit ? "Credit" : "Debit";
                })(),
          };
        }
        return null;
      })
      .filter(Boolean); // remove nulls

    try {
      const url = `${
        process.env.NEXT_PUBLIC_CATOGERY_MODEL || process.env.CATOGERY_MODEL
      }`;
      const response = await axios.post(url, {
        transactions: formatted,
      });
      // console.log("Model response:", response);
      // ✅ Return only the predictions array
      return response.data.predictions;
    } catch (err) {
      console.log("Error posting to model:", err);
    }
  }

  // get user all file logs
  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      try {
        const response = await axios.get(
          `/api/transaction-log?userId=${userId}`
        );
        setUserFileLogs(response.data);
        // Access filesArray from response.data.data
        const filesArray = response.data.data || []; // Correct extraction
        console.log("filesArray : ", filesArray);
        if (filesArray.length > 0) {
          setFileList(filesArray);
          handleSelect(filesArray[0]); // Auto-select the first file
        }
      } catch (error) {
        console.error("Failed to fetch user data", error);
      }
    };

    fetchData();
  }, [userId]);

  // handle file slections
  const handleSelect = (file) => {
    setSelectedProvider(file.filename);
    setSelectedFileData(file);
    setUserTransaction(file.transactions || []);
  };

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
        userId,
        setUserId,
        fileList,
        selectedFileData,
        selectedProvider,
        setSelectedFileData,
        handleSelect,
        catogerizationModelHandle,
        userFileLogs,
        setUserFileLogs,
      }}
    >
      {children}
    </MyContext.Provider>
  );
}

// Custom hook to access the context values
export function useMyContext() {
  const context = useContext(MyContext);
  if (!context) {
    throw new Error("useMyContext must be used within a MyContextProvider");
  }
  return context;
}
