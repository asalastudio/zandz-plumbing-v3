"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Inbox, PhoneCall } from "lucide-react";

type LeadTickerItem = {
  id: number;
  service_type: string;
  service_label: string | null;
  job_zip: string | null;
  customer?: {
    name: string | null;
  } | null;
};

type LeadTickerData = {
  count: number;
  rows: LeadTickerItem[];
};

export function AdminLeadTickerClient({
  initialLeads,
}: {
  initialLeads: LeadTickerData;
}) {
  const [leads, setLeads] = useState(initialLeads);

  useEffect(() => {
    let alive = true;

    async function refresh() {
      try {
        const res = await fetch("/api/admin/notifications", {
          credentials: "same-origin",
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = (await res.json()) as { leads?: LeadTickerData };
        if (alive && data.leads) setLeads(data.leads);
      } catch {
        // The server-rendered ticker remains visible if polling has a transient miss.
      }
    }

    const id = window.setInterval(refresh, 30_000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, []);

  if (leads.count === 0) return null;

  const first = leads.rows[0];
  const latestLabel = first
    ? `${first.customer?.name ?? "New lead"} · ${
        first.service_label ?? first.service_type
      }${first.job_zip ? ` · ${first.job_zip}` : ""}`
    : "New web lead waiting";

  return (
    <div className="border-b border-[#F96302]/35 bg-[#F96302] text-black">
      <Link
        href="/admin/jobs?status=new"
        className="mx-auto flex max-w-[1800px] items-center gap-4 overflow-hidden px-6 py-3 text-sm font-black uppercase tracking-wide"
      >
        <span className="inline-flex shrink-0 items-center gap-2">
          <Inbox className="h-5 w-5" strokeWidth={2.25} aria-hidden="true" />
          {leads.count} new {leads.count === 1 ? "lead" : "leads"}
        </span>
        <span className="hidden h-5 w-px shrink-0 bg-black/25 sm:block" />
        <span className="flex min-w-0 flex-1 items-center gap-2 normal-case tracking-normal text-black/80">
          <PhoneCall className="hidden h-4 w-4 shrink-0 sm:block" aria-hidden="true" />
          <span className="truncate">{latestLabel}</span>
        </span>
        <span className="inline-flex shrink-0 items-center gap-1">
          Review
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </span>
      </Link>
    </div>
  );
}
