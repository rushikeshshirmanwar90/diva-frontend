import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";

/** Intrinsic size of /diva/diva-logo.png — the "· Est. 1998" tagline is baked into the artwork. */
const LOGO_WIDTH = 1774;
const LOGO_HEIGHT = 887;

export function Logo({
  className,
  tagline = true,
}: {
  className?: string;
  tagline?: boolean;
}) {
  const width = tagline ? 152 : 116;

  return (
    <Link href="/" className={cn("group block w-fit shrink-0", className)}>
      <Image
        src="/diva/diva-logo.png"
        alt="Diva — The Indian Jewel"
        width={LOGO_WIDTH}
        height={LOGO_HEIGHT}
        priority
        style={{ width, height: "auto" }}
        className="transition-opacity group-hover:opacity-80"
      />
    </Link>
  );
}
