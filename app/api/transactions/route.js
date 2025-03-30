import connectToDatabase from "@/lib/db";
import Transaction from "@/models/Transaction";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  try {
    await connectToDatabase();
    const transactions = await Transaction.find({ userId }).sort({ date: -1 });
    return new Response(JSON.stringify(transactions), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
