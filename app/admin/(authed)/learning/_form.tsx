import type { LearningResource } from "@/lib/db";

interface Props {
  action: string;
  categories: { value: string; label: string }[];
  resource?: LearningResource | null;
  submitLabel: string;
}

export function LearningResourceForm({ action, categories, resource, submitLabel }: Props) {
  return (
    <form action={action} method="POST" className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <Field label="Type *" full>
        <select
          name="media_type"
          required
          defaultValue={resource?.media_type ?? "video"}
          className="w-full border border-white/15 bg-black px-4 py-3 text-base text-white outline-none focus:border-[#F96302]"
        >
          <option value="video">Video (YouTube link)</option>
          <option value="image">Image (direct image URL)</option>
        </select>
      </Field>

      <Field label="Title *">
        <input
          name="title"
          type="text"
          required
          defaultValue={resource?.title ?? ""}
          placeholder="e.g. How to spot a sewer lateral failure"
          className="w-full border border-white/15 bg-black px-4 py-3 text-base text-white outline-none focus:border-[#F96302]"
        />
      </Field>

      <Field label="Category *">
        <select
          name="category"
          required
          defaultValue={resource?.category ?? "general"}
          className="w-full border border-white/15 bg-black px-4 py-3 text-base text-white outline-none focus:border-[#F96302]"
        >
          {categories.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="URL * (YouTube link or direct image URL)" full>
        <input
          name="url"
          type="url"
          required
          defaultValue={resource?.url ?? ""}
          placeholder="https://www.youtube.com/watch?v=... or https://.../image.jpg"
          className="w-full border border-white/15 bg-black px-4 py-3 text-base text-white outline-none focus:border-[#F96302]"
        />
        <p className="mt-2 text-xs text-white/50">
          For videos: paste any YouTube link (watch, share, or embed). For images: use a direct
          image URL ending in .jpg / .png / .webp.
        </p>
      </Field>

      <Field label="Thumbnail URL (optional, auto-derived for YouTube)" full>
        <input
          name="thumbnail_url"
          type="url"
          defaultValue={resource?.thumbnail_url ?? ""}
          placeholder="https://.../thumbnail.jpg"
          className="w-full border border-white/15 bg-black px-4 py-3 text-base text-white outline-none focus:border-[#F96302]"
        />
      </Field>

      <Field label="Description" full>
        <textarea
          name="description"
          rows={4}
          defaultValue={resource?.description ?? ""}
          placeholder="One or two lines about what the customer will learn."
          className="w-full border border-white/15 bg-black px-4 py-3 text-base text-white outline-none focus:border-[#F96302]"
        />
      </Field>

      <Field label="Sort order (lower = appears first)">
        <input
          name="sort_order"
          type="number"
          step="1"
          defaultValue={resource?.sort_order ?? 0}
          className="w-full border border-white/15 bg-black px-4 py-3 text-base text-white outline-none focus:border-[#F96302]"
        />
      </Field>

      <Field label="Publish now?">
        <label className="inline-flex items-center gap-3 border border-white/15 bg-black px-4 py-3">
          <input
            type="checkbox"
            name="published"
            value="true"
            defaultChecked={resource?.published ?? false}
            className="h-5 w-5 accent-[#F96302]"
          />
          <span className="text-base text-white">Show on /videos/</span>
        </label>
      </Field>

      <div className="md:col-span-2 flex justify-end gap-3">
        <a
          href="/admin/learning"
          className="inline-flex items-center bg-transparent border border-white/15 px-6 py-3 text-sm font-bold uppercase tracking-wide text-white/70 hover:border-[#F96302] hover:text-[#F96302]"
        >
          Cancel
        </a>
        <button
          type="submit"
          className="inline-flex items-center bg-[#F96302] px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-lg hover:bg-[#e05602]"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  children,
  full = false,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <label className="block text-sm font-bold uppercase tracking-[0.12em] text-white/60 mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}
