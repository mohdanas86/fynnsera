// app/layout.tsx or app/layout.js

import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import LayoutClient from "./LayoutClient";

export const metadata = {
  title: "FYNSERA | AI Finance Assistant for Budgeting & Money Management",
  description:
    "Manage your finances smarter with FYNSERA — the AI-powered personal finance assistant for budgeting, expense tracking, and achieving your financial goals.",
  keywords:
    "AI finance assistant, personal finance app, budgeting tool, money management, track expenses, smart budget planner, financial goals, FYNSERA",
  authors: [{ name: "FYNSERA", url: "https://fynsera.netlify.app" }],
  creator: "FYNSERA",
  applicationName: "FYNSERA",
  robots: "index, follow",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  metadataBase: new URL("https://fynsera.netlify.app"), // live Netlify URL
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "FYNSERA | AI Finance Assistant for Budgeting & Money Management",
    description:
      "Smarter personal finance starts here. FYNSERA helps you manage budgets, track expenses, and hit financial goals with AI-powered insights.",
    url: "https://fynsera.netlify.app",
    siteName: "FYNSERA",
    images: [
      {
        url: "https://fynsera.netlify.app/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "FYNSERA AI Finance Assistant",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FYNSERA | AI Finance Assistant",
    description:
      "Smarter personal finance starts here. FYNSERA helps you manage budgets, track expenses, and hit financial goals with AI-powered insights.",
    images: ["https://fynsera.netlify.app/twitter-image.jpg"],
    creator: "@fynseraapp",
  },
  alternates: {
    canonical: "https://fynsera.netlify.app",
    languages: {
      "en-US": "https://fynsera.netlify.app/en-US",
    },
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 max-w-screen-2xl mx-auto">
        <LayoutClient>{children}</LayoutClient>
        <Toaster />
      </body>
    </html>
  );
}
