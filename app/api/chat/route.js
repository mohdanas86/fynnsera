// import { GoogleGenerativeAI } from "@google/generative-ai";
// import connectToDatabase from "@/lib/db";
// import Transaction from "@/models/Transaction";

// const apiKey = process.env.GEMINI_API_KEY;
// const genAI = new GoogleGenerativeAI(apiKey);

// const generationConfig = {
//   temperature: 0.7,
//   topP: 0.95,
//   topK: 40,
//   maxOutputTokens: 1024,
//   responseMimeType: "text/plain",
// };

// // Validation sets
// const VALID_INTENTS = new Set([
//   "spendingQuery",
//   "budgetAdvice",
//   "goalTracking",
// ]);
// const VALID_CATEGORIES = new Set(["food", "entertainment", "bills", "etc"]);
// const VALID_TIMEFRAMES = new Set(["month", "week", "year"]);

// export async function POST(request) {
//   try {
//     await connectToDatabase();
//     const { message, userId } = await request.json();

//     if (!message?.trim() || !userId) {
//       return new Response(JSON.stringify({ error: "Invalid request body" }), {
//         status: 400,
//         headers: { "Content-Type": "application/json" },
//       });
//     }

//     const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

//     // Enhanced prompt with strict formatting examples
//     const analysisPrompt = `
//       Analyze the financial query: "${message}".
//       Respond ONLY with a valid JSON object in this exact structure:
//       {
//         "intent": "${Array.from(VALID_INTENTS).join("|")}",
//         "category": "${Array.from(VALID_CATEGORIES).join("|")}",
//         "timeframe": "${Array.from(VALID_TIMEFRAMES).join("|")}",
//         "amount": ${"number|null"}
//       }
//       Examples:
//       {"intent": "spendingQuery", "category": "food", "timeframe": "month", "amount": null}
//       {"intent": "budgetAdvice", "category": "entertainment", "timeframe": "week", "amount": 200}
//       NO OTHER TEXT OR FORMATTING ALLOWED.
//     `;

//     const analysisResult = await model.generateContent(analysisPrompt);
//     let analysisText = (await analysisResult.response.text()).trim();

//     // Robust JSON extraction
//     const jsonMatch =
//       analysisText.match(/(\{[^]*\})/s) || analysisText.match(/\{.*\}/);
//     if (!jsonMatch) throw new Error("No JSON found in AI response");

//     const sanitizedJson = jsonMatch[1]
//       .replace(/^```json|```$/g, "")
//       .replace(/(\w+):/g, '"$1":')
//       .replace(/'/g, '"');

//     const queryData = JSON.parse(sanitizedJson);

//     // Enhanced validation
//     const isValid =
//       VALID_INTENTS.has(queryData.intent) &&
//       VALID_CATEGORIES.has(queryData.category) &&
//       VALID_TIMEFRAMES.has(queryData.timeframe) &&
//       (typeof queryData.amount === "number" || queryData.amount === null);

//     if (!isValid) throw new Error("Invalid AI response structure");

//     // Date calculation based on timeframe
//     const now = new Date();
//     let startDate, endDate;

//     switch (queryData.timeframe) {
//       case "week":
//         startDate = new Date(now.setDate(now.getDate() - now.getDay()));
//         endDate = new Date(startDate);
//         endDate.setDate(startDate.getDate() + 7);
//         break;
//       case "year":
//         startDate = new Date(now.getFullYear(), 0, 1);
//         endDate = new Date(now.getFullYear() + 1, 0, 1);
//         break;
//       default: // month
//         startDate = new Date(now.getFullYear(), now.getMonth(), 1);
//         endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
//     }

//     const transactions = await Transaction.find({
//       userId,
//       category: queryData.category,
//       date: { $gte: startDate, $lt: endDate },
//     });

//     const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);

//     // Response generation
//     const responsePrompt = `
//       User query: "${message}"
//       Category: ${queryData.category}
//       Timeframe: ${queryData.timeframe}
//       Total spent: $${totalSpent}
//       Provide concise financial advice (2-3 sentences) using these numbers.
//       Use simple language and practical tips.
//     `;

//     const responseResult = await model.generateContent(responsePrompt);
//     const responseText = (await responseResult.response.text()).trim();

//     return new Response(JSON.stringify({ text: responseText }), {
//       status: 200,
//       headers: { "Content-Type": "application/json" },
//     });
//   } catch (error) {
//     console.error("Processing Error:", error);
//     const status = error.message.includes("JSON") ? 422 : 500;
//     return new Response(
//       JSON.stringify({
//         error: error.message.includes("JSON")
//           ? "AI response format error"
//           : "Processing failed",
//       }),
//       {
//         status,
//         headers: { "Content-Type": "application/json" },
//       }
//     );
//   }
// }

import { GoogleGenerativeAI } from "@google/generative-ai";
import connectToDatabase from "@/lib/db";
import Transaction from "@/models/Transaction";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const generationConfig = {
  temperature: 0.5, // Reduced for more predictable responses
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 1024,
  responseMimeType: "text/plain",
};

// Validation constants
const VALID_INTENTS = new Set([
  "spendingQuery",
  "budgetAdvice",
  "goalTracking",
]);
const VALID_CATEGORIES = new Set(["food", "entertainment", "bills", "etc"]);
const VALID_TIMEFRAMES = new Set(["month", "week", "year"]);

// AI response schema validator
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

// Enhanced JSON sanitizer
function sanitizeAIResponse(text) {
  try {
    // Remove markdown code blocks
    let sanitized = text
      .replace(/```json|```/g, "")
      .replace(/[\r\n]/g, "")
      .trim();

    // Fix common JSON errors
    sanitized = sanitized
      .replace(/(\w+):/g, '"$1":') // Add quotes to keys
      .replace(/'/g, '"') // Replace single quotes
      .replace(/(,)(\s*})/g, "$2"); // Remove trailing commas

    // Handle number formatting
    sanitized = sanitized.replace(/"amount":\s*"(\d+)"/g, '"amount": $1');

    return JSON.parse(sanitized);
  } catch (error) {
    console.error("Sanitization failed:", error);
    throw new Error("AI response format invalid");
  }
}

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

    // Enhanced prompt with strict constraints
    const analysisPrompt = `
      STRICTLY FOLLOW THESE RULES:
      1. Analyze this financial query: "${message}"
      2. Return ONLY JSON with this EXACT structure:
      {
        "intent": "${Array.from(VALID_INTENTS).join("|")}",
        "category": "${Array.from(VALID_CATEGORIES).join("|")}",
        "timeframe": "${Array.from(VALID_TIMEFRAMES).join("|")}",
        "amount": ${"number|null"}
      }
      3. Examples of VALID responses:
      {"intent": "spendingQuery", "category": "food", "timeframe": "month", "amount": null}
      {"intent": "budgetAdvice", "category": "entertainment", "timeframe": "week", "amount": 200}
      
      INVALID RESPONSES WILL CAUSE SYSTEM FAILURES.
      DO NOT ADD COMMENTS, EXPLANATIONS, OR FORMATTING.
    `;

    // AI Response handling with retries
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

    // Date calculations with timezone awareness
    const now = new Date();
    let startDate, endDate;

    switch (queryData.timeframe) {
      case "week":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - now.getDay());
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 7);
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

    // Database query with error handling
    let transactions;
    try {
      transactions = await Transaction.find({
        userId,
        category: queryData.category,
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

    // Response generation with validation
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

    // Clean response text
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
