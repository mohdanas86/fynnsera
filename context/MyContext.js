// "use client";

// import { useSession } from "next-auth/react";
// import React, { createContext, useContext, useState } from "react";

// // Create a context with no default value.
// const MyContext = createContext();

// // Create a provider component.
// export function MyContextProvider({ children }) {
//   const [userTransaction, setUserTransaction] = useState("");
//   const [showSidebar, setShowSidebar] = useState(true);

//   // Function to update the context state.
//   const updateValue = (newValue) => {
//     setValue(newValue);
//   };

//   return (
//     <MyContext.Provider
//       value={{
//         userTransaction,
//         setUserTransaction,
//         showSidebar,
//         setShowSidebar,
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

// Create a context with no default value.
const MyContext = createContext();

// Create a provider component.
export function MyContextProvider({ children }) {
  const { data: session, status } = useSession();
  const [userTransaction, setUserTransaction] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);
  const [isLoggedin, setIsLoggedin] = useState(false);

  // Update isLoggedin based on session status
  useEffect(() => {
    setIsLoggedin(status === "authenticated");
  }, [status]);

  return (
    <MyContext.Provider
      value={{
        userTransaction,
        setUserTransaction,
        showSidebar,
        setShowSidebar,
        isLoggedin,
      }}
    >
      {children}
    </MyContext.Provider>
  );
}

// Custom hook to use the MyContext value.
export function useMyContext() {
  const context = useContext(MyContext);
  if (!context) {
    throw new Error("useMyContext must be used within a MyContextProvider");
  }
  return context;
}
