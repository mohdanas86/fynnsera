import { NextResponse } from "next/server";
import { getGeminiTips } from "@/lib/getGeminiTips";
import CachedTip from "@/models/CachedTip";
import connectToDatabase from "@/lib/db";
import crypto from "crypto";
import FormattedTransactionModel from "@/models/FormattedTransactionModel";

export async function POST(req) {
  try {
    await connectToDatabase();
    const { transactions, userId } = await req.json();

    if (!transactions || !Array.isArray(transactions) || !userId) {
      return NextResponse.json(
        { error: "Invalid input data" },
        { status: 400 }
      );
    }

    // Format the transactions into a string
    const formattedData = transactions
      .map(
        (t, i) =>
          `${i} - date: ${t.date} - amount: ₹${t.amount} - category: ${t.category} - description: ${t.description} - transactionType: ${t?.transactionType}`
      )
      .join("\n");

    // Check if formatted data already exists for user
    let existingFormatted = await FormattedTransactionModel.findOne({ userId });

    if (!existingFormatted) {
      // If not, save new formatted data
      existingFormatted = await FormattedTransactionModel.create({
        userId,
        transactions: formattedData,
        createdAt: new Date(),
      });
      console.log("--- Saved new formatted data");
    } else {
      console.log("--- Found existing formatted data");
    }

    // Compute hash from formatted data
    const hash = crypto
      .createHash("sha256")
      .update(formattedData)
      .digest("hex");

    // Check for cached tips
    const cachedTip = await CachedTip.findOne({ userId });
    if (cachedTip && cachedTip.transactionsHash === hash) {
      console.log("--- Returning cached tips");
      return NextResponse.json({
        formattedTransactions: existingFormatted.transactions,
        tips: cachedTip.aiTips,
      });
    }

    // Generate new tips using Gemini
    const tips = await getGeminiTips(transactions, userId);

    // Update cache
    await CachedTip.findOneAndUpdate(
      { userId },
      {
        aiTips: tips,
        transactionsHash: hash,
        lastUpdated: new Date(),
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      formattedTransactions: existingFormatted.transactions,
      tips,
    });
  } catch (err) {
    console.error("API Error:", err);
    return NextResponse.json(
      { error: err.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
