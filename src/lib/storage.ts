import { supabase } from "@/integrations/supabase/client";

const BUCKET = "checkin-photos";
const PUBLIC_PREFIX_REGEX = /\/storage\/v1\/object\/public\/checkin-photos\//;

/**
 * Extracts the storage path from a full public URL or returns the path as-is.
 */
export function extractStoragePath(urlOrPath: string): string {
  if (PUBLIC_PREFIX_REGEX.test(urlOrPath)) {
    return urlOrPath.split(PUBLIC_PREFIX_REGEX)[1];
  }
  return urlOrPath;
}

/**
 * Returns a public URL for a file in the checkin-photos bucket.
 * Synchronous — no network call needed.
 */
export function getPublicImageUrl(urlOrPath: string | null | undefined): string | null {
  if (!urlOrPath) return null;
  const path = extractStoragePath(urlOrPath);
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * @deprecated Use getPublicImageUrl instead. Kept for backward compatibility.
 */
export async function getSignedImageUrl(urlOrPath: string | null | undefined): Promise<string | null> {
  return getPublicImageUrl(urlOrPath);
}

/**
 * Uploads a file to checkin-photos and returns the storage path (NOT the full URL).
 */
export async function uploadToStorage(file: File, userId: string, prefix = ""): Promise<string | null> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${userId}/${prefix}${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file);
  if (error) {
    console.error("Upload failed:", error.message);
    return null;
  }
  return path;
}
