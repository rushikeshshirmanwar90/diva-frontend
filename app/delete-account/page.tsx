import type { Metadata } from "next";
import { DeleteAccountForm } from "@/components/auth/delete-account-form";

export const metadata: Metadata = {
  title: "Delete your account",
  robots: { index: false },
};

export default function DeleteAccountPage() {
  return <DeleteAccountForm />;
}
