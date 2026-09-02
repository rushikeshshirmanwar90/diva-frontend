import type { NextRequest } from "next/server";
import { bffProxy } from "@/lib/api/bff-proxy";

type Context = { params: Promise<{ merchantTransactionId: string }> };

export async function GET(request: NextRequest, { params }: Context) {
  const { merchantTransactionId } = await params;
  return bffProxy(request, `/payments/phonepe/status/${merchantTransactionId}`);
}

export const dynamic = "force-dynamic";
