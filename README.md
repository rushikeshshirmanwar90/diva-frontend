# diva-frontend — customer storefront (front-end demo)

A complete, clickable Diva storefront built to **show a client what the site will look
like**. There is deliberately **no backend, no API call and no network request** to
anything except the image CDN.

## Run it

```bash
npm install
npm run dev     # http://localhost:3000
```

Requires Node 20.9+ (Next 16). `npm run build && npm start` also works if you want to
demo the production build.

## What's real and what's mocked

| Area | Status in this demo |
|---|---|
| Catalogue (24 products, 9 categories, 5 collections) | Hard-coded in `lib/data/` |
| Filtering, faceted counts, sorting, pagination | **Real**, computed client-side in `lib/filters.ts` |
| Cart, wishlist, recently viewed, coupons | **Real**, persisted to `localStorage` |
| Cart arithmetic (GST, shipping threshold, coupons) | **Real**, in `lib/totals.ts` |
| Search | **Real**, substring match over the mock catalogue |
| Checkout | Full 3-step UI. "Pay" generates a fake order number and redirects. No payment, no PhonePe. |
| Login / register / contact / newsletter | UI only. Nothing is submitted; each form says so on screen. |
| Account, orders, addresses, reviews | Static demo data in `lib/data/content.ts` |
| Pincode check, delivery dates | Computed locally from the digits you type |

Nothing on the site sends data anywhere, so it is safe to click every button in front of
a client.

## Demo path worth walking a client through

1. **Home** — hero, category rail, bestsellers, wedding edit banner, new arrivals rail,
   budget tiles, craft story, testimonials, `#DivaOnYou` feed, journal.
2. **Jewellery → Rings** — tick a couple of filters and watch the counts change, switch
   the sort, hit *Load more*. The URL updates and is shareable.
3. **Any product** — gallery with thumbnails and click-to-zoom, size picker with a
   sold-out size, price breakdown (metal / stone / making charges), pincode check,
   specs, reviews with a rating distribution.
4. **Add to bag** — drawer slides in with the free-shipping progress bar.
5. **Cart** — apply `DIVA10` (or click any listed code), move something to wishlist.
6. **Checkout** — address → delivery → payment → order confirmation.
7. **Account → Orders** — three orders with a shipment timeline.
8. Try `/nonexistent` for the 404, and the search icon in the header.

Working coupon codes: `DIVA10`, `FESTIVE5000`, `MAKING0` (each has a minimum cart value
shown on the cart page).

## Imagery

All photography is hot-linked from **Unsplash** (free licence) and centralised in
`lib/images.ts`. `next.config.ts` also allows `i.pinimg.com`, so a Pinterest URL can be
pasted into that file directly — but Pinterest pins are user-uploaded and generally not
licensed for commercial reuse, so treat them as placeholder-only and swap in the client's
own product photography before launch.

An internet connection is needed for images to load.

## Structure

```
app/                    routes (App Router, Next 16)
  page.tsx              home
  shop/                 all-products listing
  category/[slug]/      category listing
  collections/          collection index + detail
  product/[slug]/       product detail
  cart/ checkout/ order-confirmed/
  wishlist/ account/    account area (profile, orders, addresses, reviews)
  login/ register/
  about/ contact/ blog/ faq/ policies/[slug]/
components/
  layout/               header, mega menu, mobile nav, search overlay, footer
  home/                 homepage sections
  product/              card, grid, gallery, buy box, specs, reviews
  shop/                 filter panel, listing view, page header
  cart/ checkout/ account/ auth/ contact/ ui/
lib/
  data/                 the mock catalogue and content
  store/                localStorage-backed cart & wishlist
  filters.ts            faceted filtering + sorting
  totals.ts             cart arithmetic
  images.ts             every image URL, in one place
  format.ts             paise → ₹ formatting, GST and shipping constants
```

## Conventions carried over from `implementation.md`

- **Money is paise (integers) everywhere.** `formatPaise()` is the only place it becomes
  a string. No floats in price maths.
- **Products are parent + variants.** Stock, SKU, weight and price delta live on the
  variant, not the product.
- Design tokens (gold `#C9A227`, charcoal `#1A1A1A`, beige `#F8F5F0`) are defined once in
  `app/globals.css` under `@theme`.
- Types in `lib/types.ts` mirror the planned collections closely enough that replacing
  them with `openapi-typescript` output later is a swap, not a rewrite.

## Wiring a backend in later

Every read goes through a function in `lib/data/*.ts` (`getProduct`, `productsByCategory`,
`searchProducts`, …) and every write goes through `lib/store/store.tsx`. Replacing the
mock layer means changing those two places, not the 40 components that consume them.
