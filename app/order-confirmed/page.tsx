import type { Metadata } from "next";
import Image from "next/image";
import { BadgeCheck, Mail, MapPin, Package } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { ProductRail } from "@/components/product/product-grid";
import { SectionHeading } from "@/components/ui/section-heading";
import { productsByBadge } from "@/lib/data/products";
import { demoAddresses } from "@/lib/data/content";
import { MODEL } from "@/lib/images";

export const metadata: Metadata = {
  title: "Order confirmed",
  robots: { index: false },
};

export default async function OrderConfirmedPage({
  searchParams,
}: PageProps<"/order-confirmed">) {
  const params = await searchParams;
  const raw = params.order;
  const orderNumber = (Array.isArray(raw) ? raw[0] : raw) ?? "DIVA-2026-00000";
  const address = demoAddresses[0]!;

  const eta = new Date();
  eta.setDate(eta.getDate() + 4);

  return (
    <>
      <section className="relative overflow-hidden bg-charcoal">
        <Image
          src={MODEL.layeredPendants}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-25"
        />
        <div className="relative mx-auto max-w-3xl px-5 py-20 text-center lg:px-10">
          <span className="inline-flex size-14 items-center justify-center rounded-full bg-gold text-white">
            <BadgeCheck width={26} height={26} strokeWidth={1.4} />
          </span>
          <h1 className="mt-7 font-display text-4xl leading-tight font-light text-white lg:text-[3.2rem]">
            Thank you — your order is confirmed
          </h1>
          <p className="mt-4 text-sm text-white/70">
            Order <span className="text-gold-light">{orderNumber}</span> · a receipt is
            on its way to your email
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-5 py-16 lg:px-10">
        <div className="grid gap-px bg-line sm:grid-cols-3">
          {[
            {
              icon: Package,
              title: "Quality check",
              body: "Weighed, hallmarked and photographed within 48 hours.",
            },
            {
              icon: MapPin,
              title: "Delivering to",
              body: `${address.line1}, ${address.city} ${address.pincode}`,
            },
            {
              icon: Mail,
              title: "Expected by",
              body: eta.toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
              }),
            },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="bg-white p-7">
              <Icon width={20} height={20} strokeWidth={1.3} className="text-gold" />
              <p className="mt-4 text-[10px] tracking-luxe uppercase text-ink">
                {title}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 border border-line p-8">
          <p className="eyebrow">What happens next</p>
          <ol className="mt-6 space-y-5">
            {[
              "Our workshop verifies weight and purity against your invoice, and photographs the piece before packing.",
              "You get a courier tracking link by email and SMS the moment it ships.",
              "Delivery requires a photo ID matching the order name — this is an insured jewellery shipment.",
              "15 days from delivery to return it, and 30 days for one free size exchange.",
            ].map((text, i) => (
              <li key={i} className="flex gap-5">
                <span className="font-display text-xl leading-none font-light text-gold">
                  0{i + 1}
                </span>
                <p className="text-sm leading-relaxed text-muted">{text}</p>
              </li>
            ))}
          </ol>

          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/account/orders">Track this order</ButtonLink>
            <ButtonLink href="/shop" variant="outline">
              Continue shopping
            </ButtonLink>
          </div>
        </div>

        <section className="mt-20">
          <SectionHeading
            eyebrow="Often bought together"
            title="Complete the look"
            align="between"
            href="/shop"
            linkLabel="Shop all"
          />
          <div className="mt-10">
            <ProductRail products={productsByBadge("bestseller")} />
          </div>
        </section>
      </div>
    </>
  );
}
