import type { NextRequest } from "next/server";
import { bffProxy } from "@/lib/api/bff-proxy";

export function POST(request: NextRequest) {
  return bffProxy(request, "/auth/login");
}

export const dynamic = "force-dynamic";
