"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Search, Plus, X, Trash2 } from "lucide-react";

interface ServiceHit {
  id: number;
  code: string;
  name: string;
  description: string | null;
  category: string | null;
  price_cents: number;
}

interface Line {
  key: number;
  code: string | null;
  name: string | null;
  description: string;
  quantity: string;
  unitPrice: string;
}

const inputCls =
  "w-full border border-line bg-card px-3 py-2.5 text-base text-ink outline-none placeholder:text-faint focus:border-[#F96302]";
const labelCls = "mb-1 block text-xs font-bold uppercase tracking-[0.12em] text-muted";

let SEQ = 1;
function blankLine(seed?: { description?: string; unitPrice?: string }): Line {
  return {
    key: SEQ++,
    code: null,
    name: null,
    description: seed?.description ?? "",
    quantity: "1",
    unitPrice: seed?.unitPrice ?? "",
  };
}

function money(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}
function lineTotal(l: Line): number {
  const q = Number(l.quantity.replace(/,/g, ""));
  const p = Number(l.unitPrice.replace(/[$,\s]/g, ""));
  if (!Number.isFinite(q) || !Number.isFinite(p)) return 0;
  return q * p;
}

/**
 * Invoice line-item editor with a pricebook service picker. Searching the
 * service_catalog and selecting a code auto-fills that line's description (the
 * saved scope of work) and unit price — both still editable — so operators
 * stop retyping. Submits the same description/quantity/unit_price arrays the
 * API already parses, so nothing downstream changes.
 */
export default function InvoiceLineItems({
  defaultDescription = "",
  defaultPrice = "",
}: {
  defaultDescription?: string;
  defaultPrice?: string;
}) {
  const [lines, setLines] = useState<Line[]>(() => [
    blankLine({ description: defaultDescription, unitPrice: defaultPrice }),
  ]);

  const update = useCallback((key: number, patch: Partial<Line>) => {
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  }, []);
  const addLine = useCallback(() => setLines((prev) => [...prev, blankLine()]), []);
  const removeLine = useCallback(
    (key: number) => setLines((prev) => (prev.length > 1 ? prev.filter((l) => l.key !== key) : prev)),
    []
  );
  const applyService = useCallback(
    (key: number, s: ServiceHit) => {
      update(key, {
        code: s.code,
        name: s.name,
        description: s.description ?? s.name,
        unitPrice: s.price_cents ? (s.price_cents / 100).toFixed(2) : "",
      });
    },
    [update]
  );

  const subtotal = lines.reduce((sum, l) => sum + lineTotal(l), 0);

  return (
    <div className="space-y-3">
      {lines.map((line, idx) => (
        <div key={line.key} className="border border-line bg-card p-3 md:p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-muted">
              Line {idx + 1}
            </span>
            {lines.length > 1 && (
              <button
                type="button"
                onClick={() => removeLine(line.key)}
                className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-muted hover:text-[#F96302]"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                Remove
              </button>
            )}
          </div>

          <ServiceSearch onPick={(s) => applyService(line.key, s)} picked={line.code ? `${line.code} · ${line.name}` : null} onClear={() => update(line.key, { code: null, name: null })} />

          <label className="mt-3 block">
            <span className={labelCls}>{idx === 0 ? "Description *" : "Description"}</span>
            <textarea
              name="description"
              value={line.description}
              onChange={(e) => update(line.key, { description: e.target.value })}
              rows={Math.min(14, Math.max(2, line.description.split("\n").length))}
              placeholder="Pick a service above, or type the scope of work"
              className={`${inputCls} resize-y leading-relaxed`}
            />
          </label>

          <div className="mt-3 grid grid-cols-[90px_1fr_auto] items-end gap-3">
            <label className="block">
              <span className={labelCls}>Qty</span>
              <input
                name="quantity"
                value={line.quantity}
                onChange={(e) => update(line.key, { quantity: e.target.value })}
                inputMode="decimal"
                placeholder="1"
                className={inputCls}
              />
            </label>
            <label className="block">
              <span className={labelCls}>Unit price</span>
              <input
                name="unit_price"
                value={line.unitPrice}
                onChange={(e) => update(line.key, { unitPrice: e.target.value })}
                inputMode="decimal"
                placeholder="0.00"
                className={inputCls}
              />
            </label>
            <div className="pb-2.5 text-right">
              <span className={labelCls}>Line</span>
              <span className="font-display text-lg font-black tracking-tight text-ink">
                {money(lineTotal(line))}
              </span>
            </div>
          </div>
        </div>
      ))}

      <div className="flex items-center justify-between gap-3 pt-1">
        <button
          type="button"
          onClick={addLine}
          className="inline-flex items-center gap-2 border border-line bg-card px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-muted hover:border-[#F96302] hover:text-[#F96302]"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add line
        </button>
        <div className="text-right">
          <span className="text-xs font-bold uppercase tracking-[0.12em] text-muted">Subtotal</span>
          <span className="ml-3 font-display text-2xl font-black tracking-tight text-ink">
            {money(subtotal)}
          </span>
        </div>
      </div>
    </div>
  );
}

function ServiceSearch({
  onPick,
  picked,
  onClear,
}: {
  onPick: (s: ServiceHit) => void;
  picked: string | null;
  onClear: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ServiceHit[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query.trim();
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      if (q.length < 1) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/invoices/lookup?service=${encodeURIComponent(q)}`, {
          signal: ctrl.signal,
        });
        const data = await res.json();
        setResults(Array.isArray(data.services) ? data.services : []);
        setOpen(true);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [query]);

  // Close dropdown on outside click.
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={boxRef} className="relative">
      <span className={labelCls}>Pricebook service</span>
      {picked ? (
        <div className="flex items-center justify-between gap-3 border border-[#F96302]/40 bg-[#F96302]/5 px-3 py-2.5">
          <span className="truncate text-sm font-bold text-ink">{picked}</span>
          <button
            type="button"
            onClick={() => {
              onClear();
              setQuery("");
            }}
            className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-muted hover:text-[#F96302]"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            Change
          </button>
        </div>
      ) : (
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint"
            aria-hidden="true"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length && setOpen(true)}
            placeholder="Search services (e.g. water heater, drain, toilet)"
            autoComplete="off"
            className={`${inputCls} pl-9`}
          />
        </div>
      )}

      {open && !picked && (results.length > 0 || loading) && (
        <div className="absolute z-30 mt-1 max-h-80 w-full overflow-auto border border-line bg-card shadow-xl">
          {loading && results.length === 0 ? (
            <p className="px-3 py-3 text-sm text-faint">Searching…</p>
          ) : (
            results.map((s) => (
              <button
                type="button"
                key={s.id}
                onClick={() => {
                  onPick(s);
                  setQuery("");
                  setOpen(false);
                }}
                className="block w-full border-b border-line px-3 py-2.5 text-left last:border-0 hover:bg-[#F96302]/10"
              >
                <span className="flex items-baseline justify-between gap-3">
                  <span className="truncate text-sm font-bold text-ink">
                    <span className="text-muted">{s.code}</span> · {s.name}
                  </span>
                  {s.price_cents > 0 && (
                    <span className="shrink-0 text-sm font-bold text-ink">
                      {money(s.price_cents / 100)}
                    </span>
                  )}
                </span>
                {s.category && (
                  <span className="block truncate text-xs text-faint">{s.category}</span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
