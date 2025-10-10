// /lib/getGeminiTips.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import connectToDatabase from "@/lib/db";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY
);

export async function getGeminiTips(userId, formatedData) {
  if (!userId) {
    throw new Error("Authentication required: User ID is missing");
  }

  if (!formatedData || typeof formatedData !== "string") {
    throw new Error(
      "Invalid input: Transaction data must be provided as a string"
    );
  }

  await connectToDatabase().catch((err) => {
    console.error("Database connection error:", err);
    throw new Error("Service temporarily unavailable");
  });

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro",
    generationConfig: {
      maxOutputTokens: 2000,
      temperature: 0.7,
    },
  });

  // const prompt = `
  // Analyze this transaction data with mathematical precision as a chartered accountant would. Provide only factual observations
  // and numerical insights in this exact JSON structure:

  // {
  //   "spendingPatterns": {
  //     "mostFrequentCategory": {
  //       "name": "[exact category name from data]",
  //       "count": [integer],
  //       "totalAmount": [sum in INR],
  //       "dailyAverage": [calculated figure]
  //     },
  //     "highestSpendCategory": {
  //       "name": "[exact category name]",
  //       "totalAmount": [sum in INR],
  //       "percentageOfTotal": [calculated %]
  //     },
  //     "recurringExpenses": [
  //       {
  //         "merchant": "[exact name]",
  //         "frequency": "[X times per week/month]",
  //         "totalAmount": [sum in INR]
  //       }
  //     ],
  //     "incomeSources": [
  //       {
  //         "source": "[exact name]",
  //         "totalAmount": [sum in INR],
  //         "frequency": "[pattern if any]"
  //       }
  //     ],
  //     "anomalies": [
  //       {
  //         "date": "[YYYY-MM-DD]",
  //         "amount": [INR],
  //         "description": "[exact transaction detail]",
  //         "reason": "[mathematical justification]"
  //       }
  //     ]
  //   },
  //   "financialTips": {
  //     "budgetingAdvice": "[specific action] could save [exact amount] monthly by [concrete method]",
  //     "savingsOpportunities": "Reduce [category] spending by [%] would save [calculated amount] weekly",
  //     "debtManagement": "[exact creditor] payments show [specific pattern]. Consider [specific action]",
  //     "specificWarnings": "Monitor [exact merchant] - [number] transactions totaling [amount] in [time period]"
  //   },
  //   "timeBasedSummaries": {
  //     "weekly": {
  //       "totalSpent": [INR],
  //       "topCategory": "[name] ([%] of total)",
  //       "cashFlow": "[surplus/deficit] of [amount]"
  //     },
  //     "monthly": {
  //       "totalSpent": [INR],
  //       "essentialVsDiscretionary": "[ratio]",
  //       "savingsRate": "[calculated %]"
  //     },
  //     "trends": {
  //       "p2pTransfers": {
  //         "netFlow": "[INR] ([%] change from average)",
  //         "primaryCounterparties": ["[name] ([amount])"]
  //       },
  //       "retailSpending": {
  //         "convenienceStores": "[number] visits totaling [INR]",
  //         "onlineDeliveries": "[number] orders averaging [INR]"
  //       }
  //     }
  //   }
  // }

  // Required Calculations:
  // 1. All percentages must be derived from actual data
  // 2. Time-based metrics use exact date ranges
  // 3. Averages computed from raw transaction counts
  // 4. Comparisons against category benchmarks where possible

  // Transaction Data:
  // ${formatedData}
  // `;

  const prompt = `
  Analyze this transaction data with mathematical precision as a chartered accountant would. Provide only factual observations
  and numerical insights in this exact JSON structure:
  
  {
    "spendingPatterns": {
      "mostFrequentCategory": {
        "name": "[exact category name from data]",
        "count": [integer],
        "totalAmount": [sum in INR],
        "dailyAverage": [calculated figure]
      },
      "highestSpendCategory": {
        "name": "[exact category name]",
        "totalAmount": [sum in INR],
        "percentageOfTotal": [calculated %]
      },
      "recurringExpenses": [
        {
          "merchant": "[exact name]",
          "frequency": "[X times per week/month]",
          "totalAmount": [sum in INR]
        }
      ],
      "incomeSources": [
        {
          "source": "[exact name]",
          "totalAmount": [sum in INR],
          "frequency": "[pattern if any]"
        }
      ],
      "anomalies": [
        {
          "date": "[YYYY-MM-DD]",
          "amount": [INR],
          "description": "[exact transaction detail]",
          "reason": "[mathematical justification]"
        }
      ]
    },
    "financialTips": {
      "budgetingAdvice": "Based on current spending patterns, consider tracking [mostFrequentCategory.name] expenses more closely as they account for [highestSpendCategory.percentageOfTotal]% of your spending",
      "savingsOpportunities": "Small daily savings in [mostFrequentCategory.name] could accumulate to approximately [calculated amount] monthly",
      "debtManagement": "Review recurring payments totaling [sum of recurring expenses] for potential optimization",
      "specificWarnings": "Monitor your top spending category ([highestSpendCategory.name]) which totals [highestSpendCategory.totalAmount]"
    },
    "timeBasedSummaries": {
      "weekly": {
        "totalSpent": [INR],
        "topCategory": "[name] ([%] of total)",
        "cashFlow": "[surplus/deficit] of [amount]"
      },
      "monthly": {
        "totalSpent": [INR],
        "essentialVsDiscretionary": "[ratio]",
        "savingsRate": "[calculated %]"
      },
      "trends": {
        "p2pTransfers": {
          "netFlow": "[INR] ([%] change from average)",
          "primaryCounterparties": ["[name] ([amount])"]
        },
        "retailSpending": {
          "convenienceStores": "[number] visits totaling [INR]",
          "onlineDeliveries": "[number] orders averaging [INR]"
        }
      }
    }
  }
  
  Required Calculations:
  1. Always provide insights based on available data, never state that more data is needed
  2. All percentages must be derived from actual data
  3. Time-based metrics use exact date ranges available
  4. Averages computed from raw transaction counts
  5. Focus on observable patterns rather than requesting more information
  
  Transaction Data:
  ${formatedData}
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;

  if (!response.text()) {
    throw new Error("Empty response from Gemini API");
  }

  // Clean and parse the response
  const cleanedResponse = response
    .text()
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  const parsedResponse = JSON.parse(cleanedResponse);

  // Validate response structure
  if (!parsedResponse) {
    throw new Error("Invalid response structure from Gemini API");
  }

  return parsedResponse;
}
