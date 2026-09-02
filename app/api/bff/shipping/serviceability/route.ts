import type { NextRequest } from "next/server";
import { bffProxy } from "@/lib/api/bff-proxy";

export function GET(request: NextRequest) {
  return bffProxy(request, "/shipping/serviceability");
}

export const dynamic = "force-dynamic";
