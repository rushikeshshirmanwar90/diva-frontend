import type { NextRequest } from "next/server";
import { bffProxy } from "@/lib/api/bff-proxy";

export function GET(request: NextRequest) {
  return bffProxy(request, "/orders");
}

export function POST(request: NextRequest) {
  return bffProxy(request, "/orders");
}

export const dynamic = "force-dynamic";
