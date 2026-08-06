import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell, Field, SocialButtons } from "@/components/auth/auth-shell";
import { ButtonLink } from "@/components/ui/button";
import { CONTACT } from "@/lib/data/site";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false },
};

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in to your account"
      intro="Track orders, keep your wishlist across devices and check out in two taps."
      footer={
        <>
          New to Diva?{" "}
          <Link href="/register" className="link-underline text-charcoal">
            Create an account
          </Link>
        </>
      }
    >
      <form className="space-y-6">
        <Field
          label="Email or mobile"
          type="text"
          placeholder={CONTACT.email}
          autoComplete="username"
        />
        <Field
          label="Password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          hint={
            <Link
              href="#"
              className="text-[10px] tracking-wide text-gold hover:underline"
            >
              Forgot?
            </Link>
          }
        />
        <ButtonLink href="/account" variant="gold" size="lg" className="w-full">
          Sign in
        </ButtonLink>
      </form>
      <SocialButtons />
    </AuthShell>
  );
}
