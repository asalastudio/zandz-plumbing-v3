import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { assistantTools, assistantToolSchemas } from "@/lib/assistant/tools";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Execute one grounded assistant tool by name.
 *
 * This exists so the VOICE assistant and the TEXT assistant share a single set
 * of tool implementations. The text chat calls them server-side through the AI
 * SDK; the ElevenLabs agent calls them from the browser as client tools, which
 * land here carrying the operator's admin session cookie.
 *
 * Defining the tools twice would guarantee drift — the honesty rules we just
 * added (unpriced services must never read as $0, never guess a customer
 * identity) would end up enforced in one path and not the other.
 *
 * Everything reachable here is read-only, and the session check means the agent
 * can never reach anything the signed-in operator could not already open.
 */

const ALLOWED = new Set(Object.keys(assistantTools));

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: { tool?: string; args?: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const name = body.tool;
  if (!name || !ALLOWED.has(name)) {
    return NextResponse.json(
      { error: `unknown_tool`, allowed: [...ALLOWED] },
      { status: 400 }
    );
  }

  const key = name as keyof typeof assistantTools;
  const tool = assistantTools[key];

  try {
    // Validate against the shared zod schema rather than trusting whatever the
    // speech model transcribed. "job fifty one" becoming a string instead of a
    // number should fail here, not halfway through a database call.
    const parsed = assistantToolSchemas[key].safeParse(body.args ?? {});
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "invalid_args",
          detail: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "),
        },
        { status: 400 }
      );
    }

    const execute = tool.execute as unknown as (args: unknown) => Promise<unknown>;
    const result = await execute(parsed.data);
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    console.error(`[assistant-tool] ${name} failed:`, err);
    return NextResponse.json(
      { ok: false, error: (err as Error).message ?? "tool failed" },
      { status: 500 }
    );
  }
}
