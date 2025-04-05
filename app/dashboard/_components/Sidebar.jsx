"use client";

import Link from "next/link";
import {
  Home,
  DollarSign,
  Settings,
  BadgePoundSterling,
  Goal,
  Sparkles,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useMyContext } from "@/context/MyContext";

export default function Sidebar() {
  const pathname = usePathname();
  const { showSidebar } = useMyContext();

  const linkClasses = (href) => {
    const baseClasses =
      "flex items-center gap-3 px-4 py-3 transition-all duration-400";
    if (pathname === href) {
      // Active link: bold text with a soft blue background and subtle shadow
      return `${baseClasses} bg-[var(--color-primary-dark)] font-semibold border-r-2 border-[#319795] border-[hsl(179,64%,61%)]`;
      // return `${baseClasses} font-semibold text-blue-600 bg-blue-100 border-r-2 border-blue-400`;
    }
    // Inactive links: medium-gray text with light blue hover effect
    // return `${baseClasses} text-gray-700 hover:text-blue-600 hover:bg-blue-50`;
    return `${baseClasses} text-white hover:text-[var(--color-primary)] hover:bg-blue-50`;
  };

  return (
    <aside
      className={`w-60 h-screen bg-[var(--color-primary)] text-white border-r border-gray-200 ${
        showSidebar ? "md:block" : "hidden"
      }`}
    >
      <nav>
        <Link href="/">
          <h1 className="lg:text-xl font-semibold p-6">AI Finance Assistant</h1>
        </Link>

        <ul className="flex flex-col">
          <li>
            <Link href="/dashboard" className={linkClasses("/dashboard")}>
              <Home className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/transactions"
              className={linkClasses("/dashboard/transactions")}
            >
              <DollarSign className="h-5 w-5" />
              <span>Transactions</span>
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/budget"
              className={linkClasses("/dashboard/budget")}
            >
              <BadgePoundSterling className="h-5 w-5" />
              <span>Budget</span>
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/goal-tracking"
              className={linkClasses("/dashboard/goal-tracking")}
            >
              <Goal className="h-5 w-5" />
              <span>Goal Tracking</span>
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/chat"
              className={linkClasses("/dashboard/chat")}
            >
              <Sparkles className="h-5 w-5 " />
              <span>Ai Assistant</span>
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
