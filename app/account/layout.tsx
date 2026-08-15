"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { AccountNav } from "@/components/account/account-nav";
import { useAuth } from "@/lib/auth/auth-context";

export default function AccountLayout({ children }: LayoutProps<"/account">) {
  const router = useRouter();
  const { status, user, logout } = useAuth();

  // The account section is real estate a stranger should never see — a direct
  // link, a bookmark, a back button after signing out. Effect rather than a
  // render-time redirect because `status` starts at "loading" and only
  // resolves once the session cookie has been checked.
  useEffect(() => {
    if (status === "guest") router.replace("/login");
  }, [status, router]);

  if (status !== "authenticated" || !user) {
    return <div className="min-h-[60vh]" />;
  }

  const handleSignOut = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="mx-auto max-w-[90rem] px-5 pt-8 pb-20 lg:px-10">
      <Breadcrumbs trail={[{ label: "My account" }]} />

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-8">
        <div>
          <p className="eyebrow">Signed in as {user.email}</p>
          <h1 className="mt-2 font-display text-4xl font-light text-ink lg:text-[3rem]">
            Namaste, {user.name.split(" ")[0]}
          </h1>
        </div>
        <button
          type="button"
          onClick={() => void handleSignOut()}
          className="text-[10px] tracking-luxe uppercase text-muted hover:text-sale"
        >
          Sign out
        </button>
      </div>

      <div className="mt-10 grid gap-12 lg:grid-cols-[16rem_1fr] lg:gap-16">
        <AccountNav />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
