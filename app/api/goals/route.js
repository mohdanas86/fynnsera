import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Goal from "@/models/Goal";
import { getServerSession } from "next-auth/next";
import authOptions from "@/lib/authOptions"; // adjust as necessary

export async function OPTIONS() {
  return NextResponse.json(null, {
    status: 200,
    headers: {
      Allow: "GET, POST, OPTIONS",
    },
  });
}

export async function GET() {
  await connectToDatabase();

  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const goals = await Goal.find({ userId });
    return NextResponse.json(goals, { status: 200 });
  } catch (error) {
    console.error("Error fetching goals:", error);
    return NextResponse.json(
      { error: "Error fetching goals" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  await connectToDatabase();

  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const { title, description, targetAmount, currentAmount, image } =
      await request.json();
    const newGoal = await Goal.create({
      userId,
      title,
      description,
      targetAmount: parseFloat(targetAmount),
      currentAmount: parseFloat(currentAmount),
      image: image || "",
    });
    return NextResponse.json(newGoal, { status: 201 });
  } catch (error) {
    console.error("Error creating goal:", error);
    return NextResponse.json({ error: "Error creating goal" }, { status: 500 });
  }
}
