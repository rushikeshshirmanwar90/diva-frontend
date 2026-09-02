import type { NextRequest } from "next/server";
import { bffProxy } from "@/lib/api/bff-proxy";

type Context = { params: Promise<{ orderNumber: string }> };

export async function POST(request: NextRequest, { params }: Context) {
  const { orderNumber } = await params;
  return bffProxy(request, `/orders/${orderNumber}/cancel`);
}

export const dynamic = "force-dynamic";
