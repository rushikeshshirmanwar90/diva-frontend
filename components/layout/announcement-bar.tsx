const messages = [
  "Complimentary insured shipping across India",
  "15-day returns · one free size exchange",
  "BIS hallmarked · Hand-finished 1-gram gold",
  "Transparent fixed pricing · No hidden making charges",
];

export function AnnouncementBar() {
  return (
    <div className="overflow-hidden border-b border-white/10 bg-charcoal text-white">
      <div className="flex w-max animate-marquee">
        {[0, 1].map((copy) => (
          <ul
            key={copy}
            className="flex shrink-0 items-center"
            aria-hidden={copy === 1}
          >
            {messages.map((m) => (
              <li
                key={m}
                className="flex items-center gap-8 sm:gap-10 px-6 sm:px-10 py-2 sm:py-2.5 text-[9px] sm:text-[10px] tracking-luxe uppercase whitespace-nowrap text-white/75"
              >
                {m}
                <span className="text-gold">✦</span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
