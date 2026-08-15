import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { Toaster } from "@/components/ui/toaster";
import { StoreProvider } from "@/lib/store/store";
import { AuthProvider } from "@/lib/auth/auth-context";
import { CatalogueProvider } from "@/lib/data/catalogue-context";
import { getCatalogue, getCategories, getCollections } from "@/lib/data/catalogue";

const display = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const sans = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Diva · The Indian Jewel",
    template: "%s · Diva The Indian Jewel",
  },
  description:
    "BIS hallmarked gold, diamond and polki jewellery, made in Bengaluru and Jaipur since 1998. Transparent pricing, insured delivery, 15-day returns.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  /**
   * Read once here, not per page.
   *
   * The cart drawer and header search live in this layout and need the
   * catalogue on every route, so fetching it at the root means one request per
   * navigation instead of one per component that asks. `StoreProvider` sits
   * inside it because resolving a cart line to a product is exactly this lookup.
   */
  const [catalogue, categories, collections] = await Promise.all([
    getCatalogue(),
    getCategories(),
    getCollections(),
  ]);

  return (
    <html lang="en" className={`${display.variable} ${sans.variable} h-full`}>
      <body className="flex min-h-full flex-col antialiased">
        <CatalogueProvider
          products={catalogue}
          categories={categories}
          collections={collections}
        >
          <AuthProvider>
            <StoreProvider>
              <AnnouncementBar />
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
              <CartDrawer />
              <Toaster />
            </StoreProvider>
          </AuthProvider>
        </CatalogueProvider>
      </body>
    </html>
  );
}
