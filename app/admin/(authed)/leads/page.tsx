import { redirect } from "next/navigation";

/**
 * Leads merged into the Jobs pipeline.
 *
 * A "lead" is just a job at its first stage (status = new), so it lives as the
 * New Leads filter on /admin/jobs rather than a separate destination. This
 * redirect keeps old links and bookmarks (and the Dashboard "Review all" link)
 * working. The Dashboard still carries the fast new-lead inbox for speed.
 */
export default function LeadsPage() {
  redirect("/admin/jobs?status=new");
}
