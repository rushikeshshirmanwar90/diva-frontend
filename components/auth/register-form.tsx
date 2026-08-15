"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AuthShell, Field, SocialButtons } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { MODEL } from "@/lib/images";
import { CONTACT } from "@/lib/data/site";
import { useAuth } from "@/lib/auth/auth-context";
import { ApiError, errorMessage } from "@/lib/api/client";

/**
 * Two steps, one component: the account form, then the OTP the backend sends
 * to prove the email is real. Splitting these into separate routes would mean
 * passing the email address through a query string or a second round-trip
 * just to ask for it again — state that already lives in this component's
 * memory the whole time.
 */
export function RegisterForm() {
  const router = useRouter();
  const { register, verifyOtp, resendOtp, loginWithGoogle } = useAuth();

  const [step, setStep] = useState<"form" | "otp">("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [otp, setOtp] = useState("");
  const [resent, setResent] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleGoogle = async (idToken: string) => {
    setSubmitting(true);
    setError(null);

    try {
      await loginWithGoogle(idToken);
      router.push("/account");
    } catch (cause) {
      setError(errorMessage(cause));
      setSubmitting(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    try {
      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone.trim() || undefined,
        marketingOptIn,
      });
      setStep("otp");
    } catch (cause) {
      if (cause instanceof ApiError && cause.details) {
        setFieldErrors(Object.fromEntries(cause.details.map((d) => [d.path, d.message])));
      }
      setError(errorMessage(cause));
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await verifyOtp(email.trim().toLowerCase(), otp.trim());
      router.push("/account");
    } catch (cause) {
      setError(errorMessage(cause));
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    setResent(false);

    try {
      await resendOtp(email.trim().toLowerCase());
      setResent(true);
    } catch (cause) {
      setError(errorMessage(cause));
    }
  };

  if (step === "otp") {
    return (
      <AuthShell
        image={MODEL.coinPendant}
        eyebrow="Check your email"
        title="Verify your address"
        intro={`We sent a 6-digit code to ${email}. It expires in 15 minutes.`}
        footer={
          <>
            Wrong email?{" "}
            <button
              type="button"
              onClick={() => setStep("form")}
              className="link-underline text-charcoal"
            >
              Go back
            </button>
          </>
        }
      >
        <form className="space-y-6" onSubmit={handleVerify} noValidate>
          {error && (
            <p
              role="alert"
              className="border border-[#c0392b]/30 bg-[#c0392b]/5 p-3 text-xs text-[#c0392b]"
            >
              {error}
            </p>
          )}
          <Field
            label="6-digit code"
            type="text"
            name="otp"
            placeholder="123456"
            autoComplete="one-time-code"
            value={otp}
            onChange={(value) => setOtp(value.replace(/\D/g, "").slice(0, 6))}
            required
            disabled={submitting}
          />
          <Button
            type="submit"
            variant="gold"
            size="lg"
            className="w-full"
            disabled={submitting || otp.length !== 6}
          >
            {submitting && <Loader2 width={14} height={14} className="animate-spin" />}
            Verify &amp; continue
          </Button>
          <button
            type="button"
            onClick={() => void handleResend()}
            disabled={submitting}
            className="w-full text-center text-[10px] tracking-luxe uppercase text-gold hover:underline disabled:opacity-50"
          >
            {resent ? "Code resent" : "Resend code"}
          </button>
        </form>
      </AuthShell>
    );
  }

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
          label="Full name"
          name="name"
          placeholder="Mahesh Giri"
          autoComplete="name"
          value={name}
          onChange={setName}
          error={fieldErrors.name}
          required
          disabled={submitting}
        />
        <Field
          label="Email"
          type="email"
          name="email"
          placeholder={CONTACT.email}
          autoComplete="email"
          value={email}
          onChange={setEmail}
          error={fieldErrors.email}
          required
          disabled={submitting}
        />
        <Field
          label="Mobile"
          type="tel"
          name="phone"
          placeholder={CONTACT.phone}
          autoComplete="tel"
          value={phone}
          onChange={setPhone}
          error={fieldErrors.phone}
          disabled={submitting}
        />
        <Field
          label="Password"
          type="password"
          name="password"
          placeholder="At least 10 characters"
          autoComplete="new-password"
          value={password}
          onChange={setPassword}
          error={fieldErrors.password}
          required
          disabled={submitting}
        />
        <label className="flex items-start gap-3 text-xs leading-relaxed text-muted">
          <input
            type="checkbox"
            checked={marketingOptIn}
            onChange={(event) => setMarketingOptIn(event.target.checked)}
            disabled={submitting}
            className="mt-0.5 accent-[#c9a227]"
          />
          <span>
            Send me one letter a month about new pieces and where the gold rate has
            moved. No daily mail, ever.
          </span>
        </label>
        <Button
          type="submit"
          variant="gold"
          size="lg"
          className="w-full"
          disabled={submitting}
        >
          {submitting && <Loader2 width={14} height={14} className="animate-spin" />}
          Create account
        </Button>
      </form>
      <SocialButtons onCredential={handleGoogle} disabled={submitting} />
    </AuthShell>
  );
}
