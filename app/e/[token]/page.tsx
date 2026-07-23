import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { verifyEstimateToken, getEstimateForView } from "@/lib/estimates";
import { formatMoney } from "@/lib/email";
import { siteSettings } from "@/content/site-settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Estimate · Z and Z Plumbing",
  robots: { index: false, follow: false },
};

function fmtDate(iso: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function PublicEstimatePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const estimateId = verifyEstimateToken(token);
  if (!estimateId) notFound();

  const view = await getEstimateForView(estimateId);
  if (!view) notFound();

  const { estimate, customer, jobServiceLabel } = view;

  return (
    <main className="min-h-screen bg-[#F5F5F5] py-10 px-4 text-[#111]">
      <div className="mx-auto max-w-2xl">
        <div className="mb-5 flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-wordmark.svg" alt={siteSettings.name} className="h-10 w-auto" />
        </div>

        <div className="overflow-hidden rounded-xl border border-[#E5E5E5] bg-white shadow-sm">
          <div className="bg-black px-6 py-6 text-white sm:px-8">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#F96302]">
              Estimate
            </p>
            <h1 className="mt-1 text-3xl font-black leading-none">
              {formatMoney(estimate.amount_cents)}
            </h1>
            <p className="mt-2 text-sm text-white/70">
              Estimate #{estimate.id}
              {jobServiceLabel ? ` · ${jobServiceLabel}` : ""} · {fmtDate(estimate.created_at)}
            </p>
          </div>

          <div className="px-6 py-6 sm:px-8">
            <p className="mb-5 text-base text-[#333]">
              {customer?.name ? `Hi ${customer.name}, ` : ""}here is your estimate from{" "}
              {siteSettings.name}.
            </p>

            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#E5E5E5] text-left text-[11px] uppercase tracking-[0.08em] text-[#888]">
                  <th className="py-2 font-bold">Scope</th>
                  <th className="py-2 text-right font-bold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {estimate.line_items.map((item, idx) => (
                  <tr key={idx} className="border-b border-[#F0F0F0]">
                    <td className="py-3 pr-3 align-top">
                      <span className="block whitespace-pre-line text-[#111]">{item.description}</span>
                    </td>
                    <td className="py-3 text-right align-top font-bold text-[#111]">
                      {formatMoney(item.total_cents)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td className="pt-4 text-base font-extrabold">Estimate total</td>
                  <td className="pt-4 text-right text-lg font-black">
                    {formatMoney(estimate.amount_cents)}
                  </td>
                </tr>
              </tfoot>
            </table>

            {estimate.notes ? (
              <div className="mt-5 border-l-4 border-[#F96302] bg-[#F5F5F5] px-4 py-3 text-sm leading-relaxed text-[#333]">
                {estimate.notes}
              </div>
            ) : null}

            <div className="mt-6 rounded-lg border border-[#E5E5E5] bg-[#F8F8F8] px-4 py-4 text-sm text-[#333]">
              <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#888]">
                About this estimate
              </p>
              <p className="leading-relaxed">
                This is a good-faith estimate, not a final bill. The final cost may differ if
                unforeseen conditions come up once work begins.
                {estimate.valid_until ? ` Valid through ${fmtDate(estimate.valid_until)}.` : ""}
              </p>
              <a
                href={`tel:${siteSettings.phoneTel}`}
                className="mt-4 inline-block rounded-md bg-[#F96302] px-5 py-3 text-sm font-extrabold uppercase tracking-[0.08em] text-white"
              >
                Call {siteSettings.phone} to approve
              </a>
            </div>
          </div>
        </div>

        <div className="mt-5 text-center text-xs leading-relaxed text-[#9a9a9a]">
          <p className="font-bold text-[#7a7a7a]">{siteSettings.name}</p>
          <p className="mt-1">
            {siteSettings.phone} · {siteSettings.address.full}
          </p>
          <p className="mt-1">
            {siteSettings.cslb} · {siteSettings.licenses.join(" · ")}
          </p>
        </div>
      </div>
    </main>
  );
}
