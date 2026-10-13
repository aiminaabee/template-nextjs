import Aiminaabee from "@aiminaabeejs/js-sdk";

// Defaults to standard port for Aiminaabee server
let AIMINAABEE_BACKEND_URL = "http://localhost:3000";

if (process.env.AIMINAABEE_BACKEND_URL) {
  AIMINAABEE_BACKEND_URL = process.env.AIMINAABEE_BACKEND_URL;
}

export const sdk = new Aiminaabee({
  baseUrl: AIMINAABEE_BACKEND_URL,
  debug: process.env.NODE_ENV === "development",
  publishableKey: process.env.NEXT_PUBLIC_AIMINAABEE_PUBLISHABLE_KEY,
});
