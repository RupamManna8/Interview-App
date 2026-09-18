import { useEffect, useRef, useState, useCallback } from "react";

export const useInterviewSecurity = ({
  enabled = true,
  fullscreenRequired = true,
  maxWarnings = 5,
  onDisqualify,
  cameraWarningMessage,
  setCameraWarningMessage // ✅ only message needed
}) => {
  const [warningCount, setWarningCount] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [lastViolation, setLastViolation] = useState(null);

  const fullScreenRef = useRef(null);
  const devtoolsIntervalRef = useRef(null);

  // 🔥 NEW: control spam
  const lastTriggerTimeRef = useRef(0);
  const lastCameraWarningRef = useRef(null);

  // Copy-paste tracking
  const lastCopiedContentRef = useRef(null);
  const lastCopyTimeRef = useRef(0);
  const COPY_TIMEOUT = 5000;

  // ===============================
  // SAFE DISQUALIFY
  // ===============================
  const safeDisqualify = useCallback(
    (reason) => {
      if (typeof onDisqualify === "function") {
        onDisqualify(reason);
      }
    },
    [onDisqualify]
  );

  // ===============================
  // TRIGGER WARNING (DEBOUNCED)
  // ===============================
  const triggerWarning = useCallback(
    (reason) => {
      const now = Date.now();

      // ⛔ Prevent spam (1.5 sec cooldown)
      if (now - lastTriggerTimeRef.current < 1500) return;

      lastTriggerTimeRef.current = now;

      setLastViolation(reason);

      setWarningCount((prev) => {
        const next = prev + 1;

        if (next >= maxWarnings) {
          safeDisqualify(reason);
        }

        return next;
      });
    },
    [maxWarnings, safeDisqualify]
  );

  // ===============================
  // CAMERA WARNING INTEGRATION (FIXED)
  // ===============================
  useEffect(() => {
    if (!cameraWarningMessage) return;

    // 🚫 prevent duplicate same message
    if (lastCameraWarningRef.current === cameraWarningMessage) return;

    lastCameraWarningRef.current = cameraWarningMessage;

    triggerWarning(cameraWarningMessage);
    setCameraWarningMessage("");
  }, [cameraWarningMessage, triggerWarning]);

  // ===============================
  // FULLSCREEN CONTROL
  // ===============================
  const requestFullScreen = useCallback(async () => {
    const element = fullScreenRef.current || document.documentElement;

    try {
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        await element.webkitRequestFullscreen();
      } else if (element.msRequestFullscreen) {
        await element.msRequestFullscreen();
      }

      setIsFullScreen(true);
      return true;
    } catch (err) {
      console.error("Fullscreen failed:", err);
      return false;
    }
  }, []);

  const exitFullScreen = useCallback(() => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
    setIsFullScreen(false);
  }, []);

  // ===============================
  // MAIN SECURITY EFFECT
  // ===============================
  useEffect(() => {
    if (!enabled) return;

    // -------------------------------
    // TAB SWITCH
    // -------------------------------
    const handleVisibility = () => {
      if (document.hidden) {
        triggerWarning("Tab switch detected");
      }
    };

    // -------------------------------
    // FULLSCREEN EXIT
    // -------------------------------
    const handleFullScreenChange = () => {
      const isNowFull = !!document.fullscreenElement;
      setIsFullScreen(isNowFull);

      if (fullscreenRequired && !isNowFull) {
        triggerWarning("Exited fullscreen");

        setTimeout(() => {
          requestFullScreen();
        }, 1000);
      }
    };

    // -------------------------------
    // WINDOW BLUR
    // -------------------------------
    const handleBlur = () => {
      if (document.fullscreenElement) {
        triggerWarning("Window lost focus");
      }
    };

    // -------------------------------
    // KEY BLOCKING
    // -------------------------------
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        triggerWarning("Escape pressed");
        return;
      }

      const blocked =
        e.key.startsWith("F") ||
        e.key === "Tab" ||
        (e.ctrlKey && ["x", "a", "u"].includes(e.key.toLowerCase())) ||
        (e.ctrlKey && e.shiftKey && ["i", "j", "c"].includes(e.key.toLowerCase())) ||
        (e.ctrlKey && e.key.toLowerCase() === "w");

      if (blocked) {
        e.preventDefault();
        e.stopPropagation();
        triggerWarning(`Blocked key: ${e.key}`);
      }
    };

    // -------------------------------
    // COPY
    // -------------------------------
    const handleCopy = () => {
      const selection = window.getSelection().toString();
      if (selection) {
        lastCopiedContentRef.current = selection;
        lastCopyTimeRef.current = Date.now();
      }
    };

    // -------------------------------
    // PASTE (SMART)
    // -------------------------------
    const handlePaste = (e) => {
      const clipboardData = e.clipboardData.getData("text");

      const isFromSameTab =
        lastCopiedContentRef.current &&
        clipboardData === lastCopiedContentRef.current &&
        Date.now() - lastCopyTimeRef.current < COPY_TIMEOUT;

      if (!isFromSameTab) {
        e.preventDefault();
        triggerWarning("External paste blocked");
      } else {
        lastCopiedContentRef.current = null;
      }
    };

    // -------------------------------
    // CUT
    // -------------------------------
    const handleCut = () => {
      const selection = window.getSelection().toString();
      if (selection) {
        lastCopiedContentRef.current = selection;
        lastCopyTimeRef.current = Date.now();
      }
    };

    // -------------------------------
    // DEVTOOLS DETECTION
    // -------------------------------
    devtoolsIntervalRef.current = setInterval(() => {
      const threshold = 160;

      if (
        window.outerWidth - window.innerWidth > threshold ||
        window.outerHeight - window.innerHeight > threshold
      ) {
        triggerWarning("DevTools detected");
      }
    }, 2000);

    // -------------------------------
    // EVENT LISTENERS
    // -------------------------------
    document.addEventListener("visibilitychange", handleVisibility);
    document.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);
    document.addEventListener("cut", handleCut);

    document.addEventListener("fullscreenchange", handleFullScreenChange);
    window.addEventListener("blur", handleBlur);

    // -------------------------------
    // CLEANUP
    // -------------------------------
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      document.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
      document.removeEventListener("cut", handleCut);

      document.removeEventListener("fullscreenchange", handleFullScreenChange);
      window.removeEventListener("blur", handleBlur);

      if (devtoolsIntervalRef.current) {
        clearInterval(devtoolsIntervalRef.current);
      }
    };
  }, [enabled, fullscreenRequired, triggerWarning, requestFullScreen]);

  return {
    warningCount,
    isFullScreen,
    requestFullScreen,
    exitFullScreen,
    fullScreenRef,
    lastViolation,
    triggerWarning, // 🔥 expose for direct use (important)
  };
};