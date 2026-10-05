import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev only: lets the dev server be opened as http://127.0.0.1:PORT as well as localhost. Handy for testing
  // two "devices" in one browser, because each origin has its own localStorage. No effect in production.
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
