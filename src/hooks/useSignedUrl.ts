import { getPublicImageUrl } from "@/lib/storage";

/**
 * Returns a public URL for a storage path or public URL.
 * Synchronous — no network call, no flashing.
 */
export function useSignedUrl(urlOrPath: string | null | undefined): string | null {
  return getPublicImageUrl(urlOrPath);
}

/**
 * Returns public URLs for multiple paths. Synchronous.
 */
export function useSignedUrls(urlsOrPaths: (string | null | undefined)[]): (string | null)[] {
  return urlsOrPaths.map((u) => getPublicImageUrl(u));
}
