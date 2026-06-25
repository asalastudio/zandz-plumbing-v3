import Link from "next/link";
import { BookOpen } from "lucide-react";
import ChatBox from "./_components/ChatBox";
import { SUGGESTED_PROMPTS } from "@/lib/assistant/prompt";

export const dynamic = "force-dynamic";
export const metadata = { title: "Assistant · Z and Z OS" };

export default function AssistantPage() {
  return (
    <div className="pb-24 lg:pb-0">
      <header className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F96302]">Assistant</p>
          <h1 className="mt-1 font-display text-3xl font-black uppercase tracking-tight md:text-4xl">
            Ask Z and Z OS
          </h1>
        </div>
        <Link
          href="/admin/assistant/knowledge"
          className="inline-flex shrink-0 items-center gap-2 border border-line bg-card px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-muted transition-colors hover:border-[#F96302] hover:text-[#F96302]"
        >
          <BookOpen className="h-4 w-4" aria-hidden="true" />
          Knowledge
        </Link>
      </header>
      <ChatBox suggestions={SUGGESTED_PROMPTS} />
    </div>
  );
}
