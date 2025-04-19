import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import connectToDatabase from "@/lib/db";
import Budget from "@/models/Budget";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateBudgetPlan(transactions) {
  const spendingData = transactions.reduce((acc, tx) => {
    const category = tx.category || "Uncategorized";
    acc[category] = (acc[category] || 0) + tx.amount;
    return acc;
  }, {});

  const totalSpending = Object.values(spendingData).reduce(
    (sum, val) => sum + val,
    0
  );
  if (totalSpending === 0) throw new Error("No expenses to analyze");

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const prompt = `Act as a financial expert analyzing these monthly expenses:
${JSON.stringify(spendingData)}

Total Monthly Spending: ₹${totalSpending.toFixed(2)}

Generate JSON recommendations with:
1. Category name
2. Total spent
3. Percentage of total spending
4. Specific cost-saving recommendations

Format output: [{
  "category": "Category Name",
  "spending": 1234.56,
  "percentage": 30.5,
  "recommendation": "Specific advice..."
}]`;

  const result = await model.generateContent(prompt);
  const textResponse = result.response
    .text()
    .replace(/```json|```/g, "")
    .trim();
  return textResponse;
}

export async function POST(req) {
  try {
    const { userId, fileId, formatedData } = await req.json();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();

    const existingBudget = await Budget.findOne({ userId, fileId });
    if (existingBudget) {
      return NextResponse.json({
        success: true,
        budgets: existingBudget.budgets,
        totalSpending: existingBudget.totalSpending,
      });
    }

    const transactions = Array.isArray(formatedData)
      ? formatedData.filter(
          (tx) =>
            tx.transactionType === "DEBIT" && typeof tx.amount === "number"
        )
      : [];

    if (transactions.length === 0) {
      return NextResponse.json(
        { error: "No expense transactions found", success: false },
        { status: 400 }
      );
    }

    const budgetPlanStr = await generateBudgetPlan(transactions);
    let budgetPlan;

    try {
      budgetPlan = JSON.parse(budgetPlanStr);
    } catch (err) {
      console.error("Invalid JSON from AI:", budgetPlanStr);
      return NextResponse.json(
        { error: "Invalid response from AI. Could not parse JSON." },
        { status: 500 }
      );
    }

    const totalSpending = budgetPlan.reduce(
      (sum, item) => sum + item.spending,
      0
    );

    if (!existingBudget) {
      const savedBudget = await Budget.create({
        userId,
        fileId,
        budgets: budgetPlan,
        totalSpending,
      });

      return NextResponse.json({
        success: true,
        budgets: savedBudget.budgets,
        totalSpending: savedBudget.totalSpending,
      });
    }
  } catch (error) {
    console.error("Budget Error:", error.message);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}
