import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import UploadLog from "@/models/UploadLog";

export async function POST(req) {
  try {
    await connectToDatabase();

    const upload = await req.json();

    const { userId, provider, filename, currentBalance, transactions } = upload;

    if (!userId || !provider || !filename || !Array.isArray(transactions)) {
      return NextResponse.json(
        { error: "Invalid upload format" },
        { status: 400 }
      );
    }

    const saved = await UploadLog.create({
      userId,
      provider,
      filename,
      currentBalance,
      transactions,
    });

    return NextResponse.json(
      { message: "Upload saved", uploadId: saved._id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  await connectToDatabase();
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    // console.log("user id to get user data: ", userId);

    const userUploadLogs = await UploadLog.find({ userId: userId });

    return NextResponse.json({
      status: 200,
      data: userUploadLogs,
      userId: userId,
    });
  } catch (err) {
    console.error("Error fetching user data:", err);
    return NextResponse.json({
      status: 401,
      message: "Failed To Fetch User Transaction Data",
      err,
    });
  }
}
