import connectToDatabase from "@/lib/db";
import FormattedTransactionModel from "@/models/FormattedTransactionModel";
import { NextResponse } from "next/server";

// ************ POST FORMATED DATA IN DB FOR CURRENT USER OF SLECTED FILE ************
export async function POST(req) {
  try {
    await connectToDatabase();
    const { transactions, userId, fileId } = await req.json();

    // console.log("transactions, userId, fileId", userId, fileId);

    // =========== validate body data ===========
    if (!transactions || !Array.isArray(transactions) || !userId || !fileId) {
      return NextResponse.json(
        { error: "Invalid input data" },
        { status: 201 }
      );
    }

    // =========== check formated data in db by {userId and fileId} ===========
    const existFormatedData = await FormattedTransactionModel.findOne({
      userId,
      fileId,
    });

    if (existFormatedData) {
      return NextResponse.json(
        { message: "Data Already Available", data: existFormatedData },
        { status: 200 }
      );
    }

    // =========== Format the transactions into a string ===========
    const formattedData = transactions
      .map(
        (t, i) =>
          `${i} - date: ${t.date} - amount: ₹${t.amount} - category: ${t.category} - description: ${t.description} - transactionType: ${t?.transactionType}`
      )
      .join("\n");

    // =========== create formated data for current file ===========
    const insertFormatedData = await FormattedTransactionModel.create({
      userId,
      fileId,
      formattedData,
    });

    return NextResponse.json(
      {
        message: "Formatted Data Successfully Created",
        data: insertFormatedData,
      },
      { status: 200 }
    );
  } catch (err) {
    console.log("Error in POST /api/format-transaction:", err);
    return NextResponse.json(
      { error: "Internal Server Error", details: err.message },
      { status: 500 }
    );
  }
}

// ************ GET FORMATED DATA FOR CURRENT SELCTED FILE ************

// `api/format-transaction?userId=${userId}&fileId=${fileId}`

export async function GET(req) {
  await connectToDatabase();
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const fileId = searchParams.get("fileId");

    // =========== checking data is provied? ===========
    if (!userId || !fileId) {
      return NextResponse.json({ status: 404 }, { error: "id not provieded" });
    }

    // =========== get formated data for current file ===========
    const existingFormatedData = await FormattedTransactionModel.findOne({
      userId,
      fileId,
    });
    return NextResponse.json(
      {
        message: "Formatted Data",
        data: existingFormatedData,
      },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json({ status: 501 }, { error: err });
  }
}
