import type { Metadata } from "next";
import { ReviewsView } from "@/components/account/reviews-view";

export const metadata: Metadata = {
  title: "My reviews",
  robots: { index: false },
};

export default function MyReviewsPage() {
  return <ReviewsView />;
}
