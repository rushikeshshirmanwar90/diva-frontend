import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";

/** Intrinsic size of /diva/diva-logo.png — the "· Est. 1998" tagline is baked into the artwork. */
const LOGO_WIDTH = 1774;
const LOGO_HEIGHT = 887;

export function Logo({
  className,
  tagline = true,
  imageClassName,
}: {
  className?: string;
  tagline?: boolean;
  imageClassName?: string;
}) {
  return (
    <Link href="/" className={cn("group block w-fit shrink-0", className)}>
      <Image
        src="/diva/diva-logo.png"
        alt="Diva — The Indian Jewel"
        width={LOGO_WIDTH}
        height={LOGO_HEIGHT}
        priority
        className={cn(
          "h-auto transition-opacity group-hover:opacity-80",
          tagline
            ? "w-[120px] sm:w-[136px] lg:w-[152px]"
            : "w-[96px] sm:w-[106px] lg:w-[116px]",
          imageClassName,
        )}
      />
    </Link>
  );
}
