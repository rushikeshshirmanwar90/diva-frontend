"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import {
  createAddress,
  deleteAddress,
  listAddresses,
  updateAddress,
  type Address,
} from "@/lib/api/addresses";
import { errorMessage } from "@/lib/api/client";
import { AddressForm } from "@/components/account/address-form";

export function AddressesView() {
  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | "new" | null>(null);

  const reload = async () => {
    try {
      setAddresses(await listAddresses());
    } catch (cause) {
      setError(errorMessage(cause));
      setAddresses([]);
    }
  };

  useEffect(() => {
    void (async () => {
      await reload();
    })();
  }, []);

  const handleDelete = async (id: string) => {
    setError(null);
    try {
      await deleteAddress(id);
      setAddresses((current) => current?.filter((a) => a._id !== id) ?? null);
    } catch (cause) {
      setError(errorMessage(cause));
    }
  };

  const handleSetDefault = async (id: string) => {
    setError(null);
    try {
      await updateAddress(id, { isDefault: true });
      await reload();
    } catch (cause) {
      setError(errorMessage(cause));
    }
  };

  return (
    <div>
      <h2 className="font-display text-2xl font-light text-ink">Saved addresses</h2>
      <p className="mt-2 text-sm text-muted">
        Delivery requires a photo ID matching the name on the address.
      </p>

      {error && (
        <p
          role="alert"
          className="mt-6 border border-[#c0392b]/30 bg-[#c0392b]/5 p-3 text-xs text-[#c0392b]"
        >
          {error}
        </p>
      )}

      {addresses === null ? (
        <div className="mt-10 flex justify-center py-10 text-muted">
          <Loader2 width={20} height={20} className="animate-spin" />
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {addresses.map((address) =>
            editingId === address._id ? (
              <AddressForm
                key={address._id}
                initial={address}
                onCancel={() => setEditingId(null)}
                onSaved={async () => {
                  setEditingId(null);
                  await reload();
                }}
                save={(input) => updateAddress(address._id, input)}
              />
            ) : (
              <div key={address._id} className="border border-line p-6">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] tracking-luxe uppercase text-gold">
                    {address.label || address.type}
                  </p>
                  {address.isDefault && (
                    <span className="bg-beige px-2 py-1 text-[9px] tracking-luxe uppercase text-muted">
                      Default
                    </span>
                  )}
                </div>
                <p className="mt-4 text-sm text-ink">{address.fullName}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                  {address.line1}
                  {address.line2 && (
                    <>
                      <br />
                      {address.line2}
                    </>
                  )}
                  <br />
                  {address.city}, {address.state} {address.pincode}
                  <br />
                  {address.phone}
                </p>
                <div className="mt-5 flex flex-wrap gap-5 border-t border-line pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingId(address._id)}
                    className="text-[10px] tracking-luxe uppercase text-charcoal hover:text-gold"
                  >
                    Edit
                  </button>
                  {!address.isDefault && (
                    <button
                      type="button"
                      onClick={() => void handleSetDefault(address._id)}
                      className="text-[10px] tracking-luxe uppercase text-charcoal hover:text-gold"
                    >
                      Set as default
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => void handleDelete(address._id)}
                    className="text-[10px] tracking-luxe uppercase text-charcoal hover:text-sale"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ),
          )}

          {editingId === "new" ? (
            <AddressForm
              onCancel={() => setEditingId(null)}
              onSaved={async () => {
                setEditingId(null);
                await reload();
              }}
              save={(input) => createAddress(input)}
            />
          ) : (
            <button
              type="button"
              onClick={() => setEditingId("new")}
              className="flex min-h-52 flex-col items-center justify-center gap-3 border border-dashed border-line text-muted transition-colors hover:border-gold hover:text-gold"
            >
              <Plus width={20} height={20} strokeWidth={1.4} />
              <span className="text-[10px] tracking-luxe uppercase">
                Add a new address
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
