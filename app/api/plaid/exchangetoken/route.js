// import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";
// import fs from "fs";
// import path from "path";
// import Papa from "papaparse";
// import connectToDatabase from "@/lib/db";
// import User from "@/models/User";
// import Transaction from "@/models/Transaction";

// // Load and parse the categories CSV file from the "lib" folder.
// const csvFilePath = path.join(process.cwd(), "lib", "categories.csv");
// const csvFileContent = fs.readFileSync(csvFilePath, "utf8");
// const categoryMapping = Papa.parse(csvFileContent, { header: true }).data;

// // Helper function to assign a category based on transaction description
// function getCategoryFromCSV(description = "") {
//   const lowerDesc = description.toLowerCase();
//   for (const row of categoryMapping) {
//     if (!row.Keywords) continue;
//     // Split the Keywords field into an array of keywords.
//     const keywords = row.Keywords.split(",").map((k) => k.trim().toLowerCase());
//     for (const keyword of keywords) {
//       if (lowerDesc.includes(keyword)) {
//         return row.Category;
//       }
//     }
//   }
//   return "Uncategorized";
// }

// const configuration = new Configuration({
//   basePath: PlaidEnvironments["sandbox"], // Use environment variables in production
//   baseOptions: {
//     headers: {
//       "PLAID-CLIENT-ID":
//         process.env.NEXT_PUBLIC_PLAID_CLIENT_ID || process.env.PLAID_CLIENT_ID,
//       "PLAID-SECRET":
//         process.env.NEXT_PUBLIC_PLAID_SECRET || process.env.PLAID_SECRET,
//     },
//   },
// });

// const client = new PlaidApi(configuration);

// export async function POST(req) {
//   const { public_token, userId } = await req.json();
//   console.log("Received public_token:", public_token, "userId:", userId);

//   try {
//     await connectToDatabase();
//     const user = await User.findById(userId);
//     if (!user || !user.plaidAccessToken) {
//       throw new Error("User or access token not found");
//     }

//     // Exchange the public token for an access token.
//     const tokenResponse = await client.itemPublicTokenExchange({
//       public_token,
//     });
//     const accessToken = tokenResponse.data.access_token;
//     console.log("Access token exchanged:", accessToken);

//     // Update the user's record with the new access token.
//     await User.findByIdAndUpdate(userId, { plaidAccessToken: accessToken });

//     // Set default date range to the last 30 days if not provided.
//     const today = new Date().toISOString().split("T")[0];
//     const defaultStart = new Date();
//     defaultStart.setMonth(defaultStart.getMonth() - 12);
//     const formattedStart = defaultStart.toISOString().split("T")[0];

//     const start = formattedStart;
//     const end = today;
//     console.log(`Fetching transactions from ${start} to ${end}`);

//     // Fetch transactions for the given date range.
//     const transactionsResponse = await client.transactionsGet({
//       access_token: accessToken,
//       start_date: start,
//       end_date: end,
//     });

//     const transactions = transactionsResponse.data.transactions;
//     console.log("Fetched transactions:", transactionsResponse.data);

//     if (transactions.length > 0) {
//       // Prepare bulk operations: add a 'category' field based on CSV mapping.
//       const bulkOps = transactions.map((tx) => ({
//         updateOne: {
//           filter: { transactionId: tx.transaction_id },
//           update: {
//             $set: {
//               userId,
//               accessToken,
//               transactionId: tx.transaction_id,
//               accountId: tx.account_id,
//               amount: tx.amount,
//               date: tx.date,
//               description: tx.name,
//               category: getCategoryFromCSV(tx.name),
//             },
//           },
//           upsert: true,
//         },
//       }));

//       // const bulkResult = await Transaction.bulkWrite(bulkOps);
//       // console.log("Bulk write result:", bulkOps);
//     }

//     return new Response(
//       JSON.stringify({ success: true, transactions: transactions.length }),
//       {
//         status: 200,
//         headers: { "Content-Type": "application/json" },
//       }
//     );
//   } catch (error) {
//     console.error("Plaid fetch transactions error:", error.message);
//     return new Response(JSON.stringify({ error: error.message }), {
//       status: 500,
//       headers: { "Content-Type": "application/json" },
//     });
//   }
// }

import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import Transaction from "@/models/Transaction";

const client = new PlaidApi(
  new Configuration({
    basePath: PlaidEnvironments.sandbox,
    baseOptions: {
      headers: {
        "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
        "PLAID-SECRET": process.env.PLAID_SECRET,
      },
    },
  })
);

export async function POST(req) {
  try {
    const {
      public_token,
      userId,
      provider = "phonepe",
      filename = "Three Data",
    } = await req.json();

    await connectToDatabase();
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    // 1) Exchange public token → access token
    const { data: tokenRes } = await client.itemPublicTokenExchange({
      public_token,
    });
    const accessToken = tokenRes.access_token;
    await User.findByIdAndUpdate(userId, { plaidAccessToken: accessToken });

    // 2) Fetch all transactions in last 6 months
    const today = new Date().toISOString().split("T")[0];
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);
    const start = startDate.toISOString().split("T")[0];

    const { data: txRes } = await client.transactionsGet({
      access_token: accessToken,
      start_date: start,
      end_date: today,
    });

    // 3) Fetch accounts to compute currentBalance
    const { data: acctRes } = await client.accountsGet({
      access_token: accessToken,
    });
    const currentBalance = acctRes.accounts.reduce(
      (sum, acct) => sum + (acct.balances.current || 0),
      0
    );

    // 4) Map Plaid transactions → your sub‑docs
    const txDocs = txRes.transactions.map((tx) => ({
      amount: tx.amount,
      date: new Date(tx.date).toISOString(),
      description: tx.name,
      transactionId: tx.transaction_id,
      userId: userId,
    }));

    console.log("all trasnactions : ", txDocs);

    // 5) Upsert one Statement document
    // const stmt = await Statement.findOneAndUpdate(
    //   { userId, filename },
    //   {
    //     $set: {
    //       provider,
    //       filename,
    //       currentBalance,
    //       updatedAt: new Date(),
    //       transactions: txDocs,
    //     },
    //   },
    //   { upsert: true, new: true, setDefaultsOnInsert: true }
    // );

    // return new Response(
    //   JSON.stringify({
    //     success: true,
    //     statementId: stmt._id,
    //     transactionsStored: txDocs.length,
    //   }),
    //   {
    //     status: 200,
    //     headers: { "Content-Type": "application/json" },
    //   }
    // );
  } catch (error) {
    console.error("Error in /api/plaid:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
