"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useMyContext } from "@/context/MyContext";
import { Button } from "@/components/ui/button";

const Header = () => {
  const pathname = usePathname();
  const { isLoggedin } = useMyContext();

  const isActive = (href) => pathname === href;

  return (
    <header className="bg-white">
      <div className="mx-auto flex h-16 max-w-screen-xl items-center gap-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-1 items-center justify-end md:justify-between">
          <nav aria-label="Global" className="hidden md:block">
            <ul className="flex items-center gap-6 text-sm">
              {isLoggedin
                ? [
                    { name: "Home", href: "/" },
                    { name: "About", href: "/about" },
                    { name: "Careers", href: "/careers" },
                    { name: "Dashboard", href: "/dashboard" },
                    { name: "History", href: "/history" },
                    { name: "Services", href: "/services" },
                    { name: "Projects", href: "/projects" },
                    { name: "Blog", href: "/blog" },
                  ].map((link) => (
                    <li key={link.name}>
                      <Link href={link.href}>
                        <span
                          className={`transition ${
                            isActive(link.href)
                              ? "text-teal-600 font-bold"
                              : "text-gray-500 hover:text-gray-500/75"
                          }`}
                        >
                          {link.name}
                        </span>
                      </Link>
                    </li>
                  ))
                : [
                    { name: "Home", href: "/" },
                    { name: "About", href: "/about" },
                    { name: "Careers", href: "/careers" },
                    { name: "History", href: "/history" },
                    { name: "Services", href: "/services" },
                    { name: "Projects", href: "/projects" },
                    { name: "Blog", href: "/blog" },
                  ].map((link) => (
                    <li key={link.name}>
                      <Link href={link.href}>
                        <span
                          className={`transition ${
                            isActive(link.href)
                              ? "text-teal-600 font-bold"
                              : "text-gray-500 hover:text-gray-500/75"
                          }`}
                        >
                          {link.name}
                        </span>
                      </Link>
                    </li>
                  ))}
            </ul>
          </nav>

          <div className="flex items-center gap-4">
            {isLoggedin ? (
              <Button
                onClick={() => signOut()}
                className="block rounded-md bg-red-500 px-5 text-sm font-medium text-white transition hover:bg-red-600"
              >
                Logout
              </Button>
            ) : (
              <div className="sm:flex sm:gap-4">
                <Link href="/signin">
                  <span className="block rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-dark">
                    Login
                  </span>
                </Link>

                <Link href="/signup">
                  <span className="hidden rounded-md bg-secondary px-5 py-2.5 text-sm font-medium text-teal-600 transition hover:text-teal-600/75 sm:block">
                    Register
                  </span>
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
