import { useEffect } from "react";

const CHECKIN_EVENT = "gymwolves:open-checkin";

export interface CheckinOpenDetail {
  date?: Date;
}

/** Dispatch from BottomNav or anywhere to open the check-in dialog */
export function dispatchCheckinOpen(detail?: CheckinOpenDetail) {
  window.dispatchEvent(new CustomEvent<CheckinOpenDetail>(CHECKIN_EVENT, { detail: detail || {} }));
}

/** Listen in the page that owns the CheckinDialog */
export function useCheckinEvent(handler: (detail: CheckinOpenDetail) => void) {
  useEffect(() => {
    const listener = (e: Event) => {
      const ce = e as CustomEvent<CheckinOpenDetail>;
      handler(ce.detail || {});
    };
    window.addEventListener(CHECKIN_EVENT, listener);
    return () => window.removeEventListener(CHECKIN_EVENT, listener);
  }, [handler]);
}
