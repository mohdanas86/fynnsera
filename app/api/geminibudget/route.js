import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import Transaction from "@/models/Transaction";
import Recommendation from "@/models/Recommendation";

async function getUserTransactions(userId) {
  return await Transaction.find({ userId }).lean();
}

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const generationConfig = {
  temperature: 0.2,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 3000,
  responseMimeType: "plain/text",
};

async function generateRecommendations(spendingData) {
  const totalSpending = spendingData.reduce(
    (sum, item) => sum + item.spending,
    0
  );
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const prompt = `You are a financial advisor. Based on the following spending data and the total spending provided, generate budget recommendations. The spending data is a JSON array of objects, each with "category" and "spending" fields. The total spending is ₹{totalSpending} in rupees.

Your task is to:
1. For each category, calculate its percentage of the total spending.
2. Identify the top three categories with the highest spending amounts.
3. Provide a JSON array where each object includes "category", "spending", and "recommendation".
   - In the "recommendation" field, include:
     - The spending amount.
     - The percentage of total spending.
     - Actionable advice to reduce or optimize spending.
   - For the top three categories, emphasize reducing expenses with specific, category-relevant tips.
   - For other categories, provide general optimization suggestions.

Here is the spending data:
${JSON.stringify(spendingData, null, 2)}`;

  const result = await model.generateContent(prompt, generationConfig);
  let textResponse = result.response.text();

  // Clean response
  textResponse = textResponse
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  let data;
  try {
    data = JSON.parse(textResponse);
  } catch (err) {
    console.error("Error parsing JSON response from Gemini:", err);
    throw new Error("Invalid JSON response from AI");
  }

  // Return recommendations: stringify each recommendation (if needed)
  return spendingData.map((item) => {
    const match = data.find((rec) => rec.category === item.category) || {};
    return {
      category: item.category,
      spending: item.spending,
      recommendation: JSON.stringify(
        match.recommendation || "No recommendation."
      ),
    };
  });
}

export async function POST(req) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Verify user exists and has access token
    const user = await User.findById(userId);
    if (!user || !user.plaidAccessToken) {
      return NextResponse.json(
        { error: "User or access token not found" },
        { status: 404 }
      );
    }

    // Check for existing recommendations
    const existing = await Recommendation.findOne({ userId });
    if (existing && existing.recommendations?.length > 0) {
      return NextResponse.json(
        { success: true, recommendations: existing.recommendations },
        { status: 200 }
      );
    }

    // If no recommendations, generate from transactions
    const transactions = await getUserTransactions(userId);
    if (!transactions.length) {
      return NextResponse.json(
        { error: "No transactions found for this user." },
        { status: 404 }
      );
    }

    // Sum up spending by category
    const spendingByCategory = transactions.reduce((acc, tx) => {
      const category = tx.category || "Uncategorized";
      acc[category] = (acc[category] || 0) + tx.amount;
      return acc;
    }, {});

    const spendingData = Object.entries(spendingByCategory).map(
      ([category, spending]) => ({
        category,
        spending: Math.abs(spending),
      })
    );

    // Generate and save recommendations
    const recommendations = await generateRecommendations(spendingData);

    await Recommendation.create({
      userId,
      recommendations,
    });

    return NextResponse.json(
      { success: true, recommendations },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing request:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
