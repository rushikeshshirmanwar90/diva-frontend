import type { NextRequest } from "next/server";
import { bffProxy } from "@/lib/api/bff-proxy";

export function DELETE(request: NextRequest) {
  return bffProxy(request, "/auth/delete-account");
}

export const dynamic = "force-dynamic";
