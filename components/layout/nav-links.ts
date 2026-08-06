import { categories, collections } from "@/lib/data/categories";
import { MODEL } from "@/lib/images";

export type NavItem = {
  label: string;
  href: string;
  panel?: {
    columns: Array<{ heading: string; links: Array<{ label: string; href: string }> }>;
    feature?: { title: string; blurb: string; href: string; image: string };
  };
};

export const navItems: NavItem[] = [
  {
    label: "Jewellery",
    href: "/shop",
    panel: {
      columns: [
        {
          heading: "By category",
          links: categories
            .slice(0, 5)
            .map((c) => ({ label: c.name, href: `/category/${c.slug}` })),
        },
        {
          heading: "More",
          links: [
            ...categories.slice(5).map((c) => ({
              label: c.name,
              href: `/category/${c.slug}`,
            })),
            { label: "Shop all", href: "/shop" },
          ],
        },
        {
          heading: "By metal",
          links: [
            { label: "22K Gold", href: "/shop?metal=22K+Gold" },
            { label: "18K Gold", href: "/shop?metal=18K+Gold" },
            { label: "Rose Gold", href: "/shop?metal=14K+Rose+Gold" },
            { label: "925 Silver", href: "/shop?metal=925+Silver" },
          ],
        },
      ],
      feature: {
        title: "New this season",
        blurb: "Nine pieces added to the daily-wear edit",
        href: "/shop?sort=newest",
        image: MODEL.daintyWhite,
      },
    },
  },
  {
    label: "Collections",
    href: "/collections",
    panel: {
      columns: [
        {
          heading: "Curated edits",
          links: collections.map((c) => ({
            label: c.name,
            href: `/collections/${c.slug}`,
          })),
        },
        {
          heading: "Shop by occasion",
          links: [
            { label: "Bridal", href: "/shop?occasion=Bridal" },
            { label: "Festive", href: "/shop?occasion=Festive" },
            { label: "Daily wear", href: "/shop?occasion=Daily+Wear" },
            { label: "Gifting", href: "/shop?occasion=Gifting" },
          ],
        },
        {
          heading: "Shop by budget",
          links: [
            { label: "Under ₹25,000", href: "/shop?price=0-25000" },
            { label: "₹25,000 – ₹50,000", href: "/shop?price=25000-50000" },
            { label: "₹50,000 – ₹1,00,000", href: "/shop?price=50000-100000" },
            { label: "Above ₹1,00,000", href: "/shop?price=100000-9999999" },
          ],
        },
      ],
      feature: {
        title: "The Wedding Edit",
        blurb: "Polki, temple gold and heirloom sets",
        href: "/collections/wedding-edit",
        image: MODEL.chokerPortrait,
      },
    },
  },
  { label: "Bridal", href: "/collections/wedding-edit" },
  { label: "For Him", href: "/category/mens" },
  { label: "Journal", href: "/blog" },
  { label: "Our Story", href: "/about" },
];
