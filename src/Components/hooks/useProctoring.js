import { useEffect, useRef, useState, useCallback } from "react";

const MAX_WARNINGS = 5;

export const useProctoring = ({
  cameraStream,
  onDisqualify,
  enabled,
}) => {
  const warningRef = useRef(0);
  const tabSwitchRef = useRef(0);
  const disqualifiedRef = useRef(false);

  const [warningCount, setWarningCount] = useState(0);

  /* ---------------- DISQUALIFY ---------------- */

  const disqualify = useCallback(
    (reason) => {
      if (disqualifiedRef.current) return;

      disqualifiedRef.current = true;

      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }

      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }

      onDisqualify(reason);
    },
    [cameraStream, onDisqualify]
  );

  /* ---------------- WARNING ---------------- */

  const registerWarning = useCallback(
    (reason) => {
      if (disqualifiedRef.current || !enabled) return;

      warningRef.current += 1;
      setWarningCount(warningRef.current);

      if (warningRef.current >= MAX_WARNINGS) {
        disqualify(reason);
      }
    },
    [disqualify, enabled]
  );

  /* ---------------- EFFECT ---------------- */

  useEffect(() => {
    if (!enabled) {
      // reset everything when disabled
      warningRef.current = 0;
      tabSwitchRef.current = 0;
      disqualifiedRef.current = false;
      setWarningCount(0);
      return;
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        tabSwitchRef.current += 1;

        if (tabSwitchRef.current >= 3) {
          registerWarning("Multiple tab switches detected");
        }
      }
    };

    const handleKeyDown = (e) => {
      const blocked = ["Escape", "F11", "F12"];

      if (blocked.includes(e.key)) {
        e.preventDefault();
        registerWarning(`Restricted key: ${e.key}`);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled, registerWarning]);

  return {
    warningCount,
  };
};
