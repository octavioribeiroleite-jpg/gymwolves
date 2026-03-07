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
 * Creates a signed URL for a file in the checkin-photos bucket.
 * Handles both old full public URLs and new path-only values.
 * Returns null if the input is falsy or signing fails.
 */
export async function getSignedImageUrl(urlOrPath: string | null | undefined): Promise<string | null> {
  if (!urlOrPath) return null;
  const path = extractStoragePath(urlOrPath);
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 3600); // 1 hour
  if (error) {
    console.warn("Failed to create signed URL for", path, error.message);
    return null;
  }
  return data.signedUrl;
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
