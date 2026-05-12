export const dynamic = "force-dynamic";

export default function JobsPage() {
  return (
    <div className="pb-24 lg:pb-0">
      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F96302]">Phase 2</p>
        <h1 className="mt-2 font-display text-4xl font-black uppercase tracking-tight md:text-5xl">
          Jobs
        </h1>
        <p className="mt-3 max-w-2xl text-base text-white/70 md:text-lg">
          Searchable, filterable job list. Click into a job to see the customer, status timeline,
          photos, notes, invoice, and payment status.
        </p>
      </header>

      <div className="border border-dashed border-white/20 bg-white/[0.02] px-8 py-20 text-center">
        <p className="font-display text-2xl font-black uppercase tracking-tight text-white/60 md:text-3xl">
          Coming Sprint 3
        </p>
        <p className="mt-3 mx-auto max-w-xl text-base text-white/50 md:text-lg">
          Sync job records from HubSpot deals, layer in photo upload (Vercel Blob), Stripe Payment
          Links for invoicing, and a clean job-detail view.
        </p>
      </div>
    </div>
  );
}
