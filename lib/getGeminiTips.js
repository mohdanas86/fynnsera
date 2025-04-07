// /lib/getGeminiTips.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import FormattedTransactionModel from "@/models/FormattedTransactionModel";
import connectToDatabase from "@/lib/db";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY
);

export async function getGeminiTips(transactions, userId) {
  if (!userId) throw new Error("User ID is required");

  await connectToDatabase(); // Ensure DB is connected

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const formattedTransactions = transactions
    .map(
      (t) => ` ${t.date} - ₹${t.amount} - ${t.category} - ${t.description}, `
    )
    .join("\n");

  //   console.log("formattedTransactions:", formattedTransactions);

  const existingData = await FormattedTransactionModel.findOne({ userId });

  if (!existingData) {
    await FormattedTransactionModel.create({
      userId,
      transactions: formattedTransactions,
      lastUpdated: new Date(),
    });
    console.log("✅ Inserted new transaction data");
  } else if (existingData.transactions !== formattedTransactions) {
    existingData.transactions = formattedTransactions;
    existingData.lastUpdated = new Date();
    await existingData.save();
    console.log("🔁 Updated transaction data");
  } else {
    console.log("ℹ️ No changes in transactions");
  }

  const prompt = `
  You are an advanced financial assistant AI. Given the user's list of transactions below, perform a comprehensive financial analysis and produce a well-structured HTML report. Format your response with clear headings and spacing to enhance readability. Do not include any styling attributes or wrap your output in <html>, <head>, or <body> tags.
  
  Your response must include:
  
  <h1 style="margin-bottom: 1rem;">1. Spending Pattern Summary</h1>
  <p style="margin-bottom: 1rem;">Identify and explain recurring spending habits, notable transactions, duplicate entries, and any anomalies in the transaction data.</p>
  
  <h1 style="margin-bottom: 1rem;">2. Top 3 Personalized Financial Tips</h1>
  <p style="margin-bottom: 1rem;">Provide three specific and practical recommendations tailored to the user's actual spending behavior. Avoid generic advice.</p>
  
  <h1 style="margin-bottom: 1rem;">3. Time-Based Summaries</h1>
  
  <h2 style="margin-bottom: 0.75rem;">Monthly Summary</h2>
  <p style="margin-bottom: 1rem;">Present spending totals and major categories on a monthly basis.</p>
  
  <h2 style="margin-bottom: 0.75rem;">Weekly Summary</h2>
  <p style="margin-bottom: 1rem;">Highlight the activity and trends observed during the most recent week.</p>
  
  <h2 style="margin-bottom: 0.75rem;">Yearly Summary</h2>
  <p style="margin-bottom: 1rem;">Summarize overall trends, consistent spending areas, and noteworthy patterns for the year.</p>
  
  Keep your tone professional, insightful, and concise. Use bullet points, subheadings, and paragraph breaks for clarity.
  
  ---
  User’s Transactions:
  ${formattedTransactions}
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;

  return response.text();
}
