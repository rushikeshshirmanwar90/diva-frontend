import type { NextRequest } from "next/server";
import { bffProxy } from "@/lib/api/bff-proxy";

// Called directly by lib/api/client.ts's refreshSession(), not through
// apiFetch — routing a refresh through apiFetch would be circular.
export function POST(request: NextRequest) {
  return bffProxy(request, "/auth/refresh");
}

export const dynamic = "force-dynamic";
