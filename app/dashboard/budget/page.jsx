"use client";
import React, { useEffect, useState, useMemo } from "react";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useSession } from "next-auth/react";
import PlaidLink from "../_components/PlaidLink";
import Loding from "../_components/Loding";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Budget() {
  const { data: session, status } = useSession();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasFetched, setHasFetched] = useState(false);

  // Memoize recommendations to avoid unnecessary re-renders.
  const memoizedRecommendations = useMemo(
    () => recommendations,
    [recommendations]
  );

  useEffect(() => {
    if (status === "loading" || !session || hasFetched) return;

    async function fetchBudgetRecommendations() {
      try {
        const response = await fetch("/api/geminibudget", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: session.user.id }),
        });
        const result = await response.json();
        console.log("result : ", result);

        // If the API returns an error response
        if (!response.ok || !result.success) {
          // If the error is due to no transactions, treat it as a valid empty state.
          if (result.error && result.error.includes("No transactions found")) {
            setRecommendations([]);
            setHasFetched(true);
          } else {
            setRecommendations([]);
            setHasFetched(true);
          }
        } else {
          setRecommendations(result.recommendations || []);
          setHasFetched(true);
        }
      } catch (error) {
        console.error("Error fetching budget recommendations:", error);
        setError("Unable to load recommendations. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchBudgetRecommendations();
  }, [session, status, hasFetched]);

  return (
    <div className="container mx-auto lg:px-4">
      <h1 className="text-2xl font-bold mb-6">Budget Recommendations</h1>
      {loading ? (
        <Loding />
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : memoizedRecommendations.length > 0 ? (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {memoizedRecommendations.map((rec, index) => (
            <Card
              key={index}
              className="group transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg bg-white shadow-sm rounded-2xl p-6 border border-gray-100"
            >
              <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-4 mb-3">
                <CardTitle className="flex items-center gap-2 text-2xl font-bold text-green-800 tracking-tight">
                  {/* <ShoppingCartIcon className="h-6 w-6 text-green-800" />{" "} */}
                  {/* Replace with category-specific icon */}
                  {rec.category}
                </CardTitle>
                <CardDescription className="text-sm text-green-600 mt-1">
                  Estimated Spending:{" "}
                  <span className="font-medium">
                    ₹{rec.spending.toFixed(2)}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="text-gray-800 leading-relaxed">
                <div className="text-base whitespace-pre-line">
                  {rec.recommendation}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-teal-50 p-6 rounded-lg shadow mb-6 text-center">
          <h2 className="text-2xl font-bold mb-2">No Transactions Available</h2>
          <p className="text-gray-600">
            Connect your bank account to see your transactions.
          </p>
          <div className="mt-4 flex flex-wrap gap-4 justify-center items-center">
            <PlaidLink onConnected={fetchTransactions} />
            <Link href="/dashboard/upload-files">
              <Button className="bg-[var(--color-primary)] text-white rounded-[2px] hover:bg-[var(--color-primary-dark)] w-[200px]">
                Upload File
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
