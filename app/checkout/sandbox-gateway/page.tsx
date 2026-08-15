import type { Metadata } from "next";
import { SandboxGatewayView } from "@/components/checkout/sandbox-gateway-view";

export const metadata: Metadata = {
  title: "Sandbox payment simulator",
  robots: { index: false },
};

export default function SandboxGatewayPage() {
  return <SandboxGatewayView />;
}
