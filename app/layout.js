// import { MyContextProvider } from "@/context/MyContext";
// import "./globals.css";
// import Header from "./_components/Header";

// export default function RootLayout({ children }) {
//   return (
//     <html lang="en">
//       <head>
//         <meta charSet="utf-8" />
//         <meta name="viewport" content="width=device-width, initial-scale=1" />
//         <link rel="icon" href="/favicon.ico" />
//       </head>
//       <body className="bg-gray-50 max-w-screen-2xl mx-auto">
//         <Header />
//         <MyContextProvider>{children}</MyContextProvider>
//       </body>
//     </html>
//   );
// }

// export const metadata = {
//   title: "AI Finance Assistant",
//   description: "Personal finance management with AI",
// };

// app/layout.js or app/layout.tsx
"use client";
import { MyContextProvider } from "@/context/MyContext";
import "./globals.css";
import Header from "./_components/Header";
import { usePathname } from "next/navigation";
import Footer from "./_components/Footer";
import { SessionProvider } from "next-auth/react";

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const hideHeaderRoutes = ["/dashboard", "/dashboard/budget"];
  const shouldHideHeader = hideHeaderRoutes.some((route) =>
    pathname.startsWith(route)
  );

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="bg-gray-50 max-w-screen-2xl mx-auto">
        <SessionProvider>
          <MyContextProvider>
            {!shouldHideHeader && <Header />}
            {children}
            {!shouldHideHeader && <Footer />}
          </MyContextProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

// export const metadata = {
//   title: "AI Finance Assistant",
//   description: "Personal finance management with AI",
// };
