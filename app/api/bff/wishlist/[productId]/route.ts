import type { NextRequest } from "next/server";
import { bffProxy } from "@/lib/api/bff-proxy";

type Context = { params: Promise<{ productId: string }> };

export async function DELETE(request: NextRequest, { params }: Context) {
  const { productId } = await params;
  return bffProxy(request, `/wishlist/${productId}`);
}

export const dynamic = "force-dynamic";
