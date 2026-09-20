import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { Toaster } from "@/components/ui/toaster";
import { NavigationBuffer } from "@/components/layout/navigation-buffer";
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

/**
 * `viewportFit: "cover"` is what makes `env(safe-area-inset-bottom)` non-zero
 * on iPhone. The cart drawer, filter sheet and mobile nav all pad by it; without
 * this the padding resolves to 0 and their bottom buttons sit under the home
 * indicator. The theme colour tints the browser chrome to the announcement bar.
 */
export const viewport: Viewport = {
  themeColor: "#1a1a1a",
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
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
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        {/*
          Two layers of navigation feedback, covering different moments.

          `NextTopLoader` is the always-on hairline at the top of the viewport.
          `NavigationBuffer` is the veil that follows if the route has not
          committed within ~180ms, and it clears the instant the route changes —
          at which point the segment's own `loading.tsx` skeleton takes over,
          which is a better placeholder because it has the page's shape. The
          delay is what stops a prefetched, instant navigation flashing a veil
          for two frames.
        */}
        <NextTopLoader color="#c9a227" showSpinner={false} />
        <NavigationBuffer />
        <CatalogueProvider
          products={catalogue}
          categories={categories}
          collections={collections}
        >
          <AuthProvider>
            <StoreProvider>
              {/*
                Sticks the announcement bar and header together as one unit.
                Header alone being sticky meant the bar above it scrolled away
                on its own, which read as "the navbar isn't staying put" even
                though the header itself was pinned correctly.
              */}
              <div className="sticky top-0 z-50">
                <AnnouncementBar />
                <Header />
              </div>
              <main id="main" className="flex-1">{children}</main>
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
