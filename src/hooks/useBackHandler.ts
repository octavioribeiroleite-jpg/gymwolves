import { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * Handles hardware/browser back button.
 * - On non-home pages: navigates back normally.
 * - On home ("/"):  shows exit confirmation dialog.
 */
export const useBackHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showExitDialog, setShowExitDialog] = useState(false);

  const isHome = location.pathname === "/";

  useEffect(() => {
    if (!isHome) return;

    // Push a dummy state so we can intercept the back button
    window.history.pushState({ exitGuard: true }, "");

    const handlePopState = (e: PopStateEvent) => {
      // When on home and user presses back, show exit dialog
      setShowExitDialog(true);
      // Re-push so we stay on the page
      window.history.pushState({ exitGuard: true }, "");
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isHome]);

  const confirmExit = useCallback(() => {
    setShowExitDialog(false);
    // Go back twice: once for our dummy state, once for actual back
    window.history.go(-2);
  }, []);

  const cancelExit = useCallback(() => {
    setShowExitDialog(false);
  }, []);

  return { showExitDialog, confirmExit, cancelExit };
};
