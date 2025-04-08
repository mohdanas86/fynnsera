"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  AlignLeft,
  Menu,
  Home,
  DollarSign,
  BadgePoundSterling,
  Goal,
  Sparkles,
  Settings,
  ChartPie,
} from "lucide-react";
import { useMyContext } from "@/context/MyContext";
import { useState } from "react";

export default function Header() {
  const { isLoggedin } = useMyContext();
  const { data: session, status } = useSession();
  const { showSidebar, setShowSidebar } = useMyContext();
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleLinkClick = () => setSheetOpen(false);

  return (
    <header className="flex items-center justify-between shadow-sm px-4 py-3">
      <div className="flex items-center justify-between w-full">
        {/* Sidebar toggle button for larger screens */}
        <Button
          className="mr-1 items-center justify-center hidden md:block bg-[var(--color-primary)] text-white border-0 w-[50px] hover:bg-[var(--color-primary-dark)] hover:text-white"
          variant="outline"
          onClick={() => setShowSidebar(!showSidebar)}
        >
          <AlignLeft className="mx-auto" />
        </Button>

        <Link href="/" className="lg:hidden block">
          <h1 className="lg:ml-4 lg:text-2xl font-bold text-teal-600">
            FYNSERA
          </h1>
        </Link>

        {/* Mobile menu trigger */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" className="md:hidden">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-4">
            <SheetHeader className="p-0 my-4">
              <SheetTitle className="text-2xl font-bold text-teal-600">
                FYNSERA
              </SheetTitle>
              <SheetDescription className="text-gray-500 text-sm">
                Navigation for Smarter Financial Decisions
              </SheetDescription>
            </SheetHeader>
            <nav className="mt-0">
              <ul className="flex flex-col space-y-3">
                <li>
                  <Link
                    href="/dashboard"
                    className="flex items-center space-x-2"
                    onClick={handleLinkClick}
                  >
                    <Home className="h-5 w-5" />
                    <span>Dashboard</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/transactions"
                    className="flex items-center space-x-2"
                    onClick={handleLinkClick}
                  >
                    <DollarSign className="h-5 w-5" />
                    <span>Transactions</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/budget"
                    className="flex items-center space-x-2"
                    onClick={handleLinkClick}
                  >
                    <BadgePoundSterling className="h-5 w-5" />
                    <span>Budget</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/goal-tracking"
                    className="flex items-center space-x-2"
                    onClick={handleLinkClick}
                  >
                    <Goal className="h-5 w-5" />
                    <span>Goal Tracking</span>
                  </Link>
                </li>

                <li>
                  <Link
                    href="/dashboard/ai-insight"
                    className="flex items-center space-x-2"
                    onClick={handleLinkClick}
                  >
                    <ChartPie className="h-5 w-5" />
                    <span>Ai Insight</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/chat"
                    className="flex items-center space-x-2"
                    onClick={handleLinkClick}
                  >
                    <Sparkles className="h-5 w-5" />
                    <span>Ai Assistant</span>
                  </Link>
                </li>
                {/* Uncomment or add additional links as needed */}
                {/* <li>
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center space-x-2"
                    onClick={handleLinkClick}
                  >
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                  </Link>
                </li> */}
              </ul>
            </nav>
            <div className="mt-6">
              {isLoggedin ? (
                <Button
                  onClick={() => {
                    signOut();
                    setSheetOpen(false);
                  }}
                  className="w-full bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600 border-0 bottom-0"
                >
                  Logout
                </Button>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link href="/signin" onClick={handleLinkClick}>
                    <Button className="w-full  bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] px-4 py-2 text-sm font-medium text-white transition ">
                      Login
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={handleLinkClick}>
                    <Button
                      variant="outline"
                      className="w-full border-secondary px-4 py-2 text-sm font-medium text-teal-600 transition hover:text-teal-600/75"
                    >
                      Register
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
      <div className="flex items-center space-x-4">
        {status === "authenticated" ? (
          <div className="hidden lg:flex items-center gap-4">
            <Button
              variant="outline"
              className="text-gray-700 bg-gradient-to-r from-blue-50 to-blue-50"
            >
              Hello, {session.user.email}
            </Button>

            <Button
              variant="outline"
              className="bg-[#E33B32] text-white hover:bg-[hsl(3,76%,54%)] hover:text-white"
              onClick={() => signOut({ callbackUrl: "/signin" })}
            >
              Sign Out
            </Button>
          </div>
        ) : (
          <div className="lg:flex hidden gap-3">
            <Link href="/signin">
              <Button className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-dark">
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button
                variant="outline"
                className="w-full rounded-md border-secondary px-4 py-2 text-sm font-medium text-teal-600 transition hover:text-teal-600/75"
              >
                Register
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
