import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import connectToDatabase from "@/lib/db";
import Goal from "@/models/Goal";
import { getServerSession } from "next-auth/next";
import authOptions from "@/lib/authOptions"; // adjust as necessary

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
  console.log("id", userId);
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

export async function PUT(request, { params }) {
  await connectToDatabase();

  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const { id } = params;

  try {
    const { title, description, targetAmount, currentAmount, image } =
      await request.json();
    const goal = await Goal.findOne({ _id: new ObjectId(id), userId });
    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }
    goal.title = title;
    goal.description = description;
    goal.targetAmount = parseFloat(targetAmount);
    goal.currentAmount = parseFloat(currentAmount);
    goal.image = image || "";
    goal.updatedAt = new Date();
    await goal.save();
    return NextResponse.json(goal, { status: 200 });
  } catch (error) {
    console.error("Error updating goal:", error);
    return NextResponse.json({ error: "Error updating goal" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  await connectToDatabase();

  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const { id } = params;

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
