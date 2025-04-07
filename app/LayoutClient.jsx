// app/_components/LayoutClient.jsx
"use client";

import { SessionProvider } from "next-auth/react";
import { MyContextProvider } from "@/context/MyContext";
import { usePathname } from "next/navigation";
import Header from "./_components/Header";
import Footer from "./_components/Footer";

export default function LayoutClient({ children }) {
  const pathname = usePathname();
  const shouldHideHeader = pathname.startsWith("/dashboard");

  return (
    <SessionProvider>
      <MyContextProvider>
        {!shouldHideHeader && <Header />}
        {children}
        {!shouldHideHeader && <Footer />}
      </MyContextProvider>
    </SessionProvider>
  );
}
