// Public origin of the deployed site — used to build absolute links
// (e.g. invitation URLs in emails).
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
).replace(/\/+$/, "");