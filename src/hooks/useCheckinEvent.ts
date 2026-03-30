import { useCallback, useEffect, useState } from "react";

const CHECKIN_EVENT = "gymwolves:open-checkin";

/** Dispatch from BottomNav or anywhere to open the check-in dialog */
export function dispatchCheckinOpen() {
  window.dispatchEvent(new CustomEvent(CHECKIN_EVENT));
}

/** Listen in the page that owns the CheckinDialog */
export function useCheckinEvent(handler: () => void) {
  useEffect(() => {
    const listener = () => handler();
    window.addEventListener(CHECKIN_EVENT, listener);
    return () => window.removeEventListener(CHECKIN_EVENT, listener);
  }, [handler]);
}
