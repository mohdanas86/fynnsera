import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import Transaction from "@/models/Transaction";

const configuration = new Configuration({
  basePath: PlaidEnvironments["sandbox"], // Use env variables in production
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID":
        process.env.NEXT_PUBLIC_PLAID_CLIENT_ID || process.env.PLAID_CLIENT_ID,
      "PLAID-SECRET":
        process.env.NEXT_PUBLIC_PLAID_SECRET || process.env.PLAID_SECRET,
    },
  },
});

const client = new PlaidApi(configuration);

export async function POST(req) {
  const { userId, startDate, endDate } = await req.json();
  console.log("Received userId:", userId);

  try {
    await connectToDatabase();
    const user = await User.findById(userId);
    if (!user || !user.plaidAccessToken) {
      throw new Error("User or access token not found");
    }

    // Set default date range to last 30 days if not provided
    const today = new Date().toISOString().split("T")[0];
    const defaultStart = new Date();
    defaultStart.setDate(defaultStart.getDate() - 30);
    const formattedStart = defaultStart.toISOString().split("T")[0];

    const start = startDate || formattedStart;
    const end = endDate || today;

    console.log(`Fetching transactions from ${start} to ${end}`);

    // Use transactionsGet to fetch transactions for the given date range
    const response = await client.transactionsGet({
      access_token: user.plaidAccessToken,
      start_date: start,
      end_date: end,
    });

    const transactions = response.data.transactions;
    console.log("Fetched transactions:", transactions.length);

    if (transactions.length > 0) {
      // Prepare bulk operations for better performance
      const bulkOps = transactions.map((tx) => ({
        updateOne: {
          filter: { transactionId: tx.transaction_id },
          update: {
            $set: {
              userId,
              accessToken: user.plaidAccessToken,
              transactionId: tx.transaction_id,
              accountId: tx.account_id,
              amount: tx.amount,
              date: tx.date,
              description: tx.name,
            },
          },
          upsert: true,
        },
      }));

      const bulkResult = await Transaction.bulkWrite(bulkOps);
      console.log("Bulk write result:", bulkResult);
    }

    return new Response(
      JSON.stringify({ success: true, transactions: transactions.length }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Plaid fetch transactions error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
