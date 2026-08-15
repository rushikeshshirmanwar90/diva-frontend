import type { Metadata } from "next";
import { OrdersListView } from "@/components/account/orders-list-view";

export const metadata: Metadata = {
  title: "My orders",
  robots: { index: false },
};

export default function OrdersPage() {
  return <OrdersListView />;
}
