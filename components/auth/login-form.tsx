"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AuthShell, Field, SocialButtons } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { CONTACT } from "@/lib/data/site";
import { useAuth } from "@/lib/auth/auth-context";
import { ApiError, errorMessage } from "@/lib/api/client";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, loginWithGoogle } = useAuth();

  /** Where to land after signing in — checkout sends people here with `?redirect=/checkout`. */
  const redirectTo = searchParams.get("redirect") || "/account";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    try {
      await login(email.trim().toLowerCase(), password);
      router.push(redirectTo);
    } catch (cause) {
      if (cause instanceof ApiError && cause.details) {
        setFieldErrors(Object.fromEntries(cause.details.map((d) => [d.path, d.message])));
      }
      setError(errorMessage(cause));
      setSubmitting(false);
    }
  };

  const handleGoogle = async (idToken: string) => {
    setSubmitting(true);
    setError(null);

    try {
      await loginWithGoogle(idToken);
      router.push(redirectTo);
    } catch (cause) {
      setError(errorMessage(cause));
      setSubmitting(false);
    }
  };

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
      <form className="space-y-6" onSubmit={handleSubmit} noValidate>
        {error && (
          <p
            role="alert"
            className="border border-[#c0392b]/30 bg-[#c0392b]/5 p-3 text-xs text-[#c0392b]"
          >
            {error}
          </p>
        )}
        <Field
          label="Email"
          type="email"
          name="email"
          placeholder={CONTACT.email}
          autoComplete="username"
          value={email}
          onChange={setEmail}
          error={fieldErrors.email}
          required
          disabled={submitting}
        />
        <Field
          label="Password"
          type="password"
          name="password"
          placeholder="••••••••"
          autoComplete="current-password"
          value={password}
          onChange={setPassword}
          error={fieldErrors.password}
          required
          disabled={submitting}
          hint={
            <Link href="#" className="text-[10px] tracking-wide text-gold hover:underline">
              Forgot?
            </Link>
          }
        />
        <Button
          type="submit"
          variant="gold"
          size="lg"
          className="w-full"
          disabled={submitting}
        >
          {submitting && <Loader2 width={14} height={14} className="animate-spin" />}
          Sign in
        </Button>
      </form>
      <SocialButtons onCredential={handleGoogle} disabled={submitting} />
    </AuthShell>
  );
}
