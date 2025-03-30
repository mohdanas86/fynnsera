import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import Transaction from "@/models/Transaction";
import Recommendation from "@/models/Recommendation"; // Import the new model

async function getUserTransactions(userId) {
  return await Transaction.find({ userId }).lean();
}

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
  responseSchema: {
    type: "array",
    items: {
      type: "object",
      properties: {
        category: { type: "string" },
        spending: { type: "number" },
        recommendation: { type: "string" },
      },
      required: ["category", "spending", "recommendation"],
    },
  },
};

async function generateRecommendations(spendingData) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  const prompt = `Based on the following spending data, provide budget recommendations as a JSON array where each object includes "category", "spending", and "recommendation": ${JSON.stringify(
    spendingData,
    null,
    2
  )}`;

  const result = await model.generateContent(prompt, generationConfig);
  let textResponse = result.response.text();

  // Strip Markdown code blocks and any extra whitespace
  textResponse = textResponse
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  console.log("Cleaned textResponse:", textResponse);

  let data;
  try {
    data = JSON.parse(textResponse);
  } catch (err) {
    console.error("Error parsing JSON response from Gemini:", err);
    throw new Error("Invalid JSON response from AI");
  }

  // Merge spending data with Gemini recommendations
  return spendingData.map((item) => {
    const recommendation =
      data.find((rec) => rec.category === item.category) || {};
    return {
      category: item.category,
      spending: item.spending,
      recommendation:
        recommendation.recommendation || "No recommendation provided.",
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
    const user = await User.findById(userId);
    if (!user || !user.plaidAccessToken) {
      return NextResponse.json(
        { error: "User or access token not found" },
        { status: 404 }
      );
    }

    // Check if recommendations already exist in the database
    const existingRecommendations = await Recommendation.findOne({ userId });
    if (existingRecommendations) {
      console.log("Returning existing recommendations from DB");
      return NextResponse.json(
        {
          success: true,
          recommendations: existingRecommendations.recommendations,
        },
        { status: 200 }
      );
    }

    // Fetch transactions if no recommendations exist
    const transactions = await getUserTransactions(userId);
    if (!transactions.length) {
      return NextResponse.json(
        { error: "No transactions found for this user." },
        { status: 404 }
      );
    }

    // Calculate spending by category
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

    // Generate recommendations using Gemini
    const recommendations = await generateRecommendations(spendingData);

    // Save the new recommendations to the database
    const newRecommendation = new Recommendation({
      userId,
      recommendations,
    });
    await newRecommendation.save();

    console.log("Generated and saved new recommendations:", recommendations);

    return NextResponse.json(
      { success: true, recommendations },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing request:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
