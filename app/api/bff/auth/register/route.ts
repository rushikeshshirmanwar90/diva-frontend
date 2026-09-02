import type { NextRequest } from "next/server";
import { bffProxy } from "@/lib/api/bff-proxy";

export function POST(request: NextRequest) {
  return bffProxy(request, "/auth/register");
}

// Never prerendered or cached — every call carries a session.
export const dynamic = "force-dynamic";
