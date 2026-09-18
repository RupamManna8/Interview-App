import { ProctoringEventTypes, ProctoringSeverity } from "./ProctoringEvents.js";

export class BrowserRestrictionMonitor {
  constructor(config = {}, onEvent = () => {}, onStatus = () => {}) {
    this.config = {
      blockCopy: config.blockCopy ?? true,
      blockPaste: config.blockPaste ?? true,
      blockCut: config.blockCut ?? true,
      blockContextMenu: config.blockContextMenu ?? true,
      blockDevtoolsKeys: config.blockDevtoolsKeys ?? true,
      enableBeforeUnloadWarning: config.enableBeforeUnloadWarning ?? true,
    };
    this.onEvent = onEvent;
    this.onStatus = onStatus;
    this.isRunning = false;

    this.handleBlur = this.handleBlur.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
    this.handleCopy = this.handleCopy.bind(this);
    this.handlePaste = this.handlePaste.bind(this);
    this.handleCut = this.handleCut.bind(this);
    this.handleContextMenu = this.handleContextMenu.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleBeforeUnload = this.handleBeforeUnload.bind(this);
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;

    window.addEventListener("blur", this.handleBlur);
    window.addEventListener("focus", this.handleFocus);

    if (this.config.blockCopy) {
      document.addEventListener("copy", this.handleCopy);
    }
    if (this.config.blockPaste) {
      document.addEventListener("paste", this.handlePaste);
    }
    if (this.config.blockCut) {
      document.addEventListener("cut", this.handleCut);
    }
    if (this.config.blockContextMenu) {
      document.addEventListener("contextmenu", this.handleContextMenu);
    }
    if (this.config.blockDevtoolsKeys) {
      document.addEventListener("keydown", this.handleKeyDown, true);
    }
    if (this.config.enableBeforeUnloadWarning) {
      window.addEventListener("beforeunload", this.handleBeforeUnload);
    }
  }

  handleBlur() {
    if (!this.isRunning) return;
    this.onEvent({
      type: ProctoringEventTypes.WINDOW_BLUR,
      severity: ProctoringSeverity.INFO,
      metadata: { timestamp: Date.now() },
    });
  }

  handleFocus() {
    if (!this.isRunning) return;
    this.onEvent({
      type: ProctoringEventTypes.WINDOW_FOCUS,
      severity: ProctoringSeverity.INFO,
      metadata: { timestamp: Date.now() },
    });
  }

  handleCopy(e) {
    if (!this.isRunning) return;
    if (this.config.blockCopy) {
      e.preventDefault();
    }
    this.onEvent({
      type: ProctoringEventTypes.COPY_ATTEMPT,
      severity: ProctoringSeverity.WARNING,
      metadata: { timestamp: Date.now() },
    });
  }

  handlePaste(e) {
    if (!this.isRunning) return;
    if (this.config.blockPaste) {
      e.preventDefault();
    }
    this.onEvent({
      type: ProctoringEventTypes.PASTE_ATTEMPT,
      severity: ProctoringSeverity.WARNING,
      metadata: { timestamp: Date.now() },
    });
  }

  handleCut(e) {
    if (!this.isRunning) return;
    if (this.config.blockCut) {
      e.preventDefault();
    }
    this.onEvent({
      type: ProctoringEventTypes.CUT_ATTEMPT,
      severity: ProctoringSeverity.WARNING,
      metadata: { timestamp: Date.now() },
    });
  }

  handleContextMenu(e) {
    if (!this.isRunning) return;
    if (this.config.blockContextMenu) {
      e.preventDefault();
    }
    this.onEvent({
      type: ProctoringEventTypes.CONTEXT_MENU_ATTEMPT,
      severity: ProctoringSeverity.WARNING,
      metadata: { timestamp: Date.now() },
    });
  }

  handleKeyDown(e) {
    if (!this.isRunning) return;

    const key = e.key;
    const isCtrlOrMeta = e.ctrlKey || e.metaKey;
    const isShift = e.shiftKey;

    // Block F12 and standard inspection shortcuts
    const isDevtools =
      key === "F12" ||
      (isCtrlOrMeta && isShift && ["i", "j", "c", "k"].includes(key.toLowerCase())) ||
      (isCtrlOrMeta && ["u", "s"].includes(key.toLowerCase()));

    if (isDevtools) {
      e.preventDefault();
      e.stopPropagation();
      this.onEvent({
        type: ProctoringEventTypes.DEVICE_ISSUE,
        severity: ProctoringSeverity.WARNING,
        metadata: { key, reason: "Restricted keyboard shortcut" },
      });
    }
  }

  handleBeforeUnload(e) {
    if (!this.isRunning) return;
    const message = "Your interview is currently in progress. Are you sure you want to leave?";
    e.preventDefault();
    e.returnValue = message;
    return message;
  }

  stop() {
    this.isRunning = false;

    window.removeEventListener("blur", this.handleBlur);
    window.removeEventListener("focus", this.handleFocus);
    document.removeEventListener("copy", this.handleCopy);
    document.removeEventListener("paste", this.handlePaste);
    document.removeEventListener("cut", this.handleCut);
    document.removeEventListener("contextmenu", this.handleContextMenu);
    document.removeEventListener("keydown", this.handleKeyDown, true);
    window.removeEventListener("beforeunload", this.handleBeforeUnload);
  }

  dispose() {
    this.stop();
  }
}
