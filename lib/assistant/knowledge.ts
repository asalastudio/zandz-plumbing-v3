import { isSupabaseConfigured, supabase } from "@/lib/supabase";

// Small curated corpus → injected whole into the system prompt. If it ever
// grows past this budget, switch to a searchKnowledge() tool instead.
const MAX_CHARS = 40_000;

/**
 * Active company knowledge docs (policies, warranty terms, pricing rules, the
 * operator SOP, etc.), concatenated for system-prompt injection. Returns "" if
 * the table doesn't exist yet, so the assistant works before the knowledge
 * migration is applied.
 */
export async function getKnowledgeForPrompt(): Promise<string> {
  if (!isSupabaseConfigured()) return "";
  try {
    const { data, error } = await supabase()
      .from("knowledge_docs")
      .select("title, body")
      .eq("active", true)
      .order("title", { ascending: true });
    if (error || !data) return "";

    let out = "";
    for (const doc of data as { title: string; body: string }[]) {
      const block = `### ${doc.title}\n${doc.body}\n\n`;
      if (out.length + block.length > MAX_CHARS) break;
      out += block;
    }
    return out.trim();
  } catch {
    return "";
  }
}

// ── Management helpers (for the admin knowledge CRUD) ──

export interface KnowledgeDoc {
  id: number;
  title: string;
  body: string;
  category: string | null;
  active: boolean;
  updated_at: string;
}

/** All knowledge docs for the management UI. Returns [] if the table isn't
 *  created yet so the page can show a "run migration 011" hint. */
export async function listKnowledgeDocs(): Promise<KnowledgeDoc[]> {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase()
    .from("knowledge_docs")
    .select("id, title, body, category, active, updated_at")
    .order("updated_at", { ascending: false });
  if (error || !data) return [];
  return data as KnowledgeDoc[];
}

export async function getKnowledgeDoc(id: number): Promise<KnowledgeDoc | null> {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase()
    .from("knowledge_docs")
    .select("id, title, body, category, active, updated_at")
    .eq("id", id)
    .maybeSingle();
  if (error) return null;
  return (data as KnowledgeDoc) ?? null;
}
