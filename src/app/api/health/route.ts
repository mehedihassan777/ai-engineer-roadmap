import type { HealthResponse } from "@/lib/sync/protocol";
import { getSyncDeps } from "@/server/deps";

export const dynamic = "force-dynamic";

/** Tells the UI whether this server offers cloud sync. Reveals nothing but that one boolean. */
export async function GET() {
  const body: HealthResponse = { sync: getSyncDeps().available };
  return Response.json(body, { headers: { "cache-control": "no-store" } });
}
