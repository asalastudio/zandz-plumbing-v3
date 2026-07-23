import { streamText, convertToModelMessages, stepCountIs, type UIMessage } from "ai";
import { isAuthenticated } from "@/lib/auth";
import { assistantTools } from "@/lib/assistant/tools";
import { systemPrompt } from "@/lib/assistant/prompt";
import { recordUsage } from "@/lib/api-usage";

export const runtime = "nodejs";
export const maxDuration = 30;

// Vercel AI Gateway provider string. Override per-deploy with ASSISTANT_MODEL.
// On Vercel, OIDC authenticates the Gateway; locally set AI_GATEWAY_API_KEY.
const DEFAULT_MODEL = "anthropic/claude-sonnet-4-6";

export async function POST(req: Request) {
  if (!(await isAuthenticated())) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  let messages: UIMessage[];
  try {
    const body = await req.json();
    messages = body.messages;
    if (!Array.isArray(messages)) throw new Error("messages must be an array");
  } catch {
    return new Response(JSON.stringify({ error: "bad_request" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const [system, modelMessages] = await Promise.all([
    systemPrompt(),
    convertToModelMessages(messages),
  ]);

  const model = process.env.ASSISTANT_MODEL ?? DEFAULT_MODEL;
  const result = streamText({
    model,
    system,
    messages: modelMessages,
    tools: assistantTools,
    stopWhen: stepCountIs(6), // allow find → context tool chains
    // Fire-and-forget cost logging so /admin/analytics can total AI spend.
    onFinish: ({ usage }) => {
      void recordUsage({
        provider: "ai_gateway",
        model,
        operation: "assistant_chat",
        inputTokens: usage?.inputTokens ?? 0,
        outputTokens: usage?.outputTokens ?? 0,
      });
    },
  });

  return result.toUIMessageStreamResponse();
}
