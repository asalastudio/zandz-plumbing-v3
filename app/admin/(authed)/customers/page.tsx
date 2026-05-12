import Link from "next/link";
import { Search, Phone, MapPin, ChevronRight, Plus } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase";
import { listCustomers } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(0, parseInt(params.page ?? "0", 10));
  const pageSize = 50;

  if (!isSupabaseConfigured()) {
    return <NotConfigured />;
  }

  const { rows, count } = await listCustomers({
    search: params.q?.trim() || undefined,
    limit: pageSize,
    offset: page * pageSize,
  });

  return (
    <div className="pb-24 lg:pb-0">
      <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F96302]">Customers</p>
          <h1 className="mt-2 font-display text-4xl font-black uppercase tracking-tight md:text-5xl">
            Customer Directory
          </h1>
          <p className="mt-3 max-w-2xl text-base text-white/70">
            {count.toLocaleString()} total. Cross-referenced with HubSpot when a hubspot_contact_id is set.
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
      <form action="/admin/customers" method="GET" className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" aria-hidden="true" />
          <input
            name="q"
            type="search"
            defaultValue={params.q ?? ""}
            placeholder="Search name, phone, email, or address"
            className="w-full border border-white/15 bg-black py-4 pl-12 pr-4 text-lg text-white outline-none focus:border-[#F96302]"
          />
        </div>
      </form>

      {rows.length === 0 ? (
        <div className="border border-white/10 bg-white/5 px-8 py-16 text-center text-white/60">
          {params.q ? (
            <p className="text-lg">No customers match &ldquo;{params.q}&rdquo;.</p>
          ) : (
            <p className="text-lg">
              No customers yet. Add one with the button above, or import from ServiceTitan.
            </p>
          )}
        </div>
      ) : (
        <div className="overflow-hidden border border-white/10">
          <table className="w-full text-left">
            <thead className="bg-white/5">
              <tr>
                <Th>Name</Th>
                <Th>Phone</Th>
                <Th>City</Th>
                <Th>Neighborhood</Th>
                <Th>HubSpot</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className="border-t border-white/5 transition-colors duration-150 hover:bg-white/5">
                  <td className="px-5 py-4">
                    <Link href={`/admin/customers/${c.id}`} className="block font-display text-lg font-black uppercase tracking-tight text-white hover:text-[#F96302]">
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-5 py-4">
                    {c.phone_e164 ? (
                      <a href={`tel:${c.phone_e164}`} className="inline-flex items-center gap-2 text-base text-white/80 hover:text-[#F96302]">
                        <Phone className="h-4 w-4" aria-hidden="true" />
                        {c.phone_e164}
                      </a>
                    ) : (
                      <span className="text-white/40">·</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-base text-white/70">{c.city ?? "·"}</td>
                  <td className="px-5 py-4 text-base text-white/70">{c.neighborhood ?? "·"}</td>
                  <td className="px-5 py-4 text-sm text-white/50">
                    {c.hubspot_contact_id ? (
                      <span className="inline-flex items-center bg-emerald-500/10 px-2 py-0.5 font-bold text-emerald-300">
                        Linked
                      </span>
                    ) : (
                      <span className="text-white/30">·</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link href={`/admin/customers/${c.id}`} className="text-white/40 hover:text-[#F96302]">
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
                href={`/admin/customers?${new URLSearchParams({
                  ...(params.q ? { q: params.q } : {}),
                  page: String(page - 1),
                })}`}
                className="border border-white/15 px-4 py-2 font-bold uppercase tracking-wide hover:border-[#F96302] hover:text-[#F96302]"
              >
                Previous
              </Link>
            )}
            {(page + 1) * pageSize < count && (
              <Link
                href={`/admin/customers?${new URLSearchParams({
                  ...(params.q ? { q: params.q } : {}),
                  page: String(page + 1),
                })}`}
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

function Th({ children }: { children?: React.ReactNode }) {
  return (
    <th className="px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white/60">
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
