import { Buffer } from "node:buffer";
import { randomUUID } from "node:crypto";
import { supabase } from "@/lib/supabase";

export type JobPhotoCategory = "before" | "after" | "failure" | "permit" | "invoice" | "other";

export interface JobPhoto {
  id: number;
  job_id: number;
  blob_url: string;
  caption: string | null;
  category: JobPhotoCategory | null;
  taken_at: string;
  taken_by: number | null;
}

export interface JobPhotoWithUrl extends JobPhoto {
  signedUrl: string | null;
}

const DEFAULT_BUCKET = "job-photos";
const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
const SIGNED_URL_TTL_SECONDS = 60 * 60;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

export function jobPhotoBucket(): string {
  return process.env.SUPABASE_JOB_PHOTOS_BUCKET || DEFAULT_BUCKET;
}

export function isUploadablePhoto(file: File | null | undefined): file is File {
  return Boolean(file && file.size > 0);
}

export async function saveJobPhoto({
  jobId,
  file,
  category = "other",
  caption,
  takenBy,
}: {
  jobId: number;
  file: File;
  category?: JobPhotoCategory;
  caption?: string | null;
  takenBy?: number | null;
}): Promise<JobPhoto> {
  validatePhoto(file);

  const sb = supabase();
  const bucket = jobPhotoBucket();
  await ensurePhotoBucket(bucket);

  const extension = extensionFor(file);
  const path = `job-${jobId}/${Date.now()}-${randomUUID()}.${extension}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  const { data: upload, error: uploadError } = await sb.storage
    .from(bucket)
    .upload(path, bytes, {
      contentType: file.type || "application/octet-stream",
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) throw new Error(`photo upload: ${uploadError.message}`);

  const { data: row, error: insertError } = await sb
    .from("job_photos")
    .insert({
      job_id: jobId,
      blob_url: upload.path,
      caption: caption?.trim() || null,
      category,
      taken_by: takenBy ?? null,
    })
    .select("*")
    .single();

  if (insertError) throw new Error(`photo record: ${insertError.message}`);
  return row as JobPhoto;
}

export async function listJobPhotos(jobId: number): Promise<JobPhotoWithUrl[]> {
  const sb = supabase();
  const { data, error } = await sb
    .from("job_photos")
    .select("*")
    .eq("job_id", jobId)
    .order("taken_at", { ascending: false });

  if (error) throw new Error(`listJobPhotos: ${error.message}`);

  const rows = (data ?? []) as JobPhoto[];
  return Promise.all(
    rows.map(async (photo) => ({
      ...photo,
      signedUrl: await signedUrlFor(photo.blob_url),
    }))
  );
}

async function signedUrlFor(blobUrl: string): Promise<string | null> {
  if (!blobUrl) return null;
  if (/^https?:\/\//.test(blobUrl)) return blobUrl;

  const { data, error } = await supabase()
    .storage
    .from(jobPhotoBucket())
    .createSignedUrl(blobUrl, SIGNED_URL_TTL_SECONDS);

  if (error) {
    console.error("[jobPhotos.signedUrl]", error);
    return null;
  }

  return data.signedUrl;
}

async function ensurePhotoBucket(bucket: string): Promise<void> {
  const sb = supabase();
  const { error: getError } = await sb.storage.getBucket(bucket);
  if (!getError) return;

  const { error: createError } = await sb.storage.createBucket(bucket, {
    public: false,
    allowedMimeTypes: Array.from(ALLOWED_TYPES),
    fileSizeLimit: MAX_PHOTO_BYTES,
  });

  if (
    createError &&
    !/already exists|duplicate/i.test(createError.message)
  ) {
    throw new Error(`photo bucket: ${createError.message}`);
  }
}

function validatePhoto(file: File): void {
  if (file.size > MAX_PHOTO_BYTES) {
    throw new Error("Photo must be 8MB or smaller.");
  }

  const type = file.type.toLowerCase();
  if (type && !ALLOWED_TYPES.has(type) && !type.startsWith("image/")) {
    throw new Error("Please upload an image file.");
  }
}

function extensionFor(file: File): string {
  const fromName = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (fromName && fromName.length <= 5) return fromName;

  switch (file.type) {
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/heic":
      return "heic";
    case "image/heif":
      return "heif";
    default:
      return "jpg";
  }
}
