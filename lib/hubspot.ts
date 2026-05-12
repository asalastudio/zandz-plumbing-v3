export interface LeadPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  zip: string;
  serviceInterest: string;
  preferredCallbackTime?: string;
  briefDescription?: string;
  sourcePage?: string;
}

interface HubSpotField {
  name: string;
  value: string;
}

export async function submitLead(payload: LeadPayload): Promise<{ ok: boolean; error?: string }> {
  const portalId = process.env.HUBSPOT_PORTAL_ID;
  const formId = process.env.HUBSPOT_FORM_ID;

  if (!portalId || !formId) {
    // Degraded mode — log and return success so the UI doesn't break
    console.warn("[HubSpot] Missing HUBSPOT_PORTAL_ID or HUBSPOT_FORM_ID — lead not submitted");
    return { ok: true };
  }

  const fields: HubSpotField[] = [
    { name: "firstname", value: payload.firstName },
    { name: "lastname", value: payload.lastName },
    { name: "email", value: payload.email },
    { name: "phone", value: payload.phone },
    { name: "zip_code", value: payload.zip },
    { name: "service_interest", value: payload.serviceInterest },
    { name: "preferred_callback_time", value: payload.preferredCallbackTime ?? "" },
    { name: "brief_description", value: payload.briefDescription ?? "" },
    { name: "source_page", value: payload.sourcePage ?? "" },
  ].filter((f) => f.value !== "");

  try {
    const res = await fetch(
      `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields }),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      console.error("[HubSpot] Submission error:", text);
      return { ok: false, error: "Submission failed. Please call us directly." };
    }

    return { ok: true };
  } catch (err) {
    console.error("[HubSpot] Network error:", err);
    return { ok: false, error: "Network error. Please call us directly." };
  }
}
