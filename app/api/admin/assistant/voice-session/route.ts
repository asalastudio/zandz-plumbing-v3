import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Mint a short-lived signed URL for a voice session with Lisa.
 *
 * The alternative is marking the agent public and connecting with a bare agent
 * id from the browser, which would let anyone who reads the page source start
 * conversations on Z and Z's ElevenLabs balance. Signing server-side keeps the
 * API key out of the client and the agent private.
 */

const AGENT_ID =
  process.env.ELEVENLABS_AGENT_ID ?? "agent_2801ky5xj2xxehc830ew80m20xc1";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    // Mirrors how every other channel degrades: the feature switches itself
    // off rather than throwing, so the assistant page still works as text.
    return NextResponse.json(
      { error: "not_configured", detail: "ELEVENLABS_API_KEY is not set" },
      { status: 503 }
    );
  }

  try {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${encodeURIComponent(AGENT_ID)}`,
      { headers: { "xi-api-key": apiKey }, cache: "no-store" }
    );

    if (!res.ok) {
      const detail = await res.text();
      console.error("[voice-session] ElevenLabs error", res.status, detail);
      return NextResponse.json(
        { error: "elevenlabs_error", status: res.status },
        { status: 502 }
      );
    }

    const data = (await res.json()) as { signed_url?: string };
    if (!data.signed_url) {
      return NextResponse.json({ error: "no_signed_url" }, { status: 502 });
    }

    return NextResponse.json(
      { signedUrl: data.signed_url },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("[voice-session] failed:", err);
    return NextResponse.json({ error: "request_failed" }, { status: 502 });
  }
}
