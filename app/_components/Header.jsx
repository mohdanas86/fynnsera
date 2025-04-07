"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useMyContext } from "@/context/MyContext";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AlignLeft, AlignRight } from "lucide-react";

const Header = () => {
  const pathname = usePathname();
  const { isLoggedin } = useMyContext();
  const [isOpen, setIsOpen] = useState(false); // 🔹 Sheet open/close state

  const isActive = (href) => pathname === href;

  const handleClose = () => setIsOpen(false); // 🔹 Used on every click

  // Define your links once
  const links = isLoggedin
    ? [
        { name: "Home", href: "/" },
        { name: "About", href: "/about" },
        // { name: "Careers", href: "/careers" },
        { name: "Dashboard", href: "/dashboard" },
        // { name: "History", href: "/history" },
        // { name: "Services", href: "/services" },
        // { name: "Projects", href: "/projects" },
        // { name: "Blog", href: "/blog" },
      ]
    : [
        { name: "Home", href: "/" },
        { name: "About", href: "/about" },
        { name: "Dashboard", href: "/dashboard" },
        // { name: "Careers", href: "/careers" },
        // { name: "History", href: "/history" },
        // /        { name: "Services", href: "/services" },
        // { name: "Projects", href: "/projects" },
        // { name: "Blog", href: "/blog" },
      ];

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="mx-auto flex h-16 max-w-screen-xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <div className="flex-shrink-0">
          <Link href="/">
            <span className="text-xl font-bold text-teal-600">Ai Finance</span>
          </Link>
        </div>

        <div className="flex w-full items-center justify-end">
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" className="p-2">
                  <AlignRight className="h-6 w-6 text-gray-700" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-4 pb-0">
                <SheetHeader className="p-0 my-4">
                  <SheetTitle className="text-2xl font-bold text-teal-600">
                    Ai Finance
                  </SheetTitle>
                  <SheetDescription className="text-gray-500 text-sm">
                    Navigation for Smarter Financial Decisions
                  </SheetDescription>
                </SheetHeader>
                <nav aria-label="Mobile Global">
                  <ul className="flex flex-col gap-3 text-base">
                    {links.map((link) => (
                      <li key={link.name}>
                        <Link href={link.href} onClick={handleClose}>
                          <span
                            className={`block transition ${
                              isActive(link.href)
                                ? "text-teal-600 font-bold"
                                : "text-gray-600 hover:text-teal-600"
                            }`}
                          >
                            {link.name}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
                <div className="mt-6">
                  {isLoggedin ? (
                    <Button
                      onClick={() => {
                        signOut();
                        handleClose(); // 🔹 Close on logout
                      }}
                      className="w-full rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600"
                    >
                      Logout
                    </Button>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <Link href="/signin" onClick={handleClose}>
                        <Button className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] px-4 py-2 text-sm font-medium text-white transition">
                          Login
                        </Button>
                      </Link>
                      <Link href="/signup" onClick={handleClose}>
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

          {/* Desktop Navigation (hidden on mobile) */}
          <nav aria-label="Global" className="hidden md:block">
            <ul className="flex items-center gap-4 text-sm">
              {links.map((link) => (
                <li key={link.name}>
                  <Link href={link.href}>
                    <span
                      className={`transition ${
                        isActive(link.href)
                          ? "text-teal-600 font-bold"
                          : "text-gray-600 hover:text-teal-600"
                      }`}
                    >
                      {link.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Desktop action buttons (hidden on mobile) */}
          <div className="hidden md:flex items-center gap-3 ml-4">
            {isLoggedin ? (
              <Button
                onClick={() => signOut()}
                className="rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600"
              >
                Logout
              </Button>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/signin">
                  <Button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-dark">
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button
                    variant="outline"
                    className="rounded-md border-secondary px-4 py-2 text-sm font-medium text-teal-600 transition hover:text-teal-600/75"
                  >
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
