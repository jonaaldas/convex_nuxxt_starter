import { httpAction } from "../../_generated/server";
import { plaidClient } from "./client";
import { Products, CountryCode } from "plaid";

const SITE_URL = process.env.SITE_URL || "*";

const corsHeaders = {
  "Access-Control-Allow-Origin": SITE_URL,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Valid product groups - each Link session can only use ONE group
const VALID_PRODUCTS = ["transactions", "investments", "liabilities"] as const;
type ValidProduct = (typeof VALID_PRODUCTS)[number];

const PRODUCT_MAP: Record<ValidProduct, Products> = {
  transactions: Products.Transactions,
  investments: Products.Investments,
  liabilities: Products.Liabilities,
};

export const createLinkToken = httpAction(async (_, request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    const body = await request.json();
    const { userId, products } = body;

    if (!userId) {
      return new Response(JSON.stringify({ error: "userId is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Validate and map products, default to transactions
    let plaidProducts: Products[] = [Products.Transactions];

    if (products && Array.isArray(products) && products.length > 0) {
      const requestedProduct = products[0] as string;
      if (VALID_PRODUCTS.includes(requestedProduct as ValidProduct)) {
        plaidProducts = [PRODUCT_MAP[requestedProduct as ValidProduct]];
      } else {
        return new Response(
          JSON.stringify({
            error: `Invalid product. Must be one of: ${VALID_PRODUCTS.join(", ")}`,
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
    }

    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: userId },
      client_name: "Finance Tracker",
      products: plaidProducts,
      country_codes: [CountryCode.Us],
      language: "en",
    });

    console.log(`[PLAID] Created link token for user ${userId} with products: ${plaidProducts}`);

    return new Response(JSON.stringify({ link_token: response.data.link_token }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("[PLAID] Error creating link token:", error);
    return new Response(JSON.stringify({ error: "Failed to create link token" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
