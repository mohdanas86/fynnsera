import { NextResponse } from "next/server";
import { getGeminiTips } from "@/lib/getGeminiTips";
import CachedTip from "@/models/CachedTip";
import connectToDatabase from "@/lib/db";

export async function POST(req) {
  try {
    await connectToDatabase();
    const { userId, fileId, formatedData } = await req.json();

    // Validate input
    if (!userId || !fileId || !formatedData) {
      return NextResponse.json(
        { error: "Invalid input data" },
        { status: 400 }
      );
    }
    // await CachedTip.collection.dropIndexes(); // remove catched indexing

    // Check for existing tip by userId + fileId
    const existingTip = await CachedTip.findOne({ userId, fileId });
    if (existingTip) {
      // console.log("-------- returning cached tips ------");
      return NextResponse.json(
        {
          message: "Returning cached tips",
          tips: existingTip.aiTips,
        },
        { status: 200 }
      );
    }

    // Generate new tips via Gemini
    const tips = await getGeminiTips(userId, formatedData);

    // Cache them
    if (!existingTip) {
      const newTip = await CachedTip.create({
        userId,
        fileId,
        aiTips: tips,
      });
      // console.log("-------- new tip created -------- : ");
      return NextResponse.json({ tips: newTip.aiTips }, { status: 200 });
    }
  } catch (err) {
    console.error("API Error:", err);
    return NextResponse.json(
      { error: err.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
