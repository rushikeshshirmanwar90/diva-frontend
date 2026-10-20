import "server-only";
import { cache } from "react";
import { backendUrl } from "@/lib/domain";
import { DEFAULT_CONTACT } from "@/lib/data/contact-defaults";

export type Policy = {
  slug: string;
  title: string;
  updated: string;
  intro: string;
  sections: Array<{ heading: string; body: string[] }>;
};

/** Every policy slug that exists, in nav order. Fixed regardless of content, so build-time param generation never depends on the backend being reachable. */
export const POLICY_SLUGS = ["shipping", "returns", "privacy", "terms", "copyright"] as const;
export type PolicySlug = (typeof POLICY_SLUGS)[number];

/**
 * The slugs diva-backend stores (its `Policy` model enum). Anything else is
 * frontend-only copy, served straight from the fallback without a request the
 * backend would only reject.
 */
const BACKEND_POLICY_SLUGS: readonly PolicySlug[] = ["shipping", "returns", "privacy", "terms"];

const FALLBACK_POLICIES: Record<PolicySlug, Policy> = {
  shipping: {
    slug: "shipping",
    title: "Shipping policy",
    updated: "2026-07-01",
    intro:
      "Every Diva shipment is insured for its full declared value and requires a photo ID at delivery. Here is exactly how it works.",
    sections: [
      {
        heading: "Dispatch times",
        body: [
          "In-stock pieces are quality-checked, hallmarked and dispatched within 48 working hours of payment confirmation.",
          "Made-to-order and bridal pieces take 6–8 weeks from the date the design is frozen. You receive a written production timeline when you confirm the order, and a photograph of the piece before it ships.",
        ],
      },
      {
        heading: "Delivery times and charges",
        body: [
          "Standard insured delivery reaches Indian metros in 2–4 working days and non-metros in 4–7. It is complimentary on every order, with no minimum cart value.",
          "We ship only through Bluedart and Delhivery secure-jewellery services. We do not use ordinary parcel services for jewellery at any value.",
        ],
      },
      {
        heading: "At delivery",
        body: [
          "A photo ID matching the name on the order is required. The courier will not hand over a jewellery shipment to a third party, including family members, without prior written authorisation from you.",
          "Please film or photograph the unopened package if the outer seal looks tampered with, and refuse delivery. Insurance claims are straightforward when the package is refused and near-impossible once it has been accepted.",
        ],
      },
      {
        heading: "Serviceability",
        body: [
          "We deliver to roughly 19,400 pincodes in India. The pincode checker on each product page tells you the expected date before you buy.",
          "We do not ship outside India yet. We are working through customs and hallmarking requirements for the UAE, UK and Singapore.",
        ],
      },
    ],
  },
  returns: {
    slug: "returns",
    title: "Returns & exchange",
    updated: "2026-07-01",
    intro:
      "Fifteen days to return, thirty for one free size exchange, and no restocking fee. We would rather you had the right piece than the right paperwork.",
    sections: [
      {
        heading: "Returns",
        body: [
          "In-stock pieces can be returned within 15 days of delivery, provided the BIS hallmark tag is unbroken and the piece is unworn.",
          "Refunds are credited to the original payment method within 5 working days of the piece reaching our workshop and passing a purity and weight check.",
          "Made-to-order, engraved and bridal pieces cannot be returned, because they cannot be resold. This is stated again at checkout on those items.",
        ],
      },
      {
        heading: "Size exchange",
        body: [
          "One free exchange within 30 days, including two-way courier, on rings, bangles and bracelets. Rings and bangles are the most commonly mis-sized purchases in jewellery and we do not think you should pay for that.",
          "If the new size costs more because of added metal weight, you pay only the difference at the original locked gold rate.",
        ],
      },
      {
        heading: "Buyback",
        body: [
          "We buy back pieces bought from us at 100% of current metal value, and pieces bought elsewhere at 92%, in both cases after an in-person purity assay at one of our counters.",
          "Stone value is assessed separately and depends on the certificate. Making charges are not refunded in a buyback — they were paid for labour that was performed.",
        ],
      },
      {
        heading: "Damaged or incorrect items",
        body: [
          "Tell us within 48 hours of delivery. We arrange a pickup at our cost and either replace the piece or refund in full, your choice, with no assay requirement.",
        ],
      },
    ],
  },
  privacy: {
    slug: "privacy",
    title: "Privacy policy",
    updated: "2026-07-01",
    intro:
      "What we collect, why, and how long we keep it. Written to be read rather than to be legally impenetrable.",
    sections: [
      {
        heading: "What we collect",
        body: [
          "Account details you give us: name, email, mobile, delivery addresses, and date of birth if you choose to add it.",
          "Order and payment records: what you bought, when, and the payment reference. We never see or store your full card number, CVV or UPI PIN — those are handled entirely by PhonePe's gateway.",
          "Usage data: pages viewed and searches run, used to improve what we show you. You can opt out of analytics cookies in the cookie banner without losing any site functionality.",
        ],
      },
      {
        heading: "Why we collect it",
        body: [
          "To fulfil and insure your order, to handle returns and buyback, to comply with Indian tax and hallmarking record-keeping requirements, and to answer you when you contact support.",
          "We do not sell personal data. We do not share it with advertisers.",
        ],
      },
      {
        heading: "How long we keep it",
        body: [
          "Order and invoice records for eight years, as Indian tax law requires. Account details until you ask us to delete them. Analytics data for 14 months.",
          `You can request a copy of everything we hold, or ask us to delete it, by writing to ${DEFAULT_CONTACT.email}. We respond within 30 days.`,
        ],
      },
      {
        heading: "Security",
        body: [
          "Passwords are hashed, never stored in readable form. Payment data never touches our servers. Access to customer records is role-restricted and every admin action is logged.",
        ],
      },
    ],
  },
  terms: {
    slug: "terms",
    title: "Terms of service",
    updated: "2026-07-01",
    intro:
      "The rules that apply when you buy from diva.com. Plain language, and we have tried to keep it short.",
    sections: [
      {
        heading: "Pricing and gold rate",
        body: [
          "Gold is a live commodity and prices on the site update against the daily rate. The rate is locked when you reach checkout and held for 30 minutes; if the window expires the cart re-prices and tells you what changed before you pay.",
          "For made-to-order and bridal work the rate locks on the advance payment, not on delivery. Movements in the gold price during production are ours to absorb, not yours.",
          "All prices include 3% GST. Making charges and stone value are shown separately on every product page.",
        ],
      },
      {
        heading: "Orders and acceptance",
        body: [
          "An order is a request until we confirm it. We may decline an order where a piece is mispriced by an obvious error, where stock has sold out between page load and payment, or where a delivery address cannot be serviced securely.",
          "If we decline a confirmed and paid order, you are refunded in full within 5 working days.",
        ],
      },
      {
        heading: "Hallmarking and certification",
        body: [
          "Every gold piece carries a BIS hallmark and a six-digit HUID which you can verify independently in the BIS Care app. Diamond pieces above 0.30ct ship with an IGI or GIA certificate.",
          "If any piece is found not to match its declared purity by an independent BIS-recognised assay, we refund the full amount and the cost of the assay.",
        ],
      },
      {
        heading: "Governing law",
        body: [
          "These terms are governed by Indian law, with jurisdiction in the courts of Bengaluru, Karnataka.",
        ],
      },
    ],
  },
  copyright: {
    slug: "copyright",
    title: "Copyright policy",
    updated: "2026-10-20",
    intro:
      "Our designs, photographs and writing take real work to make. Here is what you may do with them, and how to tell us if you think we have used something of yours.",
    sections: [
      {
        heading: "What we own",
        body: [
          "Unless stated otherwise, everything on this site — jewellery designs and sketches, product photographs and videos, the Diva name and logo, page layouts, guides and blog posts — belongs to Diva The Indian Jewel or is used under licence. It is protected by the Copyright Act, 1957, the Designs Act, 2000 and the Trade Marks Act, 1999.",
          "Some editorial and lifestyle images are licensed from photographers and stock libraries. Those licences cover our use only and do not extend to you.",
        ],
      },
      {
        heading: "What you may do",
        body: [
          "Browse, print or save pages for your own personal, non-commercial use — to compare pieces, show a design to family, or keep a record of an order.",
          "Share links to our pages, and share our product images on social media where the image is unaltered and credits Diva. Tag us; we like seeing where our pieces end up.",
        ],
      },
      {
        heading: "What you may not do",
        body: [
          "Copy, reproduce or manufacture our jewellery designs, or sell pieces presented as Diva designs.",
          "Reuse our photographs, videos or product descriptions on another store, marketplace listing or catalogue, or edit them to remove our name or watermark.",
          "Scrape the site or its prices in bulk, or use the Diva name or logo in a way that suggests we endorse you or your products. For press, collaboration or wholesale use, write to us first — we usually say yes.",
        ],
      },
      {
        heading: "Your reviews and photos",
        body: [
          "When you post a review or upload a photo of a piece, you keep the copyright. You give us a non-exclusive, royalty-free licence to show it on this site and in our marketing, with your first name, for as long as it stays published.",
          "You can ask us to remove your review or photo at any time from your account or by writing to us, and we will take it down within 7 working days.",
        ],
      },
      {
        heading: "Reporting infringement",
        body: [
          `If you believe anything on this site infringes your copyright or design, write to ${DEFAULT_CONTACT.email} with: a description of your work, the page where our use appears, proof that you own the rights, and your name, address and phone number.`,
          "We acknowledge every notice within 36 hours and remove material that infringes, in line with the Information Technology Act, 2000 and its intermediary rules. If you report someone else's content in error, we may restore it after hearing from them.",
          "If you see a counterfeit Diva piece or a copy of our designs elsewhere, please tell us at the same address — every piece we make carries a BIS hallmark and HUID, which counterfeits cannot match.",
        ],
      },
    ],
  },
};

type ApiPolicy = {
  slug: PolicySlug;
  title: string;
  intro: string;
  sections: Array<{ heading: string; body: string[] }>;
  updatedAt: string;
};

type Envelope<T> = { success: true; data: T } | { success: false };

/**
 * All policy pages from backend — editable in the diva-backend admin console ("Policies").
 * `cache: "no-store"` and static fallbacks keep the storefront resilient.
 */
const getDynamicPolicy = cache(async (slug: PolicySlug): Promise<Policy> => {
  if (!BACKEND_POLICY_SLUGS.includes(slug)) return FALLBACK_POLICIES[slug];

  try {
    const response = await fetch(backendUrl(`/policies/${slug}`), {
      cache: "no-store",
      headers: { accept: "application/json" },
    });

    if (!response.ok) return FALLBACK_POLICIES[slug];

    const payload = (await response.json()) as Envelope<ApiPolicy>;
    if (!payload.success) return FALLBACK_POLICIES[slug];

    return {
      slug: payload.data.slug,
      title: payload.data.title,
      updated: payload.data.updatedAt,
      intro: payload.data.intro,
      sections: payload.data.sections,
    };
  } catch {
    return FALLBACK_POLICIES[slug];
  }
});

export async function getPolicy(slug: string): Promise<Policy | undefined> {
  if ((POLICY_SLUGS as readonly string[]).includes(slug)) {
    return getDynamicPolicy(slug as PolicySlug);
  }
  return undefined;
}

/** Every policy, in nav order — for the sidebar on each policy page. */
export async function listPolicies(): Promise<Policy[]> {
  return Promise.all(POLICY_SLUGS.map((slug) => getDynamicPolicy(slug)));
}
