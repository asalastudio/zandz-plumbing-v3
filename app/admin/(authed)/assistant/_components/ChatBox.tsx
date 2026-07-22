"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { ConversationProvider } from "@elevenlabs/react";
import { Send, Mic, Square, Sparkles, Loader2, PhoneCall, PhoneOff, AudioLines } from "lucide-react";
import { useSpeechRecognition } from "./useSpeechRecognition";
import { useVoiceAssistant, type VoiceTurn } from "./useVoiceAssistant";
import { RichText } from "./RichText";

const TOOL_LABEL: Record<string, string> = {
  "tool-searchPricebook": "Checked the pricebook",
  "tool-findCustomer": "Searched customers",
  "tool-getCustomerContext": "Pulled customer history",
  "tool-getJobContext": "Looked up the job",
  "tool-getJobMaterials": "Checked job materials",
  "tool-businessKpis": "Pulled the numbers",
};

// The voice hook (useConversation) must run inside a ConversationProvider, so
// the exported component provides it and the real UI lives in ChatBoxInner.
export default function ChatBox({ suggestions }: { suggestions: string[] }) {
  return (
    <ConversationProvider>
      <ChatBoxInner suggestions={suggestions} />
    </ConversationProvider>
  );
}

function ChatBoxInner({ suggestions }: { suggestions: string[] }) {
  const { messages, sendMessage, status, stop, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/admin/assistant/chat" }),
  });
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const busy = status === "submitted" || status === "streaming";

  const { supported, listening, start, stop: stopMic } = useSpeechRecognition((text) =>
    setInput((prev) => (prev ? `${prev} ${text}` : text))
  );

  // Spoken turns land in the same transcript as typed ones, so the operator can
  // start a question by voice and finish it by typing without losing the thread.
  const [voiceTurns, setVoiceTurns] = useState<VoiceTurn[]>([]);
  const voice = useVoiceAssistant((turn) => setVoiceTurns((prev) => [...prev, turn]));

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  function submit(text: string) {
    const t = text.trim();
    if (!t || busy) return;
    sendMessage({ text: t });
    setInput("");
  }

  return (
    <div className="flex h-[calc(100vh-13rem)] min-h-[440px] flex-col">
      {/* Live voice session with Lisa. Stays open until stopped — no clicking
          between turns, and she can be interrupted mid-sentence. */}
      <div className="mb-3 flex items-center justify-between gap-3 border border-line bg-card px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={`inline-flex h-9 w-9 shrink-0 items-center justify-center ${
              voice.status === "live" ? "bg-[#F96302] text-white" : "bg-raised text-muted"
            }`}
          >
            {voice.status === "live" ? (
              <AudioLines className={`h-5 w-5 ${voice.speaking ? "animate-pulse" : ""}`} aria-hidden="true" />
            ) : (
              <PhoneCall className="h-5 w-5" aria-hidden="true" />
            )}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold text-ink">Talk to Lisa</p>
            <p className="truncate text-xs text-muted">
              {voice.status === "live"
                ? voice.speaking
                  ? "Lisa is speaking. Just talk to cut in."
                  : "Listening…"
                : voice.status === "connecting"
                  ? "Connecting…"
                  : voice.error
                    ? voice.error
                    : "Hands-free lookups while you're on a call."}
            </p>
          </div>
        </div>

        {voice.status === "live" || voice.status === "connecting" ? (
          <button
            type="button"
            onClick={voice.stop}
            className="inline-flex shrink-0 items-center gap-2 border border-line px-3 py-2 text-xs font-bold uppercase tracking-wide text-muted hover:border-[#F96302] hover:text-[#F96302]"
          >
            <PhoneOff className="h-4 w-4" aria-hidden="true" />
            End
          </button>
        ) : (
          <button
            type="button"
            onClick={voice.start}
            className="inline-flex shrink-0 items-center gap-2 bg-[#F96302] px-3 py-2 text-xs font-bold uppercase tracking-wide text-white hover:bg-[#e05602]"
          >
            <PhoneCall className="h-4 w-4" aria-hidden="true" />
            Start
          </button>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto pb-4">
        {messages.length === 0 && voiceTurns.length === 0 ? (
          <EmptyState suggestions={suggestions} onPick={submit} />
        ) : (
          messages.map((m) => <Message key={m.id} message={m} />)
        )}

        {voiceTurns.map((turn, i) => (
          <VoiceMessage key={`voice-${i}`} turn={turn} />
        ))}
        {busy && messages[messages.length - 1]?.role === "user" && (
          <div className="flex items-center gap-2 text-sm text-muted">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Thinking…
          </div>
        )}
        {error && (
          <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Something went wrong. Confirm the AI key is configured, then try again.
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(input);
        }}
        className="mt-2 flex items-end gap-2 border border-line bg-card p-2"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit(input);
            }
          }}
          rows={1}
          placeholder={listening ? "Listening…" : "Ask about a job, a price, a customer…"}
          className="max-h-40 min-h-[2.5rem] flex-1 resize-none bg-transparent px-2 py-2 text-base text-ink outline-none placeholder:text-faint"
        />
        {supported && (
          <button
            type="button"
            onClick={() => (listening ? stopMic() : start())}
            aria-label={listening ? "Stop dictation" : "Dictate"}
            className={`inline-flex h-10 w-10 shrink-0 items-center justify-center border transition-colors ${
              listening
                ? "border-[#F96302] bg-[#F96302]/10 text-[#F96302]"
                : "border-line text-muted hover:border-[#F96302] hover:text-[#F96302]"
            }`}
          >
            <Mic className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
        {busy ? (
          <button
            type="button"
            onClick={stop}
            aria-label="Stop"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center bg-ink text-card"
          >
            <Square className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            aria-label="Send"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center bg-[#F96302] text-white transition-colors hover:bg-[#e05602] disabled:opacity-40"
          >
            <Send className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
      </form>
      <p className="mt-2 text-xs text-faint">
        Grounded in your live pricebook and customer data. Double-check prices before quoting.
      </p>
    </div>
  );
}

function Message({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";
  const text = message.parts.flatMap((p) => (p.type === "text" ? [p.text] : [])).join("");
  const toolTypes = message.parts.map((p) => p.type).filter((t) => t.startsWith("tool-"));

  return (
    <div className={isUser ? "flex justify-end" : ""}>
      <div
        className={
          isUser
            ? "max-w-[85%] border border-[#F96302]/30 bg-[#F96302]/5 px-4 py-2.5"
            : "max-w-[92%]"
        }
      >
        {!isUser && toolTypes.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {toolTypes.map((t, i) => (
              <span
                key={`${t}-${i}`}
                className="inline-flex items-center gap-1 bg-raised px-2 py-1 text-xs text-muted"
              >
                <Sparkles className="h-3 w-3 text-[#F96302]" aria-hidden="true" />
                {TOOL_LABEL[t] ?? "Looked it up"}
              </span>
            ))}
          </div>
        )}
        {text &&
          (isUser ? (
            // The operator's own words go through verbatim — no reason to
            // reinterpret asterisks they typed.
            <div className="whitespace-pre-wrap text-base leading-relaxed text-ink">{text}</div>
          ) : (
            <RichText text={text} />
          ))}
      </div>
    </div>
  );
}

/** A spoken turn. Marked so the operator can tell it came from the call. */
function VoiceMessage({ turn }: { turn: VoiceTurn }) {
  const isOperator = turn.role === "operator";

  return (
    <div className={isOperator ? "flex justify-end" : ""}>
      <div
        className={
          isOperator
            ? "max-w-[85%] border border-[#F96302]/30 bg-[#F96302]/5 px-4 py-2.5"
            : "max-w-[92%]"
        }
      >
        <p className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-faint">
          <AudioLines className="h-3 w-3" aria-hidden="true" />
          {isOperator ? "You · spoken" : "Lisa · spoken"}
        </p>
        <div className="text-base leading-relaxed text-ink">{turn.text}</div>
      </div>
    </div>
  );
}

function EmptyState({
  suggestions,
  onPick,
}: {
  suggestions: string[];
  onPick: (t: string) => void;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center bg-[#F96302]/10 text-[#F96302]">
        <Sparkles className="h-6 w-6" aria-hidden="true" />
      </div>
      <h2 className="font-display text-2xl font-black uppercase tracking-tight text-ink">
        Ask the assistant
      </h2>
      <p className="mt-2 max-w-md text-sm text-muted">
        Pricing, job duration, scope of work, parts, or anything about a customer or job —
        grounded in your live data.
      </p>
      <div className="mt-6 grid w-full max-w-xl grid-cols-1 gap-2 sm:grid-cols-2">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onPick(s)}
            className="border border-line bg-card px-4 py-3 text-left text-sm text-ink transition-colors hover:border-[#F96302] hover:text-[#F96302]"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
