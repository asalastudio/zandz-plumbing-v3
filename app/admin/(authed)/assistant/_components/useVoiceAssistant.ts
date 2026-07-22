"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useConversation } from "@elevenlabs/react";

/**
 * Live voice session with Lisa.
 *
 * One click opens the session and it stays open — the operator talks, Lisa
 * answers, and they can cut her off mid-sentence without touching anything.
 * That barge-in behaviour is the whole reason this runs through ElevenLabs
 * rather than being stitched together from speech-to-text plus playback.
 *
 * Tool calls execute HERE, in the browser, so they travel with the operator's
 * existing admin session cookie. Nothing new is exposed publicly and Lisa can
 * only reach what the signed-in operator could already open.
 */

export type VoiceStatus = "idle" | "connecting" | "live" | "error";

export interface VoiceTurn {
  role: "operator" | "lisa";
  text: string;
}

/** Runs one grounded tool against the shared server implementation. */
async function callTool(tool: string, args: Record<string, unknown>) {
  const res = await fetch("/api/admin/assistant/tool", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ tool, args }),
  });

  const body = await res.json().catch(() => null);

  if (!res.ok || !body?.ok) {
    // Hand the failure back as data. Lisa is instructed to say a lookup failed
    // rather than fill the silence with something invented.
    return {
      error:
        body?.detail ?? body?.error ?? `Lookup failed with status ${res.status}`,
    };
  }
  return body.result;
}

/**
 * Tool names must match the definitions registered on the ElevenLabs agent.
 * The implementations live server-side in lib/assistant/tools.ts — these are
 * only the bridge.
 */
function buildClientTools() {
  const bridge = (name: string) => async (args: Record<string, unknown>) => {
    const result = await callTool(name, args ?? {});
    // The SDK sends the return value straight back to the model, which expects
    // a string.
    return JSON.stringify(result);
  };

  return {
    searchPricebook: bridge("searchPricebook"),
    findCustomer: bridge("findCustomer"),
    getCustomerContext: bridge("getCustomerContext"),
    getJobContext: bridge("getJobContext"),
    getJobMaterials: bridge("getJobMaterials"),
    businessKpis: bridge("businessKpis"),
  };
}

export function useVoiceAssistant(onTurn?: (turn: VoiceTurn) => void) {
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  // Keep the latest callback without re-creating the session on every render.
  const onTurnRef = useRef(onTurn);
  useEffect(() => {
    onTurnRef.current = onTurn;
  }, [onTurn]);

  const conversation = useConversation({
    onConnect: () => setStatus("live"),
    onDisconnect: () => setStatus("idle"),
    onMessage: (msg: { message?: string; source?: string }) => {
      if (!msg?.message) return;
      onTurnRef.current?.({
        role: msg.source === "user" ? "operator" : "lisa",
        text: msg.message,
      });
    },
    onError: (e: unknown) => {
      console.error("[voice] session error", e);
      setError(typeof e === "string" ? e : "The voice session dropped.");
      setStatus("error");
    },
  });

  const start = useCallback(async () => {
    setError(null);
    setStatus("connecting");

    try {
      // Ask before connecting so a denied mic reads as a clear message rather
      // than a session that silently never hears anything.
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError("Microphone access is blocked. Allow it in your browser settings.");
      setStatus("error");
      return;
    }

    try {
      const res = await fetch("/api/admin/assistant/voice-session");
      if (res.status === 503) {
        setError("Voice is not configured yet. ELEVENLABS_API_KEY is missing.");
        setStatus("error");
        return;
      }
      if (!res.ok) throw new Error(`session request failed (${res.status})`);

      const { signedUrl } = (await res.json()) as { signedUrl: string };

      await conversation.startSession({
        signedUrl,
        clientTools: buildClientTools(),
      });
    } catch (e) {
      console.error("[voice] could not start", e);
      setError("Could not start the voice session. Try again.");
      setStatus("error");
    }
  }, [conversation]);

  const stop = useCallback(async () => {
    try {
      await conversation.endSession();
    } finally {
      setStatus("idle");
    }
  }, [conversation]);

  return {
    status,
    error,
    /** True while Lisa is talking, so the UI can show she can be interrupted. */
    speaking: conversation.isSpeaking,
    start,
    stop,
  };
}
