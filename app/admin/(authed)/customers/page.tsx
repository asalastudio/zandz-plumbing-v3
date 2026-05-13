import Link from "next/link";
import { Search, Phone, ChevronRight, Plus } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase";
import { listCustomers, formatMoneyShort, type CustomerFilter, type CustomerSort } from "@/lib/db";

export const dynamic = "force-dynamic";

const FILTERS: { key: CustomerFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active (12mo)" },
  { key: "dormant", label: "Dormant (12mo+)" },
  { key: "top_spenders", label: "Top spenders" },
  { key: "no_contact", label: "No contact info" },
];

const SORTS: { key: CustomerSort; label: string }[] = [
  { key: "name", label: "Name (A-Z)" },
  { key: "revenue", label: "Lifetime revenue" },
  { key: "last_job", label: "Last job" },
  { key: "jobs", label: "Jobs completed" },
];

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    page?: string;
    filter?: CustomerFilter;
    sort?: CustomerSort;
  }>;
}) {
  const params = await searchParams;
  const page = Math.max(0, parseInt(params.page ?? "0", 10));
  const pageSize = 50;
  const filter = (params.filter ?? "all") as CustomerFilter;
  const sort = (params.sort ?? "name") as CustomerSort;

  if (!isSupabaseConfigured()) {
    return <NotConfigured />;
  }

  const { rows, count } = await listCustomers({
    search: params.q?.trim() || undefined,
    filter: filter === "all" ? undefined : filter,
    sort,
    limit: pageSize,
    offset: page * pageSize,
  });

  const baseHref = (overrides: Record<string, string | undefined>) => {
    const usp = new URLSearchParams();
    if (params.q) usp.set("q", params.q);
    if (filter !== "all") usp.set("filter", filter);
    if (sort !== "name") usp.set("sort", sort);
    for (const [k, v] of Object.entries(overrides)) {
      if (v === undefined) usp.delete(k);
      else usp.set(k, v);
    }
    const s = usp.toString();
    return s ? `/admin/customers?${s}` : "/admin/customers";
  };

  return (
    <div className="pb-24 lg:pb-0">
      <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F96302]">Customers</p>
          <h1 className="mt-2 font-display text-4xl font-black uppercase tracking-tight md:text-5xl">
            Customer Directory
          </h1>
          <p className="mt-3 max-w-2xl text-base text-white/70">
            {count.toLocaleString()} {filter !== "all" ? "matching " : ""}
            customer{count === 1 ? "" : "s"}. Click a row to see history.
          </p>
        </div>
        <Link
          href="/admin/customers/new"
          className="inline-flex items-center gap-2 bg-[#F96302] px-5 py-3 text-sm font-bold uppercase tracking-wide text-white transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-lg hover:bg-[#e05602]"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          New Customer
        </Link>
      </header>

      {/* Search */}
      <form action="/admin/customers" method="GET" className="mb-4">
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40"
            aria-hidden="true"
          />
          <input
            name="q"
            type="search"
            defaultValue={params.q ?? ""}
            placeholder="Search name, phone, email, address, or city"
            className="w-full border border-white/15 bg-black py-4 pl-12 pr-4 text-lg text-white outline-none focus:border-[#F96302]"
          />
          {/* Preserve filter + sort across search submits */}
          {filter !== "all" && <input type="hidden" name="filter" value={filter} />}
          {sort !== "name" && <input type="hidden" name="sort" value={sort} />}
        </div>
      </form>

      {/* Filter pills */}
      <div className="mb-3 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <Link
              key={f.key}
              href={baseHref({ filter: f.key === "all" ? undefined : f.key, page: undefined })}
              className={`inline-flex items-center px-3.5 py-2 text-xs font-bold uppercase tracking-[0.12em] transition-colors duration-150 ${
                active
                  ? "bg-[#F96302] text-white"
                  : "border border-white/15 bg-white/5 text-white/70 hover:border-[#F96302] hover:text-white"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {/* Sort */}
      <div className="mb-6 flex flex-wrap items-center gap-2 text-xs text-white/50">
        <span className="font-bold uppercase tracking-[0.12em]">Sort:</span>
        {SORTS.map((s) => {
          const active = sort === s.key;
          return (
            <Link
              key={s.key}
              href={baseHref({ sort: s.key === "name" ? undefined : s.key, page: undefined })}
              className={`inline-flex items-center px-2.5 py-1 font-bold uppercase tracking-[0.12em] transition-colors duration-150 ${
                active
                  ? "bg-white/15 text-white"
                  : "text-white/50 hover:text-white"
              }`}
            >
              {s.label}
            </Link>
          );
        })}
      </div>

      {rows.length === 0 ? (
        <div className="border border-white/10 bg-white/5 px-8 py-16 text-center text-white/60">
          {params.q ? (
            <p className="text-lg">No customers match &ldquo;{params.q}&rdquo;.</p>
          ) : (
            <p className="text-lg">
              No customers match this filter. Try {`"All"`} or add a new customer.
            </p>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto border border-white/10">
          <table className="w-full text-left">
            <thead className="bg-white/5">
              <tr>
                <Th>Name</Th>
                <Th>Phone</Th>
                <Th className="hidden sm:table-cell">City</Th>
                <Th className="hidden md:table-cell">Lifetime $</Th>
                <Th className="hidden md:table-cell">Jobs</Th>
                <Th className="hidden lg:table-cell">Last job</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr
                  key={c.id}
                  className="border-t border-white/5 transition-colors duration-150 hover:bg-white/5"
                >
                  <td className="px-5 py-4">
                    <Link
                      href={`/admin/customers/${c.id}`}
                      className="block font-display text-lg font-black uppercase tracking-tight text-white hover:text-[#F96302]"
                    >
                      {c.name}
                    </Link>
                    {c.customer_type && (
                      <span className="mt-1 inline-flex items-center text-[10px] font-bold uppercase tracking-[0.12em] text-white/40">
                        {c.customer_type}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {c.phone_e164 ? (
                      <a
                        href={`tel:${c.phone_e164}`}
                        className="inline-flex items-center gap-2 text-base text-white/80 hover:text-[#F96302]"
                      >
                        <Phone className="h-4 w-4" aria-hidden="true" />
                        {c.phone_e164}
                      </a>
                    ) : (
                      <span className="text-white/40">·</span>
                    )}
                  </td>
                  <td className="hidden px-5 py-4 text-base text-white/70 sm:table-cell">
                    {c.city ?? "·"}
                  </td>
                  <td className="hidden px-5 py-4 text-base font-bold text-white md:table-cell">
                    {c.lifetime_revenue_cents && c.lifetime_revenue_cents > 0
                      ? formatMoneyShort(c.lifetime_revenue_cents)
                      : <span className="text-white/30">·</span>}
                  </td>
                  <td className="hidden px-5 py-4 text-base text-white/70 md:table-cell">
                    {c.lifetime_jobs ?? <span className="text-white/30">·</span>}
                  </td>
                  <td className="hidden px-5 py-4 text-sm text-white/60 lg:table-cell">
                    {c.last_job_completed_at
                      ? new Date(c.last_job_completed_at).toLocaleDateString("en-US", {
                          month: "short",
                          year: "numeric",
                        })
                      : <span className="text-white/30">·</span>}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/admin/customers/${c.id}`}
                      className="text-white/40 hover:text-[#F96302]"
                    >
                      <ChevronRight className="h-5 w-5" aria-hidden="true" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {count > pageSize && (
        <div className="mt-6 flex items-center justify-between text-sm text-white/60">
          <p>
            Showing {page * pageSize + 1} to {Math.min((page + 1) * pageSize, count)} of {count}
          </p>
          <div className="flex gap-3">
            {page > 0 && (
              <Link
                href={baseHref({ page: String(page - 1) })}
                className="border border-white/15 px-4 py-2 font-bold uppercase tracking-wide hover:border-[#F96302] hover:text-[#F96302]"
              >
                Previous
              </Link>
            )}
            {(page + 1) * pageSize < count && (
              <Link
                href={baseHref({ page: String(page + 1) })}
                className="border border-white/15 px-4 py-2 font-bold uppercase tracking-wide hover:border-[#F96302] hover:text-[#F96302]"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Th({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return (
    <th
      className={`px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white/60 ${className}`}
    >
      {children}
    </th>
  );
}

function NotConfigured() {
  return (
    <div className="pb-24 lg:pb-0">
      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F96302]">Customers</p>
        <h1 className="mt-2 font-display text-4xl font-black uppercase tracking-tight md:text-5xl">
          Customer Directory
        </h1>
      </header>
      <div className="border-l-4 border-[#F96302] bg-[#F96302]/10 p-6">
        <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#F96302]">Setup needed</p>
        <p className="mt-2 text-base text-white/80 md:text-lg">
          Connect Supabase via WIRING.md, then this list populates automatically.
        </p>
      </div>
    </div>
  );
}
