"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, RotateCw, X, Sparkles, Loader2 } from "lucide-react";
import type { ReviewItem, DescriptionCounts } from "@/lib/pricebook-descriptions";

function money(cents: number): string {
  return cents ? `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "no price";
}

export function ReviewQueue({
  initialQueue,
  counts,
}: {
  initialQueue: ReviewItem[];
  counts: DescriptionCounts;
}) {
  const router = useRouter();
  const [queue, setQueue] = useState(initialQueue);
  const [generating, setGenerating] = useState(false);
  const [genMsg, setGenMsg] = useState<string | null>(null);

  const total = counts.original + counts.pending + counts.approved;
  const reviewedPct = total ? Math.round((counts.approved / total) * 100) : 0;

  async function generate() {
    setGenerating(true);
    setGenMsg(`Drafting up to 25 of ${counts.original} remaining…`);
    try {
      const res = await fetch("/api/admin/pricebook/generate", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setGenMsg(`Error: ${data.error ?? res.status}`);
      } else {
        setGenMsg(
          `Drafted ${data.drafted}${data.failed ? `, ${data.failed} failed` : ""}. ${data.remaining} still undrafted.`
        );
        // Pull the newly drafted items into the queue.
        router.refresh();
      }
    } catch (e) {
      setGenMsg(`Error: ${(e as Error).message}`);
    } finally {
      setGenerating(false);
    }
  }

  function drop(id: number) {
    setQueue((q) => q.filter((i) => i.id !== id));
  }

  return (
    <div>
      {/* Progress + generate */}
      <div className="mb-6 border border-line bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-6">
            <Stat label="Reviewed" value={`${counts.approved}`} sub={`${reviewedPct}% of ${total}`} />
            <Stat label="Awaiting review" value={`${counts.pending}`} accent={counts.pending > 0} />
            <Stat label="Not drafted" value={`${counts.original}`} />
          </div>
          <button
            type="button"
            onClick={generate}
            disabled={generating || counts.original === 0}
            className="inline-flex items-center gap-2 bg-[#F96302] px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-[#e05602] disabled:opacity-40"
          >
            {generating ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            )}
            {counts.original === 0 ? "All drafted" : "Draft next 25"}
          </button>
        </div>
        {genMsg && <p className="mt-3 text-sm text-muted">{genMsg}</p>}
      </div>

      {/* Queue */}
      {queue.length === 0 ? (
        <div className="border border-line bg-card p-8 text-center">
          <p className="font-display text-xl font-black uppercase tracking-tight text-ink">
            Nothing to review
          </p>
          <p className="mt-2 text-sm text-muted">
            {counts.original > 0
              ? "Draft the remaining services above, then review them here."
              : "Every active service has a reviewed description."}
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {queue.map((item) => (
            <ReviewCard key={item.id} item={item} onDone={() => drop(item.id)} />
          ))}
        </ul>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-muted">{label}</p>
      <p className={`font-display text-2xl font-black ${accent ? "text-[#F96302]" : "text-ink"}`}>
        {value}
      </p>
      {sub && <p className="text-xs text-faint">{sub}</p>}
    </div>
  );
}

function ReviewCard({ item, onDone }: { item: ReviewItem; onDone: () => void }) {
  const [draft, setDraft] = useState(item.draft ?? "");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function act(action: "approve" | "keep" | "regenerate") {
    setBusy(action);
    setError(null);
    try {
      const res = await fetch(`/api/admin/pricebook/${item.id}/review`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(action === "approve" ? { action, description: draft } : { action }),
      });
      const data = await res.json();
      if (!res.ok || data.ok === false) throw new Error(data.error ?? `Failed (${res.status})`);

      if (action === "regenerate") {
        // Server wrote a fresh draft; fetch it back isn't wired, so ask the
        // reviewer to reload for the new text. Simpler than a round-trip here.
        setError("New draft generated. Reload to see it.");
        setBusy(null);
        return;
      }
      onDone();
    } catch (e) {
      setError((e as Error).message);
      setBusy(null);
    }
  }

  return (
    <li className="border border-line bg-card p-5">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <span className="font-display text-lg font-black uppercase tracking-tight text-ink">
            {item.name}
          </span>
          <span className="ml-2 font-mono text-xs text-muted">{item.code}</span>
        </div>
        <span className="text-xs text-muted">
          {item.category ?? "Uncategorized"} · {money(item.price_cents)}
        </span>
      </div>

      {/* What a customer sees today */}
      <div className="mb-3">
        <p className="mb-1 text-xs font-bold uppercase tracking-wide text-faint">Current (live)</p>
        <p className="whitespace-pre-wrap border-l-2 border-line pl-3 text-sm text-muted">
          {item.current || "(none)"}
        </p>
      </div>

      {/* The editable draft */}
      <div className="mb-3">
        <p className="mb-1 flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-[#F96302]">
          <Sparkles className="h-3 w-3" aria-hidden="true" />
          AI draft — edit before approving
        </p>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={Math.min(16, Math.max(6, draft.split("\n").length + 1))}
          className="w-full resize-y border border-line bg-surface px-3 py-2 font-mono text-sm text-ink outline-none focus:border-[#F96302]"
        />
      </div>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => act("approve")}
          disabled={!!busy || !draft.trim()}
          className="inline-flex items-center gap-2 bg-ink px-4 py-2 text-sm font-bold uppercase tracking-wide text-card transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {busy === "approve" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          Approve &amp; make live
        </button>
        <button
          type="button"
          onClick={() => act("regenerate")}
          disabled={!!busy}
          className="inline-flex items-center gap-2 border border-line px-4 py-2 text-sm font-semibold text-muted hover:border-[#F96302] hover:text-[#F96302] disabled:opacity-40"
        >
          {busy === "regenerate" ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCw className="h-4 w-4" />}
          Regenerate
        </button>
        <button
          type="button"
          onClick={() => act("keep")}
          disabled={!!busy}
          className="inline-flex items-center gap-2 border border-line px-4 py-2 text-sm font-semibold text-muted hover:border-ink hover:text-ink disabled:opacity-40"
        >
          {busy === "keep" ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
          Keep current, skip
        </button>
      </div>
    </li>
  );
}
