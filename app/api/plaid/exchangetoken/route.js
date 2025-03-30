// import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";
// import connectToDatabase from "@/lib/db"; // Adjust path as needed
// import User from "@/models/User"; // Adjust path as needed
// import Catogery from "../../../../lib/categories.csv";

// const configuration = new Configuration({
//   basePath: PlaidEnvironments["sandbox"], // Use env or default to "sandbox"
//   baseOptions: {
//     headers: {
//       "PLAID-CLIENT-ID": "6585561292e766001c42c396",
//       "PLAID-SECRET": "42a4468487406be40976fe324bd944",
//     },
//   },
// });

// const client = new PlaidApi(configuration);

// export async function POST(req) {
//   const { public_token, userId } = await req.json();
//   console.log("Received public_token:", public_token, "userId:", userId);

//   try {
//     await connectToDatabase();

//     const response = await client.itemPublicTokenExchange({
//       public_token,
//     });

//     const accessToken = response.data.access_token;
//     console.log("Access token exchanged:", accessToken);

//     await User.findByIdAndUpdate(userId, { plaidAccessToken: accessToken });

//     return new Response(
//       JSON.stringify({ success: true, access_token: accessToken }),
//       {
//         status: 200,
//         headers: { "Content-Type": "application/json" },
//       }
//     );
//   } catch (error) {
//     console.error("Plaid exchange token error:", error.message);
//     return new Response(JSON.stringify({ error: error.message }), {
//       status: 500,
//       headers: { "Content-Type": "application/json" },
//     });
//   }
// }

import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";
import fs from "fs";
import path from "path";
import Papa from "papaparse";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import Transaction from "@/models/Transaction";

// Load and parse the categories CSV file from the "lib" folder.
const csvFilePath = path.join(process.cwd(), "lib", "categories.csv");
const csvFileContent = fs.readFileSync(csvFilePath, "utf8");
const categoryMapping = Papa.parse(csvFileContent, { header: true }).data;

// Helper function to assign a category based on transaction description
function getCategoryFromCSV(description = "") {
  const lowerDesc = description.toLowerCase();
  for (const row of categoryMapping) {
    if (!row.Keywords) continue;
    // Split the Keywords field into an array of keywords.
    const keywords = row.Keywords.split(",").map((k) => k.trim().toLowerCase());
    for (const keyword of keywords) {
      if (lowerDesc.includes(keyword)) {
        return row.Category;
      }
    }
  }
  return "Uncategorized";
}

const configuration = new Configuration({
  basePath: PlaidEnvironments["sandbox"], // Use environment variables in production
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": "6585561292e766001c42c396",
      "PLAID-SECRET": "42a4468487406be40976fe324bd944",
    },
  },
});

const client = new PlaidApi(configuration);

export async function POST(req) {
  const { public_token, userId } = await req.json();
  console.log("Received public_token:", public_token, "userId:", userId);

  try {
    await connectToDatabase();
    const user = await User.findById(userId);
    if (!user || !user.plaidAccessToken) {
      throw new Error("User or access token not found");
    }

    // Exchange the public token for an access token.
    const tokenResponse = await client.itemPublicTokenExchange({
      public_token,
    });
    const accessToken = tokenResponse.data.access_token;
    console.log("Access token exchanged:", accessToken);

    // Update the user's record with the new access token.
    await User.findByIdAndUpdate(userId, { plaidAccessToken: accessToken });

    // Set default date range to the last 30 days if not provided.
    const today = new Date().toISOString().split("T")[0];
    const defaultStart = new Date();
    defaultStart.setMonth(defaultStart.getMonth() - 6);
    const formattedStart = defaultStart.toISOString().split("T")[0];

    const start = formattedStart;
    const end = today;
    console.log(`Fetching transactions from ${start} to ${end}`);

    // Fetch transactions for the given date range.
    const transactionsResponse = await client.transactionsGet({
      access_token: accessToken,
      start_date: start,
      end_date: end,
    });

    const transactions = transactionsResponse.data.transactions;
    console.log("Fetched transactions:", transactions.length);

    if (transactions.length > 0) {
      // Prepare bulk operations: add a 'category' field based on CSV mapping.
      const bulkOps = transactions.map((tx) => ({
        updateOne: {
          filter: { transactionId: tx.transaction_id },
          update: {
            $set: {
              userId,
              accessToken,
              transactionId: tx.transaction_id,
              accountId: tx.account_id,
              amount: tx.amount,
              date: tx.date,
              description: tx.name,
              category: getCategoryFromCSV(tx.name),
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
