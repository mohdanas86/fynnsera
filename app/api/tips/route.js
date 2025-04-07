// app/api/tips/route.js
import { NextResponse } from "next/server";
import { getGeminiTips } from "@/lib/getGeminiTips";
import CachedTip from "@/models/CachedTip";
import connectToDatabase from "@/lib/db";
import crypto from "crypto";

export async function POST(req) {
  try {
    await connectToDatabase();
    const { transactions, userId } = await req.json();

    // Format transactions as in your getGeminiTips function
    const formattedTransactions = transactions
      .map(
        (t) => `• ${t.date} - $${t.amount} - ${t.category} - ${t.description}`
      )
      .join("\n");

    // Compute a hash of the formatted transactions
    const hash = crypto
      .createHash("sha256")
      .update(formattedTransactions)
      .digest("hex");

    // Check if a cached tip exists and matches the current transaction data
    const cachedTip = await CachedTip.findOne({ userId });
    if (cachedTip && cachedTip.transactionsHash === hash) {
      console.log("Returning cached AI tip");
      return NextResponse.json({ tips: cachedTip.aiTips });
    }

    // Otherwise, generate new tips via the Gemini API
    const tips = await getGeminiTips(transactions, userId);

    // Store or update the cached tip for this user
    await CachedTip.findOneAndUpdate(
      { userId },
      { aiTips: tips, transactionsHash: hash, lastUpdated: new Date() },
      { upsert: true, new: true }
    );

    return NextResponse.json({ tips });
  } catch (err) {
    console.error("API Error:", err);
    return NextResponse.json(
      { error: err.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
