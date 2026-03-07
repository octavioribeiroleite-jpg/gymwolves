import { useState, useEffect } from "react";
import { getSignedImageUrl } from "@/lib/storage";

/**
 * React hook that resolves a storage path or public URL to a signed URL.
 * Caches the result for the lifetime of the component.
 */
export function useSignedUrl(urlOrPath: string | null | undefined): string | null {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!urlOrPath) {
      setSignedUrl(null);
      return;
    }
    let cancelled = false;
    getSignedImageUrl(urlOrPath).then((url) => {
      if (!cancelled) setSignedUrl(url);
    });
    return () => { cancelled = true; };
  }, [urlOrPath]);

  return signedUrl;
}

/**
 * Hook that resolves multiple URLs/paths to signed URLs.
 */
export function useSignedUrls(urlsOrPaths: (string | null | undefined)[]): (string | null)[] {
  const [signedUrls, setSignedUrls] = useState<(string | null)[]>([]);

  useEffect(() => {
    let cancelled = false;
    Promise.all(urlsOrPaths.map((u) => getSignedImageUrl(u))).then((urls) => {
      if (!cancelled) setSignedUrls(urls);
    });
    return () => { cancelled = true; };
  }, [JSON.stringify(urlsOrPaths)]);

  return signedUrls;
}
