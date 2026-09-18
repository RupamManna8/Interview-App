/**
 * Deprecated: Heavy frame capture and WebSocket streaming to port 8000
 * has been replaced by browser-based MediaPipe detection in `src/features/proctoring/`.
 */

export function startProctoringCapture() {
  return {
    stop: () => {},
    close: () => {},
  };
}

export function stopProctoringCapture() {}
