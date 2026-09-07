import "server-only";
import { cache } from "react";
import { backendUrl } from "@/lib/domain";
import { DEFAULT_CONTACT, type Contact } from "@/lib/data/contact-defaults";
import { faqs as defaultFaqs } from "@/lib/data/content";

export type { Contact };

export type SiteAssurance = {
  title: string;
  body: string;
  icon?: string;
};

export type StoreLocation = {
  city: string;
  tag: string;
  address: string;
  phone: string;
  hours: string;
  note?: string;
};

export type FaqGroup = {
  group: string;
  items: Array<{ q: string; a: string }>;
};

export type SiteSettings = {
  contact: Contact;
  storeName: string;
  supportHours: string;
  footerBlurb: string;
  copyrightText: string;
  paymentMethodsNote: string;
  assurances: SiteAssurance[];
  contactPage: {
    eyebrow: string;
    title: string;
    description: string;
    stores: StoreLocation[];
  };
  faqs: FaqGroup[];
};

type ApiSettings = {
  storeName?: string;
  supportEmail: string;
  supportPhone: string;
  whatsappNumber?: string;
  supportHours?: string;
  address: { line1: string; line2?: string; city: string; state: string; pincode: string; country: string };
  footerBlurb?: string;
  copyrightText?: string;
  paymentMethodsNote?: string;
  assurances?: SiteAssurance[];
  contactPage?: {
    eyebrow?: string;
    title?: string;
    description?: string;
    stores?: StoreLocation[];
  };
  faqs?: FaqGroup[];
};

type Envelope<T> = { success: true; data: T } | { success: false };

function toTelHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

function toWhatsappHref(phone: string): string {
  return `https://wa.me/${phone.replace(/\D/g, "")}`;
}

const DEFAULT_ASSURANCES: SiteAssurance[] = [
  {
    title: "BIS hallmarked",
    body: "HUID on every gold piece, verifiable in the BIS Care app.",
    icon: "BadgeCheck",
  },
  {
    title: "Insured delivery",
    body: "Fully insured and tracked until it is signed for.",
    icon: "Truck",
  },
  {
    title: "15-day returns",
    body: "Plus one free size exchange within 30 days.",
    icon: "RotateCcw",
  },
  {
    title: "Lifetime care",
    body: "Free cleaning, polishing and re-rhodium plating.",
    icon: "ShieldCheck",
  },
];

const DEFAULT_STORES: StoreLocation[] = [
  {
    city: "Bengaluru",
    tag: "Flagship",
    address: DEFAULT_CONTACT.addressLine,
    phone: DEFAULT_CONTACT.phone,
    hours: "Mon–Sat 10:30–20:00 · Sun 11:00–18:00",
    note: "Bridal appointments and purity assays available here.",
  },
  {
    city: "Chennai",
    tag: "Counter",
    address: "48 Nungambakkam High Road, Chennai 600034",
    phone: DEFAULT_CONTACT.phone,
    hours: "Mon–Sat 10:30–20:00 · Sun closed",
    note: "Temple and 22K collections held in depth.",
  },
  {
    city: "Hyderabad",
    tag: "Counter",
    address: "9 Road No. 12, Banjara Hills, Hyderabad 500034",
    phone: DEFAULT_CONTACT.phone,
    hours: "Tue–Sun 11:00–20:00 · Mon closed",
    note: "Polki and diamond bridal, by appointment on weekends.",
  },
];

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  try {
    const response = await fetch(backendUrl("/settings"), {
      cache: "no-store",
      headers: { accept: "application/json" },
    });

    if (!response.ok) return fallbackSiteSettings();

    const payload = (await response.json()) as Envelope<ApiSettings>;
    if (!payload.success || !payload.data) return fallbackSiteSettings();

    const d = payload.data;
    const supportPhone = d.supportPhone || DEFAULT_CONTACT.phone;
    const supportEmail = d.supportEmail || DEFAULT_CONTACT.email;
    const whatsapp = d.whatsappNumber || supportPhone;
    const addressLine = d.address
      ? [d.address.line1, d.address.line2, `${d.address.city} ${d.address.pincode}`]
          .filter(Boolean)
          .join(", ")
      : DEFAULT_CONTACT.addressLine;

    const contact: Contact = {
      phone: supportPhone,
      phoneHref: toTelHref(supportPhone),
      whatsapp,
      whatsappHref: toWhatsappHref(whatsapp),
      email: supportEmail,
      emailHref: `mailto:${supportEmail}`,
      addressLine,
    };

    return {
      contact,
      storeName: d.storeName || "DIVA",
      supportHours: d.supportHours || "Mon–Sat, 9:00–21:00 IST",
      footerBlurb:
        d.footerBlurb ||
        "Fine jewellery made in Bengaluru and Jaipur since 1998. Every piece is hallmarked, priced transparently, and made to be worn — not stored.",
      copyrightText:
        d.copyrightText || "© 2026 Diva The Indian Jewel · GSTIN 29AABCD1234E1ZQ",
      paymentMethodsNote:
        d.paymentMethodsNote || "UPI · Cards · Net banking · No-cost EMI",
      assurances: d.assurances?.length ? d.assurances : DEFAULT_ASSURANCES,
      contactPage: {
        eyebrow: d.contactPage?.eyebrow || "We answer in under four hours",
        title: d.contactPage?.title || "Talk to a person",
        description:
          d.contactPage?.description ||
          "No chatbots. Messages reach the same team that handles the counters, and bridal enquiries go straight to a senior consultant.",
        stores: d.contactPage?.stores?.length ? d.contactPage.stores : DEFAULT_STORES,
      },
      faqs: d.faqs?.length ? d.faqs : (defaultFaqs as FaqGroup[]),
    };
  } catch {
    return fallbackSiteSettings();
  }
});

function fallbackSiteSettings(): SiteSettings {
  return {
    contact: DEFAULT_CONTACT,
    storeName: "DIVA",
    supportHours: "Mon–Sat, 9:00–21:00 IST",
    footerBlurb:
      "Fine jewellery made in Bengaluru and Jaipur since 1998. Every piece is hallmarked, priced transparently, and made to be worn — not stored.",
    copyrightText: "© 2026 Diva The Indian Jewel · GSTIN 29AABCD1234E1ZQ",
    paymentMethodsNote: "UPI · Cards · Net banking · No-cost EMI",
    assurances: DEFAULT_ASSURANCES,
    contactPage: {
      eyebrow: "We answer in under four hours",
      title: "Talk to a person",
      description:
        "No chatbots. Messages reach the same team that handles the counters, and bridal enquiries go straight to a senior consultant.",
      stores: DEFAULT_STORES,
    },
    faqs: defaultFaqs as FaqGroup[],
  };
}

export const getContact = cache(async (): Promise<Contact> => {
  const settings = await getSiteSettings();
  return settings.contact;
});
