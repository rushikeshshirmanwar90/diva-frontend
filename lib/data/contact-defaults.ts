/**
 * Fallback contact details — used when the backend is unreachable, and as
 * placeholder text in form inputs that never display real contact info.
 *
 * No `server-only` here (unlike `lib/data/site.ts`) because client components
 * import this directly for placeholder text; the live values only ever reach
 * the server.
 */

export type Contact = {
  /** Display form used in copy and UI. */
  phone: string;
  /** For `tel:` links. */
  phoneHref: string;
  whatsapp: string;
  whatsappHref: string;
  email: string;
  emailHref: string;
  addressLine: string;
};

export const DEFAULT_CONTACT: Contact = {
  phone: "+91 95798 96842",
  phoneHref: "tel:+919579896842",
  whatsapp: "+91 95798 96842",
  whatsappHref: "https://wa.me/919579896842",
  email: "rushikeshshrimanwar@gmail.com",
  emailHref: "mailto:rushikeshshrimanwar@gmail.com",
  addressLine: "12 Lavelle Road, Bengaluru 560001",
};
