import type { NextRequest } from "next/server";
import { bffProxy } from "@/lib/api/bff-proxy";

export function GET(request: NextRequest) {
  return bffProxy(request, "/auth/me");
}

export function PATCH(request: NextRequest) {
  return bffProxy(request, "/auth/me");
}

export const dynamic = "force-dynamic";
