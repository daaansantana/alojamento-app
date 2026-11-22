/** Where the market's numbers come from: INE, what was used, and each value's link and date. */
export function MarketSource({
  intro,
  lines,
}: {
  intro: string;
  lines: { text: string; url: string }[];
}) {
  return (
    <section aria-label="Fonte do mercado" className="flex flex-col gap-2">
      <p>{intro}</p>
      <ul className="flex flex-col gap-1.5">
        {lines.map((line) => (
          <li key={line.url + line.text}>
            <a
              href={line.url}
              className="inline-block py-1.5 text-primary underline underline-offset-4 first-letter:uppercase"
              target="_blank"
              rel="noreferrer"
            >
              {line.text}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
