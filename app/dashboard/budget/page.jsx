"use client";
import React, { useEffect, useState, useMemo } from "react";
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
            <Card key={index} className="shadow-md">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  {rec.category}
                </CardTitle>
                <CardDescription>
                  Budget: ${rec.spending.toFixed(2)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{rec.recommendation}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-purple-100 p-6 rounded-lg shadow text-center">
          <h2 className="text-2xl font-bold mb-2">Connect Your Bank Account</h2>
          <p className="text-gray-600">
            Link your bank account to see your budget recommendations.
          </p>
          <div className="mt-4">
            <PlaidLink />
          </div>
        </div>
      )}
    </div>
  );
}
