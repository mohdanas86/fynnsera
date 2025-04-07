// // Import the Google Generative AI library, database connection, and the FormattedTransactionModel.
// import { GoogleGenerativeAI } from "@google/generative-ai";
// import connectToDatabase from "@/lib/db";
// import FormattedTransactionModel from "@/models/FormattedTransactionModel";

// // Retrieve the API key from environment variables; throw an error if it's missing.
// const apiKey = process.env.GEMINI_API_KEY;
// if (!apiKey) {
//   throw new Error("GEMINI_API_KEY is not set");
// }

// // Initialize the GoogleGenerativeAI instance.
// const genAI = new GoogleGenerativeAI(apiKey);

// // Configuration for the generative model.
// const generationConfig = {
//   temperature: 0.5,
//   topP: 0.95,
//   topK: 40,
//   maxOutputTokens: 1024,
//   responseMimeType: "text/plain",
// };

// // Main POST function to handle the request.
// export async function POST(request) {
//   try {
//     // Connect to the database.
//     await connectToDatabase();

//     // Parse the request body to extract the user query and userId.
//     const { message, userId } = await request.json();

//     // Validate that both message and userId are provided.
//     if (!message?.trim() || !userId) {
//       return new Response(JSON.stringify({ error: "Invalid request body" }), {
//         status: 400,
//         headers: { "Content-Type": "application/json" },
//       });
//     }

//     // Retrieve all formatted transactions for the given user.
//     const transactions = await FormattedTransactionModel.find({
//       userId,
//     }).lean();

//     // Prepare the prompt by including the user query and their formatted transactions.
//     const prompt = `
//       Analyze the following financial query along with the user's formatted transactions.
//       User Query: "${message}"
//       Formatted Transactions: ${JSON.stringify(transactions)}

//       Provide concise and actionable financial advice using simple, non-technical language.
//       Limit your response to 2-3 sentences.
//     `;

//     // Get the generative model instance and generate the response.
//     const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
//     const responseResult = await model.generateContent(
//       prompt,
//       generationConfig
//     );
//     let responseText = (await responseResult.response.text()).trim();
//     // Clean up the AI response text.
//     responseText = responseText.replace(/["*]/g, "").replace(/\n/g, " ").trim();

//     // Return the generated response as JSON.
//     return new Response(JSON.stringify({ text: responseText }), {
//       status: 200,
//       headers: { "Content-Type": "application/json" },
//     });
//   } catch (error) {
//     console.error("Error processing request:", error);
//     // Determine the appropriate HTTP status code based on the error.
//     const statusCode = error.message.includes("invalid")
//       ? 422
//       : error.message.includes("Database")
//       ? 500
//       : 400;
//     return new Response(JSON.stringify({ error: "Processing error" }), {
//       status: statusCode,
//       headers: { "Content-Type": "application/json" },
//     });
//   }
// }

// Import the Google Generative AI library, database connection, and the FormattedTransactionModel.
import { GoogleGenerativeAI } from "@google/generative-ai";
import connectToDatabase from "@/lib/db";
import FormattedTransactionModel from "@/models/FormattedTransactionModel";

// Retrieve the API key from environment variables; throw an error if it's missing.
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not set");
}

// Initialize the GoogleGenerativeAI instance.
const genAI = new GoogleGenerativeAI(apiKey);

// Configuration for the generative model.
const generationConfig = {
  temperature: 0.1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 1200,
  responseMimeType: "text/plain",
};

// Main POST function to handle the request.
export async function POST(request) {
  try {
    // Connect to the database.
    await connectToDatabase();

    // Parse the request body to extract the user query and userId.
    const { message, userId } = await request.json();

    // Validate that both message and userId are provided.
    if (!message?.trim() || !userId) {
      return new Response(JSON.stringify({ error: "Invalid request body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Retrieve all formatted transactions for the given user.
    const transactions = await FormattedTransactionModel.find({
      userId,
    }).lean();

    // Enhanced prompt for generating a finance expert response.
    const prompt = `
      You are a seasoned finance expert with extensive experience in personal finance and budgeting.
      Analyze the user's query and review their recent financial transactions provided below.
      
      User Query: "${message}"
      
      Formatted Transactions Data: ${JSON.stringify(transactions)}
      
      Based on the above, provide clear, concise, and actionable financial advice. 
      Highlight any trends or areas of concern and suggest practical steps for improvement.
      Limit your response to 2-3 sentences, and ensure your language is simple and non-technical.
    `;

    // Get the generative model instance and generate the response.
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const responseResult = await model.generateContent(
      prompt,
      generationConfig
    );
    let responseText = (await responseResult.response.text()).trim();

    // Clean up the AI response text.
    responseText = responseText.replace(/["*]/g, "").replace(/\n/g, " ").trim();

    // Return the generated response as JSON.
    return new Response(JSON.stringify({ text: responseText }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing request:", error);
    // Determine the appropriate HTTP status code based on the error.
    const statusCode = error.message.includes("invalid")
      ? 422
      : error.message.includes("Database")
      ? 500
      : 400;
    return new Response(JSON.stringify({ error: "Processing error" }), {
      status: statusCode,
      headers: { "Content-Type": "application/json" },
    });
  }
}
