"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { AlignLeft, Menu, User } from "lucide-react";
import { useMyContext } from "@/context/MyContext";

export default function Header() {
  const { data: session, status } = useSession();
  const { showSidebar, setShowSidebar } = useMyContext();

  return (
    <header className="flex items-center justify-between bg-white border-b shadow-sm px-4 py-3">
      <div className="flex items-center">
        {/* Mobile sidebar trigger using shadcn's Sheet */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" className="md:hidden">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-4">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <nav className="mt-4">
              <ul className="flex flex-col space-y-3">
                <li>
                  <Link
                    href="/dashboard"
                    className="flex items-center space-x-2"
                  >
                    <Menu className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/transactions"
                    className="flex items-center space-x-2"
                  >
                    <Menu className="h-4 w-4" />
                    <span>Transactions</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center space-x-2"
                  >
                    <Menu className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </li>
              </ul>
            </nav>
          </SheetContent>
        </Sheet>
        <Button
          className="mr-1 w-[50px]"
          onClick={() => setShowSidebar(!showSidebar)}
        >
          <AlignLeft />
        </Button>
        <Link href="/">
          <h1 className="ml-4 text-2xl font-semibold">AI Finance Assistant</h1>
        </Link>
      </div>
      <div className="flex items-center space-x-4">
        {status === "authenticated" ? (
          <>
            <span className="text-gray-700">Hello, {session.user.name}</span>
            <Button
              variant="outline"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              Sign Out
            </Button>
          </>
        ) : (
          <Button variant="outline" asChild>
            <Link href="/api/auth/signin">Sign In</Link>
          </Button>
        )}
      </div>
    </header>
  );
}
