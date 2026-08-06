const messages = [
  "Complimentary insured shipping across India",
  "15-day returns · one free size exchange",
  "BIS hallmarked · HUID on every piece",
  "Live gold rate locked for 30 minutes at checkout",
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
                className="flex items-center gap-10 px-10 py-2.5 text-[10px] tracking-luxe uppercase whitespace-nowrap text-white/70"
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
