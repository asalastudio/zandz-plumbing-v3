/**
 * HubSpot CRM — Contact + Deal creation for inbound leads.
 *
 * The public Forms API (lib/hubspot.ts → submitLead) puts contacts in HubSpot
 * but doesn't create a Deal. For the sales pipeline to surface inbound leads
 * for Jay in the HubSpot Deals view, we authenticate with the Private App
 * token and create a Deal explicitly. Works on HubSpot Free tier.
 *
 * Idempotency: HubSpot deduplicates contacts by email, so re-submitting the
 * same email upserts. We create a NEW deal for every lead intake — each
 * service request is a distinct deal even from a repeat customer.
 *
 * Pipeline + stage:
 *   - If HUBSPOT_DEALS_PIPELINE_ID + HUBSPOT_DEALS_NEW_STAGE_ID are set,
 *     use those.
 *   - Otherwise, omit them and let HubSpot drop the deal into the default
 *     pipeline's first stage. Z&Z can re-classify in HubSpot UI later.
 */

const HUBSPOT_API_BASE = "https://api.hubapi.com";

function token(): string | null {
  return process.env.HUBSPOT_PRIVATE_APP_TOKEN ?? null;
}

export interface DealLeadInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  zip: string;
  serviceLabel: string;
  briefDescription?: string;
  sourcePage?: string;
  outOfArea: boolean;
}

export async function createHubSpotDeal(
  input: DealLeadInput
): Promise<{ ok: boolean; error?: string; dealId?: string; contactId?: string }> {
  const t = token();
  if (!t) {
    return { ok: true, error: "HUBSPOT_PRIVATE_APP_TOKEN not set — skipped" };
  }

  try {
    // Step A: upsert contact by email
    const contactId = await upsertContactByEmail(t, input);
    if (!contactId) {
      return { ok: false, error: "contact upsert returned no id" };
    }

    // Step B: create deal, associate to contact
    const dealId = await createDeal(t, input, contactId);
    if (!dealId) {
      return { ok: false, error: "deal create returned no id" };
    }

    return { ok: true, contactId, dealId };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

// ──────────────────────────────────────────────────────────────────────────
// Contact upsert
// ──────────────────────────────────────────────────────────────────────────

async function upsertContactByEmail(
  bearer: string,
  input: DealLeadInput
): Promise<string | null> {
  const properties: Record<string, string> = {
    firstname: input.firstName,
    lastname: input.lastName,
    email: input.email,
    phone: input.phone,
    zip: input.zip,
    lead_source: "website",
  };

  // Try create first (most common case)
  const createRes = await fetch(`${HUBSPOT_API_BASE}/crm/v3/objects/contacts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${bearer}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ properties }),
  });

  if (createRes.ok) {
    const data = await createRes.json();
    return data.id as string;
  }

  // 409 = duplicate. Search for existing by email and update.
  if (createRes.status === 409) {
    const text = await createRes.text();
    // HubSpot includes existing id in the error body
    const m = text.match(/Existing ID:\s*(\d+)/);
    const id = m?.[1];
    if (id) {
      await fetch(`${HUBSPOT_API_BASE}/crm/v3/objects/contacts/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${bearer}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ properties }),
      });
      return id;
    }
  }

  const text = await createRes.text();
  throw new Error(`contact create failed: ${createRes.status} ${text}`);
}

// ──────────────────────────────────────────────────────────────────────────
// Deal create
// ──────────────────────────────────────────────────────────────────────────

async function createDeal(
  bearer: string,
  input: DealLeadInput,
  contactId: string
): Promise<string | null> {
  const pipelineId = process.env.HUBSPOT_DEALS_PIPELINE_ID;
  const stageId = process.env.HUBSPOT_DEALS_NEW_STAGE_ID;

  const dealName = input.outOfArea
    ? `[OUT-OF-AREA] ${input.firstName} ${input.lastName} — ${input.serviceLabel}`
    : `${input.firstName} ${input.lastName} — ${input.serviceLabel} (${input.zip})`;

  const properties: Record<string, string> = {
    dealname: dealName,
    ...(pipelineId ? { pipeline: pipelineId } : {}),
    ...(stageId ? { dealstage: stageId } : {}),
  };

  const body = {
    properties,
    associations: [
      {
        to: { id: contactId },
        types: [
          {
            associationCategory: "HUBSPOT_DEFINED",
            associationTypeId: 3, // contact ↔ deal primary
          },
        ],
      },
    ],
  };

  const res = await fetch(`${HUBSPOT_API_BASE}/crm/v3/objects/deals`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${bearer}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`deal create failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  return data.id as string;
}
