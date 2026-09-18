/**
 * Standardized Proctoring Events & Severities
 */

export const ProctoringEventTypes = Object.freeze({
  FACE_NOT_DETECTED: "FACE_NOT_DETECTED",
  MULTIPLE_FACES: "MULTIPLE_FACES",
  FULLSCREEN_EXIT: "FULLSCREEN_EXIT",
  FULLSCREEN_ENTER: "FULLSCREEN_ENTER",
  TAB_SWITCH: "TAB_SWITCH",
  PAGE_HIDDEN: "PAGE_HIDDEN",
  PAGE_VISIBLE: "PAGE_VISIBLE",
  WINDOW_BLUR: "WINDOW_BLUR",
  WINDOW_FOCUS: "WINDOW_FOCUS",
  COPY_ATTEMPT: "COPY_ATTEMPT",
  PASTE_ATTEMPT: "PASTE_ATTEMPT",
  CUT_ATTEMPT: "CUT_ATTEMPT",
  CONTEXT_MENU_ATTEMPT: "CONTEXT_MENU_ATTEMPT",
  INTERVIEW_EXIT: "INTERVIEW_EXIT",
  CAMERA_DISCONNECTED: "CAMERA_DISCONNECTED",
  MICROPHONE_DISCONNECTED: "MICROPHONE_DISCONNECTED",
  DEVICE_ISSUE: "DEVICE_ISSUE",
});

export const ProctoringSeverity = Object.freeze({
  INFO: "INFO",
  WARNING: "WARNING",
  CRITICAL: "CRITICAL",
});

export const EventUserMessages = Object.freeze({
  [ProctoringEventTypes.FACE_NOT_DETECTED]: "Face not detected. Please stay in front of the camera.",
  [ProctoringEventTypes.MULTIPLE_FACES]: "Multiple faces detected. Please ensure you are the only person visible.",
  [ProctoringEventTypes.FULLSCREEN_EXIT]: "You exited fullscreen mode. Please return to fullscreen.",
  [ProctoringEventTypes.TAB_SWITCH]: "Tab switch detected. Please stay on the interview tab.",
  [ProctoringEventTypes.PAGE_HIDDEN]: "Interview page is not visible. Please return to this tab.",
  [ProctoringEventTypes.WINDOW_BLUR]: "Interview window lost focus.",
  [ProctoringEventTypes.COPY_ATTEMPT]: "Copy action is restricted during the interview.",
  [ProctoringEventTypes.PASTE_ATTEMPT]: "Paste action is restricted during the interview.",
  [ProctoringEventTypes.CUT_ATTEMPT]: "Cut action is restricted during the interview.",
  [ProctoringEventTypes.CONTEXT_MENU_ATTEMPT]: "Right-click is disabled during the interview.",
  [ProctoringEventTypes.CAMERA_DISCONNECTED]: "Camera disconnected. Please reconnect your camera.",
  [ProctoringEventTypes.MICROPHONE_DISCONNECTED]: "Microphone disconnected. Please check your audio device.",
});
