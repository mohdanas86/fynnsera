import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";

const configuration = new Configuration({
  basePath: PlaidEnvironments["sandbox"], // Use env or default to "sandbox"
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
  const { userId } = await req.json();
  console.log("Received userId:", userId);

  try {
    const response = await client.linkTokenCreate({
      user: { client_user_id: userId },
      client_name: "AI Finance Assistant",
      products: ["transactions"],
      country_codes: ["US"],
      language: "en",
    });

    console.log("Plaid API response:", response.data);
    return new Response(
      JSON.stringify({ link_token: response.data.link_token }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Plaid link token error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
