// app/api/goals/[id]/route.js
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import connectToDatabase from "@/lib/db";
import Goal from "@/models/Goal";
import { getServerSession } from "next-auth/next";
import authOptions from "@/lib/authOptions";

export async function OPTIONS() {
  return NextResponse.json(null, {
    status: 200,
    headers: {
      Allow: "GET, PUT, DELETE, OPTIONS",
    },
  });
}

export async function GET(request, { params }) {
  await connectToDatabase();

  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const { id } = await params;

  try {
    const goal = await Goal.findOne({ _id: new ObjectId(id), userId });
    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }
    return NextResponse.json(goal, { status: 200 });
  } catch (error) {
    console.error("Error fetching goal:", error);
    return NextResponse.json({ error: "Error fetching goal" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  await connectToDatabase();

  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const { id } = await params;

  try {
    const goal = await Goal.findOne({ _id: new ObjectId(id), userId });
    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }
    await Goal.deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json(
      { message: "Goal deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting goal:", error);
    return NextResponse.json({ error: "Error deleting goal" }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  console.log("🔧 PUT called");
  await connectToDatabase();

  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const goalId = await params?.id;
    const userId = session.user.id;
    const updates = await req.json();

    const updatedGoal = await Goal.findOneAndUpdate(
      { _id: new ObjectId(goalId), userId },
      {
        $set: {
          title: updates.title,
          description: updates.description,
          targetAmount: parseFloat(updates.targetAmount),
          currentAmount: parseFloat(updates.currentAmount),
          image: updates.image || "",
          status: updates.status || "Active", // 👈 fallback
          autoSave: updates.autoSave ?? false,
          updatedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!updatedGoal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    console.log("✅ Updated goal:", updatedGoal);
    return NextResponse.json(updatedGoal, { status: 200 });
  } catch (error) {
    console.error("❌ PUT error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
