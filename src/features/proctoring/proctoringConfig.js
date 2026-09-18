/**
 * Configuration defaults for lightweight browser proctoring
 */

export const defaultProctoringConfig = Object.freeze({
  // Face Detection (MediaPipe BlazeFace)
  faceDetection: {
    enabled: true,
    processIntervalMs: 280, // ~3.5 FPS for minimal CPU load
    minFaceGracePeriodMs: 3500, // 3.5s grace before recording FACE_NOT_DETECTED
    minDetectionConfidence: 0.55,
  },

  // Fullscreen Monitoring
  fullscreen: {
    enabled: true,
    required: true,
    reenterPromptDelayMs: 1000,
  },

  // Tab / Page Visibility Monitoring
  tabVisibility: {
    enabled: true,
  },

  // Window Focus / Blur
  windowFocus: {
    enabled: true,
  },

  // Browser Restrictions (Clipboard & Devtools shortcuts)
  restrictions: {
    blockCopy: true,
    blockPaste: true,
    blockCut: true,
    blockContextMenu: true,
    blockDevtoolsKeys: true,
    enableBeforeUnloadWarning: true,
  },

  // Event Deduplication & Cooldowns
  eventCooldownMs: 5000, // Do not spam identical events within 5 seconds

  // Batching & Network
  batchFlushIntervalMs: 4000, // Send queued events every 4 seconds or on unload
  maxBufferedEvents: 50,
});
