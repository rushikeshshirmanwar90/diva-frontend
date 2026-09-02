import type { NextRequest } from "next/server";
import { bffProxy } from "@/lib/api/bff-proxy";

export function GET(request: NextRequest) {
  return bffProxy(request, "/addresses");
}

export function POST(request: NextRequest) {
  return bffProxy(request, "/addresses");
}

export const dynamic = "force-dynamic";
