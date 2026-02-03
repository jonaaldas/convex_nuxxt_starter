import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./auth";
import { createLinkToken } from "./httpActions/plaid/createLinkToken";
import { exchangePublicToken } from "./httpActions/plaid/exchangeToken";

// Polyfill Buffer for Convex runtime — @polar-sh/sdk webhook verification
// uses Buffer.from(secret, "utf-8").toString("base64") which needs this.
if (typeof globalThis.Buffer === "undefined") {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  (globalThis as any).Buffer = {
    from(data: any, _encoding?: string) {
      const bytes = typeof data === "string" ? encoder.encode(data) : data;
      return {
        toString(enc?: string) {
          if (enc === "base64") {
            let binary = "";
            for (let i = 0; i < bytes.length; i++) {
              binary += String.fromCharCode(bytes[i]);
            }
            return btoa(binary);
          }
          return decoder.decode(bytes);
        },
      };
    },
  };
}

const http = httpRouter();

authComponent.registerRoutes(http, createAuth, { cors: true });

http.route({
  path: "/plaid/create-link-token",
  method: "POST",
  handler: createLinkToken,
});

http.route({
  path: "/plaid/exchange-public-token",
  method: "POST",
  handler: exchangePublicToken,
});

export default http;
