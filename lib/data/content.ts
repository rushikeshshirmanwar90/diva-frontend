import type {
  Address,
  BlogPost,
  Coupon,
  DemoOrder,
  Review,
  Testimonial,
} from "@/lib/types";
import { MODEL, STILL } from "@/lib/images";
import { CONTACT } from "@/lib/data/site";
import { rupees } from "@/lib/format";

/* ───────────────────────────── Reviews ──────────────────────────────── */

export const reviews: Review[] = [
  {
    id: "r-01",
    productSlug: "aurelia-solitaire-diamond-ring",
    author: "Ananya R.",
    city: "Bengaluru",
    rating: 5,
    title: "Sits perfectly flush with my band",
    body: "I was worried a solitaire would catch on everything. This one sits low enough that it disappears under a glove. The IGI card matched the stone exactly, which I checked because a jeweller in the family told me to.",
    date: "2026-07-12",
    verifiedPurchase: true,
    images: [STILL.ringInBox],
  },
  {
    id: "r-02",
    productSlug: "aurelia-solitaire-diamond-ring",
    author: "Devika S.",
    city: "Pune",
    rating: 4,
    title: "Beautiful, sizing ran slightly small",
    body: "Went a size up after the free exchange. The exchange itself took four days door to door with no arguing, which I did not expect.",
    date: "2026-06-28",
    verifiedPurchase: true,
  },
  {
    id: "r-03",
    productSlug: "zoya-classic-gold-hoops",
    author: "Meera K.",
    city: "Chennai",
    rating: 5,
    title: "The only earrings I've worn in four months",
    body: "Genuinely so light that I have twice gone to bed in them by accident. The click of the hinge is reassuring — I've never once worried about losing one.",
    date: "2026-07-30",
    verifiedPurchase: true,
  },
  {
    id: "r-04",
    productSlug: "zoya-classic-gold-hoops",
    author: "Fatima H.",
    city: "Hyderabad",
    rating: 5,
    title: "Bought a second pair for my sister",
    body: "18mm is the right size — 14mm looked too small on me and 24mm too much for the office. Packaging is genuinely giftable.",
    date: "2026-05-19",
    verifiedPurchase: true,
  },
  {
    id: "r-05",
    productSlug: "rukmini-temple-necklace-set",
    author: "Lakshmi V.",
    city: "Coimbatore",
    rating: 5,
    title: "Wore it for my daughter's wedding",
    body: "The repoussé work is the real thing — my mother, who is hard to impress about gold, turned it over and inspected the back before she said anything. That is high praise. Heavy, as it should be.",
    date: "2026-04-22",
    verifiedPurchase: true,
    images: [STILL.templeSet],
  },
  {
    id: "r-06",
    productSlug: "tara-diamond-cushion-pendant",
    author: "Ritika M.",
    city: "Mumbai",
    rating: 5,
    title: "Reads much bigger than 0.31ct",
    body: "The double halo does what they say. Several people have asked if it is a full carat. Chain is fine but strong, and the adjustable loop is more useful than I expected with high necklines.",
    date: "2026-07-04",
    verifiedPurchase: true,
  },
  {
    id: "r-07",
    productSlug: "saanjh-everyday-gold-bracelet",
    author: "Nandini P.",
    city: "Kolkata",
    rating: 5,
    title: "Two years of daily wear, still perfect",
    body: "Swimming, gym, dishes. No discolouration, no stretched links. I get it polished once a year at their Kolkata counter for free.",
    date: "2026-06-15",
    verifiedPurchase: true,
  },
  {
    id: "r-08",
    productSlug: "noor-polki-chandelier-earrings",
    author: "Simran B.",
    city: "Amritsar",
    rating: 5,
    title: "Polki that actually glows",
    body: "Most 'polki' online is just a dull rhinestone. These are foiled properly — they light up under warm bulbs the way my grandmother's did. The screw backs are worth the extra minute.",
    date: "2026-05-27",
    verifiedPurchase: true,
  },
  {
    id: "r-09",
    productSlug: "meher-stacked-gold-bands",
    author: "Aisha N.",
    city: "Kochi",
    rating: 5,
    title: "Best value in the store",
    body: "Three 22K bands at this price, hallmarked, is hard to beat. I wear two and my daughter took the hammered one.",
    date: "2026-07-19",
    verifiedPurchase: true,
  },
  {
    id: "r-10",
    productSlug: "anika-chunky-chain-necklace",
    author: "Prisha D.",
    city: "Delhi",
    rating: 4,
    title: "Substantial and beautifully finished",
    body: "Exactly the weight I wanted. One star off only because the 20-inch was out of stock for six weeks and I ended up with the 18.",
    date: "2026-06-09",
    verifiedPurchase: true,
  },
];

export function reviewsFor(slug: string) {
  return reviews.filter((r) => r.productSlug === slug);
}

/* ─────────────────────────── Testimonials ──────────────────────────── */

export const testimonials: Testimonial[] = [
  {
    id: "t-1",
    name: "Shalini Iyer",
    city: "Bengaluru",
    quote:
      "I've bought from the big chains for twenty years. This was the first time someone explained why a piece was priced the way it was, line by line, before I asked.",
    rating: 5,
  },
  {
    id: "t-2",
    name: "Aditi Raghunathan",
    city: "Chennai",
    quote:
      "The bridal set arrived eleven days before the wedding, exactly as promised, in a case that fit into hand baggage. That mattered more than I can explain.",
    rating: 5,
  },
  {
    id: "t-3",
    name: "Kavya Menon",
    city: "Kochi",
    quote:
      "I returned a ring because the size was wrong. No questions, no restocking fee, refund in three days. I have bought four things since.",
    rating: 5,
  },
  {
    id: "t-4",
    name: "Rhea Kapoor",
    city: "Mumbai",
    quote:
      "Every piece has come with its hallmark and its certificate. I have stopped double-checking, which is its own kind of luxury.",
    rating: 5,
  },
];

/* ───────────────────────────── Journal ─────────────────────────────── */

export const blogPosts: BlogPost[] = [
  {
    slug: "how-to-read-a-hallmark",
    title: "How to read a hallmark before you pay",
    excerpt:
      "Four marks, ten seconds, and you know whether the gold in front of you is what the tag claims.",
    body: [
      "Since 2021 every piece of hallmarked gold jewellery sold in India carries a six-digit HUID — a unique identity number for that specific item, not that design. You can type it into the BIS Care app and see the piece's registered purity and the jeweller who declared it. If a seller cannot produce the HUID, the piece is not hallmarked, whatever the sticker says.",
      "Alongside the HUID you should find three more marks: the BIS lozenge, the purity in both karat and fineness (22K916, 18K750, 14K585), and the jeweller's identification mark. On a small pendant these are laser-etched and genuinely tiny — ask for a loupe, and be suspicious of anyone reluctant to hand you one.",
      "Purity is not quality. A 22K chain and an 18K chain are both honestly described; 18K is harder and holds stones more securely, which is why almost every diamond setting you will see is 18K rather than 22K. Choosing 18K for a solitaire is a structural decision, not a compromise.",
      "One last habit worth building: photograph the hallmark and the certificate together on the day you buy. Insurance claims and resale valuations both go faster when you can produce that pair.",
    ],
    image: STILL.goldRingsOnStone,
    author: "Diva Atelier",
    readMinutes: 4,
    publishedAt: "2026-07-22",
    tag: "Buying Guide",
  },
  {
    slug: "making-charges-explained",
    title: "Making charges, explained without the sales pitch",
    excerpt:
      "Why two 10-gram chains at the same gold rate can differ by ₹18,000 — and when that difference is worth paying.",
    body: [
      "The price of a gold piece is metal value plus making charges plus GST. Metal value is arithmetic: today's rate for the purity, times the weight. Making charges are where the variation lives, and they are usually quoted either as a percentage of metal value or as rupees per gram.",
      "Handwork costs more than casting, and it should. A cast chain is poured into a mould in minutes. A hand-drawn rope chain is pulled, twisted, cut and soldered link by link — sometimes four hundred solder joints in a 20-inch chain. You are paying for hours, and the piece will outlast the cast one.",
      "Where making charges are hard to defend is on plain machine-made items sold at handwork rates. If a 22K plain band carries 22% making charges, ask what the work was. A straight answer is a good sign; a change of subject is also information.",
      "Our rule: making charges are printed on every product page alongside metal value, before you add to cart. You should never have to reverse-engineer them from a total.",
    ],
    image: STILL.chunkyChain,
    author: "Diva Atelier",
    readMinutes: 5,
    publishedAt: "2026-07-08",
    tag: "Buying Guide",
  },
  {
    slug: "bridal-timeline-eight-weeks",
    title: "The eight-week bridal timeline",
    excerpt:
      "What to order when, so nothing is being couriered the morning of the mehendi.",
    body: [
      "Made-to-order bridal work takes six to eight weeks, and that clock starts when the design is frozen, not when you first walk in. Budget two extra weeks for the deciding.",
      "Week eight to six: choose the necklace. Everything else — earrings, maangtikka, bangles — is fitted to it, so it has to be first. Bring the blouse fabric, not a photo of it; gold reads differently against raw silk and against georgette.",
      "Week five: sizing. Bangles and rings need a physical fitting, and fingers change size with the season and with pre-wedding stress. We size twice, three weeks apart, for exactly this reason.",
      "Week two: the trial. Wear the full set with the outfit and the hair, under the light you will actually be photographed in. This is when a haar turns out to be two inches too long, and two inches is a two-day fix — but only if there are two days.",
      "Week one: nothing. If the plan needed week one, the plan was wrong.",
    ],
    image: MODEL.chokerPortrait,
    author: "Diva Atelier",
    readMinutes: 6,
    publishedAt: "2026-06-25",
    tag: "Bridal",
  },
  {
    slug: "caring-for-polki",
    title: "Caring for polki and uncut stones",
    excerpt:
      "Foiled stones and ultrasonic cleaners do not mix. Here is what actually works.",
    body: [
      "Polki is uncut diamond, set over a reflective foil that gives it its glow. The foil is the whole point and it is also the vulnerability: water gets behind it, the foil clouds, and the stone goes flat. This is irreversible without resetting.",
      "So: never an ultrasonic cleaner, never soaking, never steam. Clean with a dry soft brush, and if you must use moisture, a barely damp cotton bud on the gold only, avoiding the stone edges.",
      "Store polki flat, in a soft pouch, away from other jewellery. Uncut stones have irregular edges that scratch polished gold, and they chip against each other.",
      "Perfume and hairspray before jewellery, always — with a gap. Alcohol-based sprays are the fastest way to dull both foil and pearl.",
    ],
    image: STILL.chandelierEarrings,
    author: "Diva Atelier",
    readMinutes: 3,
    publishedAt: "2026-06-11",
    tag: "Care",
  },
  {
    slug: "layering-without-tangling",
    title: "Layering chains without spending your morning untangling them",
    excerpt: "Three rules: differ the lengths, differ the weights, share a clasp.",
    body: [
      "Chains tangle when they are close in length, because they cross repeatedly through the day. Two inches is not enough separation; four is. A 16 and a 20 will stay apart. A 16 and an 18 will braid themselves by lunch.",
      "Vary weight as well as length. A fine cable and a heavier rope behave differently and slide past each other. Two identical fine chains will knot.",
      "The reliable trick is a single clasp: join both chains at one lobster clasp so they cannot rotate independently. Every layered set we sell is built this way.",
      "Store them clasped and hanging, not coiled in a box. A chain in a pile is a chain that will need ten minutes and a pin.",
    ],
    image: MODEL.layeredPendants,
    author: "Diva Atelier",
    readMinutes: 3,
    publishedAt: "2026-05-30",
    tag: "Styling",
  },
  {
    slug: "gold-rate-and-your-order",
    title: "Why your quote is valid for 30 minutes",
    excerpt: "Gold is a live commodity. Here is how we handle that honestly.",
    body: [
      "Gold trades continuously and moves a few hundred rupees a gram on a busy day. Any jeweller quoting a price is quoting against a rate snapshot, whether they tell you so or not.",
      "We lock the rate the moment you reach checkout and hold it for thirty minutes. If you complete payment inside that window, the price you saw is the price you pay, even if the market moved.",
      "If the window expires, the cart re-prices and tells you what changed and why, before you pay. It will sometimes be lower.",
      "For made-to-order bridal work the rate locks on the advance payment, not on delivery. An eight-week build at a fixed rate is a risk we carry, not one we pass to you.",
    ],
    image: STILL.hangingPendants,
    author: "Diva Atelier",
    readMinutes: 4,
    publishedAt: "2026-05-14",
    tag: "Buying Guide",
  },
];

export function getPost(slug: string) {
  return blogPosts.find((p) => p.slug === slug);
}

/* ────────────────────────────── Coupons ────────────────────────────── */

export const coupons: Coupon[] = [
  {
    code: "DIVA10",
    label: "10% off your first order",
    type: "percent",
    value: 10,
    minCartValue: rupees(15000),
    maxDiscount: rupees(15000),
  },
  {
    code: "FESTIVE5000",
    label: "₹5,000 off above ₹75,000",
    type: "flat",
    value: rupees(5000),
    minCartValue: rupees(75000),
  },
  {
    code: "MAKING0",
    label: "Making charges waived above ₹2,00,000",
    type: "percent",
    value: 6,
    minCartValue: rupees(200000),
    maxDiscount: rupees(40000),
  },
];

/* ──────────────────── Account demo data (static) ────────────────────── */

export const demoOrders: DemoOrder[] = [
  {
    orderNumber: "DIVA-2026-08417",
    placedAt: "2026-07-29",
    status: "SHIPPED",
    items: [
      {
        productSlug: "zoya-classic-gold-hoops",
        title: "Zoya Classic Gold Hoops",
        variantLabel: "18 mm",
        image: STILL.hoopsOnBox,
        price: rupees(21500),
        qty: 1,
      },
      {
        productSlug: "chandni-crescent-pendant",
        title: "Chandni Crescent Pendant",
        variantLabel: "18 in",
        image: STILL.crescentPendants,
        price: rupees(24000),
        qty: 1,
      },
    ],
    total: rupees(46967),
    courier: "Bluedart Surface",
    awb: "77661194023",
    timeline: [
      { label: "Order placed", date: "29 Jul 2026, 8:42 PM", done: true },
      { label: "Payment confirmed", date: "29 Jul 2026, 8:43 PM", done: true },
      { label: "Quality check & hallmarking", date: "31 Jul 2026", done: true },
      { label: "Shipped from Bengaluru", date: "1 Aug 2026", done: true },
      { label: "Out for delivery", date: "Expected 6 Aug 2026", done: false },
      { label: "Delivered", date: "Expected 6 Aug 2026", done: false },
    ],
  },
  {
    orderNumber: "DIVA-2026-07920",
    placedAt: "2026-06-14",
    status: "DELIVERED",
    items: [
      {
        productSlug: "tara-diamond-cushion-pendant",
        title: "Tara Diamond Cushion Pendant",
        variantLabel: "18 in",
        image: STILL.diamondPendant,
        price: rupees(42400),
        qty: 1,
      },
    ],
    total: rupees(43672),
    courier: "Delhivery Air",
    awb: "44120876591",
    timeline: [
      { label: "Order placed", date: "14 Jun 2026", done: true },
      { label: "Payment confirmed", date: "14 Jun 2026", done: true },
      { label: "Shipped", date: "16 Jun 2026", done: true },
      { label: "Delivered", date: "18 Jun 2026, 11:20 AM", done: true },
    ],
  },
  {
    orderNumber: "DIVA-2026-06355",
    placedAt: "2026-04-02",
    status: "CANCELLED",
    items: [
      {
        productSlug: "gulnaar-rose-gold-bangle",
        title: "Gulnaar Rose Gold Bangle",
        variantLabel: "2.8",
        image: STILL.roseGoldBangle,
        price: rupees(96600),
        qty: 1,
      },
    ],
    total: rupees(99498),
    timeline: [
      { label: "Order placed", date: "2 Apr 2026", done: true },
      { label: "Payment confirmed", date: "2 Apr 2026", done: true },
      { label: "Cancelled at your request", date: "3 Apr 2026", done: true },
      { label: "Refund credited", date: "6 Apr 2026", done: true },
    ],
  },
];

export const demoAddresses: Address[] = [
  {
    id: "a-1",
    label: "Home",
    name: "Mahesh Giri",
    line1: "402, Prestige Acropolis",
    line2: "Hosur Main Road, Koramangala",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560029",
    phone: CONTACT.phone,
    isDefault: true,
  },
  {
    id: "a-2",
    label: "Office",
    name: "Mahesh Giri",
    line1: "Level 9, Embassy Golf Links",
    line2: "Domlur",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560071",
    phone: CONTACT.phone,
    isDefault: false,
  },
];

/* ──────────────────────────────── FAQ ─────────────────────────────── */

export const faqs: Array<{ group: string; items: Array<{ q: string; a: string }> }> = [
  {
    group: "Orders & Delivery",
    items: [
      {
        q: "How long does delivery take?",
        a: "In-stock pieces ship within 48 hours and reach most Indian metros in 2–4 working days, insured and fully tracked. Made-to-order and bridal pieces take 6–8 weeks from design freeze; you get a production timeline in writing when you confirm.",
      },
      {
        q: "Is shipping insured?",
        a: "Yes. Every shipment is insured for its full declared value until it is signed for. We ship only through Bluedart and Delhivery secure-jewellery services, and a photo ID matching the order name is required at delivery.",
      },
      {
        q: "Do you ship outside India?",
        a: "Not yet. We are working through the customs and hallmarking requirements for the UAE, UK and Singapore, and expect to open those corridors within the year.",
      },
    ],
  },
  {
    group: "Pricing & Payment",
    items: [
      {
        q: "Why does the price change between visits?",
        a: "Gold is a live commodity. Prices update against the daily rate, and your rate is locked for 30 minutes once you reach checkout. If the window expires, the cart re-prices and tells you exactly what changed before you pay.",
      },
      {
        q: "What does the price include?",
        a: "Metal value at today's rate, making charges, stone value where applicable, and 3% GST. Every product page breaks this down line by line — you should never have to reverse-engineer a total.",
      },
      {
        q: "Which payment methods do you accept?",
        a: "UPI, all major credit and debit cards, net banking and no-cost EMI on orders above ₹25,000, all through PhonePe's secure gateway. We never see or store your card details.",
      },
    ],
  },
  {
    group: "Returns, Exchange & Buyback",
    items: [
      {
        q: "What is the return window?",
        a: "15 days from delivery on all in-stock pieces, provided the hallmark tag is unbroken. Refunds are credited to the original payment method within 5 working days of the piece reaching our workshop.",
      },
      {
        q: "Can I exchange for a different size?",
        a: "Once, free, within 30 days — including two-way courier. Rings and bangles are the usual reason and we would rather you had the right size than the right paperwork.",
      },
      {
        q: "Do you buy back old gold?",
        a: "Yes, at 100% of current metal value for pieces bought from us, and 92% for pieces bought elsewhere, in both cases after an in-person purity assay. Stone value is assessed separately.",
      },
    ],
  },
  {
    group: "Authenticity & Care",
    items: [
      {
        q: "Is everything hallmarked?",
        a: "Every gold piece carries a BIS hallmark and a six-digit HUID you can verify yourself in the BIS Care app. Diamond pieces above 0.30ct ship with an IGI or GIA certificate.",
      },
      {
        q: "Do you offer cleaning and polishing?",
        a: "Free ultrasonic cleaning and re-polishing for life at any Diva counter, and once a year by post if you are not near one. Polki and pearl pieces are cleaned by hand instead — ultrasonics destroy foiled stones.",
      },
    ],
  },
];
