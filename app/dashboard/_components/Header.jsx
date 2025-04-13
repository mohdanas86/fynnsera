"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import Image from "next/image"; // Ensure correct import for next/image
import {
  Sheet,
  SheetContent,
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
  ChartPie,
  File,
  Sparkles,
} from "lucide-react";
import { useMyContext } from "@/context/MyContext";

export default function Header() {
  // Get user session and custom context values
  const { isLoggedin, showSidebar, setShowSidebar } = useMyContext();
  const { data: session, status } = useSession();
  const [sheetOpen, setSheetOpen] = useState(false);

  // Handle closing the mobile sheet when a navigation link is clicked
  const handleLinkClick = () => setSheetOpen(false);

  // Logging the user image for debugging
  useEffect(() => {
    if (session?.user) {
      console.log("session.user.image:", session.user.image);
    }
  }, [session]);

  return (
    <header className="flex items-center justify-between px-4 py-3 shadow-sm">
      {/* Left: Sidebar toggle and Logo */}
      <div className="flex items-center space-x-4">
        {/* Sidebar toggle (visible on desktop only) */}
        <Button
          onClick={() => setShowSidebar(!showSidebar)}
          variant="outline"
          className="hidden md:flex bg-[var(--color-primary)] text-white w-12 items-center justify-center hover:bg-[var(--color-primary-dark)] hover:text-white border-0"
        >
          <AlignLeft />
        </Button>
        {/* Logo */}
        <Link href="/">
          <h1 className="text-2xl font-bold text-teal-600">FYNSERA</h1>
        </Link>
      </div>

      {/* Middle: Mobile Navigation (visible only on small screens) */}
      <div className="flex md:hidden">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-4">
            <SheetHeader className="mb-4">
              <SheetTitle className="text-2xl font-bold text-teal-600">
                FYNSERA
              </SheetTitle>
            </SheetHeader>

            <div className="flex justify-between flex-col min-h-[calc(100vh-130px)]">
              <nav>
                <ul className="flex flex-col space-y-4">
                  <li>
                    <Link
                      href="/dashboard"
                      onClick={handleLinkClick}
                      className="flex items-center gap-2"
                    >
                      <Home className="h-5 w-5" />
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/dashboard/upload-files"
                      onClick={handleLinkClick}
                      className="flex items-center gap-2"
                    >
                      <File className="h-5 w-5" />
                      Upload Files
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/dashboard/transactions"
                      onClick={handleLinkClick}
                      className="flex items-center gap-2"
                    >
                      <DollarSign className="h-5 w-5" />
                      Transactions
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/dashboard/budget"
                      onClick={handleLinkClick}
                      className="flex items-center gap-2"
                    >
                      <BadgePoundSterling className="h-5 w-5" />
                      Budget
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/dashboard/goal-tracking"
                      onClick={handleLinkClick}
                      className="flex items-center gap-2"
                    >
                      <Goal className="h-5 w-5" />
                      Goal Tracking
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/dashboard/ai-insight"
                      onClick={handleLinkClick}
                      className="flex items-center gap-2"
                    >
                      <ChartPie className="h-5 w-5" />
                      Ai Insight
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/dashboard/chat"
                      onClick={handleLinkClick}
                      className="flex items-center gap-2"
                    >
                      <Sparkles className="h-5 w-5" />
                      Ai Assistant
                    </Link>
                  </li>
                </ul>
              </nav>
              {/* Mobile Authentication Buttons */}
              <div className="mt-6">
                {isLoggedin ? (
                  <Button
                    onClick={() => {
                      signOut({ callbackUrl: "/signin" });
                      setSheetOpen(false);
                    }}
                    className="w-full bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600 rounded-[5px]"
                  >
                    Logout
                  </Button>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Link href="/signin" onClick={handleLinkClick}>
                      <Button className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] px-4 py-2 text-sm text-white rounded-[2px]">
                        Login
                      </Button>
                    </Link>
                    <Link href="/signup" onClick={handleLinkClick}>
                      <Button
                        variant="outline"
                        className="w-full border-secondary px-4 py-2 text-sm text-teal-600 rounded-[2px]"
                      >
                        Register
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Right: User profile (visible on desktop) */}
      <div className="hidden lg:flex items-center space-x-4">
        {status === "authenticated" ? (
          <>
            {/* <Button
              variant="outline"
              className="bg-[#E33B32] text-white hover:bg-[hsl(3,76%,54%)] hover:text-white border-0"
              onClick={() => signOut({ callbackUrl: "/signin" })}
            >
              Sign Out
            </Button> */}
            <Button
              variant="outline"
              className="flex items-center gap-2 text-gray-700 bg-gradient-to-r from-blue-50 to-blue-50 border-0"
            >
              <span>Hello, {session.user.name}</span>
              {/* Render profile image if available */}
              {session?.user?.image && (
                <Image
                  src={session.user.image}
                  alt="Profile"
                  width={32}
                  height={32}
                  className="rounded-full border border-gray-300 shadow-sm"
                />
              )}
            </Button>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <Link href="/signin">
              <Button className=" bg-primary px-4 py-2 text-sm text-white hover:bg-primary-dark rounded-[2px]">
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button
                variant="outline"
                className=" border-secondary px-4 py-2 text-sm text-teal-600 hover:text-teal-600/75 rounded-[2px]"
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
