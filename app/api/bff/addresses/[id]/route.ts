import type { NextRequest } from "next/server";
import { bffProxy } from "@/lib/api/bff-proxy";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Context) {
  const { id } = await params;
  return bffProxy(request, `/addresses/${id}`);
}

export async function DELETE(request: NextRequest, { params }: Context) {
  const { id } = await params;
  return bffProxy(request, `/addresses/${id}`);
}

export const dynamic = "force-dynamic";
