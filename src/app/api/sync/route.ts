import { getSyncDeps } from "@/server/deps";

// Never cache: the response depends on the stored progress and the caller's token.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return getSyncDeps().handlers.get(request);
}

export async function PUT(request: Request) {
  return getSyncDeps().handlers.put(request);
}
