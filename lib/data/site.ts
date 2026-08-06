/**
 * Single source of truth for business contact details.
 *
 * Every phone number and email address shown anywhere on the site comes from
 * here — footer, contact page, FAQ, policies, demo account. Change it once.
 */

export const CONTACT = {
  /** Display form used in copy and UI. */
  phone: "+91 95798 96842",
  /** Digits only, for `tel:` links. */
  phoneHref: "tel:+919579896842",
  whatsapp: "+91 95798 96842",
  whatsappHref: "https://wa.me/919579896842",

  email: "rushikeshshrimanwar@gmail.com",
  emailHref: "mailto:rushikeshshrimanwar@gmail.com",

  addressLine: "12 Lavelle Road, Bengaluru 560001",
} as const;
