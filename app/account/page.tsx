import type { Metadata } from "next";
import { AccountProfileView } from "@/components/account/profile-view";

export const metadata: Metadata = {
  title: "My account",
  robots: { index: false },
};

export default function AccountProfilePage() {
  return <AccountProfileView />;
}
