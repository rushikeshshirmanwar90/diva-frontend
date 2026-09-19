import type { NextRequest } from "next/server";
import { bffProxy } from "@/lib/api/bff-proxy";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  return bffProxy(request, `/products/${encodeURIComponent(slug)}/view`);
}

export const dynamic = "force-dynamic";
