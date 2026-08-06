import { ButtonLink } from "@/components/ui/button";

export function EmptyState({
  icon,
  title,
  body,
  href = "/shop",
  cta = "Start browsing",
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  href?: string;
  cta?: string;
}) {
  return (
    <div className="flex flex-col items-center py-24 text-center">
      <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-beige text-gold">
        {icon}
      </div>
      <h2 className="font-display text-2xl font-light text-ink">{title}</h2>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">{body}</p>
      <ButtonLink href={href} className="mt-8">
        {cta}
      </ButtonLink>
    </div>
  );
}
