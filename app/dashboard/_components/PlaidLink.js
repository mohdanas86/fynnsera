"use client";

import { usePlaidLink } from "react-plaid-link";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const PlaidLink = () => {
  const { data: session, status } = useSession();
  const [token, setToken] = useState(null);

  useEffect(() => {
    const fetchLinkToken = async () => {
      if (status === "authenticated" && session?.user?.id) {
        console.log("Fetching link token for user:", session.user.id);
        try {
          const response = await fetch("/api/plaid/linktoken", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: session.user.id }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to fetch link token");
          }

          const data = await response.json();
          console.log("Full API response:", data);
          console.log("Link token fetched:", data.link_token);
          setToken(data.link_token);
        } catch (error) {
          console.error("Error fetching link token:", error.message);
        }
      } else {
        console.log("Session not ready yet, status:", status);
      }
    };

    fetchLinkToken();
  }, [session, status]);

  const config = {
    token,
    onSuccess: async (publicToken) => {
      console.log("Plaid Link success, public token:", publicToken);
      await fetch("/api/plaid/exchangetoken", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          public_token: publicToken,
          userId: session.user.id,
        }),
      });
      await fetch("/api/plaid/fetchtransactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: session.user.id }),
      });
    },
    onExit: (err) => {
      if (err) console.error("Plaid Link exited with error:", err);
    },
  };

  const { open, ready } = usePlaidLink(config);

  useEffect(() => {
    console.log("PlaidLink state - token:", token, "ready:", ready);
  }, [token, ready]);

  if (status === "loading") return <p>Loading Plaid Link...</p>;

  return (
    <Button
      className="bg-[var(--color-primary)] text-white rounded-[2px] hover:bg-[var(--color-primary-dark)] w-[200px] disabled:cursor-not-allowed"
      // className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
      onClick={() => {
        console.log("Button clicked, opening Plaid Link");
        open();
      }}
      disabled={!ready}
    >
      Connect Bank Account
    </Button>
  );
};

export default PlaidLink;
