"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, AlertCircle, RefreshCw } from "lucide-react";
import { useMyContext } from "@/context/MyContext";
import { Skeleton } from "@/components/ui/skeleton";

export default function Budget() {
  const { data: session, status } = useSession();
  const {
    userTransaction = [],
    selectedProvider,
    selectedFileData,
    handleSelect,
    userFileLogs = { data: [] },
  } = useMyContext();

  const [budgetData, setBudgetData] = useState({
    budgets: [],
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (
      !isMounted ||
      status !== "authenticated" ||
      !session?.user?.id ||
      !selectedFileData?._id
    ) {
      return;
    }

    const controller = new AbortController();
    const fetchBudget = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await fetch("/api/geminibudget", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: session.user.id,
            fileId: selectedFileData._id,
            formatedData: userTransaction,
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const errRes = await res.json().catch(() => ({}));
          throw new Error(errRes.error || "Failed to load budget");
        }

        const data = await res.json();
        setBudgetData({
          budgets: Array.isArray(data.budgets) ? data.budgets : [],
          total:
            typeof data.totalSpending === "number" ? data.totalSpending : 0,
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(
            err.message || "Something went wrong while fetching budget."
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchBudget();

    return () => controller.abort();
  }, [isMounted, status, session, selectedFileData, userTransaction]);

  if (!isMounted) return null;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 p-6">
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="w-6 h-6" />
          <p className="text-lg font-medium">{error}</p>
        </div>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="lg:p-10 p-4 space-y-6">
      <h1 className="text-2xl font-bold text-[var(--color-heading)]">
        Smart Budget Planner
      </h1>

      <div className="flex lg:flex-row flex-col lg:items-center items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <p className="text-lg font-medium opacity-90">Monthly Expenditure</p>
          <h2 className="text-lg font-bold IbmFont">
            ₹
            {budgetData.total.toLocaleString("en-IN", {
              maximumFractionDigits: 2,
            })}
          </h2>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-[220px] flex justify-between items-center rounded-[4px] border border-gray-300 shadow-sm px-4 py-2 bg-white hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-medium text-gray-700">
                {selectedProvider || "Select Provider"}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[220px] rounded-[4px] shadow-md border border-gray-200 bg-white z-50">
            <DropdownMenuLabel className="text-xs font-semibold text-gray-500 px-3 py-2">
              Files
            </DropdownMenuLabel>
            {Array.isArray(userFileLogs.data) &&
            userFileLogs.data.length > 0 ? (
              userFileLogs.data.map((file) => (
                <DropdownMenuItem
                  key={file._id || file.filename}
                  onSelect={() => handleSelect(file)}
                  className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  {file.filename}
                </DropdownMenuItem>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-400">
                No files found
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-16 w-full rounded-xl" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-[200px] w-full rounded-xl" />
            ))}
          </div>
        </div>
      ) : budgetData.budgets.length > 0 ? (
        <div
          className={`grid gap-6 sm:grid-cols-2 ${
            budgetData.budgets.length > 1 ? "lg:grid-cols-3" : "lg:grid-cols-1"
          }`}
        >
          {budgetData.budgets.map((item, index) => (
            <Card
              key={`${item.category}-${index}`}
              className="group relative overflow-hidden rounded-sm IbmFont"
            >
              <CardContent className="prose prose-sm max-w-none">
                <div className="p-2 bg-teal-50 rounded-lg">
                  <h3 className="text-lg font-bold text-green-800">
                    {item.category}
                  </h3>
                  <p className="text-sm font-medium text-gray-600 mb-4">
                    ₹{Number(item.spending).toFixed(2)} •{" "}
                    {Number(item.percentage).toFixed(1)}%
                  </p>
                </div>
                <div className="p-2 mt-2 bg-gray-50 rounded-lg">
                  <ReactMarkdown
                    components={{
                      p: (props) => (
                        <p className="text-gray-700 mb-3" {...props} />
                      ),
                      ul: (props) => (
                        <ul className="list-disc pl-5 space-y-1" {...props} />
                      ),
                      li: (props) => (
                        <li className="text-gray-600" {...props} />
                      ),
                    }}
                  >
                    {item.recommendation || ""}
                  </ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[200px] gap-4 p-6 text-center border-2 border-dashed rounded-xl">
          <p className="text-lg text-[var(--color-para)]">
            No budget categories found
          </p>
          <Button variant="ghost" onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4" /> Refresh Data
          </Button>
        </div>
      )}
    </div>
  );
}
