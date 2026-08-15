import type { Metadata } from "next";
import { OrderDetailView } from "@/components/account/order-detail-view";

export const metadata: Metadata = {
  title: "Order details",
  robots: { index: false },
};

export default async function OrderDetailPage({
  params,
}: PageProps<"/account/orders/[orderNumber]">) {
  const { orderNumber } = await params;
  return <OrderDetailView orderNumber={orderNumber} />;
}
