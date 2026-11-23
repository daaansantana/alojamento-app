import { AltArrowDownIcon } from "@solar-icons/react/linear/alt-arrow-down";

/** A folded section: what the market is, what INE measures, and each value's link and date. */
export function MarketSource({
  title,
  paragraphs,
  lines,
}: {
  title: string;
  paragraphs: string[];
  lines: { text: string; url: string }[];
}) {
  return (
    <details className="group border-y">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 py-2 font-bold [&::-webkit-details-marker]:hidden">
        {title}
        <AltArrowDownIcon
          size={24}
          aria-hidden={true}
          className="shrink-0 group-open:rotate-180"
        />
      </summary>
      <div className="flex flex-col gap-2 pb-4">
        {paragraphs.map((text) => (
          <p key={text}>{text}</p>
        ))}
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
      </div>
    </details>
  );
}
