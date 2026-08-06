/**
 * Brand marks. Lucide dropped brand icons in v1, so these are hand-rolled at
 * 24×24 to match the rest of the icon set.
 */

type Props = { size?: number; className?: string };

export function InstagramIcon({ size = 16, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      className={className}
      aria-hidden
    >
      <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FacebookIcon({ size = 16, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      className={className}
      aria-hidden
    >
      <path d="M14.5 8.5h2.5M14.5 8.5V6.8c0-1 .8-1.8 1.8-1.8H17M14.5 8.5V19M11 12h6.5" />
      <path d="M14.5 19v-6.5" />
    </svg>
  );
}

export function YoutubeIcon({ size = 16, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      className={className}
      aria-hidden
    >
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
      <path d="M10.5 9.5l4.5 2.5-4.5 2.5z" />
    </svg>
  );
}

export function WhatsappIcon({ size = 16, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M20.5 11.7a8.5 8.5 0 0 1-12.6 7.4L3.5 20.5l1.4-4.4A8.5 8.5 0 1 1 20.5 11.7Z" />
      <path d="M9 9.5c0 3 2.5 5.5 5.5 5.5 .6 0 1.2-.5 1.2-1.1l-1.6-.8-.9.9c-1.1-.5-2-1.4-2.5-2.5l.9-.9-.8-1.6c-.6 0-1.1.6-1.1 1.2Z" />
    </svg>
  );
}
