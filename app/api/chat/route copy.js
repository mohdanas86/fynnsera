import { GoogleGenerativeAI } from "@google/generative-ai";
import connectToDatabase from "@/lib/db";
import Transaction from "@/models/Transaction";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not set");
}
const genAI = new GoogleGenerativeAI(apiKey);

const generationConfig = {
  temperature: 0.5,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 1024,
  responseMimeType: "text/plain",
};

const VALID_INTENTS = new Set([
  "spendingQuery",
  "budgetAdvice",
  "goalTracking",
]);
const VALID_CATEGORIES = new Set(["food", "entertainment", "bills", "etc"]);
const VALID_TIMEFRAMES = new Set(["month", "week", "year"]);

function validateAISchema(response) {
  try {
    if (!response || typeof response !== "object") return false;
    return (
      VALID_INTENTS.has(response.intent) &&
      VALID_CATEGORIES.has(response.category) &&
      VALID_TIMEFRAMES.has(response.timeframe) &&
      (typeof response.amount === "number" || response.amount === null)
    );
  } catch {
    return false;
  }
}

function sanitizeAIResponse(text) {
  try {
    let sanitized = text
      .replace(/```json|```/g, "")
      .replace(/[\r\n]/g, "")
      .trim();
    sanitized = sanitized
      .replace(/(\w+):/g, '"$1":')
      .replace(/'/g, '"')
      .replace(/(,)(\s*})/g, "$2");
    sanitized = sanitized.replace(/"amount":\s*"(\d+)"/g, '"amount": $1');
    return JSON.parse(sanitized);
  } catch (error) {
    console.error("Sanitization failed:", error);
    throw new Error("AI response format invalid");
  }
}

const categoryMap = {
  etc: ["Travel", "Shopping", "Miscellaneous"],
  food: ["Food and Drink", "Groceries"],
  bills: ["Bills and Utilities"],
  entertainment: ["Entertainment"],
};

export async function POST(request) {
  try {
    await connectToDatabase();
    const { message, userId } = await request.json();

    if (!message?.trim() || !userId) {
      return new Response(JSON.stringify({ error: "Invalid request body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const analysisPrompt = `
      STRICTLY FOLLOW THESE RULES:
      1. Analyze this financial query: "${message}"
      2. Return ONLY JSON with this EXACT structure:
      {
        "intent": "${Array.from(VALID_INTENTS).join("|")}",
        "category": "${Array.from(VALID_CATEGORIES).join("|")}",
        "timeframe": "${Array.from(VALID_TIMEFRAMES).join("|")}",
        "amount": number|null
      }
      3. Examples of VALID responses:
      {"intent": "spendingQuery", "category": "food", "timeframe": "month", "amount": null}
      {"intent": "budgetAdvice", "category": "entertainment", "timeframe": "week", "amount": 200}

      INVALID RESPONSES WILL CAUSE SYSTEM FAILURES.
      DO NOT ADD COMMENTS, EXPLANATIONS, OR FORMATTING.
    `;

    let queryData;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const analysisResult = await model.generateContent(analysisPrompt);
        const analysisText = (await analysisResult.response.text()).trim();
        console.log(`AI Response (Attempt ${attempt + 1}):`, analysisText);
        queryData = sanitizeAIResponse(analysisText);
        if (validateAISchema(queryData)) break;
      } catch (error) {
        if (attempt === 2) throw error;
        console.log(`Retrying AI call... Attempt ${attempt + 1}`);
      }
    }

    const now = new Date();
    let startDate, endDate;

    switch (queryData.timeframe) {
      case "week":
        const utcDay = now.getUTCDay(); // 0 = Sunday
        startDate = new Date(
          Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate() - utcDay
          )
        );
        endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case "year":
        startDate = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
        endDate = new Date(Date.UTC(now.getUTCFullYear() + 1, 0, 1));
        break;
      default: // month
        startDate = new Date(
          Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
        );
        endDate = new Date(
          Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)
        );
    }

    const dbCategories = categoryMap[queryData.category] || [
      queryData.category,
    ];

    let transactions;
    try {
      transactions = await Transaction.find({
        userId,
        category: { $in: dbCategories },
        date: { $gte: startDate, $lt: endDate },
      }).lean();
    } catch (dbError) {
      console.error("Database query failed:", dbError);
      throw new Error("Failed to retrieve financial records");
    }

    const totalSpent = transactions.reduce(
      (sum, t) => sum + (t.amount || 0),
      0
    );

    const responsePrompt = `
      Generate financial advice using these parameters:
      - User query: "${message}"
      - Category: ${queryData.category}
      - Timeframe: ${queryData.timeframe}
      - Total spent: $${totalSpent}
      - Amount: ${queryData.amount ?? "N/A"}

      Rules:
      1. Use simple, non-technical language
      2. 2-3 sentences maximum
      3. Include specific numbers when available
      4. Provide actionable advice
      5. Avoid markdown or special formatting
    `;

    const responseResult = await model.generateContent(responsePrompt);
    let responseText = (await responseResult.response.text()).trim();
    responseText = responseText.replace(/["*]/g, "").replace(/\n/g, " ").trim();

    return new Response(JSON.stringify({ text: responseText }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Full Error Trace:", error);
    const statusCode = error.message.includes("invalid")
      ? 422
      : error.message.includes("Database")
      ? 500
      : 400;
    return new Response(
      JSON.stringify({
        error: error.message.includes("AI")
          ? "Analysis service error - please rephrase your query"
          : error.message.includes("Database")
          ? "Financial data unavailable"
          : "Processing error",
      }),
      {
        status: statusCode,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
