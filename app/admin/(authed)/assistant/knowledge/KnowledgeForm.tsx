import type { KnowledgeDoc } from "@/lib/assistant/knowledge";

const inputCls =
  "w-full border border-line bg-card px-3 py-2.5 text-base text-ink outline-none placeholder:text-faint focus:border-[#F96302]";
const labelCls = "mb-1 block text-xs font-bold uppercase tracking-[0.12em] text-muted";

/** Create or edit a knowledge doc. Posts to /api/admin/assistant/knowledge. */
export function KnowledgeForm({ doc }: { doc?: KnowledgeDoc | null }) {
  return (
    <form
      action="/api/admin/assistant/knowledge"
      method="POST"
      className="space-y-4 border border-line bg-card p-4 md:p-5"
    >
      {doc && <input type="hidden" name="id" value={doc.id} />}
      <label className="block">
        <span className={labelCls}>Title *</span>
        <input
          name="title"
          required
          defaultValue={doc?.title ?? ""}
          placeholder="e.g. After-hours & weekend rates"
          className={inputCls}
        />
      </label>
      <label className="block">
        <span className={labelCls}>Category</span>
        <input
          name="category"
          defaultValue={doc?.category ?? ""}
          placeholder="e.g. Pricing, Warranty, Policy"
          className={inputCls}
        />
      </label>
      <label className="block">
        <span className={labelCls}>Content *</span>
        <textarea
          name="body"
          required
          rows={10}
          defaultValue={doc?.body ?? ""}
          placeholder="What should the assistant know? Plain language is fine — e.g. 'After-hours calls (after 6pm or weekends) are billed at 1.5× the standard rate.'"
          className={`${inputCls} resize-y leading-relaxed`}
        />
      </label>
      <label className="flex items-center gap-3 text-sm text-muted">
        <input
          type="checkbox"
          name="active"
          defaultChecked={doc?.active ?? true}
          className="h-5 w-5 accent-[#F96302]"
        />
        Active (the assistant uses it)
      </label>
      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex items-center bg-[#F96302] px-5 py-3 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-[#e05602]"
        >
          {doc ? "Save changes" : "Add knowledge"}
        </button>
      </div>
    </form>
  );
}
