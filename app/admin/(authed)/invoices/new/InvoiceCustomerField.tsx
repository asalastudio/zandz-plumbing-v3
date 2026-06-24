"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Search, X, UserPlus, AlertTriangle, Check } from "lucide-react";

export interface PickedCustomer {
  id: number;
  name: string;
  phone_e164: string | null;
  email: string | null;
  city?: string | null;
}

export interface JobOption {
  id: number;
  label: string;
  statusLabel: string;
}

const inputCls =
  "w-full border border-line bg-card px-3 py-3 text-base text-ink outline-none placeholder:text-faint focus:border-[#F96302]";
const labelCls = "mb-1 block text-xs font-bold uppercase tracking-[0.12em] text-muted";

function contactLine(c: PickedCustomer): string {
  return [c.phone_e164, c.email, c.city].filter(Boolean).join(" · ");
}

/**
 * Customer + optional job selector for the custom-invoice builder.
 *
 * Two modes:
 *  - "existing": searchable picker that resolves to a real customer_id, so the
 *    invoice attaches to that exact record (no name-guessing, no silent merge).
 *  - "new": name/email/phone fields, with a live duplicate warning that mirrors
 *    the server's phone-then-email match so an operator can't accidentally bill
 *    a brand-new "Janan" into an existing "Eric" record.
 */
export default function InvoiceCustomerField({
  presetCustomer = null,
  presetJobs = [],
  presetJobId = null,
}: {
  presetCustomer?: PickedCustomer | null;
  presetJobs?: JobOption[];
  presetJobId?: number | null;
}) {
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [selected, setSelected] = useState<PickedCustomer | null>(presetCustomer);
  const [jobs, setJobs] = useState<JobOption[]>(presetJobs);
  const [jobId, setJobId] = useState<string>(presetJobId ? String(presetJobId) : "");

  // Existing-customer search.
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PickedCustomer[]>([]);
  const [searching, setSearching] = useState(false);

  // New-customer fields + duplicate guard.
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [dup, setDup] = useState<PickedCustomer | null>(null);
  const [confirmNew, setConfirmNew] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const warnRef = useRef<HTMLDivElement>(null);

  // ── Debounced customer search ──
  useEffect(() => {
    if (mode !== "existing" || selected) return;
    const q = query.trim();
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      if (q.length < 1) {
        setResults([]);
        return;
      }
      setSearching(true);
      try {
        const res = await fetch(`/api/admin/invoices/lookup?q=${encodeURIComponent(q)}`, {
          signal: ctrl.signal,
        });
        const data = await res.json();
        setResults(Array.isArray(data.customers) ? data.customers : []);
      } catch {
        /* aborted or failed — leave prior results */
      } finally {
        setSearching(false);
      }
    }, 250);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [query, mode, selected]);

  const pickCustomer = useCallback(async (c: PickedCustomer) => {
    setSelected(c);
    setResults([]);
    setQuery("");
    setDup(null);
    setMode("existing");
    setJobId("");
    try {
      const res = await fetch(`/api/admin/invoices/lookup?customerId=${c.id}`);
      const data = await res.json();
      setJobs(Array.isArray(data.jobs) ? data.jobs : []);
    } catch {
      setJobs([]);
    }
  }, []);

  const clearSelected = useCallback(() => {
    setSelected(null);
    setJobs([]);
    setJobId("");
  }, []);

  // ── Debounced duplicate guard for the new-customer path ──
  // confirmNew is reset in the phone/email change handlers, so the effect only
  // performs the lookup.
  useEffect(() => {
    if (mode !== "new") return;
    const phone = newPhone.trim();
    const email = newEmail.trim();
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      if (!phone && !email) {
        setDup(null);
        return;
      }
      try {
        const params = new URLSearchParams();
        if (phone) params.set("phone", phone);
        if (email) params.set("email", email);
        const res = await fetch(`/api/admin/invoices/lookup?${params.toString()}`, {
          signal: ctrl.signal,
        });
        const data = await res.json();
        setDup(data.match ?? null);
      } catch {
        /* ignore */
      }
    }, 400);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [newPhone, newEmail, mode]);

  // ── Block submit when an unresolved duplicate is showing ──
  const blockSubmit = mode === "new" && !!dup && !confirmNew && !selected;
  const guardRef = useRef(false);
  useEffect(() => {
    guardRef.current = blockSubmit;
  }, [blockSubmit]);

  useEffect(() => {
    const form = rootRef.current?.closest("form");
    if (!form) return;
    const onSubmit = (e: Event) => {
      if (guardRef.current) {
        e.preventDefault();
        warnRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    };
    form.addEventListener("submit", onSubmit);
    return () => form.removeEventListener("submit", onSubmit);
  }, []);

  const switchToNew = () => {
    clearSelected();
    setMode("new");
    setResults([]);
    setQuery("");
  };

  return (
    <div ref={rootRef} className="space-y-4">
      {/* Hidden fields the API route reads */}
      {selected && <input type="hidden" name="customer_id" value={selected.id} />}
      {selected && jobId && <input type="hidden" name="job_id" value={jobId} />}
      {mode === "new" && !selected && <input type="hidden" name="new_customer" value="on" />}
      {mode === "new" && !selected && confirmNew && (
        <input type="hidden" name="confirm_new" value="on" />
      )}

      {/* ── EXISTING CUSTOMER ── */}
      {mode === "existing" && (
        <div>
          {selected ? (
            <div className="flex items-start justify-between gap-3 border border-[#F96302]/40 bg-[#F96302]/5 px-4 py-3">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-sm font-bold text-ink">
                  <Check className="h-4 w-4 text-[#F96302]" aria-hidden="true" />
                  {selected.name}
                </p>
                {contactLine(selected) && (
                  <p className="mt-0.5 truncate text-xs text-muted">{contactLine(selected)}</p>
                )}
              </div>
              <button
                type="button"
                onClick={clearSelected}
                className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-muted hover:text-[#F96302]"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
                Change
              </button>
            </div>
          ) : (
            <div className="relative">
              <span className={labelCls}>Search customers</span>
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Name, phone, or email"
                  autoComplete="off"
                  className={`${inputCls} pl-9`}
                />
              </div>
              {(results.length > 0 || searching) && (
                <div className="absolute z-20 mt-1 max-h-72 w-full overflow-auto border border-line bg-card shadow-xl">
                  {searching && results.length === 0 ? (
                    <p className="px-3 py-3 text-sm text-muted">Searching…</p>
                  ) : (
                    results.map((c) => (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => pickCustomer(c)}
                        className="block w-full border-b border-line px-3 py-2.5 text-left last:border-0 hover:bg-[#F96302]/10"
                      >
                        <span className="block text-sm font-bold text-ink">{c.name}</span>
                        {contactLine(c) && (
                          <span className="block truncate text-xs text-muted">
                            {contactLine(c)}
                          </span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}
              {query.trim().length > 0 && !searching && results.length === 0 && (
                <p className="mt-2 text-xs text-muted">
                  No match.{" "}
                  <button
                    type="button"
                    onClick={switchToNew}
                    className="font-bold text-[#F96302] hover:underline"
                  >
                    Add as a new customer
                  </button>
                  .
                </p>
              )}
            </div>
          )}

          {/* Optional job link */}
          {selected && jobs.length > 0 && (
            <label className="mt-4 block">
              <span className={labelCls}>Link to a job (optional)</span>
              <select
                value={jobId}
                onChange={(e) => setJobId(e.target.value)}
                className={inputCls}
              >
                <option value="">— No job (standalone invoice) —</option>
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    #{j.id} · {j.label} · {j.statusLabel}
                  </option>
                ))}
              </select>
              <span className="mt-1 block text-xs text-muted">
                Linking marks that job as invoiced and keeps the customer&apos;s history tidy.
              </span>
            </label>
          )}

          {!selected && (
            <button
              type="button"
              onClick={switchToNew}
              className="mt-3 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted hover:text-[#F96302]"
            >
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              New customer instead
            </button>
          )}
        </div>
      )}

      {/* ── NEW CUSTOMER ── */}
      {mode === "new" && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">
              New customer
            </p>
            <button
              type="button"
              onClick={() => {
                setMode("existing");
                setDup(null);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted hover:text-[#F96302]"
            >
              <Search className="h-3.5 w-3.5" aria-hidden="true" />
              Pick existing
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="block md:col-span-2">
              <span className={labelCls}>Full name *</span>
              <input
                name="customer_name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
                placeholder="Maria Lopez"
                className={inputCls}
              />
            </label>
            <label className="block">
              <span className={labelCls}>Email</span>
              <input
                name="customer_email"
                type="email"
                value={newEmail}
                onChange={(e) => {
                  setNewEmail(e.target.value);
                  setConfirmNew(false);
                }}
                placeholder="maria@example.com"
                className={inputCls}
              />
            </label>
            <label className="block">
              <span className={labelCls}>Phone</span>
              <input
                name="customer_phone"
                type="tel"
                value={newPhone}
                onChange={(e) => {
                  setNewPhone(e.target.value);
                  setConfirmNew(false);
                }}
                placeholder="(510) 555-0100"
                className={inputCls}
              />
            </label>
          </div>

          {/* Duplicate warning — the Eric guard */}
          {dup && !confirmNew && (
            <div
              ref={warnRef}
              className="mt-4 border border-amber-200 bg-amber-50 px-4 py-3"
            >
              <p className="flex items-center gap-2 text-sm font-bold text-amber-700">
                <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                This matches an existing customer
              </p>
              <p className="mt-1 text-sm text-muted">
                <span className="font-bold text-ink">{dup.name}</span>
                {contactLine(dup) ? ` · ${contactLine(dup)}` : ""}. Billing as new would not change
                their name on the invoice.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => pickCustomer(dup)}
                  className="inline-flex items-center gap-2 bg-[#F96302] px-4 py-2 text-sm font-bold uppercase tracking-wide text-white hover:bg-[#e05602]"
                >
                  <Check className="h-4 w-4" aria-hidden="true" />
                  Use {dup.name.split(" ")[0]}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmNew(true)}
                  className="inline-flex items-center border border-line px-4 py-2 text-sm font-bold uppercase tracking-wide text-muted hover:border-amber-400 hover:text-amber-700"
                >
                  Create new anyway
                </button>
              </div>
            </div>
          )}

          {dup && confirmNew && (
            <p className="mt-3 text-xs font-bold text-amber-700/80">
              Creating a separate new customer record.
            </p>
          )}

          <p className="mt-3 text-xs text-muted">
            Add at least one of email or phone, matching the channel you want to send on.
          </p>
        </div>
      )}
    </div>
  );
}
