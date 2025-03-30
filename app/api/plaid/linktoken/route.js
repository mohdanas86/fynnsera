import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";

const configuration = new Configuration({
  basePath: PlaidEnvironments["sandbox"], // Use env or default to "sandbox"
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": "6585561292e766001c42c396",
      "PLAID-SECRET": "42a4468487406be40976fe324bd944",
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
