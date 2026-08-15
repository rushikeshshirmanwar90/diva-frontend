import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { MODEL } from "@/lib/images";
import { GoogleSignInButton } from "@/components/auth/google-button";
import { cn } from "@/lib/cn";

export function AuthShell({
  image = MODEL.pearlShirt,
  eyebrow,
  title,
  intro,
  children,
  footer,
}: {
  image?: string;
  eyebrow: string;
  title: string;
  intro: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="grid min-h-[80vh] lg:grid-cols-2">
      <div className="relative hidden bg-charcoal lg:block">
        <Image
          src={image}
          alt=""
          fill
          priority
          sizes="50vw"
          className="object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-12">
          <p className="text-[10px] tracking-[0.3em] uppercase text-gold-light">
            Diva Circle
          </p>
          <p className="mt-4 max-w-sm font-display text-3xl leading-snug font-light text-white">
            Members get first look at limited runs and priority bridal appointments.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center px-5 py-16 lg:px-16">
        <div className="w-full max-w-sm">
          <Logo className="text-left" />
          <p className="eyebrow mt-10">{eyebrow}</p>
          <h1 className="mt-3 font-display text-3xl font-light text-ink">{title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">{intro}</p>

          <div className="mt-9">{children}</div>

          <div className="mt-8 text-sm text-muted">{footer}</div>

          <p className="mt-10 text-[10px] leading-relaxed text-muted/80">
            By continuing you agree to Diva&apos;s terms and{" "}
            <Link href="/policies/privacy" className="text-gold hover:underline">
              privacy policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

export function Field({
  label,
  type = "text",
  placeholder,
  autoComplete,
  hint,
  name,
  value,
  onChange,
  error,
  required,
  disabled,
}: {
  label: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  hint?: React.ReactNode;
  name?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between">
        <span className="text-[10px] tracking-luxe uppercase text-muted">{label}</span>
        {hint}
      </span>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        required={required}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        className={cn(
          "mt-2 w-full border-b bg-transparent pb-2.5 text-sm text-ink outline-none transition-colors focus:border-gold disabled:opacity-50",
          error ? "border-[#c0392b]" : "border-line",
        )}
      />
      {error && <small className="mt-1.5 block text-[11px] text-[#c0392b]">{error}</small>}
    </label>
  );
}

export function SocialButtons({
  onCredential,
  disabled,
}: {
  onCredential: (idToken: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="mt-8">
      <div className="flex items-center gap-4">
        <span className="h-px flex-1 bg-line" />
        <span className="text-[10px] tracking-luxe uppercase text-muted">or</span>
        <span className="h-px flex-1 bg-line" />
      </div>
      <GoogleSignInButton onCredential={onCredential} disabled={disabled} />
    </div>
  );
}
