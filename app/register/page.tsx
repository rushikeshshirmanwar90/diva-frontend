import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell, Field, SocialButtons } from "@/components/auth/auth-shell";
import { ButtonLink } from "@/components/ui/button";
import { MODEL } from "@/lib/images";
import { CONTACT } from "@/lib/data/site";

export const metadata: Metadata = {
  title: "Create an account",
  robots: { index: false },
};

export default function RegisterPage() {
  return (
    <AuthShell
      image={MODEL.coinPendant}
      eyebrow="Join Diva Circle"
      title="Create your account"
      intro="One account across the website and the app. We verify your email with a one-time code — no password reset emails you'll never read."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="link-underline text-charcoal">
            Sign in
          </Link>
        </>
      }
    >
      <form className="space-y-6">
        <Field label="Full name" placeholder="Mahesh Giri" autoComplete="name" />
        <Field
          label="Email"
          type="email"
          placeholder={CONTACT.email}
          autoComplete="email"
        />
        <Field
          label="Mobile"
          type="tel"
          placeholder={CONTACT.phone}
          autoComplete="tel"
        />
        <Field
          label="Password"
          type="password"
          placeholder="At least 8 characters"
          autoComplete="new-password"
        />
        <label className="flex items-start gap-3 text-xs leading-relaxed text-muted">
          <input type="checkbox" className="mt-0.5 accent-[#c9a227]" />
          <span>
            Send me one letter a month about new pieces and where the gold rate has
            moved. No daily mail, ever.
          </span>
        </label>
        <ButtonLink href="/account" variant="gold" size="lg" className="w-full">
          Create account
        </ButtonLink>
      </form>
      <SocialButtons />
    </AuthShell>
  );
}
