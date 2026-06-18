/**
 * Resend email client — dispatch notifications for new leads.
 *
 * Implemented as a thin fetch wrapper (no SDK install required) so the build
 * doesn't add another dependency. Reads:
 *   - RESEND_API_KEY  → required
 *   - DISPATCH_EMAIL  → recipient (jay@…, or a comma-separated list)
 *   - LEAD_FROM_EMAIL → from address. Defaults to leads@zandzplumbing.com.
 *                       The sending domain must be verified in Resend.
 *
 * If RESEND_API_KEY or DISPATCH_EMAIL is missing, the function returns ok:true
 * with skipped=true so the rest of the pipeline can continue uninterrupted.
 */

interface DispatchEmailInput {
  name: string;
  phoneFormatted: string;
  phoneE164: string;
  email: string;
  zip: string;
  city: string;
  serviceLabel: string;
  preferredCallbackTime?: string;
  briefDescription?: string;
  outOfArea: boolean;
  sourcePage?: string;
  supabaseJobId?: number;
}

export async function sendDispatchEmail(
  input: DispatchEmailInput
): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.DISPATCH_EMAIL;
  if (!apiKey || !to) {
    return { ok: true, error: "Resend env not set — skipped" };
  }

  const from = process.env.LEAD_FROM_EMAIL ?? "Z and Z Leads <leads@zandzplumbing.com>";
  const recipients = to.split(",").map((s) => s.trim()).filter(Boolean);

  const subject = input.outOfArea
    ? `⚠️ OUT-OF-AREA lead: ${input.name} — ${input.serviceLabel}`
    : `New lead: ${input.name} — ${input.serviceLabel} (${input.city})`;

  const html = buildDispatchHtml(input);
  const text = buildDispatchText(input);

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: recipients,
        subject,
        html,
        text,
        reply_to: input.email,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return { ok: false, error: `Resend ${res.status}: ${err}` };
    }

    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

function buildDispatchHtml(i: DispatchEmailInput): string {
  const banner = i.outOfArea
    ? `<div style="background:#FEF3C7;border-left:4px solid #F59E0B;padding:12px 16px;margin-bottom:16px;border-radius:4px;">
         <strong style="color:#92400E;">⚠️ Out-of-area request.</strong>
         <span style="color:#78350F;"> Verify before dispatch.</span>
       </div>`
    : "";

  const callbackRow = i.preferredCallbackTime
    ? row("Best time to call", capitalize(i.preferredCallbackTime))
    : "";

  const descriptionRow = i.briefDescription
    ? row("Customer notes", escapeHtml(i.briefDescription))
    : "";

  const sourceRow = i.sourcePage ? row("Source page", escapeHtml(i.sourcePage)) : "";

  const dashboardLine = i.supabaseJobId
    ? `<p style="margin-top:24px;font-size:13px;color:#666;">
         Job <strong>#${i.supabaseJobId}</strong> · open in
         <a href="https://www.zandzplumbing.com/admin/jobs" style="color:#F96302;font-weight:600;">Z and Z OS</a>
       </p>`
    : "";

  return `<!doctype html>
<html><body style="margin:0;background:#F5F5F5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:24px 16px;">
    <div style="background:#000;color:#fff;padding:20px 24px;border-radius:8px 8px 0 0;">
      <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#F96302;">
        New web lead
      </p>
      <h1 style="margin:6px 0 0;font-size:24px;font-weight:900;text-transform:uppercase;letter-spacing:-0.01em;">
        ${escapeHtml(i.name)}
      </h1>
      <p style="margin:6px 0 0;font-size:14px;color:rgba(255,255,255,0.7);">
        ${escapeHtml(i.serviceLabel)} · ${escapeHtml(i.city)} ${escapeHtml(i.zip)}
      </p>
    </div>
    <div style="background:#fff;padding:24px;border-radius:0 0 8px 8px;border:1px solid #E5E5E5;border-top:none;">
      ${banner}
      <table style="width:100%;border-collapse:collapse;">
        ${row("Phone", `<a href="tel:${escapeAttr(i.phoneE164)}" style="color:#F96302;font-weight:600;text-decoration:none;">${escapeHtml(i.phoneFormatted)}</a>`)}
        ${row("Email", `<a href="mailto:${escapeAttr(i.email)}" style="color:#F96302;text-decoration:none;">${escapeHtml(i.email)}</a>`)}
        ${row("Service", escapeHtml(i.serviceLabel))}
        ${row("ZIP", `${escapeHtml(i.zip)} · ${escapeHtml(i.city)}`)}
        ${callbackRow}
        ${descriptionRow}
        ${sourceRow}
      </table>
      <div style="margin-top:24px;display:block;">
        <a href="tel:${escapeAttr(i.phoneE164)}" style="display:inline-block;background:#F96302;color:#fff;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;font-size:13px;padding:14px 24px;border-radius:8px;text-decoration:none;">
          Call ${escapeHtml(i.phoneFormatted)}
        </a>
      </div>
      ${dashboardLine}
    </div>
  </div>
</body></html>`;
}

function buildDispatchText(i: DispatchEmailInput): string {
  const lines = [
    i.outOfArea ? "⚠️ OUT-OF-AREA — verify before dispatch.\n" : "",
    `NEW WEB LEAD`,
    `${i.name} — ${i.serviceLabel} — ${i.city} ${i.zip}`,
    ``,
    `Phone: ${i.phoneFormatted} (${i.phoneE164})`,
    `Email: ${i.email}`,
    i.preferredCallbackTime ? `Best time: ${capitalize(i.preferredCallbackTime)}` : "",
    i.briefDescription ? `Notes: ${i.briefDescription}` : "",
    i.sourcePage ? `Source: ${i.sourcePage}` : "",
    i.supabaseJobId ? `Job #${i.supabaseJobId} in Z and Z OS` : "",
  ];
  return lines.filter(Boolean).join("\n");
}

function row(label: string, value: string): string {
  return `<tr>
    <td style="padding:8px 0;color:#666;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;width:110px;vertical-align:top;">${escapeHtml(label)}</td>
    <td style="padding:8px 0;color:#111;font-size:14px;line-height:1.5;">${value}</td>
  </tr>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Stricter encoder for href/src attribute values — protects against
 *  user input that could break out of the attribute or inject JS schemes. */
function escapeAttr(s: string): string {
  // Allow only safe chars; everything else gets URI-encoded.
  // For tel: and mailto: this preserves +, digits, @, and . — strips quotes/spaces/<>.
  return encodeURI(s).replace(/"/g, "%22").replace(/'/g, "%27");
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
