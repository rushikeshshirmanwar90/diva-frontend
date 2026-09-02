import type { NextRequest } from "next/server";
import { bffProxy } from "@/lib/api/bff-proxy";

export function POST(request: NextRequest) {
  return bffProxy(request, "/auth/logout");
}

export const dynamic = "force-dynamic";
