import Image from "next/image";
import { MODEL, STILL } from "@/lib/images";
import { InstagramIcon } from "@/components/ui/social-icons";

const feed = [
  { image: MODEL.layeredNecklaces, likes: "2,418" },
  { image: STILL.hoopsOnDish, likes: "1,902" },
  { image: MODEL.coinPendant, likes: "3,275" },
  { image: STILL.templeSet, likes: "5,640" },
  { image: MODEL.ringAndPendant, likes: "2,061" },
  { image: STILL.tennisBracelet, likes: "1,744" },
];

export function InstagramStrip() {
  return (
    <section className="mx-auto max-w-[90rem] px-5 py-20 lg:px-10">
      <div className="flex flex-col items-center text-center">
        <p className="eyebrow mb-3">@divajewellery</p>
        <h2 className="font-display text-3xl leading-tight font-light text-ink md:text-[2.6rem]">
          #DivaOnYou
        </h2>
        <p className="mt-3 max-w-lg text-sm text-muted">
          Tag us and we may feature you. We repost with permission, always.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {feed.map((post, i) => (
          <div
            key={i}
            className="group relative aspect-square overflow-hidden bg-beige"
          >
            <Image
              src={post.image}
              alt=""
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 17vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-charcoal/55 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <InstagramIcon size={20} className="text-white" />
              <span className="text-[10px] tracking-luxe text-white/85">
                ♥ {post.likes}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
