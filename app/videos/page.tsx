import type { Metadata } from "next";
import Link from "next/link";
import { Phone, Play, Image as ImageIcon } from "lucide-react";
import { Section, SectionHeading } from "@/components/Section";
import { Button } from "@/components/Button";
import { TrustStrip } from "@/components/TrustStrip";
import { isSupabaseConfigured } from "@/lib/supabase";
import {
  listLearningResources,
  LEARNING_CATEGORIES,
  extractYouTubeId,
  youtubeEmbedUrl,
  youtubeThumbnailUrl,
  type LearningResource,
} from "@/lib/db";
import { siteSettings } from "@/content/site-settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Plumbing Videos & Guides | Z and Z Plumbing",
  description:
    "Plumbing videos, photo guides, and quick how-tos from Z and Z Plumbing. Sewer lateral, water heater, emergency, and maintenance tips for East Bay homeowners.",
  alternates: { canonical: `${siteSettings.siteUrl}/videos/` },
  openGraph: {
    title: "Plumbing Videos & Guides | Z and Z Plumbing",
    description:
      "Videos and photo guides from a licensed East Bay plumber. Sewer lateral, water heater, emergency, maintenance.",
    url: `${siteSettings.siteUrl}/videos/`,
    type: "website",
  },
};

async function loadVideos(): Promise<LearningResource[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    return await listLearningResources({ publishedOnly: true });
  } catch {
    return [];
  }
}

export default async function VideosPage() {
  const resources = await loadVideos();

  // Group by category for display
  const grouped = new Map<string, LearningResource[]>();
  for (const cat of LEARNING_CATEGORIES) {
    grouped.set(cat.value, []);
  }
  for (const r of resources) {
    if (!grouped.has(r.category)) grouped.set(r.category, []);
    grouped.get(r.category)!.push(r);
  }
  const nonEmpty = LEARNING_CATEGORIES.filter(
    (c) => (grouped.get(c.value) ?? []).length > 0
  );

  return (
    <>
      {/* Hero */}
      <Section bg="black" size="lg">
        <nav
          aria-label="Breadcrumb"
          className="mb-6 text-xs font-bold uppercase tracking-[0.12em] text-white/50"
        >
          <Link href="/" className="hover:text-[#F96302]">
            Home
          </Link>
          <span className="mx-2 text-white/30">/</span>
          <span className="text-white">Videos</span>
        </nav>
        <p className="font-sans text-xs font-bold uppercase tracking-[0.12em] text-[#F96302] mb-4">
          Plumbing Videos & Guides
        </p>
        <h1 className="max-w-4xl font-display text-5xl md:text-7xl font-black uppercase leading-none tracking-tight text-white">
          Plumbing, Explained.
        </h1>
        <p className="mt-6 max-w-2xl font-sans text-xl leading-relaxed text-white/80 md:text-2xl">
          Short videos and photo guides from Z and Z. Real jobs, real fixes, no fluff.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button
            variant="primary"
            size="lg"
            href={`tel:${siteSettings.phoneTel}`}
            icon={<Phone className="h-5 w-5" />}
            external
          >
            Call {siteSettings.phone}
          </Button>
          <Button variant="inverse" size="lg" href="/contact/">
            Schedule Service
          </Button>
        </div>
      </Section>

      {/* Content */}
      {resources.length === 0 ? (
        <Section bg="white" size="lg" narrow>
          <div className="border border-dashed border-[#E5E5E5] bg-[#F5F5F5] px-8 py-16 text-center">
            <Play className="mx-auto h-10 w-10 text-[#F96302]" strokeWidth={1.5} aria-hidden="true" />
            <p className="mt-4 font-display text-2xl font-black uppercase leading-tight tracking-tight text-black md:text-3xl">
              Videos coming soon.
            </p>
            <p className="mt-3 max-w-xl mx-auto text-base leading-relaxed text-[#333333] md:text-lg">
              We are recording short, useful videos covering the work we do every day. Subscribe by
              giving us a call. In the meantime, our service pages have what you need.
            </p>
            <div className="mt-6 flex justify-center">
              <Button
                variant="primary"
                size="lg"
                href={`tel:${siteSettings.phoneTel}`}
                icon={<Phone className="h-5 w-5" />}
                external
              >
                Call {siteSettings.phone}
              </Button>
            </div>
          </div>
        </Section>
      ) : (
        nonEmpty.map((cat) => {
          const list = grouped.get(cat.value) ?? [];
          return (
            <Section
              key={cat.value}
              bg={cat.value === nonEmpty[0]?.value ? "white" : "light-gray"}
              size="lg"
            >
              <SectionHeading eyebrow={cat.label} title={cat.label} />
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {list.map((r) => (
                  <ResourceCard key={r.id} resource={r} />
                ))}
              </div>
            </Section>
          );
        })
      )}

      {/* Trust strip */}
      <Section bg="white" size="md">
        <SectionHeading eyebrow="Credentials" title="Licensed for the Whole Job." />
        <TrustStrip />
      </Section>

      {/* CTA band */}
      <Section bg="hero-orange" size="md">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-4xl font-black uppercase leading-tight text-white md:text-5xl">
              Got a real plumbing problem?
            </h2>
            <p className="mt-3 max-w-2xl font-sans text-lg text-white/90 md:text-xl">
              Call us. A plumber answers. Same-day service across the East Bay.
            </p>
          </div>
          <Button
            variant="inverse"
            size="lg"
            href={`tel:${siteSettings.phoneTel}`}
            icon={<Phone className="h-5 w-5" />}
            external
          >
            {siteSettings.phone}
          </Button>
        </div>
      </Section>
    </>
  );
}

function ResourceCard({ resource }: { resource: LearningResource }) {
  if (resource.media_type === "video") {
    const ytId = extractYouTubeId(resource.url);
    if (ytId) {
      return <VideoCard resource={resource} videoId={ytId} />;
    }
  }

  return <ImageCard resource={resource} />;
}

function VideoCard({ resource, videoId }: { resource: LearningResource; videoId: string }) {
  const thumb = resource.thumbnail_url ?? youtubeThumbnailUrl(videoId);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#E5E5E5] bg-white transition-all duration-200 hover:-translate-y-1 hover:border-[#F96302] hover:shadow-lg">
      <details className="contents">
        <summary className="relative block aspect-video cursor-pointer bg-black list-none [&::-webkit-details-marker]:hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumb}
            alt={resource.title}
            className="h-full w-full object-cover transition-opacity duration-200 group-hover:opacity-90"
          />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-16 w-16 items-center justify-center bg-[#F96302] text-white shadow-lg transition-transform duration-200 group-hover:scale-110">
              <Play className="h-7 w-7 ml-1" fill="white" aria-hidden="true" />
            </span>
          </span>
        </summary>
        <iframe
          src={youtubeEmbedUrl(videoId)}
          title={resource.title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="aspect-video w-full border-0"
        />
      </details>
      <div className="flex flex-1 flex-col p-6 md:p-7">
        <h3 className="font-display text-2xl font-black uppercase leading-tight tracking-tight text-black md:text-3xl">
          {resource.title}
        </h3>
        {resource.description && (
          <p className="mt-3 text-lg leading-relaxed text-[#333333]">{resource.description}</p>
        )}
      </div>
    </article>
  );
}

function ImageCard({ resource }: { resource: LearningResource }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#E5E5E5] bg-white transition-all duration-200 hover:-translate-y-1 hover:border-[#F96302] hover:shadow-lg">
      <div className="relative aspect-video bg-[#F5F5F5]">
        {resource.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={resource.url} alt={resource.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ImageIcon className="h-12 w-12 text-[#E5E5E5]" aria-hidden="true" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6 md:p-7">
        <h3 className="font-display text-2xl font-black uppercase leading-tight tracking-tight text-black md:text-3xl">
          {resource.title}
        </h3>
        {resource.description && (
          <p className="mt-3 text-lg leading-relaxed text-[#333333]">{resource.description}</p>
        )}
      </div>
    </article>
  );
}
