import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Minimal markdown renderer for assistant replies.
 *
 * The chat used to print raw model output inside whitespace-pre-wrap, so every
 * **bold** landed on screen as literal asterisks. Rendering a full markdown
 * parser would fix that but drags a dependency into the admin bundle and opens
 * up HTML injection, so this handles the small subset the assistant actually
 * emits: bold, italic, inline code, lists, short headings, and links.
 *
 * Everything is built as React nodes — no dangerouslySetInnerHTML anywhere —
 * and hrefs are allowlisted, so a model that hallucinates `javascript:` markup
 * renders as inert text rather than a live link.
 */

// Internal record links render through next/link for client-side nav. The
// assistant is told to emit these so an operator can jump straight to the job
// or customer being discussed.
const INTERNAL_PATH = /\/(?:admin|field|i|track)\/[A-Za-z0-9/_-]+/;

type Href =
  | { kind: "internal"; href: string }
  | { kind: "external"; href: string };

function safeHref(raw: string): Href | null {
  const href = raw.trim();
  if (href.startsWith("/")) return { kind: "internal", href };
  if (/^https?:\/\//i.test(href)) return { kind: "external", href };
  // Genuinely useful for an operator mid-call, and both are inert on their own.
  if (/^(?:tel:|mailto:)/i.test(href)) return { kind: "external", href };
  return null;
}

function Anchor({ href, children }: { href: Href; children: ReactNode }) {
  const className =
    "font-semibold text-[#F96302] underline underline-offset-2 hover:text-[#e05602]";

  if (href.kind === "internal") {
    return (
      <Link href={href.href} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <a
      href={href.href}
      className={className}
      target={href.href.startsWith("http") ? "_blank" : undefined}
      rel={href.href.startsWith("http") ? "noreferrer noopener" : undefined}
    >
      {children}
    </a>
  );
}

/**
 * Inline formatting. Matchers are ordered: code first so its contents are never
 * re-parsed, then explicit links, then emphasis, then bare record paths.
 */
function parseInline(text: string, keyPrefix: string): ReactNode[] {
  const out: ReactNode[] = [];
  let rest = text;
  let i = 0;

  while (rest.length > 0) {
    const matches: Array<{
      index: number;
      length: number;
      node: ReactNode;
    }> = [];

    const push = (
      m: RegExpExecArray | null,
      build: (m: RegExpExecArray) => ReactNode
    ) => {
      if (m) matches.push({ index: m.index, length: m[0].length, node: build(m) });
    };

    push(/`([^`\n]+)`/.exec(rest), (m) => (
      <code
        key={`${keyPrefix}-c${i}`}
        className="bg-raised px-1.5 py-0.5 font-mono text-[0.92em] text-ink"
      >
        {m[1]}
      </code>
    ));

    push(/\[([^\]\n]+)\]\(([^)\s]+)\)/.exec(rest), (m) => {
      const href = safeHref(m[2]);
      // Unsafe scheme: keep the label, drop the link.
      if (!href) return <span key={`${keyPrefix}-l${i}`}>{m[1]}</span>;
      return (
        <Anchor key={`${keyPrefix}-l${i}`} href={href}>
          {m[1]}
        </Anchor>
      );
    });

    push(/\*\*([^*\n]+)\*\*/.exec(rest), (m) => (
      <strong key={`${keyPrefix}-b${i}`} className="font-bold text-ink">
        {m[1]}
      </strong>
    ));

    push(/(?:^|\s)\*([^*\n]+)\*/.exec(rest), (m) => (
      <em key={`${keyPrefix}-i${i}`}>{m[1]}</em>
    ));

    push(new RegExp(INTERNAL_PATH.source).exec(rest), (m) => (
      <Anchor key={`${keyPrefix}-p${i}`} href={{ kind: "internal", href: m[0] }}>
        {m[0]}
      </Anchor>
    ));

    if (matches.length === 0) {
      out.push(rest);
      break;
    }

    // Earliest match wins; ties break toward the higher-priority matcher, which
    // is the one pushed first.
    matches.sort((a, b) => a.index - b.index);
    const hit = matches[0];

    // The italic matcher may have consumed a leading space — keep it.
    const raw = rest.slice(hit.index, hit.index + hit.length);
    const leading = raw.startsWith(" ") ? " " : "";

    if (hit.index > 0) out.push(rest.slice(0, hit.index));
    if (leading) out.push(leading);
    out.push(hit.node);

    rest = rest.slice(hit.index + hit.length);
    i++;
  }

  return out;
}

interface Block {
  type: "p" | "ul" | "ol" | "h";
  lines: string[];
}

/** Group lines into paragraphs, lists, and headings. */
function parseBlocks(text: string): Block[] {
  const blocks: Block[] = [];
  let current: Block | null = null;

  const flush = () => {
    if (current) blocks.push(current);
    current = null;
  };

  for (const line of text.split("\n")) {
    const trimmed = line.trim();

    if (trimmed === "") {
      flush();
      continue;
    }

    const bullet = /^[-*•]\s+(.*)$/.exec(trimmed);
    const numbered = /^\d+[.)]\s+(.*)$/.exec(trimmed);
    const heading = /^#{1,6}\s+(.*)$/.exec(trimmed);

    if (heading) {
      flush();
      blocks.push({ type: "h", lines: [heading[1]] });
      continue;
    }
    if (bullet) {
      if (current?.type !== "ul") {
        flush();
        current = { type: "ul", lines: [] };
      }
      current.lines.push(bullet[1]);
      continue;
    }
    if (numbered) {
      if (current?.type !== "ol") {
        flush();
        current = { type: "ol", lines: [] };
      }
      current.lines.push(numbered[1]);
      continue;
    }

    if (current?.type !== "p") {
      flush();
      current = { type: "p", lines: [] };
    }
    current.lines.push(trimmed);
  }

  flush();
  return blocks;
}

export function RichText({ text }: { text: string }) {
  const blocks = parseBlocks(text);

  return (
    <div className="space-y-3 text-base leading-relaxed text-ink">
      {blocks.map((block, bi) => {
        if (block.type === "h") {
          return (
            <p key={bi} className="font-bold uppercase tracking-wide text-ink">
              {parseInline(block.lines[0], `h${bi}`)}
            </p>
          );
        }

        if (block.type === "ul" || block.type === "ol") {
          const ListTag = block.type === "ul" ? "ul" : "ol";
          return (
            <ListTag
              key={bi}
              className={
                block.type === "ul"
                  ? "list-disc space-y-1 pl-5 marker:text-[#F96302]"
                  : "list-decimal space-y-1 pl-5 marker:font-bold marker:text-[#F96302]"
              }
            >
              {block.lines.map((li, li_i) => (
                <li key={li_i}>{parseInline(li, `b${bi}-${li_i}`)}</li>
              ))}
            </ListTag>
          );
        }

        return <p key={bi}>{parseInline(block.lines.join(" "), `p${bi}`)}</p>;
      })}
    </div>
  );
}
