import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { demoAddresses } from "@/lib/data/content";

export const metadata: Metadata = {
  title: "Saved addresses",
  robots: { index: false },
};

export default function AddressesPage() {
  return (
    <div>
      <h2 className="font-display text-2xl font-light text-ink">Saved addresses</h2>
      <p className="mt-2 text-sm text-muted">
        Delivery requires a photo ID matching the name on the address.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {demoAddresses.map((a) => (
          <div key={a.id} className="border border-line p-6">
            <div className="flex items-center justify-between">
              <p className="text-[10px] tracking-luxe uppercase text-gold">{a.label}</p>
              {a.isDefault && (
                <span className="bg-beige px-2 py-1 text-[9px] tracking-luxe uppercase text-muted">
                  Default
                </span>
              )}
            </div>
            <p className="mt-4 text-sm text-ink">{a.name}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              {a.line1}
              <br />
              {a.line2}
              <br />
              {a.city}, {a.state} {a.pincode}
              <br />
              {a.phone}
            </p>
            <div className="mt-5 flex gap-5 border-t border-line pt-4">
              <button
                type="button"
                className="text-[10px] tracking-luxe uppercase text-charcoal hover:text-gold"
              >
                Edit
              </button>
              {!a.isDefault && (
                <button
                  type="button"
                  className="text-[10px] tracking-luxe uppercase text-charcoal hover:text-gold"
                >
                  Set as default
                </button>
              )}
              <button
                type="button"
                className="text-[10px] tracking-luxe uppercase text-charcoal hover:text-sale"
              >
                Remove
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          className="flex min-h-52 flex-col items-center justify-center gap-3 border border-dashed border-line text-muted transition-colors hover:border-gold hover:text-gold"
        >
          <Plus width={20} height={20} strokeWidth={1.4} />
          <span className="text-[10px] tracking-luxe uppercase">Add a new address</span>
        </button>
      </div>
    </div>
  );
}
