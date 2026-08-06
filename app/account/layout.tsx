import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { AccountNav } from "@/components/account/account-nav";
import { CONTACT } from "@/lib/data/site";

export default function AccountLayout({ children }: LayoutProps<"/account">) {
  return (
    <div className="mx-auto max-w-[90rem] px-5 pt-8 pb-20 lg:px-10">
      <Breadcrumbs trail={[{ label: "My account" }]} />

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-8">
        <div>
          <p className="eyebrow">Signed in as {CONTACT.email}</p>
          <h1 className="mt-2 font-display text-4xl font-light text-ink lg:text-[3rem]">
            Namaste, Mahesh
          </h1>
        </div>
        <Link
          href="/login"
          className="text-[10px] tracking-luxe uppercase text-muted hover:text-sale"
        >
          Sign out
        </Link>
      </div>

      <div className="mt-10 grid gap-12 lg:grid-cols-[16rem_1fr] lg:gap-16">
        <AccountNav />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
