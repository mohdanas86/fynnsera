"use client";

import Link from "next/link";
import {
  Home,
  DollarSign,
  Settings,
  BadgePoundSterling,
  Goal,
  Sparkles,
  ChartPie,
  File,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useMyContext } from "@/context/MyContext";
import { Button } from "@/components/ui/button";
import { signOut, useSession } from "next-auth/react";
import { DocumentArrowDownIcon, HomeIcon } from "@heroicons/react/24/outline";

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { showSidebar } = useMyContext();

  const linkClasses = (href) => {
    const baseClasses =
      "flex items-center gap-3 px-4 py-2 transition-colors duration-300 border border-transparent rounded-lg";
    if (pathname === href) {
      // Active link styling: darker background with a right border highlight
      return `${baseClasses} bg-[var(--color-primary-dark)] font-semibold `;
    }
    // Inactive link styling: white text with hover effects
    return `${baseClasses} text-white hover:bg-[var(--color-primary-dark)] `;
  };

  return (
    <aside
      className={`w-64 h-screen bg-[var(--color-primary)] text-white border-r border-gray-200 ${
        showSidebar ? "md:block" : "hidden"
      } shadow-lg`}
    >
      <nav className="h-full flex flex-col">
        <h1 className="text-2xl font-bold p-6">FYNSERA</h1>

        <div className="flex-grow overflow-y-auto">
          <ul className="flex flex-col px-4 gap-1">
            <li>
              <Link href="/dashboard" className={linkClasses("/dashboard")}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                  />
                </svg>
                <span>Dashboard</span>
              </Link>
            </li>

            <li>
              <Link
                href="/dashboard/upload-files"
                className={linkClasses("/dashboard/upload-files")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                  />
                </svg>
                <span>Upload Files</span>
              </Link>
            </li>

            <li>
              <Link
                href="/dashboard/transactions"
                className={linkClasses("/dashboard/transactions")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 8.25H9m6 3H9m3 6-3-3h1.5a3 3 0 1 0 0-6M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
                <span>Transactions</span>
              </Link>
            </li>

            <li>
              <Link
                href="/dashboard/budget"
                className={linkClasses("/dashboard/budget")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V13.5Zm0 2.25h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V18Zm2.498-6.75h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V13.5Zm0 2.25h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V18Zm2.504-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5Zm0 2.25h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V18Zm2.498-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5ZM8.25 6h7.5v2.25h-7.5V6ZM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 0 0 2.25 2.25h10.5a2.25 2.25 0 0 0 2.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0 0 12 2.25Z"
                  />
                </svg>
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
                href="/dashboard/ai-insight"
                className={linkClasses("/dashboard/ai-insight")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z"
                  />
                </svg>
                <span>Ai Insight</span>
              </Link>
            </li>

            <li>
              <Link
                href="/dashboard/chat"
                className={linkClasses("/dashboard/chat")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
                  />
                </svg>
                <span>Ai Assistant</span>
              </Link>
            </li>
          </ul>
        </div>
        {status === "authenticated" && (
          <div className="p-4">
            <Button
              variant="ghost"
              className=" bg-transaparent w-full text-white hover:bg-red-600 hover:text-white border-0 rounded-md py-5 flex justify-start  items-center"
              onClick={() => signOut({ callbackUrl: "/signin" })}
            >
              <span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15"
                  />
                </svg>
              </span>
              <span>Logout</span>
            </Button>
          </div>
        )}
      </nav>
    </aside>
  );
}
