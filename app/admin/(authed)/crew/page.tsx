import Link from "next/link";
import { Users, Phone, Mail, Plus } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase";
import { listCrew, type Crew } from "@/lib/db";

export const dynamic = "force-dynamic";

const ROLE_LABEL: Record<Crew["role"], string> = {
  owner: "Owner",
  lead_plumber: "Lead Plumber",
  plumber: "Plumber",
  apprentice: "Apprentice",
  helper: "Helper",
  office: "Office",
};

const ROLES: Crew["role"][] = ["owner", "lead_plumber", "plumber", "apprentice", "helper", "office"];

export default async function CrewPage({
  searchParams,
}: {
  searchParams: Promise<{ added?: string; updated?: string }>;
}) {
  const params = await searchParams;

  if (!isSupabaseConfigured()) {
    return (
      <div className="border-l-4 border-[#F96302] bg-[#F96302]/10 p-6">
        <p className="text-base text-white/80">Connect Supabase to manage crew.</p>
      </div>
    );
  }

  const crew = await listCrew();

  return (
    <div className="pb-24 lg:pb-0">
      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F96302]">Crew</p>
        <h1 className="mt-2 font-display text-4xl font-black uppercase tracking-tight md:text-5xl">
          Field Crew
        </h1>
        <p className="mt-3 max-w-2xl text-base text-white/70">
          Manage the {crew.filter((c) => c.active).length} active crew member{crew.filter((c) => c.active).length === 1 ? "" : "s"}.
          Used to assign jobs on the dispatch board.
        </p>
      </header>

      {(params.added || params.updated) && (
        <div className="mb-6 border-l-4 border-emerald-500 bg-emerald-500/10 p-4 text-sm font-bold uppercase tracking-wide text-emerald-300">
          {params.added && "Crew member added."}
          {params.updated && "Crew member updated."}
        </div>
      )}

      {/* Existing crew */}
      <section className="mb-12">
        <h2 className="mb-4 font-display text-2xl font-black uppercase tracking-tight md:text-3xl">
          Roster
        </h2>
        {crew.length === 0 ? (
          <div className="border border-dashed border-white/15 bg-white/[0.02] px-8 py-12 text-center">
            <Users className="mx-auto h-8 w-8 text-white/30" aria-hidden="true" />
            <p className="mt-3 text-base text-white/60">No crew yet. Add the first one below.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {crew.map((c) => (
              <article key={c.id} className={`border ${c.active ? "border-white/10" : "border-white/5 opacity-50"} bg-white/5 p-5 md:p-6`}>
                <header className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-xl font-black uppercase tracking-tight text-white md:text-2xl">
                      {c.name}
                    </h3>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#F96302]">
                      {ROLE_LABEL[c.role]}
                    </p>
                  </div>
                  {!c.active && (
                    <span className="inline-flex items-center bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white/60">
                      Inactive
                    </span>
                  )}
                </header>
                <p className="mt-3 flex items-center gap-2 text-sm text-white/70">
                  <Mail className="h-4 w-4 text-white/40" aria-hidden="true" />
                  {c.email}
                </p>
                {c.phone_e164 && (
                  <p className="mt-2 flex items-center gap-2 text-sm text-white/70">
                    <Phone className="h-4 w-4 text-white/40" aria-hidden="true" />
                    {c.phone_e164}
                  </p>
                )}
                <form action={`/api/admin/crew/${c.id}/toggle`} method="POST" className="mt-4">
                  <button
                    type="submit"
                    className="text-xs font-bold uppercase tracking-wide text-white/40 hover:text-[#F96302]"
                  >
                    {c.active ? "Deactivate" : "Reactivate"}
                  </button>
                </form>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Add new */}
      <section className="border border-white/10 bg-white/5 p-6 md:p-8">
        <header className="mb-6 flex items-center gap-3">
          <Plus className="h-5 w-5 text-[#F96302]" aria-hidden="true" />
          <h2 className="font-display text-2xl font-black uppercase tracking-tight md:text-3xl">
            Add crew member
          </h2>
        </header>
        <form action="/api/admin/crew" method="POST" className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field label="Name *" name="name" required />
          <Field label="Email *" name="email" type="email" required />
          <Field label="Phone (E.164)" name="phone_e164" type="tel" />
          <Field label="Role *" name="role" required>
            <select
              name="role"
              required
              className="w-full border border-white/15 bg-black px-4 py-3 text-base text-white outline-none focus:border-[#F96302]"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABEL[r]}
                </option>
              ))}
            </select>
          </Field>
          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center bg-[#F96302] px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-lg hover:bg-[#e05602]"
            >
              Add to crew
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  children,
}: {
  label: string;
  name?: string;
  type?: string;
  required?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-bold uppercase tracking-[0.12em] text-white/60 mb-2">
        {label}
      </label>
      {children ?? (
        <input
          type={type}
          name={name}
          required={required}
          className="w-full border border-white/15 bg-black px-4 py-3 text-base text-white outline-none focus:border-[#F96302]"
        />
      )}
    </div>
  );
}
