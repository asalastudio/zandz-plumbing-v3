import { generateText } from "ai";
import { isAuthenticated } from "@/lib/auth";

export const runtime = "nodejs";
export const maxDuration = 30;

const DEFAULT_MODEL = "anthropic/claude-sonnet-4-6";

const SYSTEM = `You write the short customer-facing "notes" that print on a plumbing invoice for Z and Z Plumbing (Oakland / East Bay). Tone: warm, professional, plain language a homeowner understands. 2-4 sentences, plain text only — no markdown, no headings, no bullet lists. Summarize the work performed based on the line items, and you may add a brief reassurance or relevant care/warranty reminder if appropriate. Do NOT invent prices, dates, part numbers, warranties, or any specifics that aren't implied by the line items. Do not mention payment terms.`;

/**
 * Draft a suggested customer-facing invoice note from the current line items
 * (and, when available, the customer name / service). Used by the "Suggest
 * with AI" button on the invoice builder. Returns { text }.
 */
export async function POST(req: Request) {
  if (!(await isAuthenticated())) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  let body: {
    lineItems?: { description?: string; quantity?: string }[];
    customerName?: string;
    serviceLabel?: string;
  };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "bad_request" }), { status: 400 });
  }

  const work = (body.lineItems ?? [])
    .filter((it) => it?.description?.trim())
    .map((it) => `- ${it.description!.trim()}${it.quantity ? ` (qty ${it.quantity})` : ""}`)
    .join("\n");

  if (!work) {
    return new Response(JSON.stringify({ error: "no_line_items" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const context = [
    body.customerName ? `Customer: ${body.customerName}` : "",
    body.serviceLabel ? `Service: ${body.serviceLabel}` : "",
    `Work performed (invoice line items):\n${work}`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const { text } = await generateText({
      model: process.env.ASSISTANT_MODEL ?? DEFAULT_MODEL,
      system: SYSTEM,
      prompt: `Write the customer-facing notes for this invoice.\n\n${context}`,
    });
    return Response.json({ text: text.trim() });
  } catch (err) {
    console.error("[suggest-notes]", err);
    return new Response(JSON.stringify({ error: "ai_failed" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
