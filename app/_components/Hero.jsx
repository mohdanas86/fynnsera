"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";
import { useMyContext } from "@/context/MyContext";

const Hero = () => {
  const { isLoggedin } = useMyContext();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-12 py-16 px-8 mx-auto max-w-7xl">
      {/* Left Content */}
      <div className="flex flex-col lg:gap-6 gap-4 items-start text-left">
        <h2 className="lg:text-5xl text-2xl font-extrabold leading-tight text-gray-900">
          Take Control of Your Finances with Smart Insights
        </h2>
        <p className="text-gray-700 lg:text-lg text-sm font-medium">
          Learn to save, invest, build credit, and stay safe—together, with the
          power of AI.
        </p>
        <Link href={isLoggedin ? "/dashboard" : "/signup"}>
          <Button className="w-[150px] bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white transition-all">
            {isLoggedin ? "Dashboard" : "Sign Up"}
          </Button>
        </Link>
        <p className="text-sm text-gray-500 max-w-md">
          Learn how we collect and use your information by visiting our{" "}
          <a
            href="/privacy"
            className="text-[var(--color-primary)] hover:underline"
          >
            Privacy Statement
          </a>
          .
        </p>
      </div>

      {/* Right Image */}
      <div className="flex items-center justify-center">
        <img
          src="/img/bank.png"
          className="w-[90%] max-w-[450px] drop-shadow-lg transition-all scale-x-[-1] rotate-[-7deg] scalingEffect"
          alt="Financial Insights"
        />
      </div>
    </div>
  );
};

export default Hero;
